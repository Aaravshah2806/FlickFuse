# UI/UX DESIGN SPECIFICATION
## Unified Streaming Taste & Social Recommendation Platform

**Version:** 2.0  
**Date:** February 3, 2026  
**Document Owner:** Design & Product Team  

---

## DOCUMENT PURPOSE

This document provides complete UI/UX specifications for building the streaming recommendation platform. It includes wireframes descriptions, user flows, component specifications, design system guidelines, and interaction patterns. Designed for AI implementation or development handoff.

---

## 1. DESIGN PRINCIPLES

### 1.1 Core Principles

**1. Clarity Over Complexity**
- Every screen should have a single primary action
- Use progressive disclosure for advanced features
- Minimize cognitive load with clear visual hierarchy

**2. Privacy by Design**
- Make privacy settings visible and accessible
- Clear visual indicators of what data is shared
- Default to most private settings

**3. Cross-Platform Consistency**
- Unified design language across web and extension
- Consistent navigation and interaction patterns
- Responsive design for desktop, tablet, mobile

**4. Delight in Discovery**
- Playful interactions when discovering recommendations
- Celebrate user milestones (first import, first friend, etc.)
- Smooth animations and transitions

**5. Accessibility First**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader friendly
- High contrast mode available

### 1.2 Design System

**Color Palette:**

```
Primary Colors:
- Primary Blue: #2563EB (buttons, links, active states)
- Primary Dark: #1E40AF (hover states)
- Primary Light: #DBEAFE (backgrounds, highlights)

Neutral Colors:
- Gray 900: #111827 (primary text)
- Gray 700: #374151 (secondary text)
- Gray 500: #6B7280 (tertiary text, icons)
- Gray 300: #D1D5DB (borders, dividers)
- Gray 100: #F3F4F6 (backgrounds)
- Gray 50: #F9FAFB (surface backgrounds)
- White: #FFFFFF

Semantic Colors:
- Success Green: #10B981 (success states, confirmations)
- Warning Yellow: #F59E0B (warnings, attention)
- Error Red: #EF4444 (errors, destructive actions)
- Info Blue: #3B82F6 (informational messages)

Platform Colors (for badges/tags):
- Netflix Red: #E50914
- Prime Blue: #00A8E1
- Hotstar Gold: #D4AF37
```

**Typography:**

```
Font Family: 
- Primary: Inter (system-ui fallback)
- Monospace: 'Roboto Mono' (for unique IDs, codes)

Type Scale:
- Headline 1: 36px / 2.25rem, Bold, Line height 1.2
- Headline 2: 30px / 1.875rem, Bold, Line height 1.3
- Headline 3: 24px / 1.5rem, Semibold, Line height 1.4
- Headline 4: 20px / 1.25rem, Semibold, Line height 1.4
- Body Large: 18px / 1.125rem, Regular, Line height 1.6
- Body: 16px / 1rem, Regular, Line height 1.6
- Body Small: 14px / 0.875rem, Regular, Line height 1.5
- Caption: 12px / 0.75rem, Regular, Line height 1.4
```

**Spacing Scale:**

```
Based on 8px grid system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
```

**Border Radius:**

```
- sm: 4px (small elements, badges)
- md: 8px (cards, inputs, buttons)
- lg: 12px (larger cards, modals)
- xl: 16px (hero sections)
- full: 9999px (circular elements)
```

**Shadows:**

```
- sm: 0 1px 2px rgba(0, 0, 0, 0.05)
- md: 0 4px 6px rgba(0, 0, 0, 0.1)
- lg: 0 10px 15px rgba(0, 0, 0, 0.1)
- xl: 0 20px 25px rgba(0, 0, 0, 0.1)
```

---

## 2. INFORMATION ARCHITECTURE

### 2.1 Site Map

```
Homepage (Landing/Marketing)
│
├── Sign Up / Login
│   
└── Dashboard (Post-Login)
    │
    ├── Home Feed
    │   ├── Recommendations
    │   ├── Social Activity
    │   └── Quick Actions
    │
    ├── My Data
    │   ├── Import Data
    │   │   ├── Netflix Import
    │   │   ├── Prime Video Import
    │   │   └── Hotstar Import
    │   ├── Watch History
    │   └── Taste Profile
    │
    ├── Recommendations
    │   ├── For You
    │   ├── Trending
    │   └── By Genre
    │
    ├── Friends
    │   ├── My Friends
    │   ├── Find Friends
    │   ├── Friend Requests
    │   └── Friend Profile View
    │
    ├── Lists
    │   ├── My Lists
    │   ├── Create List
    │   └── Friends' Lists
    │
    └── Settings
        ├── Profile
        ├── Privacy
        ├── Notifications
        └── Account
```

