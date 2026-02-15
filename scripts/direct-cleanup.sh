#!/bin/bash
# =============================================================================
# DIRECT DATABASE CLEANUP SCRIPT
# Uses psql for direct connection - bypasses Supabase timeouts
# =============================================================================

# Database connection string from your .env file
DB_URL="postgresql://postgres:postgres@db.trkgvxizmmhtvdfmgxnn.supabase.co:5432/postgres"

echo "╔════════════════════════════════════════════════════════╗"
echo "║     DIRECT DATABASE CLEANUP - BYPASSING TIMEOUTS      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo "   Install with: brew install libpq"
    exit 1
fi

echo "⚠️  IMPORTANT: This script requires your database password"
echo "   You can find it in Supabase Dashboard:"
echo "   Project Settings → Database → Connection String"
echo ""

# Ask for password
read -s -p "Enter your database password: " DB_PASSWORD
echo ""

# Construct connection string with password
DB_URL_WITH_PASS="postgresql://postgres:${DB_PASSWORD}@db.trkgvxizmmhtvdfmgxnn.supabase.co:5432/postgres"

echo ""
echo "Testing connection..."

# Test connection
if ! psql "${DB_URL_WITH_PASS}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Connection failed! Please check your password."
    exit 1
fi

echo "✅ Connection successful!"
echo ""

# =============================================================================
# STEP 1: Create Archive Tables
# =============================================================================
echo "📦 STEP 1: Creating archive tables..."

psql "${DB_URL_WITH_PASS}" << 'EOF'
CREATE TABLE IF NOT EXISTS cashback_codes_archive (
    "_id" TEXT PRIMARY KEY,
    "_createdAt" TEXT,
    "code" TEXT,
    "disbursed_on" TEXT,
    "funds_disbursed" BOOLEAN,
    "mm_confirmation" TEXT,
    "product_name" TEXT,
    "redeemed" BOOLEAN,
    "redeemed_by" TEXT,
    "redeemed_on" TEXT,
    "flagged" BOOLEAN
);

CREATE TABLE IF NOT EXISTS tiler_transaction_archive (
    "id" UUID PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE,
    "tiler_profile" TEXT,
    "shop_name" TEXT,
    "transaction_date" TEXT,
    "city" TEXT,
    "site_location" TEXT,
    "quantity_bought" INTEGER,
    "comment" TEXT
);

CREATE TABLE IF NOT EXISTS sms_archive (
    "id" UUID PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE,
    "text" TEXT,
    "phone_number" TEXT,
    "dispatch_to_provider" BOOLEAN,
    "provider_confirmation" BOOLEAN
);
EOF

echo "✅ Archive tables created"
echo ""

# =============================================================================
# STEP 2: Archive Cashback Codes (in batches)
# =============================================================================
echo "📦 STEP 2: Archiving cashback codes in batches..."

BATCH_SIZE=100
TOTAL_ARCHIVED=0

while true; do
    # Archive batch
    RESULT=$(psql "${DB_URL_WITH_PASS}" -t -c "
        WITH batch AS (
            SELECT \"_id\" FROM cashback_codes 
            WHERE \"redeemed\" = true 
            AND \"_createdAt\"::timestamp < '2024-01-01'::timestamp
            AND \"_id\" NOT IN (SELECT \"_id\" FROM cashback_codes_archive)
            LIMIT ${BATCH_SIZE}
        )
        INSERT INTO cashback_codes_archive 
        SELECT c.* FROM cashback_codes c 
        INNER JOIN batch b ON c.\"_id\" = b.\"_id\"
        ON CONFLICT (\"_id\") DO NOTHING
        RETURNING 1;
    " 2>/dev/null | wc -l)
    
    if [ "$RESULT" -eq "0" ]; then
        break
    fi
    
    # Delete archived
    psql "${DB_URL_WITH_PASS}" -c "
        DELETE FROM cashback_codes
        WHERE \"_id\" IN (SELECT \"_id\" FROM cashback_codes_archive);
    " > /dev/null 2>&1
    
    TOTAL_ARCHIVED=$((TOTAL_ARCHIVED + RESULT))
    echo "  Archived batch: +$RESULT records (Total: $TOTAL_ARCHIVED)"
done

echo "✅ Total archived: $TOTAL_ARCHIVED cashback codes"
echo ""

# =============================================================================
# STEP 3: Archive Tiler Transactions
# =============================================================================
echo "📦 STEP 3: Archiving tiler transactions..."

psql "${DB_URL_WITH_PASS}" << 'EOF'
INSERT INTO tiler_transaction_archive 
SELECT * FROM tiler_transaction 
WHERE "created_at" < '2024-01-01'
ON CONFLICT ("id") DO NOTHING;

DELETE FROM tiler_transaction
WHERE "id" IN (SELECT "id" FROM tiler_transaction_archive);
EOF

TRANS_COUNT=$(psql "${DB_URL_WITH_PASS}" -t -c "SELECT COUNT(*) FROM tiler_transaction_archive;" 2>/dev/null | xargs)
echo "✅ Archived: $TRANS_COUNT transactions"
echo ""

# =============================================================================
# STEP 4: Remove Duplicate SMS
# =============================================================================
echo "📦 STEP 4: Removing duplicate SMS..."

psql "${DB_URL_WITH_PASS}" << 'EOF'
INSERT INTO sms_archive ("id", "created_at", "text", "phone_number", "dispatch_to_provider", "provider_confirmation")
SELECT DISTINCT ON ("phone_number", "text") 
    "id", "created_at", "text", "phone_number", "dispatch_to_provider", "provider_confirmation"
FROM sms
ORDER BY "phone_number", "text", "created_at" DESC
ON CONFLICT ("id") DO NOTHING;

DELETE FROM sms
WHERE "id" IN (SELECT "id" FROM sms_archive);
EOF

SMS_COUNT=$(psql "${DB_URL_WITH_PASS}" -t -c "SELECT COUNT(*) FROM sms_archive;" 2>/dev/null | xargs)
echo "✅ Archived: $SMS_COUNT SMS messages"
echo ""

# =============================================================================
# STEP 5: Reindex
# =============================================================================
echo "📦 STEP 5: Reindexing tables..."

psql "${DB_URL_WITH_PASS}" -c "REINDEX TABLE cashback_codes;"
psql "${DB_URL_WITH_PASS}" -c "REINDEX TABLE tiler_transaction;"
psql "${DB_URL_WITH_PASS}" -c "REINDEX TABLE sms;"

echo "✅ Reindex complete"
echo ""

# =============================================================================
# STEP 6: Check Results
# =============================================================================
echo "📊 STEP 6: Checking results..."
echo ""

psql "${DB_URL_WITH_PASS}" -c "SELECT pg_size_pretty(pg_database_size('postgres')) as total_db_size;"

echo ""
echo "Table sizes after cleanup:"
psql "${DB_URL_WITH_PASS}" -c "
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('cashback_codes', 'tiler_transaction', 'sms', 
                      'cashback_codes_archive', 'tiler_transaction_archive', 'sms_archive')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                   CLEANUP COMPLETE                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  NEXT STEP: Run VACUUM in Supabase SQL Editor:"
echo "   CREATE NEW QUERY → Paste: VACUUM FULL; → Run"
echo ""
