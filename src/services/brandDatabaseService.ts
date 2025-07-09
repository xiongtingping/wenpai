import { BrandProfile } from '@/types/brand';

/**
 * 品牌数据库服务
 * @description 处理品牌档案的数据库存储和检索
 */
class BrandDatabaseService {
  private static instance: BrandDatabaseService;
  private dbName = 'BrandLibraryDB';
  private version = 1;

  private constructor() {
    this.initDatabase();
  }

  /**
   * 获取服务实例（单例模式）
   */
  public static getInstance(): BrandDatabaseService {
    if (!BrandDatabaseService.instance) {
      BrandDatabaseService.instance = new BrandDatabaseService();
    }
    return BrandDatabaseService.instance;
  }

  /**
   * 初始化数据库
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('数据库初始化失败');
        reject(new Error('数据库初始化失败'));
      };

      request.onsuccess = () => {
        console.log('数据库初始化成功');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建品牌档案表
        if (!db.objectStoreNames.contains('brandProfiles')) {
          const store = db.createObjectStore('brandProfiles', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 创建品牌资料表
        if (!db.objectStoreNames.contains('brandAssets')) {
          const store = db.createObjectStore('brandAssets', { keyPath: 'id' });
          store.createIndex('profileId', 'profileId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  /**
   * 保存品牌档案
   * @param profile 品牌档案
   */
  public async saveBrandProfile(profile: BrandProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['brandProfiles'], 'readwrite');
        const store = transaction.objectStore('brandProfiles');

        const saveRequest = store.put(profile);

        saveRequest.onsuccess = () => {
          console.log('品牌档案保存成功:', profile.id);
          resolve();
        };

        saveRequest.onerror = () => {
          console.error('品牌档案保存失败');
          reject(new Error('品牌档案保存失败'));
        };
      };
    });
  }

  /**
   * 获取品牌档案
   * @param id 档案ID
   */
  public async getBrandProfile(id: string): Promise<BrandProfile | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['brandProfiles'], 'readonly');
        const store = transaction.objectStore('brandProfiles');

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
          console.error('获取品牌档案失败');
          reject(new Error('获取品牌档案失败'));
        };
      };
    });
  }

  /**
   * 获取所有品牌档案
   */
  public async getAllBrandProfiles(): Promise<BrandProfile[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['brandProfiles'], 'readonly');
        const store = transaction.objectStore('brandProfiles');

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = () => {
          console.error('获取所有品牌档案失败');
          reject(new Error('获取所有品牌档案失败'));
        };
      };
    });
  }

  /**
   * 删除品牌档案
   * @param id 档案ID
   */
  public async deleteBrandProfile(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['brandProfiles'], 'readwrite');
        const store = transaction.objectStore('brandProfiles');

        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
          console.log('品牌档案删除成功:', id);
          resolve();
        };

        deleteRequest.onerror = () => {
          console.error('品牌档案删除失败');
          reject(new Error('品牌档案删除失败'));
        };
      };
    });
  }

  /**
   * 搜索品牌档案
   * @param query 搜索关键词
   */
  public async searchBrandProfiles(query: string): Promise<BrandProfile[]> {
    const allProfiles = await this.getAllBrandProfiles();
    const lowerQuery = query.toLowerCase();

    return allProfiles.filter(profile => 
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.description?.toLowerCase().includes(lowerQuery) ||
      profile.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
      profile.slogans.some(slogan => slogan.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取最新的品牌档案
   */
  public async getLatestBrandProfile(): Promise<BrandProfile | null> {
    const allProfiles = await this.getAllBrandProfiles();
    
    if (allProfiles.length === 0) {
      return null;
    }

    // 按更新时间排序，返回最新的
    return allProfiles.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }
}

export default BrandDatabaseService; 