### 2.2 Navigation Structure

**Primary Navigation (Top Bar):**
- Logo (home link)
- Home
- Recommendations
- Friends
- Lists
- Search (global)
- User Menu (profile, settings, logout)

**Mobile Navigation:**
- Bottom tab bar with 5 icons:
  - Home
  - Recommendations
  - Friends
  - Lists
  - Profile

---

## 3. KEY SCREENS & WIREFRAMES

### 3.1 Landing Page (Pre-Login)

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  [Logo]              [Login] [Sign Up]             │
├────────────────────────────────────────────────────┤
│                                                    │
│              HERO SECTION                          │
│                                                    │
│   Your Streaming Recommendations,                 │
│        All in One Place                           │
│                                                    │
│   Aggregate viewing from Netflix, Prime, Hotstar  │
│   Get AI-powered recommendations                   │
│   Share taste with friends privately              │
│                                                    │
│              [Get Started Free]                    │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│          HOW IT WORKS (3 STEPS)                    │
│                                                    │
│  [Icon 1]         [Icon 2]         [Icon 3]       │
│  Import Your      Get AI           Share With     │
│  Watch History    Recommendations  Friends        │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│          FEATURES SECTION                          │
│                                                    │
│  ✓ Privacy-First Design                          │
│  ✓ No API Access Required                        │
│  ✓ Works Across All Platforms                    │
│  ✓ Smart AI Recommendations                      │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│          FOOTER                                    │
│  About | Privacy | Terms | Contact                │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Components:**
- Hero with gradient background
- CTA button (prominent, blue, large)
- 3-column feature grid
- Platform logos (Netflix, Prime, Hotstar)
- Social proof (if available: "Join 10,000+ users")

### 3.2 Sign Up Flow

**Screen 1: Registration**

```
┌────────────────────────────────────────┐
│         Create Your Account            │
│                                        │
│  [Email input field]                   │
│  [Password input field]                │
│  [Confirm Password input field]        │
│                                        │
│  ☐ I agree to Terms and Privacy Policy │
│                                        │
│  [Create Account Button]               │
│                                        │
│  ─────── OR ───────                    │
│                                        │
│  [Continue with Google]                │
│  [Continue with Apple]                 │
│                                        │
│  Already have an account? [Login]      │
└────────────────────────────────────────┘
```

**Screen 2: Email Verification**

```
┌────────────────────────────────────────┐
│         Verify Your Email              │
│                                        │
│  We sent a verification link to:       │
│  user@example.com                      │
│                                        │
│  Please check your inbox and click     │
│  the link to verify your account.      │
│                                        │
│  [Resend Verification Email]           │
│                                        │
└────────────────────────────────────────┘
```

**Screen 3: Welcome & Setup**

```
┌────────────────────────────────────────┐
│         Welcome to StreamSync!         │
│                                        │
│  Your unique ID: ABC-12345             │
│  [Copy ID]                             │
│                                        │
│  Share this with friends to connect!   │
│                                        │
│  Let's get started by importing your   │
│  viewing history from your favorite    │
│  streaming platforms.                  │
│                                        │
│  [Import Netflix Data]                 │
│  [Import Prime Video Data]             │
│  [Import Hotstar Data]                 │
│                                        │
│  [Skip for Now]                        │
└────────────────────────────────────────┘
```

