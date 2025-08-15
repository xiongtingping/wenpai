# Authing Login Regression Verification (2025-08-15)

This document records the production E2E verification logs after fixing redirectUri configuration for Authing login.

## Scope
- Enforce single redirectUri in production to https://www.wenpai.xyz/callback
- Update Netlify function callback fallback to main domain
- Preserve Callback page URL normalization as safety

## Steps
1. Open https://www.wenpai.xyz/
2. Click “登录” to trigger Authing Guard and hosted login
3. Observe network and console logs

## Key Logs (Production)

- Initial login page load
  - Guard initialized with host=rzcswqs4sq0f.authing.cn

- Hosted login
  - GET rzcswqs4sq0f.authing.cn/.../login?redirect_uri=https%3A%2F%2Fwww.wenpai.xyz%2Fcallback => 200

- OIDC authorization (redirect_uri is SINGLE and correct)
  - GET rzcswqs4sq0f.authing.cn/.../oidc/auth?...&redirect_uri=https%3A%2F%2Fwww.wenpai.xyz%2Fcallback => 302

- Callback landing (no malformed URL)
  - GET https://www.wenpai.xyz/callback?code=***&state=*** => 200

- No occurrences of concatenated `/callbackhttps` URL after the fix.

## Risk & Rollback
- Change is scoped to production redirect selection and Netlify fallback only.
- Rollback by reverting branch `fix/authing-prod-redirect` if needed.

## Next
- Complete post-login flow (token exchange, user info, permissions) using a test account.

