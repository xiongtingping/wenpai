# Store迁移归档 (2024-10)

## 归档日期
2024年10月11日

## 归档内容
本目录包含从`src/stores/backup/`迁移的旧版Store文件。

## 文件清单

### 1. backup/authStore.ts
- **原用途**: 旧版认证Store
- **替代方案**: `src/stores/unified-state-store.ts` (UserState + SessionState)
- **废弃原因**: 已迁移到统一状态管理系统

### 2. backup/tokenUsageStore.ts
- **原用途**: Token使用统计Store
- **替代方案**: `src/stores/unified-state-store.ts` (TokenUsageState)
- **废弃原因**: 已合并到统一Store

### 3. backup/favoritesStore.ts
- **原用途**: 收藏夹Store
- **替代方案**: `src/stores/unified-state-store.ts` (FavoritesState)
- **废弃原因**: 已合并到统一Store

### 4. backup/contentSyncStore.ts
- **原用途**: 内容同步Store
- **替代方案**: `src/stores/unified-state-store.ts` (ContentSyncState)
- **废弃原因**: 已合并到统一Store

### 5. backup/usageStore.ts
- **原用途**: 使用统计Store
- **替代方案**: `src/stores/unified-state-store.ts` (UsageCountState)
- **废弃原因**: 已合并到统一Store

### 6. backup/UnifiedAuthContext.tsx
- **原用途**: 旧版认证Context
- **替代方案**: `src/contexts/UnifiedAuthContext.tsx` (当前版本)
- **废弃原因**: 已重构为新版本

### 7. backup/ThemeContext.tsx
- **原用途**: 主题Context
- **替代方案**: `src/stores/unified-state-store.ts` (ThemeState)
- **废弃原因**: 已迁移到Zustand Store

## 迁移说明

所有旧版Store已完全迁移到统一状态管理系统：
- 主Store: `src/stores/unified-state-store.ts`
- 兼容层: `src/stores/compatibility-layer.ts`
- 订阅Store: `src/stores/subscription-store.ts`

## 删除建议

**安全删除时间**: 2025年1月1日之后

**删除前确认**:
1. ✅ 所有功能已验证正常
2. ✅ 生产环境运行稳定超过3个月
3. ✅ 没有用户报告相关问题

## 恢复方法

如需恢复旧版Store：
```bash
# 从Git历史恢复
git log --all --full-history -- "src/stores/backup/"
git checkout <commit-hash> -- src/stores/backup/

# 或从归档恢复
cp -r .archive/stores-migration-2024-10/backup src/stores/
```

## 相关文档
- 迁移指南: `docs/STORAGE_MIGRATION_GUIDE.md`
- 架构文档: `docs/STORE_ARCHITECTURE.md`
- 变更日志: `CLAUDE.md` (第128-139行)
