/**
 * 头像服务
 * @description 处理用户头像的上传、生成和管理
 */

import { request } from '@/api/request';

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
        error: '请选择有效的图片文件'
      };
    }

    return { valid: true };
  }

  /**
   * 生成随机头像URL
   */
  generateRandomAvatar(seed?: string): string {
    const avatarSeed = seed || `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
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

      // 上传到服务器
      const response = await request.post(`${this.API_ENDPOINT}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        avatarUrl: response.data.avatarUrl
      };
    } catch (error) {
      console.error('头像上传失败:', error);
      
      // 如果服务器上传失败，使用本地URL作为临时方案
      try {
        const localUrl = URL.createObjectURL(file);
        return {
          success: true,
          avatarUrl: localUrl
        };
      } catch (localError) {
        return {
          success: false,
          error: '头像上传失败，请稍后重试'
        };
      }
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
      return true;
    } catch (error) {
      console.error('更新用户头像失败:', error);
      return false;
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
      console.error('删除用户头像失败:', error);
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
   * 获取头像缓存键
   */
  private getAvatarCacheKey(userId: string): string {
    return `avatar_cache_${userId}`;
  }

  /**
   * 缓存头像URL
   */
  cacheAvatarUrl(userId: string, avatarUrl: string): void {
    try {
      const cacheData = {
        avatarUrl,
        timestamp: Date.now()
      };
      localStorage.setItem(this.getAvatarCacheKey(userId), JSON.stringify(cacheData));
    } catch (error) {
      console.warn('缓存头像URL失败:', error);
    }
  }

  /**
   * 获取缓存的头像URL
   */
  getCachedAvatarUrl(userId: string): string | null {
    try {
      const cacheKey = this.getAvatarCacheKey(userId);
      const cacheData = localStorage.getItem(cacheKey);
      
      if (!cacheData) return null;
      
      const { avatarUrl, timestamp } = JSON.parse(cacheData);
      
      // 缓存有效期为24小时
      const CACHE_DURATION = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return avatarUrl;
    } catch (error) {
      console.warn('获取缓存头像URL失败:', error);
      return null;
    }
  }

  /**
   * 清除头像缓存
   */
  clearAvatarCache(userId?: string): void {
    try {
      if (userId) {
        // 清除特定用户的缓存
        localStorage.removeItem(this.getAvatarCacheKey(userId));
      } else {
        // 清除所有头像缓存
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('avatar_cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('清除头像缓存失败:', error);
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
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// 创建单例实例
export const avatarService = new AvatarService();

export default avatarService;
