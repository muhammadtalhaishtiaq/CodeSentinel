# 🎨 BLAZE UI/UX Design System: Modern, Trustworthy, Developer-First

> "Security scanning shouldn't look scary. It should look beautiful." - Design Philosophy

---

## 🎯 DESIGN PHILOSOPHY

**3 Core Principles:**

1. **Trust Through Clarity** ✅
   - Minimal, clean interface
   - Information hierarchy (most important first)
   - Real-time feedback (see results instantly)
   - Transparent about what's happening

2. **Developer-Friendly** 👨‍💻
   - Dark mode by default (developers expect it)
   - Terminal-inspired aesthetics
   - Keyboard shortcuts throughout
   - Command palette (Cmd+K)

3. **Modern & Sleek** ✨
   - Glassmorphism effects (subtle transparency)
   - Smooth animations (not jarring)
   - Purple/Green gradient (security + growth)
   - Consistent spacing & rhythm

---

## 🎨 COLOR PALETTE

```
Primary Colors:
  Brand Purple:  #8B5CF6 (trust, security, tech)
  Brand Lime:    #84DC5A (growth, fixed, positive)
  
Neutral Colors:
  Dark BG:       #0F172A (near black, OLED-friendly)
  Dark Secondary: #1E293B (cards, containers)
  Light Text:    #F1F5F9 (high contrast)
  Medium Text:   #94A3B8 (secondary info)
  
Status Colors:
  Critical:      #FF4757 (🔴 bright red)
  High:          #FFA502 (🟠 orange)
  Medium:        #FFD700 (🟡 gold)
  Low:           #26D07C (🟢 green)
  Info:          #00BFFF (🔵 cyan)
  
Accent Colors:
  Success:       #10B981 (green, confirmed)
  Warning:       #F59E0B (amber, caution)
  Danger:        #EF4444 (red, critical)
  Focus:         #8B5CF6 (purple, interactive)
```

**Visual Palette:**
```
████ Purple (#8B5CF6) - Trust, Security, Premium
████ Lime (#84DC5A) - Fixed, Growth, Positive
████ Dark (#0F172A) - Clean, Modern, OLED
████ Red (#FF4757) - Critical Vulnerabilities
████ Green (#10B981) - Secure, Healthy
```

---

## 📝 TYPOGRAPHY

```
Font Stack:
  Headlines:   Inter Bold / Geist (modern, geometric)
  Body:        Geist Mono for code, Inter for UI
  Terminal:    JetBrains Mono (monospace code)

Font Sizes:
  H1:  32px (page titles, hero)
  H2:  24px (section headers)
  H3:  18px (subsections)
  Body: 14px (main text)
  Small: 12px (timestamps, metadata)
  Code: 13px (monospace)

Line Height:
  Headlines: 1.2 (tight, strong)
  Body: 1.6 (readable, breathing room)
  Code: 1.5 (easy scanning)

Weights:
  Headlines: 700 (bold, weight)
  Subheaders: 600 (emphasis)
  Body: 400 (readable)
  Light: 300 (deemphasized)
```

---

## 🧩 COMPONENT LIBRARY

### **Buttons**
```
Primary Button (Action):
┌─────────────────────┐
│ ▶ Scan Now          │  Purple BG, White Text
│                     │  Hover: Brighter purple
│                     │  Active: Pressed effect
└─────────────────────┘

Secondary Button (Toggle):
┌─────────────────────┐
│ ⚙ Settings           │  Outline, Purple border
│                     │  Hover: Light purple BG
│                     │  Active: Filled purple
└─────────────────────┘

Danger Button (Delete/Reset):
┌─────────────────────┐
│ 🗑 Delete Rule      │  Red outline
│                     │  Hover: Red BG
│                     │  Confirm modal on click
└─────────────────────┘

Small Tag/Badge:
┌────────┐
│ SAST   │  Mini pill, monospace font
└────────┘

Icon Button (Compact):
 [⚡] [🔧] [📊] [⋯]  Small, no text, hover tooltip
```

