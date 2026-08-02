# Production Maintenance & Operational Guide

This document outlines ongoing operational maintenance procedures, health monitoring, process management, and security updates for the Krishna Footwear platform.

---

## 1. Health Monitoring & Endpoints

### Health Check Endpoint
- **URL**: `GET /api/v1/health`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": { "status": "ok" },
    "message": "Service is healthy"
  }
  ```
- **Automated Uptime Monitoring**: Configure Pingdom / UptimeRobot / Datadog to query `GET /api/v1/health` every 60 seconds.

---

## 2. Process Management (PM2)

### Common Commands
```bash
# Check running status of backend processes
npx pm2 status

# View real-time aggregated logs
npx pm2 logs krishna-backend

# View memory and CPU telemetry
npx pm2 monit

# Zero-downtime reload after code updates
npx pm2 reload krishna-backend
```

### Log Rotation Configuration
Prevent log files from filling server storage using `pm2-logrotate`:

```bash
npx pm2 install pm2-logrotate
npx pm2 set pm2-logrotate:max_size 50M
npx pm2 set pm2-logrotate:retain 14
```

---

## 3. Dependency & Security Patch Management

### Weekly Security Audits
Run security vulnerability checks on backend and frontend dependencies:

```bash
# Backend Audit
cd CommonBackend
npm audit

# Storefront Audit
cd ../KrishnaFrontend
npm audit

# Admin Audit
cd ../KrishnaAdminFrontend
npm audit
```

### Apply Critical Patches
```bash
npm audit fix --production
```

---

## 4. Key Rotation Procedures

### JWT Secret Key Rotation
Rotate JWT access and refresh token keys every 90 days:
1. Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `CommonBackend/.env`.
2. Reload backend process: `npx pm2 reload krishna-backend`.
3. Active customer refresh tokens stored in PostgreSQL will expire gracefully and request new sessions.
