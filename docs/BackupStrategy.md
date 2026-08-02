# Production Backup & Recovery Strategy

This document specifies the disaster recovery backup strategy, automated database export scripts, Point-In-Time Recovery (PITR), and media backup procedures for Krishna Footwear.

---

## 1. PostgreSQL Database Backup Strategy

### A. Neon Managed Point-In-Time Recovery (PITR)
- **Retention Period**: 14 Days PITR configured in Neon PostgreSQL console.
- **Recovery SLA**: RPO < 5 minutes, RTO < 30 minutes.
- **Procedure**: In case of data corruption, initiate branch restoration from Neon Dashboard to a timestamp prior to incident.

### B. Daily Automated `pg_dump` Backups
Automated shell script for daily compressed PostgreSQL backups (`/opt/scripts/db_backup.sh`):

```bash
#!/bin/bash
# Krishna Footwear Automated Database Backup Script

BACKUP_DIR="/var/backups/krishna_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/krishnadb_$TIMESTAMP.sql.gz"
DATABASE_URL="postgresql://neondb_owner:npg_ZXml73QKxzOT@ep-plain-thunder-ax5yngew.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

mkdir -p $BACKUP_DIR

echo "[$(date)] Starting PostgreSQL database dump..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Database backup completed successfully: $BACKUP_FILE"
    # Retain backups for 30 days
    find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
else
    echo "[$(date)] ERROR: Database backup failed!" | mail -s "ALERT: Krishna DB Backup Failed" sysadmin@krishnafootwear.com
    exit 1
fi
```

### Cron Schedule (`crontab -e`):
```cron
# Execute database backup every night at 2:00 AM UTC
0 2 * * * /opt/scripts/db_backup.sh >> /var/log/db_backup.log 2>&1
```

---

## 2. Media Assets Backup Strategy (Cloudinary)

- **Storage Provider**: Cloudinary CDN.
- **Backup Mechanism**: All product images and banners uploaded are stored with automatic multi-datacenter redundancy.
- **Local Copy Option**: Sync Cloudinary media folder weekly to AWS S3 bucket:
  ```bash
  cloudinary sync aws_s3:krishna-media-backup/
  ```

---

## 3. Disaster Recovery & Rollback Execution

### Database Restoration Procedure
To restore from a `.sql.gz` backup file:

```bash
# 1. Terminate active database connections
cd CommonBackend
npx pm2 stop krishna-backend

# 2. Decompress and restore database SQL dump
gunzip -c /var/backups/krishna_db/krishnadb_YYYYMMDD_HHMMSS.sql.gz | psql "$DATABASE_URL"

# 3. Execute latest migration check
node server/src/database/run_migrations.js

# 4. Restart backend processes
npx pm2 start krishna-backend
```
