#!/bin/sh
# Daily backup of the Mallick Supabase database and uploaded files.
# Runs inside the "db-backup" container of the mallick-supabase Coolify service
# (see infra/backup-service.yaml). Keeps the last KEEP_DAYS days in /backups.
set -eu

: "$KEEP_DAYS"
export PGHOST=supabase-db PGUSER=supabase_admin PGDATABASE=postgres

backup() {
  stamp=$(date -u +%Y-%m-%d_%H%M)
  dir="/backups/$stamp"
  mkdir -p "$dir"
  pg_dumpall --globals-only --no-role-passwords > "$dir/globals.sql"
  pg_dump -Fc -f "$dir/postgres.dump"
  tar -czf "$dir/storage.tar.gz" -C /storage .
  find /backups -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +
  echo "backup ok: $dir ($(du -sh "$dir" | cut -f1))"
}

until pg_isready -q; do sleep 5; done
while true; do
  backup
  sleep 86400
done
