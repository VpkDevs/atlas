# System Organization Plan — purrfect-percolating-sparkle
> Last updated: 2026-02-23 (Session 3)

---

## Current State (Post Session 3)

### DEV Structure
```
C:\Users\MQ420_OL\DEV\
├── web\       — 25 projects (added: mystical_journey, vibe-os, prompt-architect, CareerForge AI tsx, Aethelgard moved to game)
├── tool\      — 29 projects
├── game\      — 24 projects (added: Aethelgard-rpg-planning)
├── ai\        — 19 projects
├── api\       — 1 (CryptoArbitrageBot)
├── lib\       — 3 libraries
├── mobile\    — 1 (mobile-apps)
├── _INBOX\    — EMPTY ✓
├── _GRAVEYARD\ — 36 items
└── _REF\      — 3 items
```

### VAULT Structure
```
C:\Users\MQ420_OL\VAULT\
├── docs\
│   ├── NewMASTER-docs\
│   ├── eBay\
│   ├── Business_eBay\
│   ├── ahk\
│   ├── Obsidian\
│   ├── bolt-brainstorm\
│   ├── devin-docs\
│   ├── wowvegas-rtp-research\   ← NEW: casino RTP research PDFs
│   ├── 50-Ultimate-Dev-Automation-Prompts.md
│   ├── Enhanced Comprehensive Workflow Library.tsx
│   ├── Social Casino PRD.md
│   ├── prompt_based_nocode_platforms.md
│   ├── ultimate_ai_tools_directory.md
│   ├── Julia Resume.txt
│   ├── mylife.txt
│   ├── V1/V2 tube-to-hub.txt
│   ├── initial prompt for ShadowLight.txt
│   ├── VibeVisionIdea.md
│   └── antibiotic_research.md
├── media\
│   ├── images\
│   │   ├── FellouCash-genres\   ← FellouCash Desktop screenshots
│   │   ├── NM-Pics\
│   │   ├── NewMASTER\
│   │   └── APPYnessFinalOwner-important-pics\
│   ├── audio\
│   └── video\
└── personal\
    ├── Chrome-Passwords-APPYnessFinalOwner.csv  ⚠️ SENSITIVE
    ├── Microsoft Edge Passwords.csv              ⚠️ SENSITIVE
    └── vpkhubs recovery codes github.txt         ⚠️ IMPORTANT
    NOTE: Two empty troll folders exist here with offensive names — delete these
    when running admin cleanup (just Remove-Item them directly)
```

---

## Account Status (Session 3)

### STILL NEEDS ADMIN DELETION
All deletions require UAC-elevated terminal (Win+X → Terminal (Admin) → UAC prompt → Yes).
MQ420_OL is NOT in the local admin group — Remove-LocalUser fails without elevation.

