/**
 * Creem服务端支付服务
 * 仅在服务端使用，包含API密钥，不暴露给前端
 * 注意：此文件仅用于开发环境测试，生产环境应使用Netlify函数
 */

import { Creem } from "creem";
import QRCode from "qrcode";

// 开发环境直接使用Creem SDK
const creem = new Creem();

/**
 * 创建支付检查点
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付检查点信息
 */
export async function createCreemCheckout(priceId: string, customerEmail?: string) {
  try {
    // 检查环境变量
    const apiKey = import.meta.env.VITE_CREEM_API_KEY;
    if (!apiKey) {
      throw new Error('Creem API密钥未配置');
    }

    console.log('创建Creem支付检查点:', { priceId, customerEmail });

    // 调用Creem API - 正确的参数结构
    const checkout = await creem.createCheckout({
      productId: priceId,
      xApiKey: apiKey,
    });

    console.log('Creem API响应:', checkout);

    return {
      success: true,
      checkout: checkout,
      url: checkout.alipayQrCodeUrl || checkout.alipay_qr_code_url || (checkout.qrCodes && checkout.qrCodes.alipay) || null
    };
  } catch (error: any) {
    console.error('Creem API调用失败:', error);
    throw new Error(error.message || '创建支付失败');
  }
}

/**
 * 获取支付宝二维码URL
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付宝二维码URL
 */
export async function getAlipayQRCode(priceId: string, customerEmail?: string) {
  try {
    const result = await createCreemCheckout(priceId, customerEmail);
    
    // 提取支付宝二维码URL
    const alipayQr = 
      result.checkout.alipayQrCodeUrl ||
      result.checkout.alipay_qr_code_url ||
      (result.checkout.qrCodes && result.checkout.qrCodes.alipay) ||
      result.url ||
      null;

    if (!alipayQr) {
      throw new Error('该产品未配置支付宝二维码支付');
    }

    return {
      success: true,
      qrUrl: alipayQr,
      price: result.checkout.amount ? (typeof result.checkout.amount === 'number' ? result.checkout.amount / 100 : parseFloat(result.checkout.amount) / 100) : null
    };
  } catch (error: any) {
    console.error('获取支付宝二维码失败:', error);
    throw error;
  }
}

/**
 * 生成支付宝二维码图片
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 二维码图片的DataURL
 */
export async function generateAlipayQRCode(priceId: string, customerEmail?: string) {
  try {
    const result = await getAlipayQRCode(priceId, customerEmail);
    
    if (!result.success || !result.qrUrl) {
      throw new Error('无法获取支付链接');
    }

    // 生成二维码图片
    const qrCodeDataURL = await QRCode.toDataURL(result.qrUrl, {
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
      price: result.price,
      originalUrl: result.qrUrl
    };
  } catch (error: any) {
    console.error('生成二维码失败:', error);
    throw error;
  }
}

/**
 * 创建支付检查点并跳转到Creem支付页面
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱（可选）
 * @returns 支付页面URL
 */
export async function startCheckout(priceId: string, customerEmail?: string) {
  try {
    console.log('开始支付流程:', { priceId, customerEmail });

    // 调用API创建支付检查点
    const response = await fetch('/.netlify/functions/api/creem/checkout', {
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
    console.log('支付检查点创建成功:', data);

    if (!data.success || !data.url) {
      throw new Error('无法获取支付页面URL');
    }

    return {
      success: true,
      url: data.url,
      checkout: data.checkout
    };
  } catch (error: any) {
    console.error('创建支付检查点失败:', error);
    throw error;
  }
}

/**
 * 跳转到Creem支付页面
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
    console.error('跳转到支付页面失败:', error);
    throw error;
  }
} 