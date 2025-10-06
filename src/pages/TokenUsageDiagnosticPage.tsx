import React, { useMemo, useState } from 'react';
import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';

interface QueryResult { count: number; sample: any | null; sumTokens: number; source: string }

async function queryTable(userId: string, table: string, timeField: 'timestamp'|'created_at', sinceISO: string): Promise<QueryResult> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from(table).select('*').eq('user_id', userId).gte(timeField, sinceISO);
  if (error) throw error;
  const rows = data || [];
  const sumTokens = rows.reduce((s: number, r: any) => {
    const tokens = (r.total_tokens ?? r.totalTokens) ?? ((r.input_tokens ?? 0) + (r.output_tokens ?? 0));
    return s + (typeof tokens === 'number' ? tokens : 0);
  }, 0);
  return { count: rows.length, sample: rows[0] || null, sumTokens, source: `${table}.${timeField}` };
}

async function queryAllTime(userId: string, table: string): Promise<QueryResult> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from(table).select('*').eq('user_id', userId);
  if (error) throw error;
  const rows = data || [];
  const sumTokens = rows.reduce((s: number, r: any) => {
    const tokens = (r.total_tokens ?? r.totalTokens) ?? ((r.input_tokens ?? 0) + (r.output_tokens ?? 0));
    return s + (typeof tokens === 'number' ? tokens : 0);
  }, 0);
  return { count: rows.length, sample: rows[0] || null, sumTokens, source: `${table}.all_time` };
}

export default function TokenUsageDiagnosticPage() {
  const [userId, setUserId] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const monthStart = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01T00:00:00.000Z`;
  }, []);

  async function runDiagnosis() {
    setLoading(true);
    const out: any[] = [];
    try {
      // 1) token_usage_records：timestamp → created_at
      out.push(await queryTable(userId, TABLE_NAMES.USER_USAGE_LOGS, 'timestamp', monthStart));
      out.push(await queryTable(userId, TABLE_NAMES.USER_USAGE_LOGS, 'created_at', monthStart));
      // 2) 旧表 user_usage_logs：timestamp → created_at
      out.push(await queryTable(userId, 'user_usage_logs', 'timestamp', monthStart));
      out.push(await queryTable(userId, 'user_usage_logs', 'created_at', monthStart));
      // 3) 无时间过滤，检查是否“根本没有记录”
      out.push(await queryAllTime(userId, TABLE_NAMES.USER_USAGE_LOGS));
      out.push(await queryAllTime(userId, 'user_usage_logs'));
    } catch (e: any) {
      out.push({ error: true, message: e?.message || String(e) });
    } finally {
      setLogs(out);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Token 使用量诊断</h2>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="输入 userId" style={{ width: 380 }} />
        <button onClick={runDiagnosis} disabled={!userId || loading}>{loading ? '诊断中…' : '运行诊断'}</button>
      </div>
      <div>
        <div>月份起始：{monthStart}</div>
        <pre style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 6 }}>
{JSON.stringify(logs, null, 2)}
        </pre>
      </div>
    </div>
  );
}
