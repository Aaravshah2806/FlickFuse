
DOCUMENT PURPOSE
This PRD provides complete specifications for building a cross-platform streaming recommendation platform. It is designed to be given to an AI system or development team for implementation. All technical decisions, database schemas, API endpoints, and user flows are specified in detail.

1. EXECUTIVE SUMMARY
1.1 Product Vision
Build the definitive cross-platform streaming companion that aggregates viewing history from Netflix, Prime Video, Disney+ Hotstar, and other services to deliver AI-powered personalized recommendations and privacy-first social discovery—without requiring direct API access to streaming platforms.

1.2 Core Value Proposition
Users subscribe to an average of 3–4 streaming services, yet each platform operates in isolation. Our platform solves this by:

Unified Watch History: Single dashboard showing all viewing activity across platforms

AI-Powered Cross-Platform Recommendations: Taste profile understanding complete viewing behavior

Privacy-First Social Features: Share preferences with friends without exposing raw history

User Data Control: No third-party streaming authentication required—users own their data

Platform Independence: Works without relying on streaming platform APIs

1.3 Key Innovation: User-Controlled Data Import
Unlike competitors requiring direct platform authentication, we use two user-controlled import methods:

Method 1: CSV/JSON File Upload (Primary)

User exports their viewing history from streaming platform

User uploads file through our interface

We parse and normalize the data

No API access required, no streaming-account authentication needed

Method 2: Browser Extension (Optional)

Chrome/Edge/Firefox extension

Runs locally in user's browser with explicit consent

Reads DOM elements from viewing history pages

User triggers extraction manually

Sends structured data to our API

Why This Approach Wins:

✅ No streaming API dependencies or rate limits

✅ Respects platform Terms of Service

✅ User maintains complete control

✅ Works even if platforms block third-party apps

✅ Privacy-preserving (users choose what to share)

1.4 Target Users
Primary Persona: Multi-Platform Enthusiast

Age: 25–40

Subscribes to 3–5 streaming services

Needs unified view and better cross-platform recommendations

Secondary Persona: Social Discoverer

Age: 18–35

Enjoys discussing shows with friends

Wants cross-platform social discovery

Tertiary Persona: Privacy-Conscious User

Age: 30–50

Values data ownership and control

Wants clear boundaries on sharing and access

1.5 Success Metrics (6-Month Targets)
Metric	Target	Measurement
Active Users	10,000+	MAU with ≥1 platform imported
Import Success Rate	>90%	Users completing first import successfully
Recommendation Engagement	>60%	Users clicking recommendations weekly
Social Adoption	>40%	Users with 3+ friend connections
User Retention	>50%	Month-6 retention from signup
1.6 Explicit Non-Goals
❌ NO direct authentication to Netflix/Prime/Hotstar accounts
❌ NO hosting or streaming copyrighted media
❌ NO public exposure of raw user watch history
❌ NO automated scraping without user consent
❌ NO recommendation of pirated content

2. PROBLEM STATEMENT & MARKET CONTEXT
2.1 Market Opportunity
Global Streaming Market:

1.1+ billion total subscribers

Average 3.4 subscriptions per household (developed markets)

$100+ billion annual market value

65% of users report difficulty managing multiple services

Target Addressable Market:

United States: 280M streaming users

India: 350M streaming users (fastest growing)

UK, Canada, Australia: 80M combined

Total TAM: ~700M users

2.2 Current Ecosystem Problems
Platform Fragmentation:

No unified viewing history across services

Hard to remember which platform has which content

Repeated browsing across 4–5 different apps

Recommendation Limitations:

Each service sees only its own data

Algorithms biased to platform-owned content

No understanding of complete multi-platform taste

Social Discovery Gaps:

No unified cross-platform “what friends are watching”

Privacy concerns block raw history sharing

Discovery is manual and fragmented

Technical Barriers:

Closed / limited platform APIs

OAuth complexity and policy changes

ToS restrictions on automated access

DOM/UI changes breaking scrapers

