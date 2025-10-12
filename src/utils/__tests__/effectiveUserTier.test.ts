import { getEffectiveUserTier, getEffectiveUserId } from '../effectiveUserTier';

describe('effectiveUserTier utils', () => {
  const realLocalStorage = global.localStorage;
  const realRequire = require;

  beforeEach(() => {
    // simple in-memory localStorage mock
    const store: Record<string, string> = {};
    // @ts-ignore
    global.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; }
    } as unknown as Storage;

    jest.resetModules();
    jest.doMock('@/stores/subscription-store', () => ({
      useSubscriptionStore: { getState: () => ({ status: null }) }
    }), { virtual: true });
    jest.doMock('@/stores/unified-state-store', () => ({
      useUnifiedStore: { getState: () => ({ user: { id: null, subscription: 'trial' } }) }
    }), { virtual: true });
  });

  afterEach(() => {
    // @ts-ignore
    global.localStorage = realLocalStorage;
    jest.dontMock('@/stores/subscription-store');
    jest.dontMock('@/stores/unified-state-store');
  });

  test('returns pro from subscription-store when active', async () => {
    jest.doMock('@/stores/subscription-store', () => ({
      useSubscriptionStore: { getState: () => ({ status: { tier: 'pro', status: 'active' } }) }
    }), { virtual: true });

    expect(getEffectiveUserTier()).toBe('pro');
  });

  test('returns premium from unified-state-store when subscription not persisted', async () => {
    jest.doMock('@/stores/unified-state-store', () => ({
      useUnifiedStore: { getState: () => ({ user: { id: 'u1', subscription: 'premium' } }) }
    }), { virtual: true });

    expect(getEffectiveUserTier()).toBe('premium');
  });

  test('falls back to localStorage wenpai-unified-store (state.user.subscription.tier)', () => {
    const payload = { state: { user: { id: 'u2', subscription: { tier: 'pro' } } } };
    localStorage.setItem('wenpai-unified-store', JSON.stringify(payload));
    expect(getEffectiveUserTier()).toBe('pro');
  });

  test('falls back to localStorage _authing_user (plan field)', () => {
    const payload = { id: 'u3', plan: 'premium' };
    localStorage.setItem('_authing_user', JSON.stringify(payload));
    expect(getEffectiveUserTier()).toBe('premium');
  });

  test('getEffectiveUserId prefers unified-state-store', () => {
    jest.doMock('@/stores/unified-state-store', () => ({
      useUnifiedStore: { getState: () => ({ user: { id: 'uid-123', subscription: 'pro' } }) }
    }), { virtual: true });

    expect(getEffectiveUserId()).toBe('uid-123');
  });

  test('returns trial when all sources missing', () => {
    expect(getEffectiveUserTier()).toBe('trial');
  });
});

