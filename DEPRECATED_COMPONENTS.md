# 🗑️ 废弃组件清单

以下权限守卫组件已被 `EnhancedUnifiedPermissionGuard` 替代，可以安全删除：

## 已废弃的组件文件

| 组件文件 | 状态 | 引用检查 | 安全删除 |
|----------|------|----------|----------|
| `src/components/auth/EnhancedPermissionGuard.tsx` | ✅ 废弃 | ✅ 无引用 | 🟢 可删除 |
| `src/components/auth/SubscriptionGuard.tsx` | ⚠️ 废弃 | ❌ 被FeatureZoneGuard引用 | 🟡 需先处理依赖 |
| `src/components/auth/FeatureZoneGuard.tsx` | ✅ 废弃 | ✅ 无外部引用 | 🟢 可删除 |
| `src/components/auth/NewPermissionGuard.tsx` | ✅ 废弃 | ✅ 无引用 | 🟢 可删除 |
| `src/components/auth/UnifiedPaywallGuard.tsx` | ✅ 废弃 | ✅ 无引用 | 🟢 可删除 |
| `src/components/auth/PermissionGuard.tsx` | ✅ 废弃 | ✅ 无引用 | 🟢 可删除 |
| `src/components/auth/SimplePermissionGuard.tsx` | ✅ 废弃 | ✅ 无引用 | 🟢 可删除 |

## 保留的组件

| 组件文件 | 原因 | 状态 |
|----------|------|------|
| `src/components/auth/UnifiedPermissionGuard.tsx` | 原始组件，可能被外部引用 | 🟨 暂时保留 |
| `src/components/auth/EnhancedUnifiedPermissionGuard.tsx` | 新的统一组件 | ✅ 活跃 |

## 删除顺序

1. **第一批**（无依赖）：
   - `EnhancedPermissionGuard.tsx`
   - `NewPermissionGuard.tsx` 
   - `UnifiedPaywallGuard.tsx`
   - `PermissionGuard.tsx`
   - `SimplePermissionGuard.tsx`

2. **第二批**（有内部依赖）：
   - `FeatureZoneGuard.tsx`
   - `SubscriptionGuard.tsx`

## 删除后的验证

- [ ] 构建成功 (`npm run build`)
- [ ] 类型检查通过 (`npm run type-check`)
- [ ] 无未引用的导入
- [ ] 功能正常工作

## 回滚计划

如果删除后出现问题：
1. `git checkout HEAD~1 -- src/components/auth/[删除的文件].tsx`
2. 分析具体的依赖关系
3. 提供兼容性适配层