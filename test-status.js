/**
 * Test script to verify user status update functionality
 * 
 * Run with: node test-status.js
 */

require('dotenv').config();
const { supabase, supabaseAdmin } = require('./backend/config/database');

async function testStatusUpdate() {
  try {
    // 1. Get all admin users
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (adminsError) {
      console.error('Error fetching admin users:', adminsError);
      return;
    }
    
    console.log(`Found ${admins.length} admin users`);
    
    // 2. Update status for each admin
    for (const admin of admins) {
      console.log(`Testing status update for user: ${admin.email} (${admin.profiles_id})`);
      console.log(`Current status: ${admin.status}`);
      
      // Test setting status to active
      console.log('Setting status to active...');
      const { error: activeError } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'active' })
        .eq('profiles_id', admin.profiles_id);
      
      if (activeError) {
        console.error('Error setting status to active:', activeError);
      } else {
        console.log('Status set to active successfully');
      }
      
      // Verify it worked
      const { data: activeCheck, error: activeCheckError } = await supabaseAdmin
        .from('profiles')
        .select('status')
        .eq('profiles_id', admin.profiles_id)
        .single();
        
      if (activeCheckError) {
        console.error('Error checking active status:', activeCheckError);
      } else {
        console.log('Current status after update:', activeCheck.status);
      }
      
      // Test setting status to inactive
      console.log('Setting status to inactive...');
      const { error: inactiveError } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('profiles_id', admin.profiles_id);
      
      if (inactiveError) {
        console.error('Error setting status to inactive:', inactiveError);
      } else {
        console.log('Status set to inactive successfully');
      }
      
      // Verify it worked
      const { data: inactiveCheck, error: inactiveCheckError } = await supabaseAdmin
        .from('profiles')
        .select('status')
        .eq('profiles_id', admin.profiles_id)
        .single();
        
      if (inactiveCheckError) {
        console.error('Error checking inactive status:', inactiveCheckError);
      } else {
        console.log('Current status after update:', inactiveCheck.status);
      }
      
      console.log('----------------------------');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testStatusUpdate()
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test error:', error)); 