**Group A — Empty, delete everything:**
```powershell
# Run in UAC-elevated PowerShell (Win+X → Terminal (Admin))
$deleteNow = @('appyn','hyper','masqu','xvinc','kwikfellouinvite','AgenticGod','errop','CometCash','Workspace','LocalVince','3I1c8ee49zMlEV9qza')
foreach ($acct in $deleteNow) {
  Write-Host "`n--- $acct ---"
  if (Get-LocalUser -Name $acct -ErrorAction SilentlyContinue) {
    Disable-LocalUser -Name $acct
    Remove-LocalUser -Name $acct
    Write-Host "User deleted"
  }
  if (Test-Path "C:\Users\$acct") {
    Remove-Item -Recurse -Force "C:\Users\$acct"
    Write-Host "Home dir deleted"
  }
}
# Clean up already-deleted user home dirs
foreach ($acct in @('APPYness','vpkcoder')) {
  if (Test-Path "C:\Users\$acct") {
    Remove-Item -Recurse -Force "C:\Users\$acct"
    Write-Host "$acct home dir deleted"
  }
}
```

**Group C — Migrated, ready to delete:**
All content confirmed migrated in Sessions 2-3.
```powershell
$migrated = @('FellouCash','NewMASTER','APPYnessFinalOwner','Pursuit.of.APPYness','MASTER ACCOUNT','pursu','testx1','CodingSpace')
foreach ($acct in $migrated) {
  Write-Host "`n--- $acct ---"
  if (Get-LocalUser -Name $acct -ErrorAction SilentlyContinue) {
    Disable-LocalUser -Name $acct
    Remove-LocalUser -Name $acct
    Write-Host "User deleted"
  }
  if (Test-Path "C:\Users\$acct") {
    Remove-Item -Recurse -Force "C:\Users\$acct"
    Write-Host "Home dir deleted"
  }
}
```

**TEMP accounts** (may be locked while logged in — try after reboot if needed):
```powershell
$temps = @('TEMP','TEMP.VINCESALIENWARE','TEMP.VINCESALIENWARE.000','TEMP.VINCESALIENWARE.001','TEMP.VINCESALIENWARE.002','TEMP.VINCESALIENWARE.003','Coder')
foreach ($acct in $temps) {
  if (Get-LocalUser -Name $acct -ErrorAction SilentlyContinue) {
    Remove-LocalUser -Name $acct -ErrorAction SilentlyContinue
    Write-Host "Deleted: $acct"
  }
  if (Test-Path "C:\Users\$acct") {
    Remove-Item -Recurse -Force "C:\Users\$acct" -ErrorAction SilentlyContinue
    Write-Host "Home deleted: $acct"
  }
}
```

**Also delete:** `C:\Users\Public\_Projects\CodingSpace\Perplexity Setup 1.1.3.exe` (locked by Defender — delete after reboot)

**Also clean VAULT\personal troll folders:**
```powershell
Remove-Item -Recurse -Force "C:\Users\MQ420_OL\VAULT\personal\hot boy 12yo, lots of cum!!!"
Remove-Item -Recurse -Force "C:\Users\MQ420_OL\VAULT\personal\Likes To Tease, Loves The Attention, Submissive!"
```

---

## What Was Migrated (Session 3)

| Item | From | To |
|------|------|----|
| `mystical_journey` | MASTER ACCOUNT\GoCodeo | DEV\web\ |
| `vibe-os` | APPYnessFinalOwner\Documents | DEV\web\ |
| `prompt-architect` | APPYnessFinalOwner\Downloads | DEV\web\ |
| `CareerForge AI...tsx` | Pursuit.of.APPYness\Downloads | DEV\web\ |
| `Aethelgard-rpg-planning` | DEV\_INBOX | DEV\game\ |
| `Microsoft Edge Passwords.csv` | APPYnessFinalOwner\Documents | VAULT\personal\ |
| `vpkhubs recovery codes github.txt` | APPYnessFinalOwner\Downloads | VAULT\personal\ |
| `Social Casino PRD.md` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `prompt_based_nocode_platforms.md` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `ultimate_ai_tools_directory.md` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `Julia Resume.txt` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `mylife.txt` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `V1/V2 tube-to-hub.txt` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `initial prompt for ShadowLight.txt` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| `VibeVisionIdea.md` | APPYnessFinalOwner\Documents\VibeVision | VAULT\docs\ |
| `wowvegas-rtp-research\` | APPYnessFinalOwner\Documents | VAULT\docs\ |
| Small remaining migrations | APPYnessFinalOwner, FellouCash, testx1 | VAULT (done at session start) |

**Muse Hub (testx1):** 0 bytes — already empty, nothing to migrate.

---

## Remaining Cleanup (Session 4 or manual)

1. **Run Group A deletion script** (admin terminal) — script above, ready to paste
2. **Run Group C deletion script** (admin terminal) — script above, ready to paste
3. **Run TEMP deletion script** (admin terminal, may need reboot first)
4. **Delete CodingSpace Perplexity installer** — after reboot
5. **Delete troll folders** in VAULT\personal — script above
6. **Review VAULT\personal sensitive files** — Chrome, Edge passwords CSVs, recovery codes
7. **NewMASTER\dyad-apps** — empty dir still exists, needs admin Remove-Item

---

## Tag Naming (NO BRACKETS)

| Folder | Contents |
|--------|----------|
| `web\` | Web apps, sites, landing pages |
| `tool\` | Desktop/CLI utilities |
| `game\` | Games, interactive |
| `ai\` | AI/ML agents, LLM wrappers |
| `api\` | Backends, bots, scrapers |
| `lib\` | Libraries, boilerplate, templates |
| `mobile\` | Mobile apps |
| `_INBOX\` | Unsorted/staging — keep empty, sort weekly |
| `_GRAVEYARD\` | Cold storage, abandoned |
| `_REF\` | Docs, references |

---

## Anti-Patterns (enforce going forward)
1. No projects on Desktop — shortcuts only
2. No projects in Downloads — use _INBOX then sort
3. No projects at MQ420_OL root — dotfiles/OS only
4. No bracket names in folder paths (causes PowerShell glob issues)
5. One copy = one canonical path
6. No dated archive folders — _GRAVEYARD has no dates
7. _INBOX sorted weekly
