# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-22

### Added

#### Backend Features
- Friends API: Send, accept, reject friend requests
- Lists API: Full CRUD operations with item management
- Recommendations API: Generate and manage recommendations
- Taste Profile API: Analyze watch history for preferences
- Streaming API: TMDB integration for content search and details

#### Frontend Features
- User authentication (Sign up, Login, Password reset)
- Dashboard with recommendations and trending content
- Friends management page
- Custom lists with privacy controls
- Watch history import (Netflix, Prime Video, Hotstar CSV)
- Content discovery with TMDB search
- Responsive design with Tailwind CSS

#### Infrastructure
- Docker configuration for frontend and backend
- GitHub Actions CI/CD workflows
- Comprehensive test suites (pytest, Vitest)
- Production-ready deployment configurations

### Fixed
- CSV parser date format handling
- Type safety improvements across codebase
- ESLint and Prettier configuration

### Changed
- Migrated from Create React App to Vite
- Updated to React 19 and Tailwind CSS v4
- Improved error handling patterns

## [0.1.0] - 2024-01-01

### Added
- Initial project structure
- Basic authentication scaffolding
- Database schema design