### 3.3 Dashboard (Home Feed)

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Home  Recs  Friends  Lists    [Search] [👤 Profile] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Welcome back, John! 👋                                │ │
│  │  Your unique ID: XYZ-12345 [Copy]                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  QUICK ACTIONS                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ [+]      │ │ [↻]      │ │ [👥]     │ │ [⚙️]     │      │
│  │ Import   │ │ Refresh  │ │ Add      │ │ Settings │      │
│  │ Data     │ │ Recs     │ │ Friends  │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  RECOMMENDATIONS FOR YOU                    [View All →]     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ┌─────┐  Dark                            Match: 92%  │   │
│  │ │IMG  │  Thriller • Sci-Fi • German                  │   │
│  │ │     │  "Perfect for Breaking Bad fans"             │   │
│  │ └─────┘  [Netflix] [Want to Watch] [Not Interested] │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ┌─────┐  Money Heist                     Match: 88%  │   │
│  │ │IMG  │  Thriller • Drama • Spanish                  │   │
│  │ │     │  "Complex heist with great characters"       │   │
│  │ └─────┘  [Netflix] [Want to Watch] [Not Interested] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  FRIEND ACTIVITY                            [View All →]     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Sarah (ABC-111) recently loved:                      │   │
│  │ • The Crown                                           │   │
│  │ • Succession                                          │   │
│  │ • The White Lotus                                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Mike (XYZ-222) created a list:                       │   │
│  │ "Best Thrillers of 2025" (12 titles)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Components:**
- Sticky top navigation
- Personalized greeting with unique ID
- Quick action cards (4 primary actions)
- Recommendation carousel (horizontal scroll)
- Friend activity feed
- "View All" links to dedicated pages

### 3.4 Data Import - Netflix Flow

**Screen 1: Import Instructions**

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Netflix Logo]  Import Netflix Watch History           │
│                                                          │
│  STEP 1: Export Your Data from Netflix                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1. Go to Netflix.com and log in                    │ │
│  │                                                     │ │
│  │ 2. Click your profile → Account                    │ │
│  │    [Screenshot showing menu]                        │ │
│  │                                                     │ │
│  │ 3. Scroll down to "Viewing Activity"               │ │
│  │    [Screenshot showing section]                     │ │
│  │                                                     │ │
│  │ 4. Click "Download All" at bottom of page          │ │
│  │    [Screenshot showing button]                      │ │
│  │                                                     │ │
│  │ 5. Save the CSV file to your computer              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  STEP 2: Upload Your File                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │          📁 Drag and drop CSV file here            │ │
│  │                    or                              │ │
│  │              [Choose File]                         │ │
│  │                                                     │ │
│  │  Accepted formats: .csv (max 50MB)                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Cancel]                         [Upload & Import]      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Screen 2: Import Processing**

```
┌──────────────────────────────────────────┐
│  Importing Netflix Watch History         │
│                                          │
│  ████████████░░░░░░░░ 65%               │
│                                          │
│  Processing 1,247 titles...              │
│  • Validated: 1,240                      │
│  • Duplicates: 15                        │
│  • Errors: 7                             │
│                                          │
│  This may take a minute...               │
│                                          │
└──────────────────────────────────────────┘
```

**Screen 3: Import Success**

```
┌──────────────────────────────────────────┐
│  ✅ Netflix Import Complete!             │
│                                          │
│  Successfully imported 1,225 titles      │
│  from 2020-2026                          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📊 Your Stats:                     │ │
│  │                                    │ │
│  │ Total Titles: 1,225                │ │
│  │ Movies: 432                        │ │
│  │ Series: 793                        │ │
│  │ Date Range: Jan 2020 - Feb 2026   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Your taste profile is being generated   │
│  and you'll receive personalized          │
│  recommendations within 24 hours.         │
│                                          │
│  [View Watch History]                    │
│  [Import Another Platform]               │
│  [Go to Dashboard]                       │
│                                          │
└──────────────────────────────────────────┘
```

### 3.5 Recommendations Page

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Home  Recs  Friends  Lists    [Search] [👤 Profile] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Recommendations For You                                      │
│                                                              │
│  FILTERS: [All] [Movies] [Series] [Netflix] [Prime] [...]   │
│  SORT BY: [Match Score ▼] [Latest] [Popular]                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ┌───────┐                                              │ │
│  │ │       │  Dark                         Match: 92% ⭐  │ │
│  │ │ POSTER│  Thriller • Sci-Fi • German • 2017-2020     │ │
│  │ │ IMAGE │                                              │ │
│  │ │       │  Netflix                                     │ │
│  │ └───────┘                                              │ │
│  │                                                        │ │
│  │  "Perfect match for Breaking Bad fans who enjoy       │ │
│  │   complex narratives and sci-fi elements. Dark        │ │
│  │   weaves time travel with German drama."              │ │
│  │                                                        │ │
│  │  [▶️ Watch Trailer] [+ Add to List] [✓ Watched]       │ │
│  │                          [👎 Not Interested]           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ┌───────┐                                              │ │
│  │ │       │  Money Heist                  Match: 88% ⭐  │ │
│  │ │ POSTER│  Thriller • Drama • Spanish • 2017-2021     │ │
│  │ │ IMAGE │                                              │ │
│  │ │       │  Netflix                                     │ │
│  │ └───────┘                                              │ │
│  │                                                        │ │
│  │  "Intense heist thriller with character depth         │ │
│  │   matching your preferences for Narcos and drama."    │ │
│  │                                                        │ │
│  │  [▶️ Watch Trailer] [+ Add to List] [✓ Watched]       │ │
│  │                          [👎 Not Interested]           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Load More Recommendations]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Interaction States:**