### **Cards/Containers**
```
Vulnerability Card:
┌────────────────────────────────────────┐
│ 🔴 SQL Injection in login.php:45      │ Header: Red icon + title
├────────────────────────────────────────┤
│ Severity: Critical                     │
│ Type: SAST                             │
│ Pattern: "SELECT * FROM users..."      │ Body: Key info
│                                        │
│ Fix Suggested:                         │ Call-to-action
│ [✨ AI Fix] [📝 View Code] [📋 Copy]  │
└────────────────────────────────────────┘
Shadow: subtle (elevation: 2)
Hover: Slight lift, blue outline glow
```

### **Progress & Status**
```
Scan Progress (Real-Time):
Scanning files...
████████░░░░░░░░░░░ 45% (23 / 51 files)
Estimated: 8 seconds remaining

Status Indicators:
✅ PASSED    - Green checkmark
⏳ SCANNING  - Blue spinner
⚠️  ISSUES   - Orange warning
🔴 FAILED   - Red X
🔒 SECURE   - Green shield
```

### **Alerts/Notifications**
```
Success Alert (Toast):
┌─────────────────────────────────────────┐ Green background
│ ✅ Scan completed successfully!         │
│                                         │ Auto-dismiss 5s
│ Found 12 issues. View results. [×]      │
└─────────────────────────────────────────┘

Error Alert (Inline):
┌─────────────────────────────────────────┐ Red background
│ 🔴 Error: Failed to add LLM config      │
│ Check API key and try again             │ Persistent
└─────────────────────────────────────────┘

Info Alert:
┌─────────────────────────────────────────┐ Blue background
│ ℹ️ Free tier: 50 scans/month remaining  │
│                                         │ Auto-dismiss
│ 18 scans left [Upgrade to Hobby] [×]   │
└─────────────────────────────────────────┘
```

---

## 📱 PAGE LAYOUTS

### **1. LANDING PAGE (Homepage)**

