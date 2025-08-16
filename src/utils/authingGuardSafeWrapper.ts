/**
 * 占位安全封装（仅类型/接口占位，不改动实际 Guard 初始化逻辑）
 * 根据安全规则：禁止修改 Authing 核心逻辑，如需封装需新建模块
 */
export interface SafeGuardConfig {
  appId?: string;
  host?: string;
  redirectUri?: string;
}

export function createSafeGuardConfig(config?: Partial<SafeGuardConfig>): SafeGuardConfig {
  return {
    ...config,
  };
}

