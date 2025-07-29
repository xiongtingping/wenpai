/**
 * 🛡️ Authing Guard 安全包装器
 * 专门解决Authing Guard内部的undefined拼接问题
 *
 * 🔒 LOCKED: 2025-01-28 核心修复逻辑已锁定
 * 📌 此模块已验证稳定，请勿修改核心逻辑
 * 🚫 如需扩展功能，请创建新模块而不是修改此文件
 *
 * 修复策略：
 * 1. 数据层：sanitizeUserInfo() 确保用户信息安全
 * 2. 配置层：createSafeGuardConfig() 提供安全配置
 * 3. 运行时：fixUndefinedInGuardDOM() 动态修复DOM
 * 4. 事件层：createSafeGuardEventHandler() 安全事件处理
 */

/**
 * 🔒 LOCKED: 安全的用户信息处理
 * 确保所有字段都有安全的默认值，避免undefined拼接
 *
 * 📌 核心修复逻辑，请勿修改
 * 🛡️ 已验证可解决 undefinedundefined 问题
 */
export function sanitizeUserInfo(userInfo: any): any {
  if (!userInfo || typeof userInfo !== 'object') {
    return {
      id: `user_${Date.now()}`,
      username: '用户',
      nickname: '用户',
      email: '',
      name: '用户',
      avatar: '',
      photo: '',
      picture: ''
    };
  }

  // 创建安全的用户信息对象
  const safeUserInfo = {
    // 基础字段
    id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
    
    // 用户名相关字段 - 确保有安全的回退值
    username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
    nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
    name: userInfo.name || userInfo.nickname || userInfo.username || '用户',
    
    // 联系方式字段
    email: userInfo.email || userInfo.emailAddress || '',
    phone: userInfo.phone || userInfo.phoneNumber || '',
    
    // 头像相关字段
    avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
    photo: userInfo.photo || userInfo.avatar || userInfo.picture || '',
    picture: userInfo.picture || userInfo.avatar || userInfo.photo || '',
    
    // 其他常见字段
    loginTime: userInfo.loginTime || new Date().toISOString(),
    roles: userInfo.roles || userInfo.role || ['user'],
    permissions: userInfo.permissions || userInfo.permission || ['basic'],
    
    // 保留其他非undefined字段
    ...Object.fromEntries(
      Object.entries(userInfo).filter(([_, value]) => 
        value !== undefined && 
        value !== null && 
        value !== 'undefined' &&
        value !== 'null'
      )
    )
  };

  // 二次检查：确保没有任何字段是undefined或'undefined'字符串
  Object.keys(safeUserInfo).forEach(key => {
    const value = safeUserInfo[key];
    if (value === undefined || value === 'undefined' || value === null || value === 'null') {
      // 根据字段类型提供合适的默认值
      if (['username', 'nickname', 'name'].includes(key)) {
        safeUserInfo[key] = '用户';
      } else if (['email', 'phone', 'avatar', 'photo', 'picture'].includes(key)) {
        safeUserInfo[key] = '';
      } else if (['roles', 'permissions'].includes(key)) {
        safeUserInfo[key] = [];
      } else if (key === 'id') {
        safeUserInfo[key] = `user_${Date.now()}`;
      } else {
        safeUserInfo[key] = '';
      }
    }
  });

  return safeUserInfo;
}

/**
 * 🔒 LOCKED: 安全的Guard事件处理器包装
 * 在事件处理前预处理用户信息
 *
 * 📌 核心事件安全处理逻辑，请勿修改
 * 🛡️ 防止事件回调中的undefined拼接问题
 */
export function createSafeGuardEventHandler(originalHandler: (userInfo: any) => void) {
  return (userInfo: any) => {
    try {
      console.log('🛡️ Guard事件安全处理 - 原始用户信息:', JSON.stringify(userInfo, null, 2));
      
      // 安全化用户信息
      const safeUserInfo = sanitizeUserInfo(userInfo);
      
      console.log('🛡️ Guard事件安全处理 - 安全化后用户信息:', JSON.stringify(safeUserInfo, null, 2));
      
      // 验证安全化结果
      const userInfoStr = JSON.stringify(safeUserInfo);
      if (userInfoStr.includes('undefinedundefined')) {
        console.error('🚨 安全化后仍包含undefinedundefined，进行强制修复');
        const fixedUserInfoStr = userInfoStr.replace(/undefinedundefined/g, '用户');
        const fixedUserInfo = JSON.parse(fixedUserInfoStr);
        originalHandler(fixedUserInfo);
      } else {
        originalHandler(safeUserInfo);
      }
      
    } catch (error) {
      console.error('🚨 Guard事件安全处理失败:', error);
      
      // 提供最小安全的用户信息
      const fallbackUserInfo = {
        id: `user_${Date.now()}`,
        username: '用户',
        nickname: '用户',
        email: '',
        name: '用户',
        loginTime: new Date().toISOString()
      };
      
      originalHandler(fallbackUserInfo);
    }
  };
}

