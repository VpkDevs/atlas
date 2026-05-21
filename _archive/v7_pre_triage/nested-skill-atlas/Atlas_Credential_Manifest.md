# Atlas v8.3: Credential Manifest (Pre-Flight Checklist)

To achieve the level of autonomy described in the "4-Hour Run" and the "7-Day Roadmap," Atlas requires the following keys to be present in your project's `.env` or your global `~/.atlas/credentials_index.json`.

### **1. Core Infrastructure (Phase 2)**
- [ ] `VERCEL_TOKEN`: Required for Atlas to run `vercel --prod` and handle deployments automatically.
- [ ] `GITHUB_TOKEN`: Required for Atlas to push code, open PRs, and manage GitHub Actions.

### **2. Financial Intelligence (Phase 11-21)**
- [ ] `STRIPE_SECRET_KEY`: Required for the Capital Governor to track MRR, runway, and handle dunning recovery.
- [ ] `LEMON_SQUEEZY_API_KEY`: (Alternative) If not using Stripe.

### **3. Observability & Self-Healing**
- [ ] `SENTRY_DSN`: Required for Atlas to detect, reproduce, and auto-fix code crashes.
- [ ] `BETTER_UPTIME_API_KEY`: Required for Atlas to create and monitor health checks.

### **4. Growth & Distribution**
- [ ] `POSTHOG_API_KEY`: Required for A/B testing, funnel analysis, and "Decision-Driven" growth.
- [ ] `RESEND_API_KEY`: Required for Atlas to send transactional onboarding and reactivation emails.
- [ ] `BUFFER_ACCESS_TOKEN`: Required for Atlas to schedule social media content and manage distribution.
- [ ] `SEARCH_CONSOLE_API_KEY`: Required for SEO tracking and content pillar planning.

### **5. The "Swarm" (Optional)**
- [ ] `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Required if you want Atlas to spawn external sub-agents via Swarm or API-driven worker nodes.

---
**Security Note:** Atlas v8.3 *never* stores these values in logs. It only tracks their *presence* (true/false) in `credentials_index.json`.
