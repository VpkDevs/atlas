# AutoSeshLog — Firefox Extension Plan

## Context
The user manages 50+ email accounts across dozens of platforms (Google AI Studio, GitHub, etc.), using Firefox Multi-Account Containers for session isolation per tab. The current problem: logging into all relevant accounts for a given platform requires manually opening each tab and entering credentials. The goal is a single-click Firefox extension that accepts a domain, finds all matching accounts, and opens one containerized tab per account — auto-filling credentials and completing the login flow.

---

## Architecture Decision
**Pure Firefox Browser Extension (Manifest V2)** — no external backend required.
- All credential storage in `browser.storage.local` (AES-256-GCM encrypted)
- All login automation via content scripts + `browser.contextualIdentities` API
- Master password → PBKDF2 → AES key lives in-memory only; destroyed on Firefox close
- Bulk JSON import for initial 50+ account setup; individual UI form for ongoing management

---

## File Structure
```
AutoSeshLog/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   └── icon48.png
├── background/
│   ├── background.js          # Orchestration, message routing, job tracking
│   ├── credential-manager.js  # PBKDF2 + AES-GCM encrypt/decrypt, session key
│   └── container-manager.js   # contextualIdentities create/reuse/verify
├── popup/
│   ├── popup.html             # Locked view + domain input + progress list
│   ├── popup.js
│   └── popup.css
├── content/
│   ├── content.js             # Entry point + shared DOM utilities
│   └── adapters/
│       ├── google.js          # Multi-step Google login (MutationObserver state machine)
│       ├── github.js          # GitHub single-page login
│       └── generic.js         # Scored heuristic fallback for any other site
└── options/
    ├── options.html           # Account list + add/edit form + import/export
    ├── options.js
    └── options.css
```

---

## Critical Implementation Details

### manifest.json permissions
```json
{
  "manifest_version": 2,
  "permissions": [
    "contextualIdentities", "cookies", "tabs", "storage",
    "activeTab", "webNavigation", "<all_urls>"
  ],
  "background": { "scripts": [...], "persistent": true },
  "content_scripts": [{ "matches": ["<all_urls>"], "run_at": "document_idle" }]
}
```
`persistent: true` keeps the in-memory AES key alive between popup opens.

### Encryption (credential-manager.js)
- **Key derivation**: PBKDF2-SHA-256, 600,000 iterations, 16-byte random salt → 256-bit AES-GCM key
- **Encrypt**: random 12-byte IV per field → `{ iv: base64, data: base64 }`
- **Verify unlock**: encrypt a known constant (`"AutoSeshLog-v1-verify"`) and store; on unlock attempt, decrypt and compare. Wrong password → AES-GCM auth tag failure
- **Session key**: module-level variable, `extractable: false`, never serialized. Nulled automatically when Firefox closes.

### Data model (browser.storage.local)
```
{
  masterSalt: "base64",
  verifyBlob: { iv, data },
  accounts: [
    {
      id: "uuid",
      label: "react-projects@gmail.com",
      emailHint: "re...@gmail.com",     ← plaintext, for UI
      containerId: "firefox-container-N", ← from contextualIdentities
      containerColor: "blue",
      domains: ["google.com", "aistudio.google.com"],
      platform: "google" | "github" | "generic",
      createdAt: timestamp,
      lastUsed: timestamp
    }
  ],
  credentials: {
    "uuid": {
      email: { iv, data },       ← encrypted
      password: { iv, data },    ← encrypted
      totp: { iv, data } | null  ← encrypted, optional
    }
  }
}
```

### Domain matching (background.js)
Each account has a `domains` array. Patterns:
- `"google.com"` → matches `google.com` and any subdomain (e.g. `aistudio.google.com`)
- `"*.notion.so"` → matches only subdomains, not bare `notion.so`
- `"github.com"` → exact + subdomains

`getAccountsForDomain(accounts, inputDomain)` filters accounts using suffix + wildcard logic.

### Login job flow
1. Popup sends `LOGIN_ALL { domain }` → background
2. Background filters accounts by domain, for each:
   - `getOrRecreateContainer(account)` — verifies `containerId` still exists in Firefox; recreates if deleted
   - `browser.tabs.create({ url: loginUrl, cookieStoreId, active: false })`
   - Adds `tabId → { accountId, domain, status }` to `activeJobs` map
