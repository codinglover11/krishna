# Production Deployment Guide: Krishna Footwear E-Commerce Platform

This guide outlines the production deployment setup for the Krishna Footwear repository:
1. `CommonBackend` (Node.js / Express API Service)
2. `KrishnaFrontend` (React Storefront Application)
3. `KrishnaAdminFrontend` (React Admin Dashboard Application)

---

## 1. Prerequisites & System Requirements

- **Node.js**: `v18.x` or `v20.x` LTS
- **PostgreSQL**: `v14+` or Managed Neon PostgreSQL database instance (`sslmode=require`)
- **Redis**: `v6+` (Optional - dual-layer in-memory fallback enabled if unconfigured)
- **Firebase Auth**: Firebase Web App & Admin SDK credentials for Phone Authentication
- **Email Gateway**: Resend, Brevo, or SMTP credentials for Email OTP
- **Cloudinary**: Cloud name, API Key, API Secret credentials for media uploads
- **Domain & SSL**: Valid domain with HTTPS SSL certificates (Let's Encrypt / Cloudflare)

---

## 2. Environment Variables Configuration

### A. CommonBackend (`CommonBackend/.env.production`)
```env
PORT=5000
NODE_ENV=production

# PostgreSQL Database Connection (Neon Cloud PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_ZXml73QKxzOT@ep-plain-thunder-ax5yngew.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require

# Caching Configuration
REDIS_URL=redis://default:production_password@redis-cluster.internal:6379
ENABLE_REDIS=true

# Firebase Admin Phone Auth Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

# Email Provider Configuration (Resend -> Brevo -> SMTP strategy)
RESEND_API_KEY=re_your_resend_api_key_here
BREVO_API_KEY=xkeysib-your_brevo_api_key_here

# JWT Tokens & Passwords
JWT_SECRET=production_super_secret_jwt_access_key_change_me
JWT_REFRESH_SECRET=production_super_secret_jwt_refresh_key_change_me
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Production CORS Allowed Origins
CORS_ORIGIN=https://krishnafootwear.com,https://www.krishnafootwear.com,https://admin.krishnafootwear.com

# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=fvxvcsgc
CLOUDINARY_API_KEY=671275699651994
CLOUDINARY_API_SECRET=bYMAuFq_eFx4cSNbd-62TP8gWX0

# Admin Contact
ADMIN_PHONE_NUMBER=+1234567890
ADMIN_EMAIL=admin@krishnafootwear.com
```

### B. Customer Frontend (`KrishnaFrontend/.env.production`)
```env
VITE_API_BASE_URL=https://api.krishnafootwear.com/api/v1

# Firebase Web Auth SDK Config
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### C. Admin Frontend (`KrishnaAdminFrontend/.env.production`)
```env
VITE_API_BASE_URL=https://api.krishnafootwear.com/api/v1

# Firebase Web Auth SDK Config
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 3. Database Migration & Performance Indexing

To apply all normalized tables, incremental migration scripts (`001` through `016`), seeds, and composite query indexes:

```bash
cd CommonBackend
npm install
node server/src/database/run_migrations.js
```

---

## 4. Build & Deployment Execution

### A. CommonBackend (Node.js API Service)
Deploy via PM2 process manager or Docker container:

```bash
cd CommonBackend
npm install --production

# Execute Automated QA Test Suite
npm test

# Start Production PM2 Daemon
npx pm2 start server/index.js --name "krishna-backend" --instances max --exec-mode cluster
npx pm2 save
```

### B. Customer Storefront (`KrishnaFrontend`)
Deploy built static assets to Vercel, Netlify, or Nginx:

```bash
cd KrishnaFrontend
npm install
npm run build

# Output generated in /dist directory ready for static hosting
```

### C. Admin Dashboard (`KrishnaAdminFrontend`)
```bash
cd KrishnaAdminFrontend
npm install
npm run build

# Output generated in /dist directory ready for static hosting
```

---

## 5. Domain, DNS & Nginx Reverse Proxy Configuration

Nginx Configuration snippet (`/etc/nginx/sites-available/krishnafootwear.conf`):

```nginx
# API Backend Reverse Proxy
server {
    listen 443 ssl http2;
    server_name api.krishnafootwear.com;

    ssl_certificate /etc/letsencrypt/live/api.krishnafootwear.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.krishnafootwear.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 6. Security Checklist

- [x] HTTPS / SSL certificates active across all subdomains.
- [x] `httpOnly`, `sameSite: strict`, `secure: true` cookies active for refresh tokens.
- [x] Helmet security headers active (`X-Content-Type-Options`, `X-Frame-Options`, `HSTS`).
- [x] Firebase Phone Authentication enabled for client phone verification.
- [x] Email OTP provider strategy active (`Resend` -> `Brevo` -> `SMTP`).
- [x] CORS restricted strictly to approved production origins.
- [x] Granular RBAC permission check middleware active on all administrative routes.
- [x] SQL injection protection enforced via parameterized `$1, $2` PG queries.
- [x] Rate limiting active via `express-rate-limit`.
