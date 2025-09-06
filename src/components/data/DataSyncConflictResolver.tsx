/**
 * 数据同步冲突解决器界面组件
 * @description 提供可视化的数据同步冲突解决界面
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataSyncConflictResolver } from '@/hooks/useDataSyncConflictResolver';
import { 
  ConflictResolutionStrategy, 
  ConflictType,
  type DataConflict 
} from '@/services/dataSyncConflictResolver';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  GitMerge, 
  Download, 
  Upload, 
  Copy,
  Settings
} from 'lucide-react';

interface DataSyncConflictResolverProps {
  /** 是否显示 */
  open?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 获取冲突类型图标
 */
const getConflictTypeIcon = (type: ConflictType) => {
  switch (type) {
    case ConflictType.BOTH_MODIFIED:
      return <GitMerge className="w-4 h-4 text-orange-500" />;
    case ConflictType.VERSION_MISMATCH:
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case ConflictType.LOCAL_NEW_REMOTE_EXISTS:
      return <Copy className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  }
};

/**
 * 获取冲突类型描述
 */
const getConflictTypeDescription = (type: ConflictType) => {
  switch (type) {
    case ConflictType.BOTH_MODIFIED:
      return '双方都已修改';
    case ConflictType.VERSION_MISMATCH:
      return '版本不匹配';
    case ConflictType.LOCAL_NEW_REMOTE_EXISTS:
      return '本地新建与远程冲突';
    case ConflictType.LOCAL_DELETED_REMOTE_MODIFIED:
      return '本地删除，远程修改';
    case ConflictType.LOCAL_MODIFIED_REMOTE_DELETED:
      return '本地修改，远程删除';
    default:
      return '未知冲突类型';
  }
};

/**
 * 获取解决策略图标
 */
const getStrategyIcon = (strategy: ConflictResolutionStrategy) => {
  switch (strategy) {
    case ConflictResolutionStrategy.LOCAL_WINS:
      return <Upload className="w-4 h-4" />;
    case ConflictResolutionStrategy.REMOTE_WINS:
      return <Download className="w-4 h-4" />;
    case ConflictResolutionStrategy.MERGE:
      return <GitMerge className="w-4 h-4" />;
    case ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS:
      return <Clock className="w-4 h-4" />;
    case ConflictResolutionStrategy.CREATE_COPY:
      return <Copy className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
  }
};

/**
 * 获取解决策略描述
 */
const getStrategyDescription = (strategy: ConflictResolutionStrategy) => {
  switch (strategy) {
    case ConflictResolutionStrategy.LOCAL_WINS:
      return '本地优先';
    case ConflictResolutionStrategy.REMOTE_WINS:
      return '远程优先';
    case ConflictResolutionStrategy.MERGE:
      return '智能合并';
    case ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS:
      return '最新优先';
    case ConflictResolutionStrategy.CREATE_COPY:
      return '创建副本';
    case ConflictResolutionStrategy.MANUAL_RESOLUTION:
      return '手动解决';
    default:
      return '未知策略';
  }
};

/**
 * 冲突项组件
 */
