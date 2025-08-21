/**
 * Authing 登录策略封装（生产默认跳转，弹窗为可选增强）
 */
import { AuthConfig } from './types';

// 小工具：base64url 与 PKCE 生成
async function sha256(input: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer> {
  return await crypto.subtle.digest('SHA-256', input);
}
function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function randomBytesUrlSafe(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function generatePKCE() {
  const code_verifier = randomBytesUrlSafe(64);
  const enc = new TextEncoder().encode(code_verifier);
  const digest = await sha256(enc);
  const code_challenge = toBase64Url(digest);
  return { code_verifier, code_challenge, method: 'S256' as const };
}

export async function discoverAuthorizationEndpoint(host: string, appId: string): Promise<string> {
  try {
    const qs = new URLSearchParams({ host, appId });
    const resp = await fetch(`/.netlify/functions/oidc-discovery?${qs.toString()}`);
    if (resp.ok) {
      const d = await resp.json();
      if (d && d.authorization_endpoint) return d.authorization_endpoint as string;
    }
  } catch (e) { /* discovery fallback used */ }
  // fallback：托管登录入口
  return `${host.replace(/\/$/, '')}/${appId}/login`;
}

export async function buildAuthorizeUrl(config: AuthConfig, opts?: { redirectTo?: string; screenHint?: 'signup' | 'login' }) {
  const authorization_endpoint = await discoverAuthorizationEndpoint(config.host, config.appId);
  const { code_verifier, code_challenge, method } = await generatePKCE();
  // 持久化 PKCE
  try { localStorage.setItem('pkce_code_verifier', code_verifier); } catch (_e) { /* ignore storage error */ }

  const state = opts?.redirectTo || '';
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri || '',
    response_type: 'code',
    scope: config.scope || 'openid profile email phone',
    code_challenge: code_challenge,
    code_challenge_method: method,
  });
  if (state) params.set('state', state);
  if (opts?.screenHint) params.set('screen_hint', opts.screenHint);

  return `${authorization_endpoint}?${params.toString()}`;
}

export async function startHostedLogin(config: AuthConfig, redirectTo?: string) {
  const url = await buildAuthorizeUrl(config, { redirectTo });
  window.location.href = url;
}

export async function startHostedRegister(config: AuthConfig, redirectTo?: string) {
  const url = await buildAuthorizeUrl(config, { redirectTo, screenHint: 'signup' });
  window.location.href = url;
}

// 运行时选择：生产默认跳转；开发或灰度可通过查询参数或环境变量强制 hosted/guard
export function shouldUseHosted(): boolean {
  try {
    const qs = new URLSearchParams(window.location.search);
    const mode = (qs.get('auth') || qs.get('auth_mode') || qs.get('login_mode') || '').toLowerCase();
    if (['hosted', '1', 'true'].includes(mode)) return true;
  } catch (_e) { /* ignore query parse */ }
  // 生产默认 hosted
  return process.env.NODE_ENV === 'production';
}

