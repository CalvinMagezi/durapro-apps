# 🛡️ Database Backup & Cleanup System

Enterprise-grade backup and cleanup tools for Supabase database maintenance.

## ⚠️ CRITICAL SAFETY WARNING

**NEVER run cleanup operations without:**
1. ✅ Complete database backup
2. ✅ Verified backup integrity (checksums)
3. ✅ Dry-run simulation
4. ✅ Team notification
5. ✅ Maintenance window
6. ✅ Restore plan ready

## 📁 Structure

```
scripts/backup/
├── backup-database.js       # Full database backup
├── verify-backup.js         # Backup integrity verification
├── cleanup-dry-run.js       # Simulate cleanup without deleting
└── pre-cleanup-checklist.sh # Safety checklist

backups/
└── backup-2026-02-11T10-30-00.000Z/
    ├── manifest.json              # Backup metadata
    ├── cashback_codes.json        # Table data (JSON)
    ├── cashback_codes.csv         # Table data (CSV)
    ├── restore.sh                 # Bash restore script
    ├── restore.js                 # Node.js restore script
    └── ... (other tables)
```

## 🚀 Quick Start

### Step 1: Create Full Backup

```bash
npm run backup:database
```

This will:
- Export all 24 tables to JSON and CSV
- Create SHA256 checksums for verification
- Generate restore scripts
- Save everything to `backups/backup-[timestamp]/`

**Expected duration:** 5-15 minutes depending on data size

### Step 2: Verify Backup Integrity

```bash
npm run backup:verify
```

Checks:
- All files exist
- Checksums match
- JSON is valid
- Record counts match manifest

### Step 3: Run Dry-Run Simulation

```bash
npm run backup:dry-run
```

Shows:
- Exactly what would be deleted
- How many records affected
- Estimated space savings
- Current vs projected database size

### Step 4: Safety Checklist

```bash
npm run backup:checklist
```

Interactive checklist that must be completed before cleanup.

## 📊 Expected Results

### Before Cleanup
- Database size: **0.62 GB**
- Free tier limit: **0.5 GB**
- Status: 🔴 **LOCKED OUT**

### After Phase 1 Cleanup
- Estimated savings: **120-200 MB**
- Projected size: **0.42-0.46 GB**
- Status: ✅ **Under limit with buffer**

## 🔧 Manual Cleanup (After Backup)

Once backup is verified, run the cleanup SQL:

1. Open [Supabase SQL Editor](https://app.supabase.com/project/trkgvxizmmhtvdfmgxnn)
2. Copy contents from `database-cleanup-phase1.sql`
3. Execute **one section at a time**:
   - Section 1: Create archive tables
   - Section 2: Archive old redeemed codes
   - Section 3: Archive old transactions
   - Section 4: Delete duplicates
   - Section 5: VACUUM

### Between Each Section:
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Restore from Backup

If anything goes wrong:

```bash
cd backups/backup-[timestamp]
./restore.sh
```

Or manually:
```bash
cd backups/backup-[timestamp]
node restore.js
```

## 📋 Cleanup Phases

### Phase 1: Quick Wins (Immediate)
- ✅ Delete duplicate SMS messages
- ✅ Archive old redeemed codes (pre-2024)
- ✅ Archive old transactions (pre-2024)
- **Est. savings: 120-200 MB**

### Phase 2: Moderate Cleanup
- Clean empty tables
- Optimize indexes
- **Est. savings: 20-40 MB**

### Phase 3: VACUUM
- Reclaim dead tuple space
- Rebuild indexes
- **Est. savings: 20-40 MB**

## 🛡️ Safety Measures

### Multiple Backup Formats
- **JSON**: Complete data with types preserved
- **CSV**: Human-readable format
- **Manifest**: Metadata and checksums
- **SQL**: Restore scripts

### Data That Will NEVER Be Deleted
- ✅ Current unredeemed cashback codes
- ✅ Active user profiles (2024+)
- ✅ Recent transactions (2024+)
- ✅ Active equipment records
- ✅ Role/permission data
- ✅ Recent SMS (last 3 months)

### What Gets Archived (Not Deleted)
- Old redeemed codes (pre-2024) → `cashback_codes_archive`
- Old transactions (pre-2024) → `tiler_transaction_archive`
- Duplicate SMS → `sms_archive`

Archive tables remain in database for easy restoration.

## 🔍 Monitoring

### Track Progress
```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;

-- Record counts
SELECT 'cashback_codes' as table_name, COUNT(*) FROM cashback_codes
UNION ALL SELECT 'cashback_codes_archive', COUNT(*) FROM cashback_codes_archive
UNION ALL SELECT 'tiler_transaction', COUNT(*) FROM tiler_transaction
UNION ALL SELECT 'tiler_transaction_archive', COUNT(*) FROM tiler_transaction_archive;
```

## 🆘 Emergency Procedures

### If Cleanup Goes Wrong

1. **Stop immediately** - Don't run more commands
2. **Check application** - Test critical functionality
3. **Restore from backup**:
   ```bash
   cd backups/[latest-backup]
   ./restore.sh
   ```
4. **Contact Supabase support** if needed

### If Database is Locked

Supabase may lock your project when over limit. To unlock:
1. Complete cleanup
2. Contact Supabase support to temporarily lift restrictions
3. Provide evidence of cleanup plan

## 📞 Support

- **Supabase Dashboard**: https://app.supabase.com/project/trkgvxizmmhtvdfmgxnn
- **Supabase Support**: https://supabase.com/support
- **Project ID**: `trkgvxizmmhtvdfmgxnn`

## 📝 Checklist Summary

Before any cleanup:
- [ ] Run `npm run backup:database`
- [ ] Run `npm run backup:verify`
- [ ] Run `npm run backup:dry-run`
- [ ] Run `npm run backup:checklist`
- [ ] Notify team
- [ ] Execute SQL in Supabase Editor (one section at a time)
- [ ] Verify database size after each section
- [ ] Test application functionality
- [ ] Monitor for 24 hours

## ⚡ Current Status

- **Last Updated**: February 11, 2026
- **Database Size**: 0.62 GB / 0.5 GB limit
- **Status**: 🔴 LOCKED OUT - Immediate action required
- **Next Review**: After Phase 1 completion
