#!/usr/bin/env node
/**
 * AUTOMATED DATABASE CLEANUP - API Approach
 * Executes cleanup in small batches to avoid timeouts
 * Runs directly via Supabase REST API
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://trkgvxizmmhtvdfmgxnn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2d2eGl6bW1odHZkZm1neG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY0NTc5MTcsImV4cCI6MTk5MjAzMzkxN30.xRZydpUO3fCZh-jfkZOdPcLy8458eZMyenCxGCwXg8g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 50; // Very small batches to avoid timeouts

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanupCashbackCodes() {
  console.log('\n📦 Cleaning up cashback codes...\n');
  
  let totalArchived = 0;
  let batchCount = 0;
  
  while (true) {
    // Get batch of codes to archive
    const { data: codesToArchive, error: fetchError } = await supabase
      .from('cashback_codes')
      .select('*')
      .eq('redeemed', true)
      .lt('_createdAt', '2024-01-01')
      .limit(BATCH_SIZE);
    
    if (fetchError) {
      console.error(`❌ Error fetching: ${fetchError.message}`);
      break;
    }
    
    if (!codesToArchive || codesToArchive.length === 0) {
      console.log('✅ No more codes to archive');
      break;
    }
    
    // Insert into archive
    const { error: insertError } = await supabase
      .from('cashback_codes_archive')
      .upsert(codesToArchive, { onConflict: '_id' });
    
    if (insertError) {
      console.error(`❌ Error archiving: ${insertError.message}`);
      break;
    }
    
    // Delete from main table
    const idsToDelete = codesToArchive.map(c => c._id);
    const { error: deleteError } = await supabase
      .from('cashback_codes')
      .delete()
      .in('_id', idsToDelete);
    
    if (deleteError) {
      console.error(`❌ Error deleting: ${deleteError.message}`);
      break;
    }
    
    totalArchived += codesToArchive.length;
    batchCount++;
    
    console.log(`  Batch ${batchCount}: Archived ${codesToArchive.length} codes (Total: ${totalArchived})`);
    
    // Small delay to avoid rate limiting
    await sleep(500);
  }
  
  console.log(`\n✅ Total cashback codes archived: ${totalArchived}\n`);
  return totalArchived;
}

async function cleanupTransactions() {
  console.log('\n📦 Cleaning up tiler transactions...\n');
  
  // Get all old transactions
  const { data: transactions, error: fetchError } = await supabase
    .from('tiler_transaction')
    .select('*')
    .lt('created_at', '2024-01-01');
  
  if (fetchError) {
    console.error(`❌ Error fetching: ${fetchError.message}`);
    return 0;
  }
  
  if (!transactions || transactions.length === 0) {
    console.log('✅ No transactions to archive');
    return 0;
  }
  
  // Insert into archive
  const { error: insertError } = await supabase
    .from('tiler_transaction_archive')
    .upsert(transactions, { onConflict: 'id' });
  
  if (insertError) {
    console.error(`❌ Error archiving: ${insertError.message}`);
    return 0;
  }
  
  // Delete from main table
  const idsToDelete = transactions.map(t => t.id);
  
  // Delete in small batches
  for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
    const batch = idsToDelete.slice(i, i + BATCH_SIZE);
    const { error: deleteError } = await supabase
      .from('tiler_transaction')
      .delete()
      .in('id', batch);
    
    if (deleteError) {
      console.error(`❌ Error deleting batch: ${deleteError.message}`);
    } else {
      console.log(`  Deleted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(idsToDelete.length/BATCH_SIZE)}`);
    }
    
    await sleep(300);
  }
  
  console.log(`\n✅ Total transactions archived: ${transactions.length}\n`);
  return transactions.length;
}

async function cleanupSMS() {
  console.log('\n📦 Cleaning up duplicate SMS...\n');
  
  // Get all SMS
  const { data: allSMS, error: fetchError } = await supabase
    .from('sms')
    .select('*');
  
  if (fetchError) {
    console.error(`❌ Error fetching: ${fetchError.message}`);
    return 0;
  }
  
  if (!allSMS || allSMS.length === 0) {
    console.log('✅ No SMS to process');
    return 0;
  }
  
  // Find duplicates
  const groups = {};
  allSMS.forEach(sms => {
    const key = `${sms.phone_number}|${sms.text}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sms);
  });
  
  const duplicatesToDelete = [];
  for (const [key, messages] of Object.entries(groups)) {
    if (messages.length > 1) {
      // Sort by created_at descending, keep first, delete rest
      messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      duplicatesToDelete.push(...messages.slice(1));
    }
  }
  
  if (duplicatesToDelete.length === 0) {
    console.log('✅ No duplicates found');
    return 0;
  }
  
  // Archive unique SMS (keep one per phone+text)
  const uniqueSMS = Object.values(groups).map(group => group[0]);
  
  const { error: insertError } = await supabase
    .from('sms_archive')
    .upsert(uniqueSMS, { onConflict: 'id' });
  
  if (insertError) {
    console.error(`❌ Error archiving: ${insertError.message}`);
    return 0;
  }
  
  // Delete duplicates in batches
  const idsToDelete = duplicatesToDelete.map(s => s.id);
  
  for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
    const batch = idsToDelete.slice(i, i + BATCH_SIZE);
    const { error: deleteError } = await supabase
      .from('sms')
      .delete()
      .in('id', batch);
    
    if (deleteError) {
      console.error(`❌ Error deleting batch: ${deleteError.message}`);
    } else {
      console.log(`  Deleted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(idsToDelete.length/BATCH_SIZE)} (${batch.length} messages)`);
    }
    
    await sleep(300);
  }
  
  console.log(`\n✅ Total SMS duplicates removed: ${duplicatesToDelete.length}\n`);
  return duplicatesToDelete.length;
}

async function showResults() {
  console.log('\n📊 FINAL RESULTS:\n');
  
  // Check archive counts
  const tables = [
    { name: 'cashback_codes_archive', label: 'Cashback codes archived' },
    { name: 'tiler_transaction_archive', label: 'Transactions archived' },
    { name: 'sms_archive', label: 'SMS archived' }
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ${table.label}: Error - ${error.message}`);
    } else {
      console.log(`  ${table.label}: ${data.length || 0} records`);
    }
  }
  
  console.log('\n✅ Cleanup complete!\n');
  console.log('⚠️  NEXT: Run VACUUM FULL in Supabase SQL Editor');
  console.log('   (Create new query → paste: VACUUM FULL; → run)\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     AUTOMATED DATABASE CLEANUP - RUNNING NOW          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('⏱️  This will take several minutes...');
  console.log('   Processing in small batches to avoid timeouts\n');
  
  try {
    // Step 1: Cleanup cashback codes
    const codesCount = await cleanupCashbackCodes();
    
    // Step 2: Cleanup transactions
    const transCount = await cleanupTransactions();
    
    // Step 3: Cleanup SMS
    const smsCount = await cleanupSMS();
    
    // Show results
    await showResults();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   CLEANUP COMPLETE                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.log('\n⚠️  Cleanup may be partially complete.');
    console.log('   Check Supabase Dashboard for current status.\n');
    process.exit(1);
  }
}

main();