2.3 Competitive Landscape
Competitor	Approach	Limitations
JustWatch	Streaming aggregation	No personalization, no watch history, no social
Letterboxd	Manual logging & social	Movies only, manual entry required
TV Time	Series tracking	Series only, manual tracking, limited AI
Reelgood	Platform aggregation	No import, no AI, basic recommendations
Our Solution	Automated import + AI + Social	Comprehensive solution
3. USER EXPERIENCE OVERVIEW
3.1 Core User Journey
text
1. User Registration (via Clerk)
   ↓
2. Data Import (Choose Method)
   ├─→ CSV Upload (Netflix, Prime, Hotstar)
   └─→ Browser Extension (Optional)
   ↓
3. Data Processing & Normalization
   ↓
4. Taste Profile Generation (AI)
   ↓
5. Personalized Recommendations
   ↓
6. Social Features
   ├─→ Add Friends (via Unique ID)
   ├─→ View Friend Taste Profiles
   └─→ Discover Social Recommendations
3.2 Critical User Flows
(unchanged; same as your original flows for import, friends, recommendations.)

4. FUNCTIONAL REQUIREMENTS
4.1 User Account Management
4.1.1 Registration & Authentication (via Clerk)
Identity Provider:

Use Clerk as the managed authentication and user management provider.

Supported Methods (through Clerk):

Email/password (Clerk-managed)

OAuth providers supported by Clerk (e.g., Google, Apple), enabled via Clerk dashboard

Authentication Flow:

Frontend uses Clerk React SDK for sign-in, sign-up, and session management.

Clerk stores and manages passwords, sessions, MFA, email verification, etc.

Backend receives Clerk JWT/session tokens on each request and verifies them using Clerk’s server SDK/middleware.

On first successful Clerk login, backend creates an internal users record linked to the Clerk user ID.

Security Responsibilities:

Clerk: password security, MFA, email verification, account lockout, device/session management.

Our backend: authorization, rate limiting, access control to resources based on internal users.id mapped to Clerk user ID.

4.1.2 Unique User ID System
Each user has:

Clerk user ID (e.g., user_abc123) as the external identity.

Internal users.id (UUID) as primary key in our DB.

A human-friendly immutable ID (XYZ-12345) for sharing and friend search.

(Format, generation, and usage same as before.)

4.1.3 Profile Management
(Exactly as previously defined: username, display_name, profile_picture, bio, favorite_genres, preferred_languages, plus privacy settings. All stored in our own users table keyed by internal users.id, which is mapped 1:1 to Clerk user ID.)

4.2 Data Import System
(4.2.1–4.2.4 unchanged from previous PRD: supported platforms, CSV/JSON specs, upload flow, browser extension.)

4.3 Data Normalization & Storage
4.3.1 Unified Watch Event Schema
(Your existing watch_events table, unchanged.)

4.3.2 Data Processing Pipeline
(Your existing 7-step pipeline, unchanged.)

4.3.3 Persistent User Data
Every user’s watch history, taste profile, friends, and social activity are stored in our own PostgreSQL database.

Internal users.id is used as the foreign key across:

watch_events (normalized watched movies/shows per user)

taste_profiles

friendships

social_feed_events

user_lists and user_list_items

Clerk is used only for identity and auth; all domain data (watched movies, social graph, etc.) is our own DB.

4.4 AI Recommendation Engine
(4.4.1–4.4.4 exactly as previously defined: taste profiles, AI integration, content_catalog, recommendations.)

4.5 External Content & Availability APIs
4.5.1 Objectives
Provide rich metadata and posters for catalog/recommended titles without storing image files locally.

Show “where to watch” (platform availability) for each title per country (starting with India).

Use legal, documented APIs and design for rate limits (no “unlimited free” assumptions).

4.5.2 TMDb Integration (Metadata + Posters)
TMDb used as primary metadata source for content_catalog: title, overview, genres, languages, release year.

content_catalog stores:

tmdb_id (integer)

poster_path (string)

Frontend builds poster URLs:

https://image.tmdb.org/t/p/w500{poster_path}

