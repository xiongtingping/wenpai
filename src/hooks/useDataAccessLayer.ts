import i18n from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import DataAccessLayer, { type DataAccessOptions } from '@/services/dataAccessLayer';
import type { DatabaseRecord } from '@/services/supabaseDataService';

export function useDataAccessLayer() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.id) {
    throw new Error(i18n.t('common.errors.数据访问层需要用户登录'));
  }

  const dal = new DataAccessLayer(user.id, user.isAdmin || false);

  return {
    create: <T extends DatabaseRecord>(
      tableName: string,
      data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
      options?: DataAccessOptions
    ) => dal.create<T>(tableName, data, options),
    findMany: <T extends DatabaseRecord>(tableName: string, options?: DataAccessOptions) =>
      dal.findMany<T>(tableName, options),
    findById: <T extends DatabaseRecord>(tableName: string, id: string, options?: DataAccessOptions) =>
      dal.findById<T>(tableName, id, options),
    update: <T extends DatabaseRecord>(
      tableName: string,
      id: string,
      data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>,
      options?: DataAccessOptions
    ) => dal.update<T>(tableName, id, data, options),
    delete: (tableName: string, id: string, options?: DataAccessOptions) =>
      dal.delete(tableName, id, options),
    deleteMany: (tableName: string, ids: string[], options?: DataAccessOptions) =>
      dal.deleteMany(tableName, ids, options),
    count: (tableName: string, filters?: Record<string, any>, options?: DataAccessOptions) =>
      dal.count(tableName, filters, options),
    getAccessLogs: (limit?: number) => dal.getAccessLogs(limit),
    clearAccessLogs: () => dal.clearAccessLogs(),
    getUserStats: () => dal.getUserStats(),
    user,
    isAuthenticated
  };
}

export default useDataAccessLayer;