```
┌─────────────────────────────────────────────────────────────┐
│  [🔥 BLAZE]          FEATURES  PRICING  DOCS  GITHUB  LOGIN │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🔥 Security Scanning                                     │
│   at Lightspeed                                            │
│                                                             │
│   10x faster than Snyk                                     │
│   10x cheaper than Snyk                                    │
│   Open source | AI-native                                  │
│                                                             │
│   [Try Free - No CC]  [View Demo]                          │
│                                                             │
│   ✅ 100,000+ developers securing code                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ 🏃 Fast  │ 💰 Free  │ 🔓 Open  │ 🤖 Smart │
│ 5 sec    │ $0/mo    │ Source   │ AI-Fixes │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────────────┐
│ Features                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [🔍 SAST]      [📦 SCA]       [🐳 Container]              │
│ Code Analysis  Dependency     Docker Image                 │
│                Scanning       Scanning                      │
│                                                             │
│ [☁️ IaC]        [🤖 AI Chat]   [🔄 Auto-Fix]              │
│ Terraform      Project        Create PRs                   │
│ & Kubernetes   Context Chat   Automatically                │
│                                                             │
│ [⚡ Real-Time]  [🔗 Webhooks]  [🎯 Custom]                │
│ IDE Plugin     PR Scanning    Security Rules               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┐
│ Pricing              │ Free Tier Benefits   │
├──────────────────────┤                      │
│ 🟢 Free: $0/mo       │ ✅ 50 scans/month   │
│ 🟠 Hobby: $5/mo      │ ✅ 14+ languages    │
│ 🟡 Team: $15/mo      │ ✅ Custom rules     │
│ 🔴 Enterprise: $49/mo│ ✅ GitHub OAuth     │
└──────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ From the team at [City, Country]                            │
│                                                             │
│ [GitHub] [Twitter] [Discord] [Newsletter]                  │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Hero section: Large, simple, trust-building
- Feature cards: Visual icons, not text-heavy
- Pricing: Clear comparison table
- Trust signals: GitHub stars, user count, testimonials
- CTA buttons: Purple with gradient hover

---

### **2. DASHBOARD (After Login)**

```
┌─────────────────┬─────────────────────────────────────────┐
│ 🔥 BLAZE        │  [🔍] [🔔] [⚙️] [@user ▼]              │
├─────────────────┼─────────────────────────────────────────┤
│                 │                                         │
│  Home           │  Security Overview                      │
│  Projects       │  ┌─────────────────────────────────┐   │
│  Dashboard      │  │ 🟢 Score: 87/100                │   │
│  Settings       │  │ ✅ 3 Critical issues (last 7d)   │   │
│  Rules          │  │ 📈 10% improvement from last wk   │   │
│  Integrations   │  └─────────────────────────────────┘   │
│                 │                                         │
│  [+ New Project]│  Recent Activity                        │
│                 │  ┌─────────────────────────────────┐   │
│                 │  │ 🔴 auth-service: 5 vulns found   │   │
│                 │  │ ✅ api-gateway: Scan passed      │   │
│                 │  │ ⏳ website: Scanning (45%)        │   │
│                 │  │ 📝 db-service: Manual scan added │   │
│                 │  └─────────────────────────────────┘   │
│                 │                                         │
│                 │  Projects Overview                      │
│                 │  ┌──────────┬──────────┬──────────┐   │
│                 │  │ Name     │ Issues   │ Score    │   │
│                 │  ├──────────┼──────────┼──────────┤   │
│                 │  │ auth-svc │ 5 CRIT  │ 72/100   │   │
│                 │  │ api-gw   │ 2 HIGH  │ 92/100   │   │
│                 │  │ website  │ 12 MED  │ 68/100   │   │
│                 │  └──────────┴──────────┴──────────┘   │
│                 │                                         │
└─────────────────┴─────────────────────────────────────────┘
```

**Design Notes:**
- Left sidebar: Persistent navigation (collapsible on mobile)
- Color-coded severity: Red (critical), Orange (high), Yellow (medium), Green (low)
- Real-time updates: Animations on status changes
- Quick actions: [Scan Now] [View Report] [Apply Fix] buttons

---

### **3. PROJECT DETAIL PAGE**

```
┌─────────────────────────────────────────────────────────────┐
│ [← Back] auth-service › master                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [🔍 Code] [📦 Dependencies] [🐳 Container] [☁️ IaC]        │
│                                                             │
│ ┌──────────────────────────────────────┐                  │
│ │ Security Score: 72/100               │                  │
│ │ ████████░░░░░░░░░░░░░ (Good)         │                  │
│ │                                      │                  │
│ │ 🔴 5 Critical   🟠 3 High            │                  │
│ │ 🟡 8 Medium     🟢 0 Low             │                  │
│ │                                      │                  │
│ │ Last Scan: 2 hours ago               │                  │
│ │ [🔄 Rescan Now]  [📜 View History]   │                  │
│ └──────────────────────────────────────┘                  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Vulnerabilities                                       │  │
│ ├───────────────────────────────────────────────────────┤  │
│ │                                                       │  │
│ │ 🔴 SQL Injection in login.php:45                     │  │
│ │    Severity: CRITICAL | Type: SAST                   │  │
│ │    Match: "SELECT * FROM users WHERE id=" + input    │  │
│ │    [✨ AI Fix] [👀 View Code] [💡 Explain] [🔗 Docs] │  │
│ │                                                       │  │
│ │ ┌─────────────────────────────────────────────────┐  │  │
│ │ │ Suggested Fix:                                  │  │  │
│ │ │ Use parameterized queries instead               │  │  │
│ │ │                                                 │  │  │
│ │ │ const query = `                                 │  │  │
│ │ │   SELECT * FROM users WHERE id = ?              │  │  │
│ │ │ `;                                              │  │  │
│ │ │ db.query(query, [input]);                       │  │  │
│ │ │                                                 │  │  │
│ │ │ [📋 Copy Fix] [✅ Apply & Create PR] [👎 Skip]  │  │  │
│ │ └─────────────────────────────────────────────────┘  │  │
│ │                                                       │  │
│ │ 🔴 XSS in profile.php:120                            │  │
│ │    Severity: CRITICAL | Type: SAST                   │  │
│ │    [✨ AI Fix] [👀 View Code] [💡 Explain] [🔗 Docs] │  │
│ │                                                       │  │
│ │ 🟠 Weak hashing in password.php:88                   │  │
│ │    Severity: HIGH | Type: SAST                       │  │
│ │    [✨ AI Fix] [👀 View Code] [💡 Explain] [🔗 Docs] │  │
│ │                                                       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Tab navigation for different scan types
- Security score with visual progress bar
- Vulnerability cards with full context
- AI-powered explanations inline
- One-click PR creation for fixes

