/**
 * 🗄️ Supabase 表名称常量
 * 遵循 CLAUDE 架构规范：统一配置管理，避免跨层硬编码
 */

export const TABLE_NAMES = {
  USER_PROFILES: 'user_profiles',
  USER_SUBSCRIPTIONS: 'user_subscriptions',
  USER_ORDERS: 'user_orders',
  USER_NOTES: 'user_notes',
  USER_FILES: 'user_files',
  USER_USAGE_LOGS: 'token_usage_records',
  USAGE_COUNT_RECORDS: 'usage_count_records',
  USER_LIBRARY_ITEMS: 'user_library_items',
  USER_CHAT_HISTORY: 'user_chat_history',
  USER_BRAND_CORPUS: 'user_brand_corpus',
  USER_INVITE_RELATIONS: 'user_invite_relations',
  USER_INVITE_STATS: 'user_invite_stats',
  USER_INVITE_EVENTS: 'user_invite_events'
} as const;

export type TableNameKey = keyof typeof TABLE_NAMES;

