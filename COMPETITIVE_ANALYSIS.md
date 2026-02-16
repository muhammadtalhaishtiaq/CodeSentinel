# 🔫 Snyk Deep Dive: Feature-by-Feature Competitive Analysis

> Everything Snyk does, and how we beat them

---

## 📊 SNYK'S COMPLETE PRODUCT MATRIX

### **Snyk Code (SAST - Static Analysis)**
**What it does:** Finds code vulnerabilities (SQL injection, XSS, auth bypasses)

**Their Features:**
- ✅ Real-time custom code scanning
- ✅ DeepCode AI Engine (scans as you type in IDE)
- ✅ 14+ languages & frameworks
- ✅ IDE integrations (VS Code, IntelliJ, PyCharm, WebStorm, Visual Studio)
- ✅ SCM integration (pre-commit hooks, PR comments)
- ✅ Cloud source management (GitHub, GitLab, Bitbucket, Azure)
- ✅ Automated fixes with DeepCode AI
- ✅ Custom severity rules
- ✅ Tests: 100/mo (Free) → 1,000/mo (Team) → Unlimited (Ignite/Enterprise)

**🆚 Our Status:**
- ✅ **WE HAVE THIS** (code scanning works, AI-powered)
- ⚠️ **NEEDS:** Better IDE integration (VS Code plugin)
- ⚠️ **NEEDS:** Automated fixes (one-click PR creation)
- ⚠️ **NEEDS:** More languages (add Kotlin, Swift, Rust)

**Strategy to Beat Them:**
- ⚡ **5-second scans** vs their minutes
- 🤖 **Better AI fixes** (use GPT-4o vs their DeepCode)
- 🎯 **Framework-specific** (Laravel, Django, Express specialist)
- 🆓 **Open source** scanning engine (theirs is closed)

---

### **Snyk Open Source (SCA - Software Composition Analysis)**
**What it does:** Scans dependencies for known vulnerabilities (npm, pip, Maven, composer, etc)

**Their Features:**
- ✅ Dependency monitoring (continuous scanning)
- ✅ Broad language coverage (NPM, PyPI, Maven, NuGet, Packagist, Gem, etc)
- ✅ License compliance (detect GPL, MIT, Apache, etc)
- ✅ SBOM support (Software Bill of Materials)
- ✅ Private package registries (Artifactory, Nexus)
- ✅ Tests: 200/mo (Free) → 1,000/mo (Team) → Unlimited (Ignite/Enterprise)
- ✅ Black Duck acquisition = best-in-class DB

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS** - CRITICAL GAP!
- 🔴 **This is 80% of vulnerabilities** (dependencies = most common attack surface)
- 🔴 **Without this, we're only catching 20% of issues**

**Strategy to Build & Beat Them:**
- Build NPM scanning (Week 4)
- Add Python, PHP, Go, Java (Week 5)
- **BEAT THEM:** Free tier unlimited (they limit by tests/mo)
- **BEAT THEM:** Integrations with dependency managers (auto-update)
- **BEAT THEM:** AI-powered "safely upgrade" suggestions

---

### **Snyk Container (Container Image Scanning)**
**What it does:** Finds vulnerable base images & packages in Docker

**Their Features:**
- ✅ Base image recommendations (suggest secure alternatives)
- ✅ Public container registries (Docker Hub, ECR, ACR, GCR)
- ✅ Self-hosted registries (Enterprise only)
- ✅ Kubernetes monitoring & prioritization (Enterprise)
- ✅ Custom base image recommendations (Enterprise)
- ✅ Tests: 100/mo (Free) → Unlimited (Team+)
- ✅ Uses Grype/Trivy under hood (open source)

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS** (low priority for MVP, but needed for enterprise)
- 📌 **Priority:** Week 7 (after SCA foundation)

**Strategy to Build & Beat Them:**
- Use Trivy (open source, free)
- Scan Dockerfile + base image + layers
- **BEAT THEM:** Recommend secure lightweight alternatives (alpine, distroless)
- **BEAT THEM:** Show cost savings (smaller images = less bandwidth)

---