const ConflictItem: React.FC<{
  conflict: DataConflict;
  onResolve: (id: string, strategy: ConflictResolutionStrategy) => void;
  isResolving: boolean;
}> = ({ conflict, onResolve, isResolving }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy>(
    ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS
  );

  const handleResolve = () => {
    onResolve(conflict.id, selectedStrategy);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {getConflictTypeIcon(conflict.type)}
            冲突项目：{conflict.id}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {conflict.dataType}
          </Badge>
        </div>
        <CardDescription>
          {getConflictTypeDescription(conflict.type)} - {conflict.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 冲突详情 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 本地版本 */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm">本地版本</span>
            </div>
            <p className="text-xs text-muted-foreground">
              修改时间：{formatTimestamp(conflict.localItem.lastModified || conflict.localItem.timestamp)}
            </p>
            {conflict.localItem.version && (
              <p className="text-xs text-muted-foreground">
                版本：v{conflict.localItem.version}
              </p>
            )}
          </div>

          {/* 远程版本 */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm">远程版本</span>
            </div>
            <p className="text-xs text-muted-foreground">
              修改时间：{formatTimestamp(conflict.remoteItem.lastModified || conflict.remoteItem.timestamp)}
            </p>
            {conflict.remoteItem.version && (
              <p className="text-xs text-muted-foreground">
                版本：v{conflict.remoteItem.version}
              </p>
            )}
          </div>
        </div>

        {/* 解决策略选择 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">解决策略：</label>
          <Select value={selectedStrategy} onValueChange={(value: ConflictResolutionStrategy) => setSelectedStrategy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ConflictResolutionStrategy.LOCAL_WINS}>
                <div className="flex items-center gap-2">
                  {getStrategyIcon(ConflictResolutionStrategy.LOCAL_WINS)}
                  {getStrategyDescription(ConflictResolutionStrategy.LOCAL_WINS)}
                </div>
              </SelectItem>
              <SelectItem value={ConflictResolutionStrategy.REMOTE_WINS}>
                <div className="flex items-center gap-2">
                  {getStrategyIcon(ConflictResolutionStrategy.REMOTE_WINS)}
                  {getStrategyDescription(ConflictResolutionStrategy.REMOTE_WINS)}
                </div>
              </SelectItem>
              <SelectItem value={ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS}>
                <div className="flex items-center gap-2">
                  {getStrategyIcon(ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS)}
                  {getStrategyDescription(ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS)}
                </div>
              </SelectItem>
              <SelectItem value={ConflictResolutionStrategy.MERGE}>
                <div className="flex items-center gap-2">
                  {getStrategyIcon(ConflictResolutionStrategy.MERGE)}
                  {getStrategyDescription(ConflictResolutionStrategy.MERGE)}
                </div>
              </SelectItem>
              <SelectItem value={ConflictResolutionStrategy.CREATE_COPY}>
                <div className="flex items-center gap-2">
                  {getStrategyIcon(ConflictResolutionStrategy.CREATE_COPY)}
                  {getStrategyDescription(ConflictResolutionStrategy.CREATE_COPY)}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            onClick={handleResolve}
            disabled={isResolving}
            className="ml-auto"
          >
            {isResolving ? '解决中...' : '解决冲突'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 数据同步冲突解决器组件
 */
export const DataSyncConflictResolver: React.FC<DataSyncConflictResolverProps> = ({
  open = false,
  onClose,
  className = ''
}) => {
  const {
    pendingConflicts,
    isResolving,
    resolvedCount,
    conflictStats,
    resolveConflict,
    resolveAllConflicts,
    batchResolveConflicts,
    hasConflicts,
    detectionError,
    resolutionError
  } = useDataSyncConflictResolver({ showNotifications: true });

  const [batchStrategy, setBatchStrategy] = useState<ConflictResolutionStrategy>(
    ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS
  );

  const handleBatchResolve = async () => {
    const conflictIds = pendingConflicts.map(c => c.id);
    await batchResolveConflicts(conflictIds, batchStrategy);
  };

  const handleResolveAll = async () => {
    await resolveAllConflicts();
  };

  if (!open && !hasConflicts) {
    return null;
  }

  return (
    <Dialog open={open || hasConflicts} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[80vh] overflow-y-auto ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            数据同步冲突解决器
          </DialogTitle>
          <DialogDescription>
            检测到 {conflictStats.total} 个数据同步冲突需要处理
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-500">{conflictStats.total}</div>
                <p className="text-xs text-muted-foreground">待处理冲突</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">{resolvedCount}</div>
                <p className="text-xs text-muted-foreground">已解决冲突</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-500">{conflictStats.needsManualReview}</div>
                <p className="text-xs text-muted-foreground">需要手动处理</p>
              </CardContent>
            </Card>
          </div>

          {/* 批量操作 */}
          {hasConflicts && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">批量操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Select value={batchStrategy} onValueChange={(value: ConflictResolutionStrategy) => setBatchStrategy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ConflictResolutionStrategy.LOCAL_WINS}>
                        {getStrategyDescription(ConflictResolutionStrategy.LOCAL_WINS)}
                      </SelectItem>
                      <SelectItem value={ConflictResolutionStrategy.REMOTE_WINS}>
                        {getStrategyDescription(ConflictResolutionStrategy.REMOTE_WINS)}
                      </SelectItem>
                      <SelectItem value={ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS}>
                        {getStrategyDescription(ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS)}
                      </SelectItem>
                      <SelectItem value={ConflictResolutionStrategy.MERGE}>
                        {getStrategyDescription(ConflictResolutionStrategy.MERGE)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    onClick={handleBatchResolve}
                    disabled={isResolving}
                  >
                    批量解决全部
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResolveAll}
                    disabled={isResolving}
                  >
                    自动解决全部
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 错误信息 */}
          {(detectionError || resolutionError) && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">错误信息</span>
                </div>
                {detectionError && (
                  <p className="text-sm text-red-600 mt-1">检测错误：{detectionError}</p>
                )}
                {resolutionError && (
                  <p className="text-sm text-red-600 mt-1">解决错误：{resolutionError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 冲突列表 */}
          {hasConflicts ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingConflicts.map(conflict => (
                <ConflictItem
                  key={conflict.id}
                  conflict={conflict}
                  onResolve={resolveConflict}
                  isResolving={isResolving}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">没有冲突</h3>
                <p className="text-muted-foreground">所有数据都已同步，没有检测到冲突。</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataSyncConflictResolver;