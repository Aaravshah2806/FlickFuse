# GitHub Actions Secrets Configuration

This document lists all the GitHub Actions secrets required for CI/CD deployment.

## Required Secrets

### Docker Hub
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token

### Supabase
- `VITE_SUPABASE_URL` - Supabase project URL (frontend build)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (frontend build)
- `SUPABASE_URL` - Supabase project URL (backend runtime)
- `SUPABASE_SERVICE_KEY` - Supabase service role key (backend runtime)

### External APIs
- `VITE_TMDB_API_KEY` - TMDB API key (frontend build)
- `TMDB_API_KEY` - TMDB API key (backend runtime)
- `STREAMING_AVAILABILITY_API_KEY` - Streaming availability API key (optional)

### Staging Server
- `STAGING_HOST` - Staging server hostname/IP
- `STAGING_USER` - Staging SSH username
- `STAGING_SSH_KEY` - Staging SSH private key

### Production Server
- `PRODUCTION_HOST` - Production server hostname/IP
- `PRODUCTION_USER` - Production SSH username
- `PRODUCTION_SSH_KEY` - Production SSH private key

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## Security Notes

- Never commit actual secrets to the repository
- Use separate keys for staging and production when possible
- Rotate API keys periodically
- Use environment-specific configurations for different deployment targets
