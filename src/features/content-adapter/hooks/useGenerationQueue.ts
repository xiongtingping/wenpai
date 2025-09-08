/**
 * 生成队列管理Hook
 * 处理批量生成、重试队列、自动化流程等
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// 队列任务类型
export interface QueueTask {
  id: string;
  type: 'generate' | 'retry' | 'regenerate' | 'comparison' | 'title';
  platformId: string;
  request: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

// 自动化进度
export interface AutomationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
}

// Hook状态
export interface GenerationQueueState {
  queue: QueueTask[];
  running: boolean;
  currentTask?: QueueTask;
  automationProgress?: AutomationProgress;
  concurrency: number;
  retryDelay: number;
}

// Hook参数
export interface UseGenerationQueueParams {
  maxConcurrency?: number;
  defaultRetryDelay?: number;
  maxRetryAttempts?: number;
  onTaskComplete?: (task: QueueTask, result: any) => void;
  onTaskFailed?: (task: QueueTask, error: Error) => void;
  onQueueComplete?: () => void;
}

// Hook返回值
export interface UseGenerationQueueReturn extends GenerationQueueState {
  // 队列管理
  addTask: (task: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'attempts'>) => string;
  removeTask: (taskId: string) => void;
  clearQueue: () => void;
  startQueue: () => void;
  stopQueue: () => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  
  // 批量操作
  addBatchTasks: (tasks: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'attempts'>[]) => string[];
  retryFailedTasks: () => void;
  cancelAllTasks: () => void;
  
  // 自动化
  startAutomation: (platforms: string[], request: any) => void;
  stopAutomation: () => void;
  
  // 统计
  getQueueStats: () => {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
}

/**
 * 生成队列管理Hook
 */
