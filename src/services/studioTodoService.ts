import { getGlobalDataManager } from '@/services/unifiedDataManager';

// 强类型定义：创意工作室 待办事项
export interface StudioTodo {
  id: string;
  title: string;
  content?: string;
  done: boolean;
  tags?: string[];
  dueDate?: string;      // ISO string
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;     // ISO string
  updatedAt: string;     // ISO string
  metadata?: Record<string, unknown>;
}

export class StudioTodoService {
  private static readonly KEY = 'studio_todos';

  // 获取全部待办（支持强制刷新云端）
  static async getAll(forceRefresh: boolean = false): Promise<StudioTodo[]> {
    const items = await getGlobalDataManager().getData<StudioTodo[]>(this.KEY, forceRefresh);
    return Array.isArray(items) ? items : [];
  }

  // 设置全量（写入云端 + 本地缓存）
  private static async setAll(items: StudioTodo[]): Promise<void> {
    await getGlobalDataManager().setData<StudioTodo[]>(this.KEY, items);
  }

  // 新建待办
  static async create(partial: Omit<StudioTodo, 'id' | 'createdAt' | 'updatedAt' | 'done'> & { done?: boolean }): Promise<StudioTodo> {
    const now = new Date().toISOString();
    const id = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ?
      (globalThis.crypto as Crypto).randomUUID() :
      `todo_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    const newItem: StudioTodo = {
      id,
      title: partial.title,
      content: partial.content,
      done: partial.done ?? false,
      tags: partial.tags || [],
      dueDate: partial.dueDate,
      priority: partial.priority,
      createdAt: now,
      updatedAt: now,
      metadata: partial.metadata || {}
    };

    const list = await this.getAll();
    list.unshift(newItem);
    await this.setAll(list);
    return newItem;
  }

  // 更新待办
  static async update(id: string, updates: Partial<Omit<StudioTodo, 'id' | 'createdAt'>>): Promise<StudioTodo | null> {
    const list = await this.getAll();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const next: StudioTodo = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const nextList = [...list];
    nextList[idx] = next;
    await this.setAll(nextList);
    return next;
  }

  // 切换完成状态
  static async toggleDone(id: string): Promise<StudioTodo | null> {
    const list = await this.getAll();
    const item = list.find(i => i.id === id);
    if (!item) return null;
    return this.update(id, { done: !item.done });
  }

  // 删除待办
  static async remove(id: string): Promise<boolean> {
    const list = await this.getAll();
    const next = list.filter(i => i.id !== id);
    if (next.length === list.length) return false;
    await this.setAll(next);
    return true;
  }

  // 批量清理已完成
  static async clearCompleted(): Promise<void> {
    const list = await this.getAll();
    const next = list.filter(i => !i.done);
    await this.setAll(next);
  }
}

