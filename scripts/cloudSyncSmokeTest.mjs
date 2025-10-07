import { createClient } from '@supabase/supabase-js';

function envOrThrow(name){ const v=process.env[name]; if(!v) throw new Error(`Missing env ${name}`); return v }
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY; // allow fallback
if(!url || !serviceKey){
  console.error('Env check failed:', { url: !!url, key: !!serviceKey });
  process.exit(2);
}
const supabase = createClient(url, serviceKey);

const testRunId = `cloud-sync-smoke-${Date.now()}`;
const userId = `agent-test-user-${Date.now()}`;

function logStep(name, ok, extra){
  const status = ok ? 'OK' : 'FAIL';
  console.log(`[${status}] ${name}`, extra? JSON.stringify(extra): '');
}

async function upsertProfile(){
  const payload = {
    user_id: userId,
    nickname: 'CloudSyncTest',
    avatar_url: 'https://example.com/a.png',
    phone: '000-0000',
    email: `test+${testRunId}@example.com`,
    preferences: { theme: 'dark', language: 'zh-CN', testRunId },
    settings: { shortcuts: {}, testRunId },
  };
  const { data, error } = await supabase.from('user_profiles').upsert(payload).select('*').eq('user_id', userId).maybeSingle();
  if(error) throw error;
  return data;
}

async function brandKV(key, value){
  const brand_name = `user_${userId}_${key}`;
  const payload = { user_id: userId, brand_name, brand_description: JSON.stringify(value), metadata: { dataKey: key, testRunId } };
  const { data, error } = await supabase.from('user_brand_corpus').insert(payload).select('*').single();
  if(error) throw error;
  const { data: rows, error: e2 } = await supabase.from('user_brand_corpus').select('*').eq('user_id', userId).eq('brand_name', brand_name).limit(1);
  if(e2) throw e2;
  const got = rows && rows[0];
  return { inserted: data, read: got };
}

async function brandLegacy(){
  const legacy = `brand_assets_${userId}`;
  const samples = [JSON.stringify([{ title: 'LegacyBrand', testRunId }])];
  const { data, error } = await supabase.from('user_brand_corpus').insert({ user_id: userId, brand_name: legacy, content_samples: samples, metadata: { testRunId, legacy: true } }).select('*').single();
  if(error) throw error;
  const { data: rows, error: e2 } = await supabase.from('user_brand_corpus').select('*').eq('user_id', userId).eq('brand_name', legacy).limit(1);
  if(e2) throw e2;
  return { inserted: data, read: rows && rows[0] };
}

async function libraryItem(){
  const payload = { user_id: userId, title: `Test Library ${testRunId}`, content: 'hello', status: 'active', metadata: { testRunId } };
  const { data, error } = await supabase.from('user_library_items').insert(payload).select('*').single();
  if(error) throw error;
  const { data: rows } = await supabase.from('user_library_items').select('*').eq('user_id', userId).eq('metadata->>testRunId', testRunId).limit(1);
  return { inserted: data, read: rows && rows[0] };
}

async function chatHistory(){
  const payload = { user_id: userId, session_id: testRunId, role: 'user', content: 'hi', model: 'gpt-4o-mini', tokens_used: 10, metadata: { testRunId } };
  const { data, error } = await supabase.from('user_chat_history').insert(payload).select('*').single();
  if(error) throw error;
  const { data: rows } = await supabase.from('user_chat_history').select('*').eq('user_id', userId).eq('session_id', testRunId).limit(1);
  return { inserted: data, read: rows && rows[0] };
}

async function subscriptionKV(){
  const res = await brandKV('subscriptionTier', 'trial');
  return res;
}

async function tokenUsage(){
  const id = `tok_${Date.now()}`;
  const payload = { id, user_id: userId, feature: 'cloudSyncTest', task_type: 'smoke', input_tokens: 5, output_tokens: 7, total_tokens: 12, model: 'deepseek-v3', content_summary: 'ok', success: true };
  const { data, error } = await supabase.from('token_usage_records').insert(payload).select('*').single();
  if(error) throw error;
  const { data: rows } = await supabase.from('token_usage_records').select('*').eq('id', id).limit(1);
  return { inserted: data, read: rows && rows[0] };
}

// usage count table not present; test via kv instead
async function modelUsageKV(){
  const res = await brandKV('aiModelUsage', { model: 'deepseek-v3', calls: 1, tokens: 12, testRunId });
  return res;
}

async function invites(){
  const relation = { inviter_id: `${userId}-A`, invitee_id: `${userId}-B`, status: 'pending', source: 'link', metadata: { testRunId } };
  const { data, error } = await supabase.from('user_invite_relations').insert(relation).select('*').single();
  if(error) throw error;
  const { data: rel } = await supabase.from('user_invite_relations').select('*').eq('inviter_id', `${userId}-A`).eq('invitee_id', `${userId}-B`).limit(1);

  // stats/rewards（若存在表）
  let stats=null, reward=null;
  try {
    const { data: st } = await supabase.from('user_invite_stats').insert({ user_id: userId, total_invites: 1, successful_invites: 0, link_clicks: 0, rewards_issued: 0, total_reward_count: 0, conversion_rate: 0 }).select('*').single();
    stats = st;
  } catch {}
  try {
    const { data: rw } = await supabase.from('invite_rewards').insert({ user_id: userId, reward_type: 'usage_count', amount: 1, source: 'invite', metadata: { testRunId } }).select('*').single();
    reward = rw;
  } catch {}
  return { relation: rel && rel[0], stats, reward };
}

async function cleanup(){
  // brand corpus
  await supabase.from('user_brand_corpus').delete().eq('user_id', userId);
  // library
  await supabase.from('user_library_items').delete().eq('user_id', userId);
  // chat
  await supabase.from('user_chat_history').delete().eq('user_id', userId);
  // subscriptions
  await supabase.from('user_subscriptions').delete().eq('user_id', userId);
  // token usage
  await supabase.from('token_usage_records').delete().eq('user_id', userId);
  await supabase.from('usage_counts').delete().eq('user_id', userId);
  // invites
  await supabase.from('user_invite_relations').delete().or(`inviter_id.eq.${userId}-A,invitee_id.eq.${userId}-B`);
  try { await supabase.from('user_invite_stats').delete().eq('user_id', userId); } catch {}
  try { await supabase.from('invite_rewards').delete().eq('user_id', userId); } catch {}
  // profile
  await supabase.from('user_profiles').delete().eq('user_id', userId);
}

async function main(){
  const results = [];
  try {
    const prof = await upsertProfile();
    results.push(['user_profiles', !!prof]);

    const sh = await brandKV('shareHistory', [{ content: 'hello', testRunId }]);
    results.push(['shareHistory', !!sh.read && !!sh.inserted]);

    const modelPref = await brandKV('preferredAIModel', 'deepseek-v3');
    results.push(['preferredAIModel', !!modelPref.read]);

    const topics = await brandKV('bookmarked-topics', [{ topic: 'AI', testRunId }]);
    results.push(['bookmarked-topics', !!topics.read]);

    const interest = await brandKV('interestFilters', { category: 'tech', score: 0.8 });
    results.push(['interestFilters', !!interest.read]);

    const todos = await brandKV('studio_todos', [{ title: 't1', done: false, testRunId }]);
    results.push(['studio_todos', !!todos.read]);

    const emoji = await brandKV('emoji-favorites', ['😀']);
    results.push(['emoji-favorites', !!emoji.read]);

    const lib = await libraryItem();
    results.push(['user_library_items', !!lib.read]);

    const brandNew = await brandKV('brand_assets', { desc: 'brand', testRunId });
    results.push(['brand_assets(new)', !!brandNew.read]);

    const brandOld = await brandLegacy();
    results.push(['brand_assets(legacy)', !!brandOld.read]);

    const sub = await subscriptionKV();
    results.push(['subscriptionTier(kv)', !!sub.read]);

    const tok = await tokenUsage();
    results.push(['token_usage_records', !!tok.read]);

    const mu = await modelUsageKV();
    results.push(['aiModelUsage(kv)', !!mu.read]);

    const inv = await invites();
    results.push(['invites', !!inv.relation]);

    // 输出结果
    for (const [name, ok] of results) logStep(name, ok);

    const allOk = results.every(([,ok]) => ok);
    console.log('ALL_OK:', allOk);
    if (!allOk) process.exitCode = 1;

  } catch (e) {
    console.error('Test failed:', e);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

main();