---

### **4. SETTINGS PAGE**

```
┌─────────────────────────────────────────────────────────────┐
│ SETTINGS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Profile] [Account] [LLM Config] [Integrations] [Billing]  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ LLM Configuration                                   │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │                                                     │   │
│ │ Default LLM Provider                                │   │
│ │ [▼ Select Provider]                                 │   │
│ │                                                     │   │
│ │ ○ Free (Shared AIML Key)                            │   │
│ │   └─ 50 scans/month                                 │   │
│ │                                                     │   │
│ │ ○ OpenAI                                            │   │
│ │   API Key: [••••••••••••••••]                       │   │
│ │   Model: [▼ gpt-4o-mini]                            │   │
│ │   [Test Connection] [Reset]                         │   │
│ │   ✅ Connected (last checked 2 hours ago)            │   │
│ │                                                     │   │
│ │ ○ Anthropic (Claude)                                │   │
│ │   API Key: [••••••••••••••••]                       │   │
│ │   Model: [▼ claude-3-5-sonnet]                      │   │
│ │   [Test Connection] [Reset]                         │   │
│ │   ⚠️ Not configured                                  │   │
│ │                                                     │   │
│ │ ○ Google Gemini                                     │   │
│ │   API Key: [••••••••••••••••]                       │   │
│ │   [Test Connection] [Reset]                         │   │
│ │   ⚠️ Not configured                                  │   │
│ │                                                     │   │
│ │ ○ Microsoft Azure                                   │   │
│ │   Endpoint: [https://...]                           │   │
│ │   API Key: [••••••••••••••••]                       │   │
│ │   [Test Connection] [Reset]                         │   │
│ │   ⚠️ Not configured                                  │   │
│ │                                                     │   │
│ │ Usage & Cost Tracking                               │   │
│ │ ┌─────────────────────────────────────────────┐    │   │
│ │ │ This Month: 12 scans (OpenAI)                │    │   │
│ │ │ Tokens Used: 45,000                          │    │   │
│ │ │ Estimated Cost: $0.45                        │    │   │
│ │ │ Budget Alert: Not set [Set Limit]            │    │   │
│ │ └─────────────────────────────────────────────┘    │   │
│ │                                                     │   │
│ │ [💾 Save Changes]                                   │   │
│ │                                                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Connected Integrations                                      │
│ ┌────────────────┬────────────────┬────────────────────┐   │
│ │ Slack          │ GitHub         │ Jira               │   │
│ │ ✅ Connected   │ ✅ Connected   │ ⚠️ Disconnected   │   │
│ │ [Disconnect]   │ [Disconnect]   │ [Connect]          │   │
│ └────────────────┴────────────────┴────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Multiple settings tabs (tabs at top)
- Radio buttons for provider selection
- Real-time connection testing
- Usage tracking under each provider
- Encrypted key display (••••• for security)

---

### **5. VS CODE EXTENSION (In-IDE)**

```
VS Code Sidebar:
┌────────────────────────────────────┐
│ 🔥 BLAZE                           │
├────────────────────────────────────┤
│                                    │
│ 🛡️ Security Status                 │
│ ┌────────────────────────────────┐ │
│ │ This File: 3 issues found      │ │
│ │ Status: ⚠️  Review needed       │ │
│ └────────────────────────────────┘ │
│                                    │
│ 📁 Issues by Severity             │
│ 🔴 Critical: 1                     │
│ 🟠 High: 1                         │
│ 🟡 Medium: 1                       │
│ 🟢 Low: 0                          │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🔴 SQL Injection (line 45)      │ │
│ │ 🟠 XSS vulnerability (line 120) │ │
│ │ 🟡 Weak hash (line 88)          │ │
│ └────────────────────────────────┘ │
│                                    │
│ [🔄 Rescan] [⚙️ Settings]          │
│                                    │
└────────────────────────────────────┘