When user clicks "Watched":
- Card gets subtle green border
- "Watched" button becomes filled green with checkmark
- Feedback sent to server
- Card fades out after 2 seconds

When user clicks "Not Interested":
- Card fades out with animation
- Feedback sent to server
- Next recommendation loads

### 3.6 Add Friend Flow

**Screen 1: Find Friends**

```
┌──────────────────────────────────────────┐
│  Find Friends                            │
│                                          │
│  Enter Friend's Unique ID                │
│  ┌────────────────────────────────────┐ │
│  │ ABC-12345                          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  OR                                      │
│                                          │
│  [📱 Scan QR Code]                       │
│  [📋 Share My ID: XYZ-67890]             │
│                                          │
└──────────────────────────────────────────┘
```

**Screen 2: Friend Profile Preview**

```
┌──────────────────────────────────────────┐
│  ┌────┐                                  │
│  │ 👤 │  Sarah Johnson                   │
│  └────┘  @sarahj • ABC-12345             │
│                                          │
│  📊 Taste Compatibility: 78%             │
│                                          │
│  Favorite Genres:                        │
│  Drama (45%) • Thriller (32%) • Comedy   │
│                                          │
│  Recent Favorites:                       │
│  • The Crown                             │
│  • Succession                            │
│  • The White Lotus                       │
│                                          │
│  [Send Friend Request]                   │
│  [Cancel]                                │
│                                          │
└──────────────────────────────────────────┘
```

**Screen 3: Request Sent Confirmation**

```
┌──────────────────────────────────────────┐
│  ✅ Friend Request Sent!                 │
│                                          │
│  Your request to Sarah Johnson has       │
│  been sent. You'll be notified when      │
│  she accepts.                            │
│                                          │
│  [Add Another Friend]                    │
│  [Go to Friends Page]                    │
│                                          │
└──────────────────────────────────────────┘
```

### 3.7 Friend Profile View

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Home  Recs  Friends  Lists    [Search] [👤 Profile] │
├──────────────────────────────────────────────────────────────┤
│  ← Back to Friends                                           │
│                                                              │
│  ┌──────┐                                                    │
│  │ PROF │  Sarah Johnson                                     │
│  │ PIC  │  @sarahj • ABC-12345                              │
│  └──────┘  Friends since Jan 2026                           │
│            [Message] [Remove Friend]                         │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  TASTE COMPATIBILITY                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  You and Sarah have 78% taste overlap! 🎉             │ │
│  │                                                        │ │
│  │  Common Interests:                                     │ │
│  │  • Drama Series                                        │ │
│  │  • British Content                                     │ │
│  │  • Character-driven narratives                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  TASTE PROFILE                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Genre Preferences:                                     │ │
│  │ Drama      ████████████████░░░░░ 45%                  │ │
│  │ Thriller   ████████████░░░░░░░░░ 32%                  │ │
│  │ Comedy     ███████████░░░░░░░░░░ 28%                  │ │
│  │                                                        │ │
│  │ Language Preferences:                                  │ │
│  │ English (85%), Spanish (10%), French (5%)             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  RECENT RECOMMENDATIONS                   [View All →]       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ┌─────┐  The Crown            Match for Sarah: 95%    │ │
│  │ │IMG  │  Drama • Historical                           │ │
│  │ └─────┘  [Add to My List]                             │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ ┌─────┐  Succession           Match for Sarah: 92%    │ │
│  │ │IMG  │  Drama • Comedy                               │ │
│  │ └─────┘  [Add to My List]                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  SARAH'S PUBLIC LISTS                     [View All →]       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📋 Best Thrillers of 2025 (12 titles)                 │ │
│  │ 📋 Weekend Binge Watch (8 titles)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.8 Create List Flow

