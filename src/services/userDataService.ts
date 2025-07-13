/**
 * 用户数据服务
 * @description 处理用户数据的数据库存储和检索，支持临时用户ID与正式用户ID的关联
 */

import { User } from '@/types/user';

/**
 * 用户数据记录接口
 */
interface UserDataRecord {
  /** 用户ID（临时或正式） */
  userId: string;
  /** 是否为临时用户 */
  isTempUser: boolean;
  /** 关联的正式用户ID（如果是临时用户） */
  realUserId?: string;
  /** 用户基本信息 */
  userInfo: Partial<User>;
  /** 用户行为数据 */
  userActions: {
    /** 页面访问记录 */
    pageVisits: Array<{
      page: string;
      timestamp: string;
      duration?: number;
    }>;
    /** 功能使用记录 */
    featureUsage: Array<{
      feature: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }>;
    /** 内容创建记录 */
    contentCreated: Array<{
      type: string;
      title: string;
      timestamp: string;
      contentId: string;
    }>;
  };
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 用户数据服务类
 */
class UserDataService {
  private static instance: UserDataService;
  private dbName = 'UserDataDB';
  private version = 1;

  private constructor() {
    this.initDatabase();
  }

  /**
   * 获取服务实例（单例模式）
   */
  public static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  /**
   * 初始化数据库
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('用户数据数据库初始化失败');
        reject(new Error('用户数据数据库初始化失败'));
      };

      request.onsuccess = () => {
        console.log('用户数据数据库初始化成功');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建用户数据表
        if (!db.objectStoreNames.contains('userData')) {
          const store = db.createObjectStore('userData', { keyPath: 'userId' });
          store.createIndex('isTempUser', 'isTempUser', { unique: false });
          store.createIndex('realUserId', 'realUserId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 创建用户绑定关系表
        if (!db.objectStoreNames.contains('userBindings')) {
          const store = db.createObjectStore('userBindings', { keyPath: 'tempUserId' });
          store.createIndex('realUserId', 'realUserId', { unique: false });
          store.createIndex('boundAt', 'boundAt', { unique: false });
        }
      };
    });
  }

  /**
   * 创建或更新用户数据记录
   * @param userId 用户ID
   * @param userInfo 用户信息
   * @param isTempUser 是否为临时用户
   */
  public async createOrUpdateUserData(
    userId: string, 
    userInfo: Partial<User>, 
    isTempUser: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData'], 'readwrite');
        const store = transaction.objectStore('userData');

        // 先尝试获取现有记录
        const getRequest = store.get(userId);

        getRequest.onsuccess = () => {
          const existingRecord = getRequest.result;
          const now = new Date().toISOString();

          let userDataRecord: UserDataRecord;

          if (existingRecord) {
            // 更新现有记录
            userDataRecord = {
              ...existingRecord,
              userInfo: { ...existingRecord.userInfo, ...userInfo },
              updatedAt: now
            };
          } else {
            // 创建新记录
            userDataRecord = {
              userId,
              isTempUser,
              userInfo,
              userActions: {
                pageVisits: [],
                featureUsage: [],
                contentCreated: []
              },
              createdAt: now,
              updatedAt: now
            };
          }

          const saveRequest = store.put(userDataRecord);

          saveRequest.onsuccess = () => {
            console.log('用户数据保存成功:', userId);
            resolve();
          };

          saveRequest.onerror = () => {
            console.error('用户数据保存失败');
            reject(new Error('用户数据保存失败'));
          };
        };

        getRequest.onerror = () => {
          console.error('获取用户数据失败');
          reject(new Error('获取用户数据失败'));
        };
      };
    });
  }

  /**
   * 获取用户数据记录
   * @param userId 用户ID
   */
  public async getUserData(userId: string): Promise<UserDataRecord | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData'], 'readonly');
        const store = transaction.objectStore('userData');

        const getRequest = store.get(userId);

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
          console.error('获取用户数据失败');
          reject(new Error('获取用户数据失败'));
        };
      };
    });
  }

  /**
   * 记录用户行为
   * @param userId 用户ID
   * @param actionType 行为类型
   * @param actionData 行为数据
   */
  public async recordUserAction(
    userId: string,
    actionType: 'pageVisit' | 'featureUsage' | 'contentCreated',
    actionData: any
  ): Promise<void> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) {
        // 如果用户数据不存在，先创建基础记录
        await this.createOrUpdateUserData(userId, {}, true);
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => reject(new Error('数据库连接失败'));

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['userData'], 'readwrite');
          const store = transaction.objectStore('userData');

          const getRequest = store.get(userId);

          getRequest.onsuccess = () => {
            const userData = getRequest.result;
            if (!userData) {
              reject(new Error('用户数据不存在'));
              return;
            }

            const now = new Date().toISOString();
            const updatedUserData = {
              ...userData,
              updatedAt: now,
              userActions: {
                ...userData.userActions,
                [actionType === 'pageVisit' ? 'pageVisits' : 
                 actionType === 'featureUsage' ? 'featureUsage' : 'contentCreated']: [
                  ...userData.userActions[actionType === 'pageVisit' ? 'pageVisits' : 
                                         actionType === 'featureUsage' ? 'featureUsage' : 'contentCreated'],
                  {
                    ...actionData,
                    timestamp: now
                  }
                ]
              }
            };

            const saveRequest = store.put(updatedUserData);

            saveRequest.onsuccess = () => {
              console.log('用户行为记录成功:', actionType);
              resolve();
            };

            saveRequest.onerror = () => {
              console.error('用户行为记录失败');
              reject(new Error('用户行为记录失败'));
            };
          };

          getRequest.onerror = () => {
            console.error('获取用户数据失败');
            reject(new Error('获取用户数据失败'));
          };
        };
      });
    } catch (error) {
      console.error('记录用户行为失败:', error);
      throw error;
    }
  }

  /**
   * 绑定临时用户ID到正式用户ID
   * @param tempUserId 临时用户ID
   * @param realUserId 正式用户ID
   */
  public async bindTempUserToRealUser(tempUserId: string, realUserId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData', 'userBindings'], 'readwrite');
        const userDataStore = transaction.objectStore('userData');
        const bindingsStore = transaction.objectStore('userBindings');

        // 1. 更新用户数据记录
        const getUserDataRequest = userDataStore.get(tempUserId);

        getUserDataRequest.onsuccess = () => {
          const tempUserData = getUserDataRequest.result;
          if (tempUserData) {
            // 更新临时用户数据，标记为已绑定
            const updatedTempUserData = {
              ...tempUserData,
              realUserId,
              updatedAt: new Date().toISOString()
            };

            const updateTempUserRequest = userDataStore.put(updatedTempUserData);
            updateTempUserRequest.onerror = () => {
              console.error('更新临时用户数据失败');
              reject(new Error('更新临时用户数据失败'));
            };
          }

          // 2. 创建绑定关系记录
          const bindingRecord = {
            tempUserId,
            realUserId,
            boundAt: new Date().toISOString()
          };

          const saveBindingRequest = bindingsStore.put(bindingRecord);

          saveBindingRequest.onsuccess = () => {
            console.log('临时用户绑定成功:', { tempUserId, realUserId });
            resolve();
          };

          saveBindingRequest.onerror = () => {
            console.error('保存绑定关系失败');
            reject(new Error('保存绑定关系失败'));
          };
        };

        getUserDataRequest.onerror = () => {
          console.error('获取临时用户数据失败');
          reject(new Error('获取临时用户数据失败'));
        };
      };
    });
  }

  /**
   * 获取临时用户的所有数据记录
   * @param tempUserId 临时用户ID
   */
  public async getTempUserData(tempUserId: string): Promise<UserDataRecord[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData'], 'readonly');
        const store = transaction.objectStore('userData');

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const allRecords = getAllRequest.result || [];
          const tempUserRecords = allRecords.filter(record => 
            record.userId === tempUserId || record.realUserId === tempUserId
          );
          resolve(tempUserRecords);
        };

        getAllRequest.onerror = () => {
          console.error('获取用户数据失败');
          reject(new Error('获取用户数据失败'));
        };
      };
    });
  }

  /**
   * 获取正式用户的所有关联数据（包括临时用户期间的数据）
   * @param realUserId 正式用户ID
   */
  public async getRealUserData(realUserId: string): Promise<UserDataRecord[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData', 'userBindings'], 'readonly');
        const userDataStore = transaction.objectStore('userData');
        const bindingsStore = transaction.objectStore('userBindings');

        // 1. 获取正式用户数据
        const getRealUserRequest = userDataStore.get(realUserId);
        
        // 2. 获取所有绑定到该正式用户的临时用户ID
        const getBindingsRequest = bindingsStore.index('realUserId').getAll(realUserId);

        Promise.all([
          new Promise<UserDataRecord | null>((resolve) => {
            getRealUserRequest.onsuccess = () => resolve(getRealUserRequest.result || null);
            getRealUserRequest.onerror = () => resolve(null);
          }),
          new Promise<any[]>((resolve) => {
            getBindingsRequest.onsuccess = () => resolve(getBindingsRequest.result || []);
            getBindingsRequest.onerror = () => resolve([]);
          })
        ]).then(([realUserData, bindings]) => {
          const allUserData: UserDataRecord[] = [];
          
          // 添加正式用户数据
          if (realUserData) {
            allUserData.push(realUserData);
          }

          // 添加所有绑定的临时用户数据
          const tempUserIds = bindings.map(binding => binding.tempUserId);
          const getAllTempUserData = userDataStore.getAll();
          
          getAllTempUserData.onsuccess = () => {
            const allRecords = getAllTempUserData.result || [];
            const tempUserRecords = allRecords.filter(record => 
              tempUserIds.includes(record.userId)
            );
            
            allUserData.push(...tempUserRecords);
            resolve(allUserData);
          };

          getAllTempUserData.onerror = () => {
            console.error('获取临时用户数据失败');
            resolve(allUserData); // 返回已有的数据
          };
        });
      };
    });
  }

  /**
   * 删除用户数据（谨慎使用）
   * @param userId 用户ID
   */
  public async deleteUserData(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(new Error('数据库连接失败'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['userData'], 'readwrite');
        const store = transaction.objectStore('userData');

        const deleteRequest = store.delete(userId);

        deleteRequest.onsuccess = () => {
          console.log('用户数据删除成功:', userId);
          resolve();
        };

        deleteRequest.onerror = () => {
          console.error('用户数据删除失败');
          reject(new Error('用户数据删除失败'));
        };
      };
    });
  }
}

export default UserDataService; 