### **Snyk IaC (Infrastructure as Code)**
**What it does:** Finds misconfigurations in Terraform, CloudFormation, K8s YAML

**Their Features:**
- ✅ Scanning throughout SDLC (dev, PR, CD)
- ✅ 600+ built-in policies
- ✅ Custom severities & rules
- ✅ Drift management (detect changes)
- ✅ Terraform Cloud/Enterprise support
- ✅ Tests: 300/mo (Free) → Unlimited (Team+)
- ✅ Uses Checkov under hood (open source)

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS**
- 📌 **Priority:** Week 8 (cloud/modern ops teams need this)

**Strategy to Build & Beat Them:**
- Use Checkov (open source)
- Add Terraform, CloudFormation, K8s detection
- Custom rules (detect S3 without encryption, etc)
- **BEAT THEM:** Show cost savings (prevent $1M+ data breaches)
- **BEAT THEM:** AI-generated fixes ("here's the fix" in plain English)

---

### **Snyk DAST (Dynamic Application Security Testing)**
**What it does:** Runtime testing of APIs and web apps

**Their Features:**
- ✅ API & Web app scanning (finds XSS, SQLi, auth flaws)
- ✅ Add-on: Snyk API & Web (extra cost)
- ✅ 10 DAST targets included (Ignite)
- ✅ Enterprise only

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS**
- 📌 **Priority:** Phase 5 (Month 4+, lower priority)
- 💡 **Note:** Hardest to build, requires running code

**Strategy:**
- Build after MVP launch
- Maybe use Zap (open source) or partner with ScanAPI
- **Focus:** Don't waste time here, SCA + IaC are higher ROI

---

### **Snyk Code Insights**
**What it does:** Visual Code intelligence (reachability, risk scoring)

**Their Features:**
- ✅ Application dependency tree
- ✅ Reachability analysis (is vulnerable code actually called?)
- ✅ Risk-based prioritization
- ✅ Advanced analytics & dashboards

**🆚 Our Status:**
- ⚠️ **PARTIAL** (file tree visualization exists)
- 📌 **Needs:** Reachability analysis (complex, use AST parsing)
- 📌 **Needs:** Risk scoring algorithm

**Strategy:**
- Don't over-engineer initially
- Show vulnerability in context of project
- **Future:** Add reachability when scaling

---

### **DeepCode AI Fix**
**What it does:** Auto-generate security fixes

**Their Features:**
- ✅ Automated fix generation
- ✅ One-click apply (Team+ only)
- ✅ Creates PR automatically
- ✅ Context-aware explanations

**🆚 Our Status:**
- ⚠️ **PARTIAL** (we have AI chat, not auto-fixing yet)
- 🔴 **Homepage promises "one-click fix"** but we don't have it

**Strategy to Build:**
- Week 3: One-click apply fix (auto-create PR)
- **BEAT THEM:** Use GPT-4o instead of proprietary engine
- **BEAT THEM:** Show confidence score (how sure are we this fix works?)
- **BEAT THEM:** Verify fix (re-scan after merge)

---

### **Evo by Snyk (Agentic Orchestration)**
**What it does:** AI agents that fix issues automatically

**Their Features:**
- ✅ Autonomous remediation
- ✅ Non-deterministic systems (AI-native apps)
- ✅ Runtime protection
- ✅ Requires Enterprise license
- ✅ "Future-proof your AI transformation"

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS**
- 📌 **This is their moonshot feature (2026+)**
- 💡 **Don't worry about this yet** - bleeding edge

**Strategy:**
- Monitor development
- When mature, consider adding agents
- **For now:** Focus on solid fundamentals

---

### **Snyk Learn**
**What it does:** Developer education & compliance training

**Their Features:**
- ✅ Security lessons (how to fix issues)
- ✅ Gamification (earn points)
- ✅ SSO integration
- ✅ Compliance tracking
- ✅ Add-on: $$ per user

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS**
- 📌 **Low priority for MVP**

**Strategy:**
- Build blog content (SEO!)
- Create YouTube tutorials
- Integrate GitHub links to relevant docs
- **Later:** Formal training program

---