Code Editor (Inline Feedback):
┌──────────────────────────────────────────────────┐
│  45 const query = "SELECT * FROM users WHERE..." │
│     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 🔴
│     
│     Hover → Shows popup:
│     ┌──────────────────────────────────────────┐
│     │ 🔴 SQL Injection (CRITICAL)              │
│     │                                          │
│     │ Using string concatenation in SQL query  │
│     │ Use parameterized queries instead        │
│     │                                          │
│     │ [💡 Explain] [🔧 Quick Fix] [📖 Learn]  │
│     └──────────────────────────────────────────┘

│  88 bcrypt.hash(password)  # Weak algorithm     │
│     ^^^^^^^^^^ 🟠                               │
│                                                 │
└──────────────────────────────────────────────────┘
```

**Design Notes:**
- Sidebar shows file security status
- Inline squiggly underlines (red for critical)
- Hover shows detailed explanation
- Quick action buttons (explain, fix, learn)

---

## 🎨 DESIGN SYSTEM COMPONENTS

### **Color Severity Legend (Everywhere)**
```
🔴 Critical - Immediate risk, deploy blocker
🟠 High - Serious, should fix before merge
🟡 Medium - Important, fix with next update
🟢 Low - Minor, good to have
🔵 Info - FYI, not a vulnerability

Grayscale: ⚫ Neutral/Unresolved
```

### **Icons Used**
```
Actions:
  🔍 Scan/Search
  ✨ AI-Powered Action
  📝 Edit/Write
  🗑️ Delete
  🔄 Refresh
  📋 Copy
  🔗 Link
  ⚙️ Settings
  
Status:
  ✅ Success/Pass
  ❌ Failed
  ⏳ Pending/Loading
  ⚠️ Warning
  🔒 Secure
  🔓 Insecure
  
Vulns:
  🔴 Critical
  🟠 High
  🟡 Medium
  🟢 Low
  🔵 Info
  
Tech:
  📦 Package/Dependency
  🐳 Container/Docker
  ☁️ Cloud/IaC
  🔌 Integration
  🤖 AI/ML
```

---

## 🎯 TRUST SIGNALS (Everywhere)

### **Homepage Trust Elements**
```
Top of page:
┌─────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ 4.9/5 from 500+ reviews           │
│ "Saved us $50k in Snyk costs" - Tech Lead  │
│ ✅ 100,000+ developers trust Blaze         │
│ 🔒 SOC 2 Type II Certified                 │
│ 🌍 Used by 1000+ companies                 │
└─────────────────────────────────────────────┘

Mid page (Trust Badges):
[🔐 ISO 27001] [📋 SOC 2 Type II] [✅ GDPR Ready] [🛡️ Enterprise Grade]

Bottom page:
"Built by security experts that worked at..."
[Snyk] [GitHub] [Google] [Microsoft]
```

### **Dashboard Trust Elements**
```
┌─────────────────────────────────────┐
│ 🟢 System Status: All Green         │
│ ✅ 99.9% Uptime (300+ days)        │
│ 🔒 All data encrypted at rest      │
│ 📊 Real-time vulnerability database │
└─────────────────────────────────────┘
```

---

## 📱 MOBILE RESPONSIVE

```
Mobile Layout (< 768px):
┌──────────────────────┐
│ [☰] 🔥 BLAZE [👤]    │
├──────────────────────┤
│                      │
│ Security Score: 87/100
│ ████████░░░░░░░░░░░ │
│                      │
│ 🔴 3 Critical        │
│ 🟠 2 High            │
│                      │
│ [🔄 Rescan]          │
│                      │
│ Recent Issues:       │
│ ┌──────────────────┐ │
│ │ 🔴 SQL Injection │ │
│ │ [View]           │ │
│ │                  │ │
│ │ 🟠 XSS Found     │ │
│ │ [View]           │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘

