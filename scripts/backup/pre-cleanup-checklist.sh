#!/bin/bash
# =============================================================================
# PRE-CLEANUP SAFETY CHECKLIST
# Run this before executing any database cleanup
# =============================================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║      DATABASE CLEANUP - SAFETY CHECKLIST              ║"
echo "║   STOP! Do not proceed until all items are checked    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checklist=()

# Function to ask yes/no
ask_yes_no() {
    while true; do
        read -p "$1 (yes/no): " yn
        case $yn in
            [Yy]* ) checklist+=("✅ $2"); return 0;;
            [Nn]* ) checklist+=("❌ $2 - NOT CONFIRMED"); return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

echo -e "${YELLOW}REQUIRED CHECKS:${NC}\n"

# Check 1: Backup completed
ask_yes_no "1. Have you completed a FULL database backup?" "Full backup completed"
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  CRITICAL: Backup must be completed first!${NC}"
    echo "   Run: npm run backup:database"
    exit 1
fi

# Check 2: Backup verified
ask_yes_no "2. Have you verified the backup integrity (checksums)?" "Backup verified"
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  CRITICAL: Backup must be verified!${NC}"
    echo "   Run: node scripts/backup/verify-backup.js"
    exit 1
fi

# Check 3: Dry run completed
ask_yes_no "3. Have you run the dry-run simulation?" "Dry-run completed"
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  CRITICAL: Run dry-run first to preview changes!${NC}"
    echo "   Run: node scripts/backup/cleanup-dry-run.js"
    exit 1
fi

# Check 4: Maintenance window
ask_yes_no "4. Is this during a low-traffic/maintenance window?" "Maintenance window confirmed"

# Check 5: Team notified
ask_yes_no "5. Has the team been notified about the maintenance?" "Team notified"

# Check 6: Rollback plan ready
ask_yes_no "6. Do you have the restore script ready?" "Restore script ready"

# Check 7: Supabase dashboard access
ask_yes_no "7. Do you have access to Supabase Dashboard (for emergency)?" "Dashboard access confirmed"

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Display checklist
for item in "${checklist[@]}"; do
    echo "$item"
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Final confirmation
ask_yes_no "Are you ready to proceed with database cleanup?" "Ready to proceed"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All checks passed! You may proceed with cleanup.${NC}"
    echo ""
    echo "Next steps:"
    echo "   1. Open Supabase SQL Editor"
    echo "   2. Run database-cleanup-phase1.sql (one section at a time)"
    echo "   3. Monitor database size after each section"
    echo "   4. Verify application functionality"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Cleanup cancelled. Complete all checks first.${NC}"
    exit 1
fi
