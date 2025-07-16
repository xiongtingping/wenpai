// /api/creem/webhook.ts
import { Creem } from "creem";

const creem = new Creem({ 
  serverURL: "https://api.creem.io" 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body;

    console.log('收到Creem webhook事件:', {
      type: event.type,
      id: event.id,
      timestamp: event.timestamp
    });

    // 验证webhook签名（如果配置了）
    if (process.env.CREEM_WEBHOOK_SECRET) {
      try {
        const signature = request.headers.get('x-creem-signature');
        if (!signature) {
          console.warn('缺少webhook签名');
          return Response.json({ error: '缺少签名' }, { status: 401 });
        }

        // 这里可以添加签名验证逻辑
        // const isValid = creem.verifyWebhookSignature(body, signature, process.env.CREEM_WEBHOOK_SECRET);
        // if (!isValid) {
        //   return Response.json({ error: '签名验证失败' }, { status: 401 });
        // }
      } catch (error) {
        console.error('签名验证失败:', error);
        return Response.json({ error: '签名验证失败' }, { status: 401 });
      }
    }

    // 处理不同类型的事件
    switch (event.type) {
      case 'checkout.completed':
        await handleCheckoutCompleted(event);
        break;
      
      case 'checkout.expired':
        await handleCheckoutExpired(event);
        break;
      
      case 'checkout.cancelled':
        await handleCheckoutCancelled(event);
        break;
      
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      
      default:
        console.log('未处理的事件类型:', event.type);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('处理webhook失败:', error);
    return Response.json({ 
      error: error.message || '处理webhook失败' 
    }, { status: 500 });
  }
}

/**
 * 处理支付完成事件
 */
async function handleCheckoutCompleted(event: any) {
  console.log('支付完成:', {
    checkoutId: event.data.id,
    customerEmail: event.data.customer_email,
    amount: event.data.amount,
    currency: event.data.currency
  });

  // 这里可以添加业务逻辑：
  // 1. 更新订单状态
  // 2. 激活用户订阅
  // 3. 发送确认邮件
  // 4. 记录支付日志
  
  try {
    // 示例：更新用户订阅状态
    // await updateUserSubscription(event.data.customer_email, event.data.price_id);
    
    // 示例：发送确认邮件
    // await sendPaymentConfirmationEmail(event.data.customer_email, event.data);
    
    console.log('支付完成处理成功');
  } catch (error) {
    console.error('处理支付完成事件失败:', error);
  }
}

/**
 * 处理支付过期事件
 */
async function handleCheckoutExpired(event: any) {
  console.log('支付过期:', {
    checkoutId: event.data.id,
    customerEmail: event.data.customer_email
  });

  // 这里可以添加业务逻辑：
  // 1. 更新订单状态为过期
  // 2. 清理临时数据
  // 3. 发送提醒邮件
}

/**
 * 处理支付取消事件
 */
async function handleCheckoutCancelled(event: any) {
  console.log('支付取消:', {
    checkoutId: event.data.id,
    customerEmail: event.data.customer_email
  });

  // 这里可以添加业务逻辑：
  // 1. 更新订单状态为取消
  // 2. 清理临时数据
}

/**
 * 处理支付成功事件
 */
async function handlePaymentSucceeded(event: any) {
  console.log('支付成功:', {
    paymentId: event.data.id,
    checkoutId: event.data.checkout_id,
    amount: event.data.amount,
    currency: event.data.currency
  });

  // 这里可以添加业务逻辑：
  // 1. 更新支付状态
  // 2. 激活产品/服务
  // 3. 发送成功通知
}

/**
 * 处理支付失败事件
 */
async function handlePaymentFailed(event: any) {
  console.log('支付失败:', {
    paymentId: event.data.id,
    checkoutId: event.data.checkout_id,
    reason: event.data.failure_reason
  });

  // 这里可以添加业务逻辑：
  // 1. 更新支付状态为失败
  // 2. 发送失败通知
  // 3. 提供重试选项
} 