export function useGenerationQueue(params: UseGenerationQueueParams = {}): UseGenerationQueueReturn {
  const {
    maxConcurrency = 3,
    defaultRetryDelay = 2000,
    maxRetryAttempts = 3,
    onTaskComplete,
    onTaskFailed,
    onQueueComplete
  } = params;

  const { toast } = useToast();
  
  // 状态
  const [queue, setQueue] = useState<QueueTask[]>([]);
  const [running, setRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<QueueTask>();
  const [automationProgress, setAutomationProgress] = useState<AutomationProgress>();
  const [concurrency] = useState(maxConcurrency);
  const [retryDelay] = useState(defaultRetryDelay);
  
  // 运行中的任务计数
  const runningTasksRef = useRef<Set<string>>(new Set());
  const queueIntervalRef = useRef<NodeJS.Timeout>();
  const pausedRef = useRef(false);

  // 生成唯一任务ID
  const generateTaskId = useCallback(() => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 添加任务
  const addTask = useCallback((taskData: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'attempts'>) => {
    const taskId = generateTaskId();
    const task: QueueTask = {
      ...taskData,
      id: taskId,
      createdAt: Date.now(),
      status: 'pending',
      attempts: 0,
      maxAttempts: taskData.maxAttempts || maxRetryAttempts
    };

    setQueue(prev => [...prev, task].sort((a, b) => b.priority - a.priority));
    return taskId;
  }, [generateTaskId, maxRetryAttempts]);

  // 批量添加任务
  const addBatchTasks = useCallback((tasksData: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'attempts'>[]) => {
    const tasks = tasksData.map(taskData => {
      const taskId = generateTaskId();
      return {
        ...taskData,
        id: taskId,
        createdAt: Date.now(),
        status: 'pending' as const,
        attempts: 0,
        maxAttempts: taskData.maxAttempts || maxRetryAttempts
      };
    });

    setQueue(prev => [...prev, ...tasks].sort((a, b) => b.priority - a.priority));
    return tasks.map(task => task.id);
  }, [generateTaskId, maxRetryAttempts]);

  // 移除任务
  const removeTask = useCallback((taskId: string) => {
    setQueue(prev => prev.filter(task => task.id !== taskId));
    runningTasksRef.current.delete(taskId);
  }, []);

  // 清空队列
  const clearQueue = useCallback(() => {
    setQueue([]);
    runningTasksRef.current.clear();
    setCurrentTask(undefined);
  }, []);

  // 执行单个任务
  const executeTask = useCallback(async (task: QueueTask) => {
    try {
      // 更新任务状态
      setQueue(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: 'running', startedAt: Date.now() }
          : t
      ));
      
      setCurrentTask(task);
      runningTasksRef.current.add(task.id);

      // 模拟任务执行（实际应该调用相应的生成函数）
      let result;
      switch (task.type) {
        case 'generate':
          // 调用生成内容的实际函数
          result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 2000));
          break;
        case 'retry':
          result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
          break;
        case 'regenerate':
          result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 1800));
          break;
        case 'comparison':
          result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 2200));
          break;
        case 'title':
          result = await new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
          break;
        default:
          throw new Error(`未知任务类型: ${task.type}`);
      }

      // 任务成功完成
      setQueue(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: 'completed', completedAt: Date.now() }
          : t
      ));

      onTaskComplete?.(task, result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '任务执行失败';
      
      // 更新任务失败状态
      setQueue(prev => prev.map(t => {
        if (t.id === task.id) {
          const newAttempts = t.attempts + 1;
          
          if (newAttempts < t.maxAttempts) {
            // 还可以重试
            return {
              ...t,
              status: 'pending',
              attempts: newAttempts,
              error: errorMessage
            };
          } else {
            // 达到最大重试次数，标记为失败
            return {
              ...t,
              status: 'failed',
              attempts: newAttempts,
              error: errorMessage,
              completedAt: Date.now()
            };
          }
        }
        return t;
      }));

      onTaskFailed?.(task, error instanceof Error ? error : new Error(errorMessage));
      
    } finally {
      runningTasksRef.current.delete(task.id);
      setCurrentTask(undefined);
    }
  }, [onTaskComplete, onTaskFailed]);

  // 队列处理器
  const processQueue = useCallback(async () => {
    if (pausedRef.current || !running) return;

    const pendingTasks = queue.filter(task => task.status === 'pending');
    const runningCount = runningTasksRef.current.size;

    if (pendingTasks.length === 0) {
      // 队列为空，检查是否所有任务都完成
      if (runningCount === 0 && queue.length > 0) {
        const allCompleted = queue.every(task => 
          task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled'
        );
        
        if (allCompleted) {
          setRunning(false);
          onQueueComplete?.();
          
          toast({
            title: "队列处理完成",
            description: `共处理 ${queue.length} 个任务`,
          });
        }
      }
      return;
    }

    // 启动新任务（在并发限制内）
    const availableSlots = Math.max(0, concurrency - runningCount);
    const tasksToStart = pendingTasks.slice(0, availableSlots);

    for (const task of tasksToStart) {
      executeTask(task);
    }
  }, [queue, running, concurrency, executeTask, onQueueComplete, toast]);

  // 启动队列处理
  useEffect(() => {
    if (running && !queueIntervalRef.current) {
      queueIntervalRef.current = setInterval(processQueue, 500);
    } else if (!running && queueIntervalRef.current) {
      clearInterval(queueIntervalRef.current);
      queueIntervalRef.current = undefined;
    }

    return () => {
      if (queueIntervalRef.current) {
        clearInterval(queueIntervalRef.current);
        queueIntervalRef.current = undefined;
      }
    };
  }, [running, processQueue]);

  // 启动队列
  const startQueue = useCallback(() => {
    setRunning(true);
    pausedRef.current = false;
  }, []);

  // 停止队列
  const stopQueue = useCallback(() => {
    setRunning(false);
    pausedRef.current = false;
    
    // 取消所有待处理的任务
    setQueue(prev => prev.map(task => 
      task.status === 'pending' 
        ? { ...task, status: 'cancelled' }
        : task
    ));
  }, []);

  // 暂停队列
  const pauseQueue = useCallback(() => {
    pausedRef.current = true;
  }, []);

  // 恢复队列
  const resumeQueue = useCallback(() => {
    pausedRef.current = false;
  }, []);

  // 重试失败的任务
  const retryFailedTasks = useCallback(() => {
    setQueue(prev => prev.map(task => 
      task.status === 'failed' 
        ? { ...task, status: 'pending', attempts: 0, error: undefined }
        : task
    ));
  }, []);

  // 取消所有任务
  const cancelAllTasks = useCallback(() => {
    setQueue(prev => prev.map(task => 
      task.status === 'pending' || task.status === 'running'
        ? { ...task, status: 'cancelled' }
        : task
    ));
  }, []);

  // 启动自动化流程
  const startAutomation = useCallback((platforms: string[], request: any) => {
    const tasks = platforms.map((platformId, index) => ({
      type: 'generate' as const,
      platformId,
      request,
      priority: 100 - index, // 按顺序优先级
      maxAttempts: 2
    }));

    const taskIds = addBatchTasks(tasks);
    
    setAutomationProgress({
      total: platforms.length,
      completed: 0,
      failed: 0,
      status: 'running'
    });

    startQueue();

    toast({
      title: "自动化流程已启动",
      description: `将为 ${platforms.length} 个平台生成内容`,
    });

    return taskIds;
  }, [addBatchTasks, startQueue, toast]);

  // 停止自动化
  const stopAutomation = useCallback(() => {
    stopQueue();
    setAutomationProgress(prev => prev ? { ...prev, status: 'cancelled' } : undefined);
  }, [stopQueue]);

  // 获取队列统计
  const getQueueStats = useCallback(() => {
    const stats = queue.reduce((acc, task) => {
      acc.total++;
      acc[task.status]++;
      return acc;
    }, {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0
    });

    return stats;
  }, [queue]);

  // 更新自动化进度
  useEffect(() => {
    if (automationProgress && automationProgress.status === 'running') {
      const stats = getQueueStats();
      const completed = stats.completed;
      const failed = stats.failed;
      
      if (completed + failed >= automationProgress.total) {
        setAutomationProgress(prev => prev ? {
          ...prev,
          completed,
          failed,
          status: failed > 0 ? 'failed' : 'completed'
        } : undefined);
      } else {
        setAutomationProgress(prev => prev ? {
          ...prev,
          completed,
          failed,
          current: currentTask?.platformId
        } : undefined);
      }
    }
  }, [queue, currentTask, automationProgress, getQueueStats]);

  return {
    // 状态
    queue,
    running,
    currentTask,
    automationProgress,
    concurrency,
    retryDelay,
    
    // 队列管理
    addTask,
    removeTask,
    clearQueue,
    startQueue,
    stopQueue,
    pauseQueue,
    resumeQueue,
    
    // 批量操作
    addBatchTasks,
    retryFailedTasks,
    cancelAllTasks,
    
    // 自动化
    startAutomation,
    stopAutomation,
    
    // 统计
    getQueueStats
  };
}
