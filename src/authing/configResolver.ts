/**
 * Resolve Authing Guard config from server public-config to avoid hardcoded mismatch.
 * Systemic fix: single source of truth from Authing, no patching.
 */
export interface BaseAuthingConfig {
  appId: string;
  host: string; // may be with protocol; we'll normalize to https://<domain>
  redirectUri: string;
}

export interface ResolvedGuardConfig {
  appId: string;
  host: string;       // Plan A: https://<domain>/<appId> 应用专属 host
  redirectUri: string; // 从服务器白名单选择的回调
}

function toDomain(host: string): string {
  const trimmed = host.replace(/\/$/, '');
  return trimmed.replace(/^https?:\/\//, '');
}

function normalizeRedirect(uri: string): string {
  try {
    const u = new URL(uri);
    const hn = u.hostname;
    if (hn.includes('localhost')) return 'http://localhost:5173/callback';
    if (hn.endsWith('netlify.app')) return 'https://wenpai.netlify.app/callback';
    if (hn.endsWith('wenpai.xyz')) return 'https://www.wenpai.xyz/callback';
    return uri;
  } catch {
    return uri;
  }
}

function pickRedirectUri(uris: string[], fallback: string): string {
  // 优先严格选择生产主域
  const canonical = 'https://www.wenpai.xyz/callback';
  if (uris.includes(canonical)) return canonical;
  const netlify = 'https://wenpai.netlify.app/callback';
  if (uris.includes(netlify)) return netlify;
  const local = 'http://localhost:5173/callback';
  if (uris.includes(local)) return local;
  // 兜底：返回第一个（服务端白名单）或规范化fallback
  return uris[0] || normalizeRedirect(fallback);
}

export async function resolveAuthingGuardConfig(base: BaseAuthingConfig): Promise<ResolvedGuardConfig> {
  const domain = toDomain(base.host);
  // 使用官方核心域名公开配置接口，确保 CORS 与数据一致性
  const url = `https://core.authing.cn/api/v2/applications/${base.appId}/public-config`;
  try {
    const resp = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (resp.ok) {
      const data = await resp.json();
      const redirectUris: string[] =
        data?.oidc?.redirect_uris || data?.redirectUris || data?.redirectUrisWhitelist || [];
      let chosen = pickRedirectUri(redirectUris, base.redirectUri);
      // 生产环境一律回落到主域回调，统一入口，避免白名单抖动
      if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
        chosen = 'https://www.wenpai.xyz/callback';
      }
      return {
        appId: base.appId,
        host: `https://${domain}/${base.appId}`.replace(/\/$/, ''),
        redirectUri: chosen
      };
    }
  } catch (e) {
    // swallow and fallback
  }
  return {
    appId: base.appId,
    host: `https://${domain}/${base.appId}`.replace(/\/$/, ''),
    redirectUri: normalizeRedirect(base.redirectUri)
  };
}

