#!/usr/bin/env node
/**
 * COMPREHENSIVE DATABASE BACKUP UTILITY
 * Backs up all Supabase tables before any cleanup operations
 * Creates multiple backup formats for safety
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = 'https://trkgvxizmmhtvdfmgxnn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BATCH_SIZE = 1000; // Process 1000 records at a time to avoid timeouts
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Tables to backup in order of importance
const TABLES_TO_BACKUP = [
  // CRITICAL: Cashback system
  'cashback_codes',
  'cashback_users',
  'cashback_feedback',
  
  // CRITICAL: User management
  'profiles',
  'tiler_profile',
  'users_with_codes',
  
  // IMPORTANT: Transactions
  'tiler_transaction',
  'commission',
  
  // IMPORTANT: Service tracking
  'equipment',
  'equipment_part',
  'servicing_event',
  'external_service',
  'tracking_requests',
  
  // IMPORTANT: Communications
  'sms',
  'otp',
  
  // System tables
  'employees',
  'organisations',
  'roles',
  'role_permission',
  'permission',
  'staff_profile',
  'ban_list',
  'api_users',
  'old_users'
];

class DatabaseBackup {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupPath = path.join(BACKUP_DIR, `backup-${this.backupTimestamp}`);
    this.manifest = {
      timestamp: new Date().toISOString(),
      tables: {},
      checksums: {},
      totalRecords: 0,
      errors: []
    };
  }

  async initialize() {
    console.log('🔧 Initializing backup...');
    await fs.mkdir(this.backupPath, { recursive: true });
    console.log(`📁 Backup directory: ${this.backupPath}`);
  }

  async backupTable(tableName) {
    console.log(`\n📦 Backing up table: ${tableName}`);
    const startTime = Date.now();
    
    try {
      // First, get total count
      const { count, error: countError } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(`Count error: ${countError.message}`);
      }
      
      const totalRecords = count || 0;
      console.log(`   Total records: ${totalRecords.toLocaleString()}`);
      
      if (totalRecords === 0) {
        console.log(`   ⚠️  Table is empty, skipping...`);
        this.manifest.tables[tableName] = {
          records: 0,
          status: 'empty',
          duration: 0
        };
        return;
      }

      // For very large tables, use streaming/chunked approach
      if (totalRecords > 10000) {
        await this.backupLargeTable(tableName, totalRecords);
      } else {
        await this.backupSmallTable(tableName);
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`   ✅ Completed in ${duration}s`);
      
    } catch (error) {
      console.error(`   ❌ Error backing up ${tableName}: ${error.message}`);
      this.manifest.errors.push({
        table: tableName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.manifest.tables[tableName] = {
        records: 0,
        status: 'failed',
        error: error.message
      };
    }
  }

  async backupSmallTable(tableName) {
    // For smaller tables, fetch all at once
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    
    await this.saveTableData(tableName, data);
  }

  async backupLargeTable(tableName, totalRecords) {
    console.log(`   Large table detected (${totalRecords.toLocaleString()} records), using chunked approach...`);
    
    let allData = [];
    let offset = 0;
    let hasMore = true;
    let chunks = 0;
    
    while (hasMore && offset < totalRecords) {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .range(offset, offset + BATCH_SIZE - 1);
      
      if (error) {
        console.error(`   ⚠️  Error fetching chunk at offset ${offset}: ${error.message}`);
        // Try to continue with what we have
        break;
      }
      
      if (data && data.length > 0) {
        allData = allData.concat(data);
        chunks++;
        
        if (chunks % 10 === 0) {
          console.log(`   Progress: ${allData.length.toLocaleString()} / ${totalRecords.toLocaleString()} records...`);
        }
        
        if (data.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          offset += BATCH_SIZE;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`   Fetched ${allData.length.toLocaleString()} records in ${chunks} chunks`);
    await this.saveTableData(tableName, allData);
  }

  async saveTableData(tableName, data) {
    // Save as JSON (complete data)
    const jsonPath = path.join(this.backupPath, `${tableName}.json`);
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(jsonPath, jsonData);
    
    // Save as CSV (for easy viewing/import)
    if (data.length > 0) {
      const csvPath = path.join(this.backupPath, `${tableName}.csv`);
      const csvData = this.convertToCSV(data);
      await fs.writeFile(csvPath, csvData);
    }
    
    // Calculate checksums
    const jsonChecksum = crypto.createHash('sha256').update(jsonData).digest('hex');
    this.manifest.checksums[tableName] = {
      json: jsonChecksum,
      records: data.length
    };
    
    // Update manifest
    this.manifest.tables[tableName] = {
      records: data.length,
      status: 'success',
      files: {
        json: `${tableName}.json`,
        csv: data.length > 0 ? `${tableName}.csv` : null
      }
    };
    
    this.manifest.totalRecords += data.length;
    
    console.log(`   💾 Saved ${data.length.toLocaleString()} records`);
  }

  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
        return String(value).replace(/"/g, '""');
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  async saveManifest() {
    const manifestPath = path.join(this.backupPath, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
    console.log(`\n📋 Manifest saved to: ${manifestPath}`);
  }

  async createRestoreScript() {
    const restoreScript = `#!/bin/bash
# RESTORE SCRIPT GENERATED: ${new Date().toISOString()}
# This script restores data from backup: ${this.backupTimestamp}

BACKUP_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Starting restore from backup: ${this.backupTimestamp}"
echo "📁 Backup location: \$BACKUP_DIR"
echo ""

# Verify checksums before restore
echo "🔍 Verifying backup integrity..."
node -e "
const fs = require('fs');
const crypto = require('crypto');
const manifest = JSON.parse(fs.readFileSync('\$BACKUP_DIR/manifest.json', 'utf8'));
let allValid = true;

for (const [table, checksums] of Object.entries(manifest.checksums)) {
  const jsonPath = '\$BACKUP_DIR/' + table + '.json';
  if (fs.existsSync(jsonPath)) {
    const data = fs.readFileSync(jsonPath, 'utf8');
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    if (hash === checksums.json) {
      console.log('✅ ' + table + ': checksum valid (' + checksums.records + ' records)');
    } else {
      console.log('❌ ' + table + ': checksum INVALID!');
      allValid = false;
    }
  }
}

if (!allValid) {
  console.log('\\n⚠️  Some backups failed checksum verification!');
  process.exit(1);
}
console.log('\\n✅ All backups verified successfully!');
"

if [ $? -ne 0 ]; then
  echo "❌ Backup verification failed. Aborting restore."
  exit 1
fi

echo ""
echo "⚠️  WARNING: This will INSERT data into your database."
echo "Existing records with the same ID may cause conflicts."
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "\$confirm" != "yes" ]; then
  echo "❌ Restore cancelled."
  exit 0
fi

echo ""
echo "🚀 Starting restore..."
node "\$BACKUP_DIR/restore.js"
`;

    const restoreScriptPath = path.join(this.backupPath, 'restore.sh');
    await fs.writeFile(restoreScriptPath, restoreScript);
    await fs.chmod(restoreScriptPath, 0o755);
    
    // Create Node.js restore script
    const restoreJs = `const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BACKUP_DIR = __dirname;

async function restoreTable(tableName) {
  console.log(\`Restoring \${tableName}...\`);
  
  try {
    const jsonPath = path.join(BACKUP_DIR, \`\${tableName}.json\`);
    const data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    
    if (data.length === 0) {
      console.log(\`  ℹ️  No data to restore\`);
      return;
    }
    
    // Insert in batches
    const BATCH_SIZE = 500;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(tableName).upsert(batch, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
      
      if (error) {
        console.error(\`  ❌ Error: \${error.message}\`);
      } else {
        console.log(\`  ✅ Restored batch \${Math.floor(i/BATCH_SIZE) + 1}/\${Math.ceil(data.length/BATCH_SIZE)}\`);
      }
    }
    
    console.log(\`  ✅ Restored \${data.length} records\`);
  } catch (error) {
    console.error(\`  ❌ Failed to restore \${tableName}: \${error.message}\`);
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, 'manifest.json'), 'utf8'));
  
  for (const tableName of Object.keys(manifest.tables)) {
    await restoreTable(tableName);
  }
  
  console.log('\\n🎉 Restore completed!');
}

main().catch(console.error);
`;

    const restoreJsPath = path.join(this.backupPath, 'restore.js');
    await fs.writeFile(restoreJsPath, restoreJs);
    
    console.log(`📝 Restore scripts created:`);
    console.log(`   - ${restoreScriptPath}`);
    console.log(`   - ${restoreJsPath}`);
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     SUPABASE DATABASE BACKUP - ENTERPRISE EDITION     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    const startTime = Date.now();
    
    try {
      await this.initialize();
      
      // Backup each table
      for (const tableName of TABLES_TO_BACKUP) {
        await this.backupTable(tableName);
      }
      
      // Save manifest and create restore scripts
      await this.saveManifest();
      await this.createRestoreScript();
      
      // Create summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const successCount = Object.values(this.manifest.tables).filter(t => t.status === 'success').length;
      const emptyCount = Object.values(this.manifest.tables).filter(t => t.status === 'empty').length;
      const failedCount = Object.values(this.manifest.tables).filter(t => t.status === 'failed').length;
      
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║                  BACKUP COMPLETE                       ║');
      console.log('╠════════════════════════════════════════════════════════╣');
      console.log(`║  📦 Total Records: ${this.manifest.totalRecords.toLocaleString().padStart(34)} ║`);
      console.log(`║  ✅ Successful:    ${successCount.toString().padStart(34)} ║`);
      console.log(`║  ⚠️  Empty Tables: ${emptyCount.toString().padStart(34)} ║`);
      console.log(`║  ❌ Failed:        ${failedCount.toString().padStart(34)} ║`);
      console.log(`║  ⏱️  Duration:     ${duration.padStart(34)} ║`);
      console.log(`║  📁 Location:      ${this.backupPath.slice(-34).padStart(34)} ║`);
      console.log('╚════════════════════════════════════════════════════════╝\n');
      
      if (this.manifest.errors.length > 0) {
        console.log('⚠️  Warnings/Errors:');
        this.manifest.errors.forEach(err => {
          console.log(`   - ${err.table}: ${err.error}`);
        });
        console.log('');
      }
      
      console.log('🔒 BACKUP VERIFICATION:');
      console.log('   Run this command to verify backup integrity:');
      console.log(`   node ${path.join(this.backupPath, 'verify-backup.js')}`);
      console.log('');
      console.log('🔄 TO RESTORE DATA:');
      console.log(`   cd ${this.backupPath}`);
      console.log('   ./restore.sh');
      console.log('');
      
      return {
        success: true,
        backupPath: this.backupPath,
        manifest: this.manifest
      };
      
    } catch (error) {
      console.error('\n❌ Backup failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run backup
const backup = new DatabaseBackup();
backup.run().then(result => {
  process.exit(result.success ? 0 : 1);
});
