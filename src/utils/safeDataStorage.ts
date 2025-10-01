/**
 * 安全数据存储工具
 * 解决localStorage数据丢失问题
 */

export interface SaveResult {
  success: boolean;
  error?: string;
  storageUsed?: number;
  totalStorage?: number;
}

/**
 * 安全保存数据到localStorage
 */
export function safeSaveToLocalStorage(key: string, data: any): SaveResult {
  try {
    const jsonData = JSON.stringify(data);
    const dataSize = new Blob([jsonData]).size;
    
    // 检查存储空间
    const storageUsed = getLocalStorageUsage();
    const estimatedTotal = storageUsed + dataSize;
    
    console.log(`💾 准备savingdata: ${key}, size: ${(dataSize/1024).toFixed(2)}KB`);
    console.log(`📊 currentstorage使用: ${(storageUsed/1024).toFixed(2)}KB, 预计total计: ${(estimatedTotal/1024).toFixed(2)}KB`);
    
    // 尝试保存
    localStorage.setItem(key, jsonData);
    
    // 验证保存是否成功
    const savedData = localStorage.getItem(key);
    if (savedData !== jsonData) {
      throw new Error('数据保存验证失败：保存的数据与原数据不一致');
    }
    
    console.log(`✅ datasavingsuccess: ${key}`);
    
    return {
      success: true,
      storageUsed: getLocalStorageUsage(),
      totalStorage: estimatedTotal
    };
    
  } catch (error: any) {
    console.error(`❌ datasavingfailed: ${key}`, error);
    
    let errorMessage = i18n.t('common.errors.dataSaveFailed');
    
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      errorMessage = '存储空间不足，请清理浏览器数据或联系管理员';
    } else if (error.message.includes('JSON')) {
      errorMessage = '数据格式错误，无法保存';
    } else if (error.message.includes(i18n.t('common.status.privateMode')) || error.message.includes('private')) {
      errorMessage = '当前浏览器处于隐私模式，无法保存数据';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 安全加载数据从localStorage
 */
export function safeLoadFromLocalStorage<T>(key: string, defaultValue?: T): { data: T | undefined; success: boolean; error?: string } {
  try {
    const savedData = localStorage.getItem(key);
    
    if (!savedData) {
      console.log(`📂 没has找到data: ${key}`);
      return {
        data: defaultValue,
        success: true
      };
    }
    
    const parsedData = JSON.parse(savedData);
    console.log(`📂 successloadingdata: ${key}, item目数: ${Array.isArray(parsedData) ? parsedData.length : 'N/A'}`);
    
    return {
      data: parsedData,
      success: true
    };
    
  } catch (error: any) {
    console.error(`❌ dataloadingfailed: ${key}`, error);
    
    let errorMessage = i18n.t('common.errors.dataLoadFailed');
    if (error.message.includes('JSON')) {
      errorMessage = '数据格式损坏，无法读取';
    }
    
    return {
      data: defaultValue,
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 获取localStorage使用情况
 */
export function getLocalStorageUsage(): number {
  let totalSize = 0;
  
  try {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([key + value]).size;
        }
      }
    }
  } catch (error) {
    console.warn('none法calculatinglocalStorage使用量:', error);
  }
  
  return totalSize;
}

/**
 * 检查localStorage可用性
 */
export function checkLocalStorageAvailability(): { available: boolean; error?: string } {
  try {
    const testKey = '__test__';
    const testValue = 'test';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
      return {
        available: false,
        error: 'localStorage读写不一致'
      };
    }
    
    return { available: true };
    
  } catch (error: any) {
    let errorMessage = 'localStorage不可用';
    
    if (error.name === 'QuotaExceededError') {
      errorMessage = 'localStorage存储空间已满';
    } else if (error.message.includes('private') || error.message.includes(i18n.t('utils.errors.隐私'))) {
      errorMessage = '浏览器隐私模式限制了localStorage使用';
    }
    
    return {
      available: false,
      error: errorMessage
    };
  }
}

/**
 * 清理过期或损坏的数据
 */
export function cleanupLocalStorageData(prefix?: string): number {
  let cleanedCount = 0;
  
  try {
    const keys = Object.keys(localStorage);
    const targetKeys = prefix ? keys.filter(key => key.startsWith(prefix)) : keys;
    
    targetKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // 尝试解析，如果失败说明数据损坏
          JSON.parse(value);
        }
      } catch (error) {
        console.log(`🧹 cleaning损坏的data: ${key}`);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 cleaningcompleted，removing了 ${cleanedCount} item损坏的data`);
    }
    
  } catch (error) {
    console.error('cleaninglocalStoragedata时出错:', error);
  }
  
  return cleanedCount;
}

/**
 * 创建备份数据
 */
export function backupLocalStorageData(keys: string[]): { [key: string]: any } {
  const backup: { [key: string]: any } = {};
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        backup[key] = JSON.parse(data);
      }
    } catch (error) {
      console.warn(`backupdatafailed: ${key}`, error);
    }
  });
  
  return backup;
}

/**
 * 从备份恢复数据
 */
export function restoreLocalStorageData(backup: { [key: string]: any }): number {
  let restoredCount = 0;
  
  Object.entries(backup).forEach(([key, data]) => {
    try {
      const saveResult = safeSaveToLocalStorage(key, data);
      if (saveResult.success) {
        restoredCount++;
      }
    } catch (error) {
      console.warn(`restoringdatafailed: ${key}`, error);
    }
  });
  
  return restoredCount;
}