**Screen 1: Create New List**

```
┌──────────────────────────────────────────┐
│  Create New List                         │
│                                          │
│  List Title *                            │
│  ┌────────────────────────────────────┐ │
│  │ Best Sci-Fi Series                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Description (Optional)                  │
│  ┌────────────────────────────────────┐ │
│  │ My favorite sci-fi shows that      │ │
│  │ blend science with great stories   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Visibility                              │
│  ⚫ Public (visible to everyone)        │
│  ○ Friends Only                         │
│  ○ Private (only me)                    │
│                                          │
│  [Cancel]              [Create List]     │
│                                          │
└──────────────────────────────────────────┘
```

**Screen 2: Add Items to List**

```
┌──────────────────────────────────────────────────────────────┐
│  Best Sci-Fi Series                      [Edit] [Share] [×]  │
│  Private list • 0 items                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Search to add titles                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search for movies or series...                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  SUGGESTED BASED ON YOUR TASTE:                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ┌─────┐  Dark                        [+ Add]          │ │
│  │ │IMG  │  Thriller • Sci-Fi • German                   │ │
│  │ └─────┘  Netflix                                       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ ┌─────┐  Stranger Things             [+ Add]          │ │
│  │ │IMG  │  Sci-Fi • Drama • Horror                      │ │
│  │ └─────┘  Netflix                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Screen 3: List with Items**

```
┌──────────────────────────────────────────────────────────────┐
│  Best Sci-Fi Series                      [Edit] [Share] [×]  │
│  Public list • 5 items                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [+ Add More Titles]                                         │
│                                                              │
│  YOUR LIST:                                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. ┌─────┐  Dark                        [Remove]      │ │
│  │    │IMG  │  Netflix                                    │ │
│  │    └─────┘                                             │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 2. ┌─────┐  Stranger Things             [Remove]      │ │
│  │    │IMG  │  Netflix                                    │ │
│  │    └─────┘                                             │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 3. ┌─────┐  Black Mirror                [Remove]      │ │
│  │    │IMG  │  Netflix                                    │ │
│  │    └─────┘                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Drag to reorder items                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.9 Settings Page

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Home  Recs  Friends  Lists    [Search] [👤 Profile] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────────────────────────────────┐ │
│  │            │  │                                        │ │
│  │ SIDEBAR    │  │  PROFILE                               │ │
│  │            │  │                                        │ │
│  │ ⚫ Profile  │  │  Profile Picture                       │ │
│  │ ○ Privacy  │  │  ┌──────────┐                         │ │
│  │ ○ Notifs   │  │  │  IMAGE   │  [Change]               │ │
│  │ ○ Account  │  │  └──────────┘                         │ │
│  │            │  │                                        │ │
│  │            │  │  Display Name                          │ │
│  │            │  │  ┌──────────────────────────────────┐ │ │
│  │            │  │  │ John Doe                         │ │ │
│  │            │  │  └──────────────────────────────────┘ │ │
│  │            │  │                                        │ │
│  │            │  │  Username                              │ │
│  │            │  │  ┌──────────────────────────────────┐ │ │
│  │            │  │  │ @johndoe                         │ │ │
│  │            │  │  └──────────────────────────────────┘ │ │
│  │            │  │                                        │ │
│  │            │  │  Your Unique ID                        │ │
│  │            │  │  ┌──────────────────────────────────┐ │ │
│  │            │  │  │ XYZ-12345         [Copy]         │ │ │
│  │            │  │  └──────────────────────────────────┘ │ │
│  │            │  │                                        │ │
│  │            │  │  Bio                                   │ │
│  │            │  │  ┌──────────────────────────────────┐ │ │
│  │            │  │  │ Movie enthusiast. Love thrillers │ │ │
│  │            │  │  │ and sci-fi!                      │ │ │
│  │            │  │  └──────────────────────────────────┘ │ │
│  │            │  │                                        │ │
│  │            │  │  [Cancel]           [Save Changes]     │ │
│  │            │  │                                        │ │
│  └────────────┘  └────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Privacy Settings Tab:**

