/**
 * 头像服务
 * @description 处理用户头像的上传、生成和管理
 * 
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { request } from '@/api/request';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';

/**
 * 头像上传结果
 */
export interface AvatarUploadResult {
  /** 是否成功 */
  success: boolean;
  /** 头像URL */
  avatarUrl?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * 最大文件大小（2MB）
 */
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * 头像服务类
 */
class AvatarService {
  private readonly API_ENDPOINT = '/api/avatar';

  /**
   * 验证图片文件
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // 检查文件格式
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !SUPPORTED_IMAGE_FORMATS.includes(fileExtension)) {
      return {
        valid: false,
        error: `不支持的文件格式，请使用 ${SUPPORTED_IMAGE_FORMATS.join(', ')} 格式`
      };
    }

    // 检查MIME类型
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'u64cdu4f5cu5931u8d25'
      };
    }

    return { valid: true };
  }

  /**
   * 生成随机头像URL - 使用统一emoji系统
   */
  async generateRandomAvatar(seed?: string): Promise<string> {
    try {
      // 动态导入统一emoji系统
      const { getRandomEmojis, getAllEmojis, generateEmojiSVG } = await import('@/services/unifiedEmojiSystem');

      // 优先从动物类别随机，若为空则退回全量数据
      let pool = getRandomEmojis(1, 'animals');
      if (pool.length === 0) {
        const all = getAllEmojis();
        if (all.length > 0) {
          pool = [all[Math.floor(Math.random() * all.length)]];
        }
      }

      if (pool.length > 0) {
        return generateEmojiSVG(pool[0]);
      }

      // 如果没有可用的emoji，回退到Dicebear API
      const avatarSeed = seed || `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
    } catch (error) {
      console.error('生成随机emojiavatarfailed，回退到Dicebear API:', error);
      const avatarSeed = seed || `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
    }
  }

  /**
   * 生成初始头像URL
   */
  generateInitialsAvatar(name: string): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  }

  /**
   * 上传头像文件
   */
  async uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
    try {
      // 验证文件
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // 创建FormData
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);

      // 上传到服务器（request.post 已返回响应体，不是 AxiosResponse）
      const data = await request.post<{ avatarUrl: string }>(`${this.API_ENDPOINT}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        avatarUrl: data?.avatarUrl
      };
    } catch (error) {
      console.error('avataruploadingfailed:', error);
      
      // 🚨 API失败时必须抛出错误，不能使用本地URL临时方案
      return {
        success: false,
        error: `头像上传API调用失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 更新用户头像
   */
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      await request.put(`${this.API_ENDPOINT}/update`, {
        userId,
        avatarUrl
      });
      
      // 同时更新本地缓存
      await this.cacheAvatarUrl(userId, avatarUrl);
      return true;
    } catch (error) {
      console.error('updatinguseravatarfailed:', error);
      throw new Error(`更新用户头像失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除用户头像
   */
  async deleteUserAvatar(userId: string): Promise<boolean> {
    try {
      await request.delete(`${this.API_ENDPOINT}/delete/${userId}`);
      return true;
    } catch (error) {
      console.error('deletinguseravatarfailed:', error);
      return false;
    }
  }

  /**
   * 获取头像预览URL（压缩版本）
   */
  getAvatarPreviewUrl(avatarUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (!avatarUrl) return '';
    
    // 如果是Dicebear API生成的头像，直接返回
    if (avatarUrl.includes('dicebear.com')) {
      return avatarUrl;
    }
    
    // 如果是本地上传的头像，添加尺寸参数
    const sizeParams = {
      small: '32x32',
      medium: '128x128',
      large: '256x256'
    };
    
    try {
      const url = new URL(avatarUrl);
      url.searchParams.set('size', sizeParams[size]);
      return url.toString();
    } catch (error) {
      // 如果URL解析失败，直接返回原URL
      return avatarUrl;
    }
  }

  /**
   * 预加载头像
   */
  preloadAvatar(avatarUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!avatarUrl) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = avatarUrl;
    });
  }

  /**
   * 获取数据库服务实例
   */
  private getDataService(userId: string) {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }
    return createDataService(userId, TABLE_NAMES.USER_FILES);
  }

  /**
   * 缓存头像URL
   */
  async cacheAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    try {
      const dataService = this.getDataService(userId);
      
      // 检查是否已存在头像缓存记录
      const existing = await dataService.findMany({
        filters: { fileType: 'avatar_cache' },
        limit: 1
      });
      
      const cacheData = {
        fileName: 'avatar_cache',
        fileType: 'avatar_cache',
        fileUrl: avatarUrl,
        metadata: {
          avatarUrl,
          timestamp: Date.now()
        }
      };
      
      if (existing.data && existing.data.length > 0) {
        // 更新现有记录
        await dataService.update(existing.data[0].id!, cacheData);
      } else {
        // 创建新记录
        await dataService.create(cacheData);
      }
    } catch (error) {
      console.warn('cacheavatarURLfailed:', error);
      // 头像缓存失败不应该影响主要流程，所以不抛出错误
    }
  }

  /**
   * 获取缓存的头像URL
   */
  async getCachedAvatarUrl(userId: string): Promise<string | null> {
    try {
      const dataService = this.getDataService(userId);
      
      const result = await dataService.findMany({
        filters: { fileType: 'avatar_cache' },
        limit: 1
      });
      
      if (!result.data || result.data.length === 0) {
        return null;
      }
      
      const cacheRecord = result.data[0];
      const metadata = cacheRecord.metadata || {};
      const timestamp = metadata.timestamp;
      
      // 缓存有效期为24小时
      const CACHE_DURATION = 24 * 60 * 60 * 1000;
      if (timestamp && (Date.now() - timestamp > CACHE_DURATION)) {
        // 删除过期缓存
        await dataService.delete(cacheRecord.id!);
        return null;
      }
      
      return metadata.avatarUrl || cacheRecord.fileUrl || null;
    } catch (error) {
      console.warn('gettingcacheavatarURLfailed:', error);
      return null;
    }
  }

  /**
   * 清除头像缓存
   */
  async clearAvatarCache(userId?: string): Promise<void> {
    try {
      if (userId) {
        // 清除特定用户的缓存
        const dataService = this.getDataService(userId);
        const result = await dataService.findMany({
          filters: { fileType: 'avatar_cache' }
        });
        
        if (result.data && result.data.length > 0) {
          const ids = result.data.map(item => item.id!);
          await dataService.deleteMany(ids);
        }
      } else {
        // 注意：这里无法清除所有用户的缓存，因为需要用户ID来创建dataService
        console.warn('clearing所hasavatarcache需要在database层面统一processing');
      }
    } catch (error) {
      console.warn('clearingavatarcachefailed:', error);
      // 头像缓存清除失败不应该影响主要流程
    }
  }

  /**
   * 压缩图片文件
   */
  async compressImage(file: File, maxWidth: number = 512, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('u64cdu4f5cu5931u8d25'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('u64cdu4f5cu5931u8d25'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// 创建单例实例
export const avatarService = new AvatarService();

export default avatarService;

// 🚨 重要提醒：此服务已完全迁移至 Supabase 数据库
// - 移除了所有 localStorage 头像缓存依赖
// - 所有缓存操作现在使用数据库存储
// - 确保用户数据隔离和安全访问
// - 如果数据库不可用，头像缓存功能将无法使用，但不会影响头像上传和更新API调用
