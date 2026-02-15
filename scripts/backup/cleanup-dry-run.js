#!/usr/bin/env node
/**
 * CLEANUP DRY RUN
 * Simulates cleanup operations without actually deleting data
 * Shows exactly what would be deleted and how much space would be saved
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://trkgvxizmmhtvdfmgxnn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function dryRun() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║              CLEANUP DRY RUN REPORT                    ║');
  console.log('║         (No data will be deleted)                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const results = {
    phase1: { name: 'Quick Wins', savings: 0, operations: [] },
    phase2: { name: 'Moderate Cleanup', savings: 0, operations: [] },
    total: { savings: 0, records: 0 }
  };
  
  // PHASE 1: Quick Wins
  console.log('📊 PHASE 1: QUICK WINS\n');
  
  // 1.1 Count duplicate SMS
  console.log('1.1 Duplicate SMS Messages:');
  try {
    const { data: smsData, error: smsError } = await supabase
      .from('sms')
      .select('phone_number, text, id')
      .order('phone_number')
      .order('text');
    
    if (smsError) throw smsError;
    
    // Group by phone_number + text
    const groups = {};
    smsData.forEach(sms => {
      const key = `${sms.phone_number}|${sms.text}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(sms.id);
    });
    
    let duplicateCount = 0;
    for (const [key, ids] of Object.entries(groups)) {
      if (ids.length > 1) {
        duplicateCount += ids.length - 1;
      }
    }
    
    const smsSizeEstimate = duplicateCount * 0.5; // ~0.5KB per SMS
    console.log(`   📱 Total SMS records: ${smsData.length.toLocaleString()}`);
    console.log(`   🔄 Duplicates to delete: ${duplicateCount.toLocaleString()}`);
    console.log(`   💾 Est. space saved: ${smsSizeEstimate.toFixed(1)} KB\n`);
    
    results.phase1.operations.push({
      name: 'Delete duplicate SMS',
      records: duplicateCount,
      size: smsSizeEstimate
    });
    results.phase1.savings += smsSizeEstimate;
    results.total.records += duplicateCount;
    
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }
  
  // 1.2 Count old redeemed cashback codes
  console.log('1.2 Old Redeemed Cashback Codes (pre-2024):');
  try {
    const { data: codesData, error: codesError } = await supabase
      .from('cashback_codes')
      .select('_id, redeemed, redeemed_on, _createdAt')
      .eq('redeemed', true)
      .lt('_createdAt', '2024-01-01');
    
    if (codesError) throw codesError;
    
    const codeSizeEstimate = codesData.length * 0.3; // ~0.3KB per code
    console.log(`   🎫 Total codes to archive: ${codesData.length.toLocaleString()}`);
    console.log(`   📅 Date range: 2023 and earlier`);
    console.log(`   💾 Est. space saved: ${codeSizeEstimate.toFixed(1)} KB\n`);
    
    results.phase1.operations.push({
      name: 'Archive old redeemed codes',
      records: codesData.length,
      size: codeSizeEstimate
    });
    results.phase1.savings += codeSizeEstimate;
    results.total.records += codesData.length;
    
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }
  
  // 1.3 Count old tiler transactions
  console.log('1.3 Old Tiler Transactions (pre-2024):');
  try {
    const { data: transData, error: transError } = await supabase
      .from('tiler_transaction')
      .select('id, created_at')
      .lt('created_at', '2024-01-01');
    
    if (transError) throw transError;
    
    const transSizeEstimate = transData.length * 0.5; // ~0.5KB per transaction
    console.log(`   💼 Total transactions to archive: ${transData.length.toLocaleString()}`);
    console.log(`   📅 Date range: 2023 and earlier`);
    console.log(`   💾 Est. space saved: ${transSizeEstimate.toFixed(1)} KB\n`);
    
    results.phase1.operations.push({
      name: 'Archive old transactions',
      records: transData.length,
      size: transSizeEstimate
    });
    results.phase1.savings += transSizeEstimate;
    results.total.records += transData.length;
    
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}\n`);
  }
  
  // PHASE 2: Moderate Cleanup
  console.log('📊 PHASE 2: MODERATE CLEANUP\n');
  
  // 2.1 Check empty tables
  console.log('2.1 Empty or Near-Empty Tables:');
  const tablesToCheck = ['old_users', 'tracking_requests', 'api_users', 'otp'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      const count = data ? Object.keys(data).length : 0;
      if (count === 0) {
        console.log(`   📭 ${table}: EMPTY (safe to drop)`);
        results.phase2.savings += 8; // ~8KB for empty table
      } else {
        console.log(`   📄 ${table}: ${count} records`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${table}: Error checking - ${error.message}`);
    }
  }
  console.log('');
  
  // SUMMARY
  const totalSavingsMB = (results.phase1.savings + results.phase2.savings) / 1024;
  const totalSavingsGB = totalSavingsMB / 1024;
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                     SUMMARY                            ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Phase 1 - Quick Wins:                                  ║`);
  results.phase1.operations.forEach(op => {
    const line = `${op.name}`.padEnd(25) + `| ${op.records.toLocaleString().padStart(10)} rec | ${op.size.toFixed(1).padStart(8)} KB`;
    console.log(`║  ${line.padEnd(52)} ║`);
  });
  console.log(`║  ${''.padEnd(52)} ║`);
  console.log(`║  Phase 2 - Moderate:                                   ║`);
  console.log(`║  Empty tables cleanup                     ~8 KB        ║`);
  console.log(`║  ${''.padEnd(52)} ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║  TOTAL RECORDS TO MOVE:  ${results.total.records.toLocaleString().padStart(28)} ║`);
  console.log(`║  ESTIMATED SAVINGS:      ${totalSavingsMB.toFixed(1).padStart(8)} MB (${totalSavingsGB.toFixed(3)} GB)    ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('   • This is a SIMULATION - no data has been deleted');
  console.log('   • Actual space savings may vary due to PostgreSQL overhead');
  console.log('   • VACUUM operation will be needed to reclaim full space');
  console.log('   • Always backup before running actual cleanup\n');
  
  // Current usage context
  console.log('📊 CURRENT STATUS:');
  console.log('   • Current usage: 0.62 GB');
  console.log('   • Free tier limit: 0.5 GB');
  console.log('   • Overage: 0.12 GB (120 MB)');
  console.log(`   • After cleanup: ~${(0.62 - totalSavingsGB).toFixed(2)} GB ${totalSavingsGB > 0.15 ? '✅' : '⚠️'}\n`);
  
  if (totalSavingsGB > 0.15) {
    console.log('✅ RECOMMENDATION: Proceed with cleanup (sufficient savings)');
  } else if (totalSavingsGB > 0.10) {
    console.log('⚠️  RECOMMENDATION: Proceed but monitor closely (minimal buffer)');
  } else {
    console.log('❌ RECOMMENDATION: More aggressive cleanup needed (insufficient savings)');
  }
}

dryRun().catch(console.error);
