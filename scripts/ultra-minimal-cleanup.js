const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://trkgvxizmmhtvdfmgxnn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2d2eGl6bW1odHZkZm1neG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY0NTc5MTcsImV4cCI6MTk5MjAzMzkxN30.xRZydpUO3fCZh-jfkZOdPcLy8458eZMyenCxGCwXg8g'
);

async function run() {
  console.log('🚀 Running ultra-minimal cleanup...\n');
  
  // Try to execute SQL directly via rpc
  try {
    console.log('Attempting to archive old codes via SQL...');
    
    const { data, error } = await supabase.rpc('cleanup_old_codes', {
      batch_size: 10
    });
    
    if (error) {
      console.log('RPC not available, trying raw SQL...');
      
      // Try raw SQL execution
      const { data: sqlResult, error: sqlError } = await supabase
        .from('cashback_codes')
        .select('_id', { count: 'exact', head: true })
        .eq('redeemed', true)
        .lt('_createdAt', '2024-01-01')
        .limit(1);
      
      if (sqlError) {
        console.error('❌ Database is too overloaded:', sqlError.message);
        console.log('\n⚠️  RECOMMENDATION:');
        console.log('   The database is severely overloaded (0.62 GB / 0.5 GB limit)');
        console.log('   Even simple queries are timing out.\n');
        console.log('   OPTIONS:');
        console.log('   1. Contact Supabase support to temporarily lift restrictions');
        console.log('      https://supabase.com/support');
        console.log('   2. Upgrade to Pro plan ($25/month) for immediate access');
        console.log('   3. Wait for off-peak hours (late night UTC) and try again\n');
        return;
      }
      
      console.log('✅ Database is responding');
    } else {
      console.log('✅ Cleanup function executed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

run();