https://image.tmdb.org/t/p/original{poster_path}

Posters are not stored in S3 or locally; only TMDb CDN URLs are used.

TMDb attribution (logo/text) displayed in app.

TMDb responses cached on backend and refreshed via background jobs (e.g., nightly).

4.5.3 Streaming Availability API (Where to Watch)
Use a third-party availability API (e.g., Streaming Availability API or Watchmode) to map titles to platforms (Netflix, Prime Video, Disney+ Hotstar, Zee5, etc.) for country=IN.

Backend queries provider by TMDb ID and/or title+year, then normalizes response to content_catalog.platform_availability (TEXT[], e.g. ['netflix','prime_video','hotstar']).

Frontend displays badges/icons like “Available on: Netflix, Prime Video” using these codes.

Availability results cached by catalog_id + country and refreshed periodically (24–72h) by background jobs; no direct client → provider calls.

4.5.4 No “Unlimited Free” Assumption
All external APIs assumed to have quotas and rate limits.

System must operate within free/low-cost tiers using caching, batching, and periodic sync.

If a provider removes free tiers or changes pricing:

API access goes through a thin adapter layer to allow provider swap.

Non-critical UI (availability badges) must degrade gracefully without breaking core flows.

4.5.5 Data Model Extensions
content_catalog is extended as:

sql
ALTER TABLE content_catalog
  ADD COLUMN tmdb_id INTEGER,
  ADD COLUMN poster_path TEXT,
  ADD COLUMN external_ids JSONB, -- { "imdb": "tt0944947", "omdb": "..." },
  ADD COLUMN availability_last_checked TIMESTAMPTZ;
platform_availability continues to store normalized platform codes.

Background jobs populate tmdb_id, poster_path, external_ids, and periodically update availability fields.

4.6 Social Features
(4.6.1–4.6.4: friendships, social feed, curated lists — unchanged, just renumbered from 4.5.)

Note: All social data (friends, feed events, lists) are stored in our own DB, keyed by user_id (internal) linked to Clerk user.

5. TECHNICAL ARCHITECTURE
5.1 System Architecture Overview
(Your existing three-tier diagram and description.)

5.2 Technology Stack Recommendations
Frontend:

React 18+ with TypeScript

Clerk React SDK for auth (sign-in/sign-up components, user profile, session handling)

Redux Toolkit or Zustand

React Router v6

MUI or Tailwind CSS + shadcn/ui

Axios with interceptors

Vite

Backend:

Node.js 20 + Express.js + TypeScript or Python 3.11+ + FastAPI

ORM: Prisma / SQLAlchemy

Clerk backend SDK/middleware to verify Clerk JWT/session on all protected routes and map to internal users row

Validation: Zod / Pydantic

Database & Infra:
(As before: PostgreSQL, Redis, S3/MinIO, optional Elasticsearch, Docker/K8s, GitHub Actions, Prometheus/Grafana/Sentry, ELK.)

AI Integration:
(As before: GPT-4, Claude Sonnet, embedding models.)

5.3 Complete Database Schema
(As before, but conceptually:

users includes a field for clerk_user_id

All other tables (watch_events, friendships, user_lists, etc.) reference users.id.)

5.4 API Endpoints
Auth endpoints that were previously email/password/JWT can now be simplified/adjusted to a Clerk-based model, where:

Most auth UI/flows are handled on frontend via Clerk.

Backend exposes only application endpoints, expecting a valid Clerk-authenticated request (e.g., using Clerk middleware).

You can either keep the existing endpoint list and annotate them as “protected via Clerk auth”, or explicitly drop custom auth endpoints and keep only domain APIs (/api/import, /api/watch-events, /api/recommendations, /api/friends, etc.).

6–8. SECURITY, PHASES, SUCCESS CRITERIA, APPENDIX
These remain the same, with one conceptual update:

Authentication security: password storage and MFA are delegated to Clerk; our API security still enforces TLS, rate limiting, validation, etc.

User data: watch history, recommendations, social graph are always in our own DB, not in Clerk.