```
┌────────────────────────────────────────┐
│  PRIVACY SETTINGS                      │
│                                        │
│  Profile Visibility                    │
│  ⚫ Public                             │
│  ○ Friends Only                       │
│  ○ Private                            │
│                                        │
│  Who can see my taste profile?         │
│  ⚫ All Friends                        │
│  ○ Selected Friends                   │
│  ○ Nobody                             │
│                                        │
│  Show recent activity to friends?      │
│  ☑ Yes                                │
│                                        │
│  Allow friends to see my               │
│  recommendations?                      │
│  ☑ Yes                                │
│                                        │
│  [Save Privacy Settings]               │
│                                        │
└────────────────────────────────────────┘
```

---

## 4. COMPONENT SPECIFICATIONS

### 4.1 Button Component

**Primary Button:**
```css
background: #2563EB
color: #FFFFFF
padding: 12px 24px
border-radius: 8px
font-weight: 600
font-size: 16px

hover:
  background: #1E40AF
  transform: translateY(-1px)
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3)

active:
  background: #1E3A8A
  transform: translateY(0)
```

**Secondary Button:**
```css
background: transparent
border: 1px solid #D1D5DB
color: #374151
padding: 12px 24px
border-radius: 8px

hover:
  border-color: #2563EB
  color: #2563EB
  background: #DBEAFE
```

**Sizes:**
- Small: padding 8px 16px, font-size 14px
- Medium (default): padding 12px 24px, font-size 16px
- Large: padding 16px 32px, font-size 18px

### 4.2 Card Component

**Recommendation Card:**
```css
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 12px
padding: 20px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
transition: all 0.2s

hover:
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1)
  transform: translateY(-2px)
```

### 4.3 Input Field Component

**Text Input:**
```css
border: 1px solid #D1D5DB
border-radius: 8px
padding: 12px 16px
font-size: 16px
background: #FFFFFF

focus:
  border-color: #2563EB
  outline: none
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)

error:
  border-color: #EF4444
  
  ::placeholder {
    color: #9CA3AF
  }
```

### 4.4 Platform Badge Component

**Netflix Badge:**
```css
background: #E50914
color: #FFFFFF
padding: 4px 12px
border-radius: 16px
font-size: 12px
font-weight: 600
display: inline-flex
align-items: center
```

**Prime Badge:**
```css
background: #00A8E1
(same other properties)
```

### 4.5 Match Score Display

```html
<div class="match-score">
  <div class="score-circle">92%</div>
  <span class="score-label">Match Score</span>
</div>
```

```css
.score-circle {
  width: 48px
  height: 48px
  border-radius: 50%
  background: linear-gradient(135deg, #10B981, #059669)
  color: white
  display: flex
  align-items: center
  justify-content: center
  font-weight: 700
}

.score-label {
  font-size: 12px
  color: #6B7280
}
```

---

## 5. RESPONSIVE DESIGN

### 5.1 Breakpoints

```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
Large Desktop: > 1440px
```

### 5.2 Mobile Adaptations

**Navigation:**
- Top bar collapses to hamburger menu
- Bottom tab bar for primary navigation
- User profile accessible from menu

**Cards:**
- Stack vertically instead of grid
- Full width on mobile
- Smaller padding (16px instead of 20px)

**Forms:**
- Full width inputs
- Larger touch targets (min 44px height)
- Simplified layouts

### 5.3 Tablet Optimizations

- 2-column grid for recommendations
- Sidebar navigation remains visible
- Slightly reduced padding

---

## 6. ANIMATIONS & INTERACTIONS

### 6.1 Page Transitions

```css
.page-enter {
  opacity: 0
  transform: translateY(20px)
}

.page-enter-active {
  opacity: 1
  transform: translateY(0)
  transition: all 0.3s ease-out
}
```

### 6.2 Micro-Interactions

**Button Click:**
```
Scale down to 0.95 for 100ms
Spring back to 1.0
```

**Card Hover:**
```
Lift 2px
Add shadow
Duration: 200ms
Easing: ease-out
```

**Recommendation Feedback:**
```
When "Watched" clicked:
1. Flash green border (200ms)
2. Fade out card (400ms)
3. Slide up next recommendation (300ms)
```

### 6.3 Loading States

**Skeleton Screens:**
- Use for recommendation cards
- Pulse animation (2s infinite)
- Match layout of actual content

**Spinners:**
- Use for data processing
- Indeterminate progress for unknown duration
- Determinate progress bar for file uploads

---

## 7. ACCESSIBILITY GUIDELINES

### 7.1 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus indicators visible (2px blue outline)
- Logical tab order
- Escape key to close modals
- Enter/Space to activate buttons