Hamburger menu collapses sidebar
Bottom navigation for primary actions
Cards stack vertically (no columns)
```

---

## ✨ ANIMATIONS & INTERACTIONS

### **Loading States**
```
Scan in progress:
  Pulsing icon: 🔍 → 🔍 (slow pulse)
  Progress bar: Smooth fill animation
  Status text: Updates live ("Checking 23/51 files...")

Card hover:
  Slight elevation (+2px shadow)
  Border glow (subtle purple shadow)
  Text becomes more colorful
```

### **Micro-interactions**
```
Button click:
  Visual feedback: Brief color flash
  Sound: Optional subtle "ding" (can disable)

Toggle switch:
  Smooth slide animation (200ms)
  Color transition

Notification toast:
  Slide in from right (300ms)
  Auto-dismiss with fade-out (5s)

Page transitions:
  Fade in new content (200ms)
  No jarring jumps
```

---

## 🎭 DARK MODE (Default)

```
Light mode OPTION available, but:
- Dark mode is default (developer preference)
- Light mode supported for accessibility
- System theme preference respected
- Manual toggle in settings

Color adjustments for light mode:
┌─────────────────────────────────┐
│ Dark Mode    │ Light Mode       │
├──────────────┼──────────────────┤
│ #0F172A bg   │ #FFFFFF bg       │
│ #8B5CF6 text │ #6B24C9 text     │
│ #F1F5F9 text │ #0F172A text     │
└─────────────────────────────────┘
```

---

## 🚀 DESIGN IMPLEMENTATION PHASES

### **Phase 1: Component Library (Week 1-2)**
- [ ] Create Tailwind config with color palette
- [ ] Build button, card, alert components
- [ ] Build form inputs & dropdowns
- [ ] Build typography scale
- [ ] Build spacing/grid system

### **Phase 2: Page Redesigns (Week 3-4)**
- [ ] Redesign landing page (hero, trust signals)
- [ ] Redesign dashboard (new layout, charts)
- [ ] Redesign project detail (vulnerability cards)
- [ ] Redesign settings (tabbed interface)

### **Phase 3: Interactions & Polish (Week 5)**
- [ ] Add animations (transitions, hovers)
- [ ] Add dark/light mode toggle
- [ ] Mobile responsiveness audit
- [ ] Performance optimization (Lighthouse 95+)
- [ ] Accessibility audit (WCAG AA)

### **Phase 4: Extensions & Refinement (Week 6)**
- [ ] VS Code extension UI
- [ ] Mobile app mockups
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

---

## 📊 PAGES TO REDESIGN (PRIORITY ORDER)

### **Critical (Immediate Impact)**
1. **Landing Page** - First impression (trust builder)
2. **Dashboard** - Main user interface (engagement)
3. **Project Detail** - Where security happens (conversion)

### **Important (High Priority)**
4. **Settings Page** - LLM configuration (new feature)
5. **Pricing Page** - Revenue driver (clearer, better comparisons)
6. **Login/Auth** - Smooth onboarding

### **Nice to Have (Polish)**
7. **Documentation** - Better navigation
8. **Blog** - Content marketing
9. **Comparison Pages** - SEO content

---

## 💻 FRONTEND STACK RECOMMENDATION

```bash
State Management:   React Context API (hooks)
UI Components:      shadcn/ui (Radix + Tailwind)
Charts/Analytics:   Recharts or Chart.js
Code Highlighting:  Prism.js
Icons:             Lucide React
Animations:        Framer Motion
Dark Mode:         next-themes or simple CSS
DataTable:         TanStack Table (React Table)
Form Handling:     React Hook Form
Testing:           Vitest + Testing Library
```

---

## 🎯 DESIGN GOALS

**By Launch (Week 3):**
- [ ] Landing page looks 2x better than Snyk
- [ ] Dashboard is clean, minimal, fast
- [ ] Trust signals visible everywhere
- [ ] Mobile responsive (tested on iPhone/Android)
- [ ] Dark mode is default, light mode available
- [ ] Feels premium (not startup-y, but not corporate-y)
- [ ] Load time < 2 seconds (Lighthouse 90+)
- [ ] Accessibility score 90+ (WCAG AA)

**Success Metric:**
> "First-time user lands → Thinks 'wow, this looks professional'" 🎨

---

