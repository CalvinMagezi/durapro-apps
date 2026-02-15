#!/usr/bin/env node
/**
 * BACKUP VERIFICATION UTILITY
 * Verifies the integrity of backup files before any cleanup operations
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function verifyBackup(backupPath) {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           BACKUP VERIFICATION REPORT                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`📁 Verifying backup: ${backupPath}\n`);
  
  try {
    // Read manifest
    const manifestPath = path.join(backupPath, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    
    console.log(`🕐 Backup created: ${manifest.timestamp}`);
    console.log(`📊 Total tables: ${Object.keys(manifest.tables).length}`);
    console.log(`📈 Total records: ${manifest.totalRecords.toLocaleString()}\n`);
    
    let verified = 0;
    let failed = 0;
    const results = [];
    
    // Verify each table
    for (const [tableName, checksums] of Object.entries(manifest.checksums)) {
      const jsonPath = path.join(backupPath, `${tableName}.json`);
      
      try {
        // Check file exists
        const stats = await fs.stat(jsonPath);
        
        // Read and verify checksum
        const data = await fs.readFile(jsonPath, 'utf8');
        const computedHash = crypto.createHash('sha256').update(data).digest('hex');
        
        if (computedHash === checksums.json) {
          const recordCount = JSON.parse(data).length;
          console.log(`✅ ${tableName.padEnd(25)} | ${recordCount.toLocaleString().padStart(10)} records | SHA256 OK`);
          verified++;
          results.push({ table: tableName, status: 'valid', records: recordCount });
        } else {
          console.log(`❌ ${tableName.padEnd(25)} | CHECKSUM MISMATCH!`);
          failed++;
          results.push({ table: tableName, status: 'invalid', error: 'Checksum mismatch' });
        }
      } catch (error) {
        console.log(`❌ ${tableName.padEnd(25)} | ERROR: ${error.message}`);
        failed++;
        results.push({ table: tableName, status: 'error', error: error.message });
      }
    }
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                  VERIFICATION SUMMARY                  ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Verified:  ${verified.toString().padStart(36)} ║`);
    console.log(`║  ❌ Failed:    ${failed.toString().padStart(36)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    if (failed === 0) {
      console.log('✅ ALL BACKUP FILES VERIFIED SUCCESSFULLY!');
      console.log('🔒 It is safe to proceed with database cleanup.\n');
      return { valid: true, verified, failed };
    } else {
      console.log('❌ BACKUP VERIFICATION FAILED!');
      console.log('⚠️  DO NOT PROCEED with cleanup until backups are verified.\n');
      return { valid: false, verified, failed };
    }
    
  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

// Get backup path from command line or use most recent
async function main() {
  const backupDir = path.join(__dirname, '../../backups');
  let backupPath = process.argv[2];
  
  if (!backupPath) {
    // Find most recent backup
    try {
      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      const backups = entries
        .filter(e => e.isDirectory() && e.name.startsWith('backup-'))
        .map(e => e.name)
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.error('❌ No backups found!');
        process.exit(1);
      }
      
      backupPath = path.join(backupDir, backups[0]);
      console.log(`Using most recent backup: ${backups[0]}\n`);
    } catch (error) {
      console.error(`❌ Error finding backups: ${error.message}`);
      process.exit(1);
    }
  }
  
  const result = await verifyBackup(backupPath);
  process.exit(result.valid ? 0 : 1);
}

main();
