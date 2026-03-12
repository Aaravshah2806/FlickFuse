Below is a **formal Product Requirements Document (PRD)** based strictly on the architecture and ideas you provided. It is structured for **academic review, hackathon judges, or early-stage product validation**.

---

# Product Requirements Document (PRD)

## Project Title: Unified Streaming Taste & Social Recommendation Platform

---

## 1. Purpose and Vision

The purpose of this product is to provide users with **AI-driven content recommendations and a social discovery experience** across multiple streaming platforms without requiring direct API access or account login to third-party services.

The system enables users to import their own viewing data, derive an intelligent taste profile, receive personalized recommendations, and share curated taste insights with friends in a privacy-preserving manner.

---

## 2. Problem Statement

Streaming platforms operate in silos, each maintaining isolated recommendation systems and closed APIs. Users face the following challenges:

* No unified view of their viewing behavior across platforms.
* No ability to compare tastes or recommendations with friends across different services.
* Limited transparency and control over how recommendations are generated.
* Privacy concerns when third-party applications request direct account access.

---

## 3. Goals and Objectives

### Primary Objectives

* Enable users to import watch history without logging into streaming platforms.
* Generate accurate, AI-based recommendations from derived taste profiles.
* Allow social discovery through a controlled and privacy-safe friend system.

### Non-Goals

* Direct authentication or API integration with Netflix, Prime Video, Hotstar, or similar platforms.
* Redistribution or public exposure of raw user watch history.
* Hosting or streaming copyrighted media.

---

## 4. Target Users

* Streaming consumers using multiple platforms.
* Users interested in data-driven recommendations beyond platform boundaries.
* Users who value privacy and control over personal data.
* Social users who enjoy sharing preferences rather than raw activity.

---

## 5. User Experience Overview

1. User signs up on the platform.
2. User imports watch history via file upload or browser extension.
3. System processes and normalizes viewing data.
4. AI engine generates a taste profile and recommendations.
5. User receives personalized suggestions.
6. User can add friends using a unique ID and view shared taste insights.

---

## 6. Functional Requirements

### 6.1 User Account Management

* User registration and authentication.
* Generation of a unique, non-guessable user ID (COD-style format).
* Profile management (username, visibility settings).

---

### 6.2 Data Import System

#### Option A: CSV / File Upload (Primary)

* Platform-specific import pages with step-by-step guides.
* Supported inputs:

  * CSV files
  * JSON exports
* Supported platforms:

  * Netflix
  * Prime Video
  * Hotstar (expandable)

#### Option B: Browser Extension (Optional / Advanced)

* Chrome / Edge extension.
* Restricted execution scope to specific streaming domains.
* Reads watch history from DOM with explicit user consent.
* Sends structured data to backend API.

---

### 6.3 Data Normalization

Imported data is converted into a unified internal schema:

**Watch Event Fields**

* user_id
* platform
* title
* content_type (movie / series)
* date_watched
* duration (if available)
* metadata_json

---

### 6.4 Taste Profile Generation

The system derives an aggregated taste profile from normalized data, including:

* Genre preferences (weighted vector).
* Language preferences.
* Typical session length.
* Viewing time patterns.
* Recency bias for recent content.

Raw watch history is not exposed publicly.

---

### 6.5 AI Recommendation Engine

* Converts taste profile into a compact AI prompt.
* Generates recommendations from a public content catalog.
* Outputs:

  * Top recommended titles.
  * Explanation signals (optional, non-sensitive).

Example AI Prompt Summary:

> “User prefers dark science fiction, Indian thrillers, average daily watch time X, recent favorites Y. Recommend 10 titles from catalog Z.”

---

### 6.6 Content Catalog

* Based on public metadata sources.
* Stores:

  * Title
  * Genres
  * Languages
  * Ratings
* Contains no personal user data.

---

### 6.7 Social Features

#### Unique ID System

* Each user receives a shareable unique ID.
* IDs can be searched or shared manually.

#### Friend System

* Follow / request / accept flow.
* Friends stored in a dedicated relationship table.

#### Social Visibility

Friends can view:

* Derived taste profiles.
* Public recommendation lists.
* AI-generated suggestions.

Friends cannot view:

* Raw watch history.
* Platform-specific activity logs.

---

### 6.8 Feed and Discovery

* “Friend X recently liked these titles.”
* “Top recommendations among your friends this week.”
* Aggregated, non-identifiable insights only.

---

## 7. Technical Architecture

### 7.1 Backend

* RESTful APIs for:

  * User management
  * Data import
  * Recommendation retrieval
* Periodic batch jobs for:

  * Taste profile recomputation
  * Recommendation updates

### 7.2 Database Schema (High Level)

* users
* watch_events
* taste_profiles
* friendships
* recommendations

---

## 8. Privacy and Compliance

* Explicit user consent for all data imports.
* Storage of derived profiles instead of raw behavioral data for social features.
* Clear disclosure in UI and Terms of Service.
* User-controlled data deletion.
* No automated login to third-party platforms.

---

## 9. Risks and Mitigations

| Risk                    | Mitigation                                   |
| ----------------------- | -------------------------------------------- |
| Platform layout changes | CSV upload as primary fallback               |
| Scraping limitations    | Transparent disclosure and optional feature  |
| Privacy concerns        | Aggregation, anonymization, and user control |
| Data inconsistency      | Robust normalization and validation          |

---

## 10. Success Metrics

* Import success rate.
* Recommendation engagement rate.
* Social interaction frequency.
* User retention after first import.
* Privacy complaints or data deletion requests.

---

## 11. Future Enhancements

* Cross-friend taste overlap visualization.
* Mood-based recommendation modes.
* Time-aware recommendations (weekday vs weekend).
* Exportable taste profile summary for users.

---

## 12. Summary

This product delivers a **cross-platform, privacy-first recommendation and social discovery experience** by shifting control of data import to the user and leveraging AI on derived insights rather than raw personal history. The architecture avoids dependency on proprietary APIs while maintaining scalability, compliance, and user trust.

---