### **Snyk Broker (Self-Hosted Integration)**
**What it does:** Secure connection to on-prem Git repos

**Their Features:**
- ✅ GitHub Enterprise Server
- ✅ Bitbucket Server / Data Center
- ✅ GitLab Enterprise
- ✅ Azure DevOps Server
- ✅ High security (encrypted tunnels)
- ✅ Enterprise only

**🆚 Our Status:**
- ❌ **WE DON'T HAVE THIS**
- 📌 **Enterprise feature (Phase 5)**

**Strategy:**
- Build after MVP
- Use SSH tunnels + private Git repos
- **Target:** Fortune 500 companies with on-prem

---

### **Snyk's Integrations (What They Connect To)**

| Category | Snyk | CodeSentinel |
|----------|------|-------------|
| **IDEs** | VS Code, IntelliJ, PyCharm, WebStorm, Visual Studio, VIM, Neovim | ✅ VS Code (build Week 9) |
| **Git** | GitHub, GitLab, Bitbucket, Azure DevOps | ✅ GitHub, 🔄 GitLab, Azure next |
| **CI/CD** | GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis, TeamCity, Azure Pipelines, BitBucket Pipelines | ⚠️ GitHub Actions only (add Pipelines) |
| **Chat** | Slack (via Incoming Webhooks) | ✅ Slack, Discord (build Week 11) |
| **Ticketing** | Jira, Linear, GitHub Issues, Azure Boards, Slack | 🔄 Jira, Linear (build Week 11) |
| **Cloud Platform** | AWS, Azure, GCP, Docker, Kubernetes | ⚠️ Basic support only |
| **Artifact Registries** | Artifactory, Nexus, Docker Registries | ❌ Not yet |
| **Package Managers** | npm, PyPI, Maven, NuGet, RubyGems, PHP Composer, Go, Gradle | 🔄 NPM only (add others) |
| **Deployment** | Helm, Kustomize, Kubernetes | ❌ Not yet |
| **API** | Snyk API (REST, GraphQL) | 🔄 REST API only (add GraphQL) |

---

## 🎯 CRITICAL GAPS: What We MUST Build to Compete

### **TIER 1 (Critical - Without these, we're incomplete)**
1. **SCA (Dependency Scanning)** - 80% of vulns are here!
2. **Container Scanning** - Modern teams use Docker
3. **IaC Scanning** - Cloud security is critical
4. **IDE Plugin (VS Code)** - 70% of devs use VS Code
5. **GitHub Actions Integration** - CI/CD pipeline scanning

### **TIER 2 (Important - Needed for Team+Enterprise)**
6. **Jira/Linear Integration** - Enterprise workflows
7. **Slack/Teams/Discord** - Team notifications
8. **Audit Logs** - Compliance requirement
9. **SSO/SAML** - Enterprise authentication
10. **On-Premise Option** - For regulated industries

### **TIER 3 (Nice to Have - Future)**
11. **DAST (API Testing)** - Runtime scanning
12. **GitLab/Azure DevOps Integrations** - More Git platforms
13. **Snyk Learn equivalent** - Developer education
14. **Broker (Enterprise Git)** - On-prem repos

---

## 💰 PRICING COMPARISON: Our Unfair Advantage

