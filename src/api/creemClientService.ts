/**
 * Creem客户端服务
 * 前端安全调用，不直接使用Creem SDK，避免API密钥泄露
 */

import QRCode from "qrcode";

/**
 * 获取API端点
 * 根据环境自动选择正确的API端点
 */
function getAPIEndpoint(): string {
  // 生产环境使用Netlify Functions
  if (import.meta.env.PROD) {
    return '/.netlify/functions/checkout';
  }
  
  // 开发环境使用本地Netlify Functions
  if (import.meta.env.DEV) {
    return 'http://localhost:8888/.netlify/functions/checkout';
  }
  
  // 默认使用相对路径（适用于大多数部署环境）
  return '/.netlify/functions/checkout';
}

/**
 * 创建支付检查点（通过后端API）
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付检查点信息
 */
export async function createCreemCheckout(priceId: string, customerEmail?: string) {
  try {
    // 检查网络连接
    if (!navigator.onLine) {
      throw new Error('网络连接不可用');
    }

    const apiEndpoint = getAPIEndpoint();
    console.log('使用API端点:', apiEndpoint);

    // 调用后端API创建支付检查点
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '网络请求失败' }));
      console.error('支付API错误:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('支付检查点创建成功:', data);
    
    return {
      success: true,
      checkout: data.checkout,
      url: data.url,
      qrCodeUrl: data.qrCodeUrl,
      qrCodeDataURL: data.qrCodeDataURL,
      price: data.price
    };
  } catch (error: any) {
    console.error('支付服务调用失败:', error);
    
    // 提供更友好的错误信息
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error('支付服务暂时不可用，请稍后重试');
    }
    
    throw new Error(error.message || '支付服务暂时不可用');
  }
}

/**
 * 获取支付宝二维码URL（通过后端API）
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付宝二维码URL
 */
export async function getAlipayQRCode(priceId: string, customerEmail?: string) {
  try {
    const result = await createCreemCheckout(priceId, customerEmail);
    
    // 优先使用后端返回的二维码URL
    const alipayQr = 
      result.qrCodeUrl ||
      result.checkout?.alipayQrCodeUrl ||
      result.checkout?.alipay_qr_code_url ||
      (result.checkout?.qrCodes && result.checkout.qrCodes.alipay) ||
      result.url ||
      null;

    if (!alipayQr) {
      throw new Error('该产品未配置支付宝二维码支付');
    }

    return {
      success: true,
      qrUrl: alipayQr,
      price: result.price
    };
  } catch (error: any) {
    console.error('获取支付宝二维码失败:', error);
    throw error;
  }
}

/**
 * 生成支付宝二维码图片（通过后端API）
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 二维码图片的DataURL
 */
export async function generateAlipayQRCode(priceId: string, customerEmail?: string) {
  try {
    const result = await createCreemCheckout(priceId, customerEmail);
    
    // 优先使用后端返回的二维码图片
    if (result.qrCodeDataURL) {
      return {
        success: true,
        qrCodeDataURL: result.qrCodeDataURL,
        price: result.price,
        originalUrl: result.qrCodeUrl || result.url
      };
    }
    
    // 如果后端没有返回二维码图片，则在前端生成
    const qrResult = await getAlipayQRCode(priceId, customerEmail);
    
    if (!qrResult.success || !qrResult.qrUrl) {
      throw new Error('无法获取支付链接');
    }

    // 生成二维码图片
    const qrCodeDataURL = await QRCode.toDataURL(qrResult.qrUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      success: true,
      qrCodeDataURL,
      price: qrResult.price,
      originalUrl: qrResult.qrUrl
    };
  } catch (error: any) {
    console.error('生成二维码失败:', error);
    throw error;
  }
}

/**
 * 创建支付检查点并跳转到Creem支付页面（通过后端API）
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付页面URL
 */
export async function startCheckout(priceId: string, customerEmail?: string) {
  try {
    // 检查网络连接
    if (!navigator.onLine) {
      throw new Error('网络连接不可用');
    }

    // 调用后端API创建支付检查点
    const response = await fetch('http://localhost:8888/.netlify/functions/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error('无法获取支付页面URL');
    }

    return {
      success: true,
      url: data.url,
      checkout: data.checkout
    };
  } catch (error: any) {
    console.log('创建支付检查点失败，请稍后重试');
    throw error;
  }
}

/**
 * 跳转到Creem支付页面（通过后端API）
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 */
export async function redirectToCheckout(priceId: string, customerEmail?: string) {
  try {
    const result = await startCheckout(priceId, customerEmail);
    
    if (result.success && result.url) {
      // 跳转到Creem支付页面
      window.location.href = result.url;
    } else {
      throw new Error('无法获取支付页面URL');
    }
  } catch (error: any) {
    console.log('跳转到支付页面失败，请稍后重试');
    throw error;
  }
} 