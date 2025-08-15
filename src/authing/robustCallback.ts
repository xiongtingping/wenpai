import AuthService from '@/services/authService';
import { getAuthingConfig } from '@/config/authing';

export async function robustHandleAuthCallback(): Promise<any> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) throw new Error('缺少授权码(code)');

  const cfg = getAuthingConfig();
  const svc = AuthService.getInstance();

  const tokenData = await svc.exchangeCodeForToken(code, cfg.redirectUri);
  const accessToken = tokenData?.access_token || tokenData?.accessToken;
  if (!accessToken) throw new Error('未获取到 access_token');

  const me = await svc.getUserInfo(accessToken);
  const normalized = svc.buildUserInfo(me, tokenData);

  // 清理 URL 参数，仅保留路径
  const cleanPath = window.location.pathname;
  window.history.replaceState({}, document.title, cleanPath);

  return normalized;
}