| Feature | Snyk Free | **CodeSentinel Free** | Snyk Team ($25/mo) | **CodeSentinel Hobby ($5/mo)** | Snyk Enterprise | **CodeSentinel Enterprise ($49/mo)** |
|---------|-----------|----------------------|-----------|---------------------|-------------|----------------------|
| **SAST Tests/mo** | 100 | **50** | 1,000 | **Unlimited** ✅ | Unlimited | **Unlimited** ✅ |
| **SCA Tests/mo** | 200 | **50** | 1,000 | **Unlimited** ✅ | Unlimited | **Unlimited** ✅ |
| **BYOK LLM** | No | No | No | **Yes** ✅ | No | **Yes** ✅ |
| **Scheduled Scans** | No | No | No | **Yes** ✅ | Yes | **Yes** ✅ |
| **PR Auto-Scan** | No | No | No | **Yes** ✅ | Yes | **Yes** ✅ |
| **One-Click Fix** | No | No | No | **Yes** ✅ | Yes | **Yes** ✅ |
| **Container Scanning** | Yes | No | Yes | **Yes** ✅ | Yes | **Yes** ✅ |
| **IaC Scanning** | Yes | No | Yes | **Yes** ✅ | Yes | **Yes** ✅ |
| **Team Collab** | No | No | Yes | No | Yes | **Yes** ✅ |
| **Team Users** | ∞ | 1 | 1-5 | 1 | ∞ | **∞** ✅ |
| **Annual Cost** | $0 | **$0** | **$1,500** (5 devs) | **$60** ✅ | Custom | **$588** ✅ |
| **% Savings vs Snyk** | - | - | **Baseline** | **96% cheaper!** 🔥 | - | **99% cheaper!** 🔥🔥🔥 |

---

## 🚀 Our Competitive Moats (Why We Win)

### **1. Price Destruction** 💰
- **Hobby:** 96% cheaper than Snyk Team
- **Enterprise:** 99% cheaper than Snyk Enterprise
- **Undercut Snyk on every tier**

### **2. LLM Flexibility** 🤖
- User chooses OpenAI, Claude, Gemini, Azure, or our AIML
- Snyk uses proprietary DeepCode (costs them $$)
- We cost nearly zero (user pays for LLM!)

### **3. Speed** ⚡
- 5-second scans vs Snyk's minutes
- Real-time IDE integration (as you type)
- Faster feedback = faster development

### **4. Open Source DNA** 🌍
- Open source scanning engine (Snyk is closed)
- Community rule submissions (marketplace)
- Free for open source projects (truly unlimited)
- Developer love > corporate entity

### **5. AI-Native from Day 1** 🧠
- Not bolted on (like DeepCode acquired 2021)
- Conversational AI (understands context)
- AI rule builder (generate rules from plain English)
- Better explanations + fixes

### **6. Niche Expertise** 🎯
- Laravel specialist (framework-specific rules)
- Django specialist (Python web)
- Express specialist (Node.js web)
- "Best tool for Laravel" marketing angle

---

## 📋 Feature Implementation Priority

### **Phase 1: MVP (Weeks 1-2)**
- [ ] LLM Configuration System
- [ ] Scheduled Scans + Webhooks

### **Phase 2: Parity (Weeks 3-6)**
- [ ] One-Click Apply Fix
- [ ] SCA - NPM (CRITICAL!)
- [ ] SCA - Python/PHP/Go/Java
- [ ] Dashboard v2

### **Phase 3: Competitive (Weeks 7-9)**
- [ ] Container Scanning (Trivy)
- [ ] IaC Scanning (Checkov)
- [ ] VS Code Extension

### **Phase 4: Winning (Weeks 10-12)**
- [ ] AI Rule Builder
- [ ] Team Collaboration + RBAC
- [ ] Integrations (Slack, Jira, Linear)

### **Phase 5: Dominance (Month 4+)**
- [ ] GitLab Integration
- [ ] Azure DevOps Integration
- [ ] GitHub Advanced Security Comparison page
- [ ] On-Premise Deployment
- [ ] DAST (API Testing)
- [ ] Sonarqube Comparison page

---

## 🎬 Go-to-Market Strategy

**Positioning:**
> "The open-source, AI-native, developer-first security platform that's 10x faster and 10x cheaper than Snyk"

**Key Messages:**
1. "Free + Open Source" (vs Snyk's proprietary)
2. "Unlimited scans with your LLM key" (vs Snyk's per-test pricing)
3. "5-second scans" (vs Snyk's minutes)
4. "Pick your LLM: OpenAI, Claude, Gemini" (vs Snyk's lock-in)
5. "Laravel/Python/React specialist" (vs Snyk's generalist)

**Launch Channels (Day 1):**
- Product Hunt (Lead with pricing)
- Hacker News (Lead with open source)
- Reddit (r/laravel, r/python, r/javascript)
- Twitter (Founder thread: why we built this)
- Dev.to (Technical deep dive)

---

