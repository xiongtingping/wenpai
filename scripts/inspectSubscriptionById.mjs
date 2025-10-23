#!/usr/bin/env node
/**
 * Quick script: Inspect subscription record by ID
 * Usage: node scripts/inspectSubscriptionById.mjs <subscription_id>
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const [,, subId] = process.argv;
if (!subId) {
  console.error('Usage: node scripts/inspectSubscriptionById.mjs <subscription_id>');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
if (!url || !serviceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env');
  process.exit(2);
}

const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

const main = async () => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id,user_id,tier,status,started_at,expires_at,created_at,updated_at')
    .eq('id', subId)
    .maybeSingle();

  if (error) {
    console.error('Query error:', error);
    process.exit(3);
  }
  if (!data) {
    console.log('No record found for id:', subId);
    return;
  }

  const start = data.started_at ? new Date(data.started_at) : (data.created_at ? new Date(data.created_at) : null);
  const end = data.expires_at ? new Date(data.expires_at) : null;
  const fmt = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : 'N/A';

  console.log('Record:', data);
  console.log('Valid period:', `${fmt(start)} ~ ${fmt(end)}`);
};

main().catch((e) => { console.error(e); process.exit(99); });

