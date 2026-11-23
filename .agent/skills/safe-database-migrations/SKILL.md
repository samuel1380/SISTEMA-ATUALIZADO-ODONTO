---
name: safe-database-migrations
description: >-
  Guidelines and runbooks for executing safe, zero-downtime, non-destructive database migrations, schema alterations, and data backfills on production databases.
---

# Safe Database Migrations & Data Evolution Skill

This skill provides safety protocols for executing database operations, migrations, and fixes on production databases (MySQL/PostgreSQL/RDS).

## Golden Rules for Production Database Operations

1. **Pre-Flight Snapshot:**
   - Always take an immediate point-in-time snapshot/dump of relevant tables before executing schema or data alterations:
     `mysqldump -h $HOST -u $USER -p$PASS $DB > backup_pre_flight_$(date +%Y%m%d_%H%M%S).sql`

2. **Non-Destructive Alterations:**
   - Never drop columns or tables in a single step if active application code references them.
   - Use additive migrations: add new nullable or default columns first, deploy code, then deprecate old fields.

3. **Idempotent Data Migrations & Scripts:**
   - Scripts must be safely re-runnable without duplicating or corrupting data.
   - Use `INSERT ... ON DUPLICATE KEY UPDATE` or `WHERE NOT EXISTS` clauses rather than blind inserts.
   - For historical data corrections, target only affected primary keys and leave recent/active records untouched.

4. **Transaction Safety & Foreign Key Checks:**
   - Wrap multi-statement data backfills in transactions (`START TRANSACTION; ... COMMIT;`).
   - If disabling foreign keys (`FOREIGN_KEY_CHECKS=0`), explicitly re-enable them (`FOREIGN_KEY_CHECKS=1`) in the same script session.

5. **Batch Processing for Large Datasets:**
   - When updating thousands of rows, process in indexed chunks (e.g., batches of 500-1000) to prevent lock contention, transaction timeouts, and excessive memory spikes.