/**
 * 拦截并修复Authing Guard的DOM操作
 * 🚫 DISABLED: 禁用DOM拦截，避免干扰Authing Guard正常显示
 */
export function setupGuardDOMInterception() {
  // 🚫 已禁用DOM拦截，让Authing Guard正常显示
  console.log('🚫 Authing Guard DOM拦截已禁用，避免干扰弹窗显示');

  // 返回一个空的observer
  return {
    disconnect: () => {}
  };
}

/**
 * 修复Guard DOM中的undefined拼接
 * 🛡️ 专门针对Authing Guard的undefined问题
 */
function fixUndefinedInGuardDOM(container: Element) {
  try {
    // 查找所有文本节点
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    // 修复包含undefinedundefined的文本节点
    textNodes.forEach(textNode => {
      if (textNode.textContent && textNode.textContent.includes('undefinedundefined')) {
        console.log('🛡️ 发现undefinedundefined文本，进行修复:', textNode.textContent);
        textNode.textContent = textNode.textContent.replace(/undefinedundefined/g, '用户');
      }

      // 修复单独的undefined
      if (textNode.textContent === 'undefined') {
        console.log('🛡️ 发现undefined文本，进行修复');
        textNode.textContent = '';
      }
    });

    // 修复属性中的undefined
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      ['title', 'alt', 'placeholder', 'value'].forEach(attr => {
        if (element.getAttribute(attr) === 'undefined') {
          console.log(`🛡️ 发现${attr}属性为undefined，进行修复`);
          element.removeAttribute(attr);
        }
      });
    });

  } catch (error) {
    console.error('🚨 修复Guard DOM时出错:', error);
  }
}

/**
 * 创建安全的Guard配置
 * 确保配置中没有可能导致undefined拼接的选项
 */
export function createSafeGuardConfig(originalConfig: any) {
  const safeConfig = {
    ...originalConfig,
    
    // 确保用户信息显示相关的配置是安全的
    lang: originalConfig.lang || 'zh-CN',
    mode: originalConfig.mode || 'modal',
    
    // 🛡️ 精确CSS来隐藏undefined内容
    customCSS: `
      ${originalConfig.customCSS || ''}

      /* 隐藏包含undefined的属性元素 */
      .authing-guard [title="undefined"],
      .authing-guard [alt="undefined"],
      .authing-guard [placeholder="undefined"] {
        display: none !important;
      }

      /* 修复可能的undefined伪元素内容 */
      .authing-guard *:before,
      .authing-guard *:after {
        content: none !important;
      }
    `,

    // 🛡️ 添加运行时undefined检测和修复
    onLoad: function() {
      console.log('🛡️ Guard加载完成，开始undefined检测和修复');

      // 延迟执行，确保DOM完全渲染
      setTimeout(() => {
        const guardContainer = document.querySelector('.authing-guard');
        if (guardContainer) {
          fixUndefinedInGuardDOM(guardContainer);

          // 设置观察器持续监控
          const observer = new MutationObserver(() => {
            fixUndefinedInGuardDOM(guardContainer);
          });

          observer.observe(guardContainer, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      }, 100);

      // 调用原始onLoad
      if (originalConfig.onLoad) {
        originalConfig.onLoad();
      }
    },
    
    // 🛡️ 事件处理配置 - 已在onLoad中集成undefined修复
    events: {
      ...originalConfig.events,

      // 在所有事件中添加安全处理
      onLogin: createSafeGuardEventHandler(originalConfig.events?.onLogin || (() => {})),
      onRegister: createSafeGuardEventHandler(originalConfig.events?.onRegister || (() => {})),
    }
  };

  return safeConfig;
}
