#!/usr/bin/env node

/**
 * PaymentPage 国际化自动替换脚本
 * 处理支付页面的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PAGE_PATH = 'src/pages/PaymentPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class PaymentPageI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('💳 开始 PaymentPage 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理页面文件
      await this.processPageFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ PaymentPage 国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📖 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      this.zhTranslations = JSON.parse(fs.readFileSync(ZH_LOCALE_PATH, 'utf8'));
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      this.enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
    }
    
    console.log('✅ 翻译文件加载完成');
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 确保payment部分存在
    if (!this.zhTranslations.payment) {
      this.zhTranslations.payment = {};
    }
    if (!this.enTranslations.payment) {
      this.enTranslations.payment = {};
    }

    // 页面标题和导航
    this.zhTranslations.payment.navigation = {
      pageTitle: "支付中心",
      paymentCenter: "支付中心",
      selectPlan: "选择套餐",
      paymentMethod: "支付方式",
      orderSummary: "订单摘要",
      backToPlans: "返回套餐选择"
    };

    this.enTranslations.payment.navigation = {
      pageTitle: "Payment Center",
      paymentCenter: "Payment Center",
      selectPlan: "Select Plan",
      paymentMethod: "Payment Method",
      orderSummary: "Order Summary",
      backToPlans: "Back to Plans"
    };

    // 套餐信息
    this.zhTranslations.payment.plans = {
      freePlan: "免费版",
      proPlan: "专业版",
      premiumPlan: "高级版",
      currentPlan: "当前套餐",
      recommended: "推荐",
      popular: "热门",
      bestValue: "最超值",
      monthly: "月付",
      yearly: "年付",
      save: "节省",
      perMonth: "每月",
      perYear: "每年",
      billed: "计费",
      billedMonthly: "按月计费",
      billedYearly: "按年计费"
    };

    this.enTranslations.payment.plans = {
      freePlan: "Free Plan",
      proPlan: "Pro Plan",
      premiumPlan: "Premium Plan",
      currentPlan: "Current Plan",
      recommended: "Recommended",
      popular: "Popular",
      bestValue: "Best Value",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save",
      perMonth: "per month",
      perYear: "per year",
      billed: "billed",
      billedMonthly: "billed monthly",
      billedYearly: "billed yearly"
    };

    // 支付方式
    this.zhTranslations.payment.methods = {
      selectPaymentMethod: "选择支付方式",
      wechatPay: "微信支付",
      alipay: "支付宝",
      unionPay: "银联支付",
      creditCard: "信用卡",
      paypal: "PayPal",
      applePay: "Apple Pay",
      googlePay: "Google Pay",
      bankTransfer: "银行转账"
    };

    this.enTranslations.payment.methods = {
      selectPaymentMethod: "Select Payment Method",
      wechatPay: "WeChat Pay",
      alipay: "Alipay",
      unionPay: "UnionPay",
      creditCard: "Credit Card",
      paypal: "PayPal",
      applePay: "Apple Pay",
      googlePay: "Google Pay",
      bankTransfer: "Bank Transfer"
    };

    // 订单信息
    this.zhTranslations.payment.order = {
      orderDetails: "订单详情",
      planName: "套餐名称",
      billingCycle: "计费周期",
      originalPrice: "原价",
      discount: "优惠",
      couponDiscount: "优惠券折扣",
      finalPrice: "实付金额",
      totalAmount: "总金额",
      tax: "税费",
      currency: "货币",
      orderNumber: "订单号",
      createTime: "创建时间",
      expireTime: "过期时间"
    };

    this.enTranslations.payment.order = {
      orderDetails: "Order Details",
      planName: "Plan Name",
      billingCycle: "Billing Cycle",
      originalPrice: "Original Price",
      discount: "Discount",
      couponDiscount: "Coupon Discount",
      finalPrice: "Final Price",
      totalAmount: "Total Amount",
      tax: "Tax",
      currency: "Currency",
      orderNumber: "Order Number",
      createTime: "Create Time",
      expireTime: "Expire Time"
    };

    // 支付状态和消息
    this.zhTranslations.payment.status = {
      processing: "处理中...",
      paymentProcessing: "支付处理中，请稍候...",
      paymentSuccess: "支付成功",
      paymentFailed: "支付失败",
      paymentCancelled: "支付已取消",
      paymentTimeout: "支付超时",
      orderCreated: "订单创建成功",
      orderFailed: "订单创建失败",
      redirecting: "正在跳转到支付页面...",
      pleaseWait: "请稍候",
      doNotClose: "请勿关闭页面"
    };

    this.enTranslations.payment.status = {
      processing: "Processing...",
      paymentProcessing: "Payment processing, please wait...",
      paymentSuccess: "Payment Successful",
      paymentFailed: "Payment Failed",
      paymentCancelled: "Payment Cancelled",
      paymentTimeout: "Payment Timeout",
      orderCreated: "Order created successfully",
      orderFailed: "Order creation failed",
      redirecting: "Redirecting to payment page...",
      pleaseWait: "Please wait",
      doNotClose: "Please do not close this page"
    };

    // 按钮和操作
    this.zhTranslations.payment.actions = {
      selectPlan: "选择套餐",
      upgradeToPro: "升级到专业版",
      upgradeToPremium: "升级到高级版",
      payNow: "立即支付",
      confirmPayment: "确认支付",
      cancelPayment: "取消支付",
      retryPayment: "重试支付",
      backToHome: "返回首页",
      contactSupport: "联系客服",
      viewOrderHistory: "查看订单历史",
      downloadInvoice: "下载发票"
    };

    this.enTranslations.payment.actions = {
      selectPlan: "Select Plan",
      upgradeToPro: "Upgrade to Pro",
      upgradeToPremium: "Upgrade to Premium",
      payNow: "Pay Now",
      confirmPayment: "Confirm Payment",
      cancelPayment: "Cancel Payment",
      retryPayment: "Retry Payment",
      backToHome: "Back to Home",
      contactSupport: "Contact Support",
      viewOrderHistory: "View Order History",
      downloadInvoice: "Download Invoice"
    };

    // 错误消息
    this.zhTranslations.payment.errors = {
      networkError: "网络连接失败，请检查网络后重试",
      serverError: "服务器错误，请稍后重试",
      paymentError: "支付失败，请重试或更换支付方式",
      invalidOrder: "订单信息无效",
      orderExpired: "订单已过期",
      insufficientBalance: "余额不足",
      paymentMethodUnavailable: "支付方式不可用",
      unknownError: "未知错误，请联系客服"
    };

    this.enTranslations.payment.errors = {
      networkError: "Network connection failed, please check network and retry",
      serverError: "Server error, please try again later",
      paymentError: "Payment failed, please retry or change payment method",
      invalidOrder: "Invalid order information",
      orderExpired: "Order has expired",
      insufficientBalance: "Insufficient balance",
      paymentMethodUnavailable: "Payment method unavailable",
      unknownError: "Unknown error, please contact support"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 页面标题和导航
      {
        search: /['"`]支付中心['"`]/g,
        replace: "t('payment.navigation.paymentCenter')"
      },
      {
        search: /['"`]选择套餐['"`]/g,
        replace: "t('payment.navigation.selectPlan')"
      },
      {
        search: /['"`]支付方式['"`]/g,
        replace: "t('payment.navigation.paymentMethod')"
      },
      {
        search: /['"`]订单摘要['"`]/g,
        replace: "t('payment.navigation.orderSummary')"
      },

      // 套餐信息
      {
        search: /['"`]免费版['"`]/g,
        replace: "t('payment.plans.freePlan')"
      },
      {
        search: /['"`]专业版['"`]/g,
        replace: "t('payment.plans.proPlan')"
      },
      {
        search: /['"`]高级版['"`]/g,
        replace: "t('payment.plans.premiumPlan')"
      },
      {
        search: /['"`]当前套餐['"`]/g,
        replace: "t('payment.plans.currentPlan')"
      },
      {
        search: /['"`]推荐['"`]/g,
        replace: "t('payment.plans.recommended')"
      },
      {
        search: /['"`]热门['"`]/g,
        replace: "t('payment.plans.popular')"
      },
      {
        search: /['"`]月付['"`]/g,
        replace: "t('payment.plans.monthly')"
      },
      {
        search: /['"`]年付['"`]/g,
        replace: "t('payment.plans.yearly')"
      },

      // 支付方式
      {
        search: /['"`]选择支付方式['"`]/g,
        replace: "t('payment.methods.selectPaymentMethod')"
      },
      {
        search: /['"`]微信支付['"`]/g,
        replace: "t('payment.methods.wechatPay')"
      },
      {
        search: /['"`]支付宝['"`]/g,
        replace: "t('payment.methods.alipay')"
      },
      {
        search: /['"`]银联支付['"`]/g,
        replace: "t('payment.methods.unionPay')"
      },

      // 订单信息
      {
        search: /['"`]订单详情['"`]/g,
        replace: "t('payment.order.orderDetails')"
      },
      {
        search: /['"`]套餐名称['"`]/g,
        replace: "t('payment.order.planName')"
      },
      {
        search: /['"`]计费周期['"`]/g,
        replace: "t('payment.order.billingCycle')"
      },
      {
        search: /['"`]原价['"`]/g,
        replace: "t('payment.order.originalPrice')"
      },
      {
        search: /['"`]优惠['"`]/g,
        replace: "t('payment.order.discount')"
      },
      {
        search: /['"`]实付金额['"`]/g,
        replace: "t('payment.order.finalPrice')"
      },
      {
        search: /['"`]总金额['"`]/g,
        replace: "t('payment.order.totalAmount')"
      },

      // 支付状态
      {
        search: /['"`]处理中\.\.\.['"`]/g,
        replace: "t('payment.status.processing')"
      },
      {
        search: /['"`]支付处理中，请稍候\.\.\.['"`]/g,
        replace: "t('payment.status.paymentProcessing')"
      },
      {
        search: /['"`]支付成功['"`]/g,
        replace: "t('payment.status.paymentSuccess')"
      },
      {
        search: /['"`]支付失败['"`]/g,
        replace: "t('payment.status.paymentFailed')"
      },
      {
        search: /['"`]支付已取消['"`]/g,
        replace: "t('payment.status.paymentCancelled')"
      },
      {
        search: /['"`]订单创建成功['"`]/g,
        replace: "t('payment.status.orderCreated')"
      },
      {
        search: /['"`]正在跳转到支付页面\.\.\.['"`]/g,
        replace: "t('payment.status.redirecting')"
      },

      // 按钮和操作
      {
        search: /['"`]立即支付['"`]/g,
        replace: "t('payment.actions.payNow')"
      },
      {
        search: /['"`]确认支付['"`]/g,
        replace: "t('payment.actions.confirmPayment')"
      },
      {
        search: /['"`]取消支付['"`]/g,
        replace: "t('payment.actions.cancelPayment')"
      },
      {
        search: /['"`]重试支付['"`]/g,
        replace: "t('payment.actions.retryPayment')"
      },
      {
        search: /['"`]返回首页['"`]/g,
        replace: "t('payment.actions.backToHome')"
      },
      {
        search: /['"`]联系客服['"`]/g,
        replace: "t('payment.actions.contactSupport')"
      },

      // 错误消息
      {
        search: /['"`]网络连接失败，请检查网络后重试['"`]/g,
        replace: "t('payment.errors.networkError')"
      },
      {
        search: /['"`]服务器错误，请稍后重试['"`]/g,
        replace: "t('payment.errors.serverError')"
      },
      {
        search: /['"`]支付失败，请重试或更换支付方式['"`]/g,
        replace: "t('payment.errors.paymentError')"
      },
      {
        search: /['"`]订单信息无效['"`]/g,
        replace: "t('payment.errors.invalidOrder')"
      },
      {
        search: /['"`]订单已过期['"`]/g,
        replace: "t('payment.errors.orderExpired')"
      }
    ];
  }

  /**
   * 处理页面文件
   */
  async processPageFile() {
    console.log('📝 处理页面文件...');
    
    if (!fs.existsSync(PAGE_PATH)) {
      throw new Error(`页面文件不存在: ${PAGE_PATH}`);
    }

    let content = fs.readFileSync(PAGE_PATH, 'utf8');
    
    // 确保导入了useTranslation
    if (!content.includes('useTranslation')) {
      const importMatch = content.match(/import.*from ['"]react['"];?\n/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          `${importMatch[0]}import { useTranslation } from 'react-i18next';\n`
        );
      }
    }

    // 确保在组件中使用了t函数
    if (!content.includes('const { t }')) {
      const componentMatch = content.match(/export default function PaymentPage\(\) \{/);
      if (componentMatch) {
        content = content.replace(
          componentMatch[0],
          `${componentMatch[0]}\n  const { t } = useTranslation();`
        );
      }
    }

    // 应用所有替换
    for (const replacement of this.replacements) {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        this.processedCount += matches.length;
      }
    }

    fs.writeFileSync(PAGE_PATH, content, 'utf8');
    console.log(`✅ 页面文件处理完成，替换了 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('📄 更新翻译文件...');
    
    // 更新中文翻译文件
    fs.writeFileSync(
      ZH_LOCALE_PATH,
      JSON.stringify(this.zhTranslations, null, 2),
      'utf8'
    );
    
    // 更新英文翻译文件
    fs.writeFileSync(
      EN_LOCALE_PATH,
      JSON.stringify(this.enTranslations, null, 2),
      'utf8'
    );
    
    console.log('✅ 翻译文件更新完成');
  }
}

// 运行脚本
const processor = new PaymentPageI18n();
processor.run().catch(console.error);