3. `webNavigation.onDOMContentLoaded` fires → background decrypts credentials → `sendMessage(tabId, INJECT_CREDENTIALS { email, password, totp, platform })`
4. Content script selects adapter by hostname → calls `adapter.login(...)` → sends `LOGIN_COMPLETE` or `LOGIN_FAILED`
5. Background updates job status → popup shows live progress

**Login URL construction**: Google → `accounts.google.com/signin?continue=https://TARGET`, GitHub → `github.com/login`, Generic → `https://TARGET`

### Google adapter (MutationObserver state machine)
Steps: `waitForElement(emailInput)` → `humanTypeInto` → click Next → `waitForElementGone(emailInput)` → `waitForElement(passwordInput)` → `humanTypeInto` → click Next.

`humanTypeInto` uses the **native property descriptor setter trick** to trigger React's synthetic events:
```js
Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, text)
el.dispatchEvent(new Event('input', { bubbles: true }))
```
Plus 80–200ms random delay per field for bot-detection mitigation.

### Generic adapter (heuristic)
Scores all visible inputs by `type`, `name`, `id`, `autocomplete`, `placeholder`, `aria-label`. Email field: +10 for `type=email`, +8 for `email` in any attr, −5 for `phone/tel`. Password field: `type=password` is definitive. Falls back to sequential flow (email→submit→wait→password) if both fields aren't visible simultaneously.

### TOTP support
Built-in RFC 6238 implementation using `crypto.subtle.sign(HMAC-SHA1)` — no external library needed. Optional per account.

### Bulk Import (options page)
Import format — a JSON file:
```json
[
  {
    "label": "react-projects@gmail.com",
    "email": "react-projects@gmail.com",
    "password": "plaintext-password-here",
    "totp": "TOTP_SECRET_BASE32_OR_BLANK",
    "platform": "google",
    "domains": ["google.com", "aistudio.google.com"],
    "containerColor": "blue"
  }
]
```
Import reads the file via `<input type="file">`, parses JSON, sends each account via `ADD_ACCOUNT` message to background (which encrypts on arrival). The plaintext file is never stored — it's read into memory, processed, then the reference is dropped. User is reminded to delete the source file after import.

Export writes the same structure but with `password` and `totp` fields as `"[ENCRYPTED - cannot export plaintext]"` — metadata only, no credential exfiltration risk.

---

## Options UI Layout
- **Unlock gate**: master password input (shown if `sessionKey === null`)
- **Account list**: table rows — color dot, label, emailHint, domain tags, platform badge; Edit/Delete per row
- **Add/Edit form**: label, email, password, totp (optional), platform dropdown, domains (multi-line), container color picker
- **Import/Export bar**: "Import JSON" button + "Export metadata" button
- **First-run flow**: if no `masterSalt` exists, show "Set Master Password" form (requires confirmation field)

---

## Build Order (implementation sequence)
1. `manifest.json` + placeholder icons
2. `background/credential-manager.js` — encryption core (testable in isolation)
3. `background/container-manager.js` — container create/reuse
4. `background/background.js` — message router + job orchestration
5. `content/content.js` — DOM utilities (`waitForElement`, `humanTypeInto`, `isVisible`)
6. `content/adapters/generic.js` → `google.js` → `github.js`
7. `popup/` — unlock view + domain input + progress list
8. `options/` — account list + add/edit form + bulk import

---

## Verification
1. Load extension in Firefox: `about:debugging` → "Load Temporary Add-on" → select `manifest.json`
2. Open options page → set master password → add one test Google account manually
3. Click extension icon → enter `google.com` → click "Login All" → verify one tab opens in the named container and auto-logs in
4. Test bulk import: prepare a 3-account JSON file, import it, verify all 3 appear in the account list
5. Test container reuse: run Login All twice; verify same containers are reused (same `cookieStoreId`)
6. Test lock: click "Lock" → reopen popup → verify master password prompt reappears
7. Test generic adapter: add an account for a non-Google/GitHub site, run Login All, verify generic field detection fills the form
8. Test domain matching: add account with `domains: ["google.com"]`, run Login All for `aistudio.google.com`, verify it matches
