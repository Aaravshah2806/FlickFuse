# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on the server
- Git installed
- SSH access to the server
- Domain name configured (optional)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flickfuse.git
cd flickfuse
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
nano .env  # Edit with your actual values
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `TMDB_API_KEY`

### 3. Deploy with Docker Compose

**Development/Staging:**
```bash
docker-compose up -d --build
```

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost/
```

## Server Setup

### Ubuntu/Debian

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for reverse proxy)
sudo apt update
sudo apt install nginx

# Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL Configuration (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## CI/CD Deployment

The project uses GitHub Actions for automated deployment:

1. Push to `main` branch triggers staging deployment
2. Manual workflow dispatch for production deployment

### Setting up SSH Access for Deployment

```bash
# On the server, create deployment user
sudo adduser deploy
sudo usermod -aG docker deploy

# On your local machine, generate SSH key
ssh-keygen -t ed25519 -C "deploy@flickfuse"

# Copy public key to server
ssh-copy-id deploy@your-server-ip

# Add private key as GitHub secret (STAGING_SSH_KEY or PRODUCTION_SSH_KEY)
```

## Health Checks

The containers include health checks:

- **Backend**: `curl http://localhost:8000/health`
- **Frontend**: Always healthy (nginx with static files)

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Build fails
```bash
docker-compose build --no-cache
```

### Database connection issues
Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct in your `.env` file.

### Frontend shows blank page
Check that build arguments were passed correctly:
```bash
docker-compose exec frontend env | grep VITE_
```

## Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or for production
docker-compose -f docker-compose.prod.yml up -d --build
```

## Backup

For database backups, use Supabase dashboard or CLI:
```bash
supabase db dump -p your-password > backup.sql
```