### 7.2 Screen Reader Support

**ARIA Labels:**
```html
<button aria-label="Add Dark to watchlist">
  <PlusIcon />
</button>

<div role="alert" aria-live="polite">
  Import completed successfully
</div>
```

**Semantic HTML:**
- Use proper heading hierarchy (h1 > h2 > h3)
- Use `<nav>`, `<main>`, `<article>` tags
- Use `<button>` for actions, `<a>` for links

### 7.3 Color Contrast

- Text on background: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### 7.4 Focus Management

- Move focus to modal when opened
- Return focus when modal closed
- Skip links for keyboard users
- Focus trap in modals

---

## 8. ERROR STATES

### 8.1 Form Validation Errors

```
[Input Field with red border]
⚠️ Please enter a valid email address
```

**Inline validation:**
- Show errors immediately after blur
- Clear errors on valid input
- Use red color (#EF4444)
- Include icon and message

### 8.2 API Errors

**Toast Notification:**
```
┌──────────────────────────────────────┐
│ ⚠️ Failed to load recommendations    │
│ Please try again later.              │
│                            [Dismiss]  │
└──────────────────────────────────────┘
```

**Full Page Error:**
```
┌──────────────────────────────────────┐
│         Something went wrong         │
│                                      │
│  We couldn't load this page.         │
│  Please try again.                   │
│                                      │
│  [Retry] [Go to Dashboard]           │
│                                      │
└──────────────────────────────────────┘
```

### 8.3 Empty States

**No Recommendations Yet:**
```
┌──────────────────────────────────────┐
│         📺                           │
│                                      │
│  No Recommendations Yet              │
│                                      │
│  Import your watch history to get    │
│  personalized recommendations.       │
│                                      │
│  [Import Data]                       │
│                                      │
└──────────────────────────────────────┘
```

---

## 9. BROWSER EXTENSION UI

### 9.1 Extension Popup (Chrome)

**Dimensions:** 400px × 600px

```
┌────────────────────────────────────┐
│ StreamSync                      [×] │
├────────────────────────────────────┤
│                                    │
│  Logged in as: johndoe             │
│  Your ID: XYZ-12345 [Copy]         │
│                                    │
│  ─────────────────────────────────│
│                                    │
│  📺 Netflix Watch History          │
│                                    │
│  Detected: You're on Netflix       │
│  viewing activity page             │
│                                    │
│  [Extract Watch History]           │
│                                    │
│  ─────────────────────────────────│
│                                    │
│  Recent Syncs:                     │
│  ✓ Netflix: 2 days ago (1,247)    │
│  ✓ Prime: 1 week ago (543)         │
│                                    │
│  [Settings] [Logout]               │
│                                    │
└────────────────────────────────────┘
```

### 9.2 Extension Options Page

Full browser tab for settings and detailed sync history.

---

## 10. NOTIFICATION SYSTEM

### 10.1 In-App Notifications

**Toast Notifications (Bottom Right):**
```
Duration: 5 seconds
Position: Fixed bottom-right, 24px from edges
Max width: 400px
Auto-dismiss or manual close

Types:
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)
```

### 10.2 Push Notifications (Future)

- Friend request received
- Recommendations ready
- Friend activity (if enabled)
- Import completion

---

## 11. PERFORMANCE CONSIDERATIONS

### 11.1 Image Optimization

- Use WebP format with JPEG fallback
- Lazy loading for off-screen images
- Responsive images with srcset
- Poster images max 800px width

### 11.2 Code Splitting

- Route-based code splitting
- Lazy load heavy components (charts, modals)
- Defer non-critical JavaScript

### 11.3 Caching Strategy

- Cache static assets (CSS, JS, images)
- Service worker for offline support
- Cache API responses (5 minute TTL for recommendations)

---

## APPENDIX: Design Assets Checklist

**Icons Needed:**
- Platform logos (Netflix, Prime, Hotstar)
- Navigation icons (home, recommendations, friends, lists)
- Action icons (add, remove, edit, share, copy, search)
- Status icons (check, error, warning, info)
- Feedback icons (thumbs up/down, star, heart)

**Illustrations:**
- Empty states
- Error pages
- Onboarding screens
- Email verification confirmation

**Photography/Imagery:**
- Landing page hero image
- Feature showcase images

---

**END OF UI/UX SPECIFICATION**
