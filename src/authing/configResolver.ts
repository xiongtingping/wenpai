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
  host: string;       // https://<domain> (no appId path) per official Guard docs
  redirectUri: string; // one of server-allowed URIs
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
  const priorities = [
    'https://www.wenpai.xyz/callback',
    'https://wenpai.netlify.app/callback',
    'http://localhost:5173/callback'
  ];
  for (const p of priorities) if (uris.includes(p)) return p;
  return uris[0] || normalizeRedirect(fallback);
}

export async function resolveAuthingGuardConfig(base: BaseAuthingConfig): Promise<ResolvedGuardConfig> {
  const domain = toDomain(base.host);
  const url = `https://${domain}/api/v2/applications/${base.appId}/public-config`;
  try {
    const resp = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (resp.ok) {
      const data = await resp.json();
      const redirectUris: string[] =
        data?.oidc?.redirect_uris || data?.redirectUris || data?.redirectUrisWhitelist || [];
      return {
        appId: base.appId,
        host: `https://${domain}`,
        redirectUri: pickRedirectUri(redirectUris, base.redirectUri)
      };
    }
  } catch (e) {
    // swallow and fallback
    // console.warn('Failed to fetch public-config:', e);
  }
  return {
    appId: base.appId,
    host: `https://${domain}`,
    redirectUri: normalizeRedirect(base.redirectUri)
  };
}

