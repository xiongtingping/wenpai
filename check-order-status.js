const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrder() {
  const ORDER_ID = 'WP17598412695672908';
  const USER_ID = '68b6fd961774b4e49242c916';
  
  console.log('===== 检查订单状态 =====\n');
  
  // 1. 查询订单
  const { data: order, error: orderError } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('order_id', ORDER_ID)
    .single();
    
  console.log('📋 订单信息:');
  if (orderError) {
    console.error('❌ 查询失败:', orderError.message);
  } else if (!order) {
    console.log('❌ 订单不存在');
  } else {
    console.log(JSON.stringify(order, null, 2));
  }
  console.log('');
  
  // 2. 查询订阅
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', USER_ID)
    .maybeSingle();
    
  console.log('📋 订阅信息:');
  if (subError) {
    console.error('❌ 查询失败:', subError.message);
  } else if (!subscription) {
    console.log('ℹ️  无订阅记录');
  } else {
    console.log(JSON.stringify(subscription, null, 2));
  }
  console.log('');
  
  // 3. 分析问题
  console.log('===== 问题分析 =====');
  if (order) {
    console.log('订单状态:', order.status);
    console.log('支付时间:', order.paid_at || '未支付');
    console.log('处理时间:', order.processed_at || '未处理');
    console.log('产品类型:', order.product_type);
    console.log('订阅周期:', order.duration_type);
    console.log('');
    
    if (order.status === 'paid' && !order.processed_at) {
      console.log('⚠️  订单已支付但未处理 - 这是问题所在！');
      console.log('可能原因:');
      console.log('1. BufPay回调失败（返回了400/500错误）');
      console.log('2. processOrderPermissions函数执行失败');
      console.log('3. 数据库写入订阅信息失败');
    }
  }
}

checkOrder().catch(console.error);
