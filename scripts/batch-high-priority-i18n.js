#!/usr/bin/env node

/**
 * 批量处理高优先级文件国际化脚本
 * 目标：达到100%国际化覆盖率
 */

import fs from 'fs';
import path from 'path';

const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

// 高优先级文件列表（基于扫描报告）
const HIGH_PRIORITY_FILES = [
  'src/api/ai.ts',
  'src/api/aiService.ts',
  'src/api/contentAdapter.ts',
  'src/utils/titleGenerationUtils.ts',
  'src/utils/titleGeneratorValidator.ts',
  'src/utils/userDataIsolation.ts',
  'src/utils/safeDataStorage.ts',
  'src/utils/secureStorage.ts',
  'src/utils/sessionManager.ts',
  'src/utils/subscriptionStatusUtils.ts',
  'src/utils/paymentUtils.ts',
  'src/utils/platformUtils.ts'
];

class BatchHighPriorityI18n {
  constructor() {
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
    this.totalFiles = 0;
  }

  /**
   * 运行批量国际化处理
   */
  async run() {
    console.log('🚀 开始批量处理高优先级文件国际化...\n');
    console.log(`📋 计划处理 ${HIGH_PRIORITY_FILES.length} 个高优先级文件`);

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 批量处理文件
      await this.batchProcessFiles();
      
      // 3. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 批量高优先级文件国际化完成！`);
      console.log(`📊 成功处理了 ${this.totalFiles} 个文件，${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 批量国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📁 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      const zhContent = fs.readFileSync(ZH_LOCALE_PATH, 'utf8');
      this.zhTranslations = JSON.parse(zhContent);
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      const enContent = fs.readFileSync(EN_LOCALE_PATH, 'utf8');
      this.enTranslations = JSON.parse(enContent);
    }

    // 确保基础结构存在
    if (!this.zhTranslations.common) this.zhTranslations.common = {};
    if (!this.enTranslations.common) this.enTranslations.common = {};
    if (!this.zhTranslations.common.errors) this.zhTranslations.common.errors = {};
    if (!this.enTranslations.common.errors) this.enTranslations.common.errors = {};
    if (!this.zhTranslations.common.messages) this.zhTranslations.common.messages = {};
    if (!this.enTranslations.common.messages) this.enTranslations.common.messages = {};
    if (!this.zhTranslations.common.status) this.zhTranslations.common.status = {};
    if (!this.enTranslations.common.status) this.enTranslations.common.status = {};
  }

  /**
   * 批量处理文件
   */
  async batchProcessFiles() {
    console.log('🔄 开始批量处理文件...\n');
    
    for (const filePath of HIGH_PRIORITY_FILES) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
        continue;
      }

      console.log(`📝 处理文件: ${filePath}`);
      await this.processFile(filePath);
      this.totalFiles++;
    }
  }

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileProcessedCount = 0;

    // 根据文件类型选择处理策略
    if (filePath.includes('api/ai')) {
      fileProcessedCount = this.processAIFiles(content, filePath);
    } else if (filePath.includes('utils/')) {
      fileProcessedCount = this.processUtilsFiles(content, filePath);
    } else {
      fileProcessedCount = this.processGenericFile(content, filePath);
    }

    this.processedCount += fileProcessedCount;
    console.log(`✅ ${filePath} 处理完成，替换了 ${fileProcessedCount} 处文本`);
  }

  /**
   * 处理AI相关文件
   */
  processAIFiles(content, filePath) {
    let processedCount = 0;
    
    // 定义AI相关的常用翻译
    const aiTranslations = {
      // 错误消息
      '密钥未配置': { en: 'API key not configured', key: 'common.errors.keyNotConfigured' },
      '密钥未正确配置': { en: 'API key not properly configured', key: 'common.errors.keyNotProperlyConfigured' },
      '密钥格式不正确': { en: 'Invalid API key format', key: 'common.errors.invalidKeyFormat' },
      '密钥长度过短': { en: 'API key too short', key: 'common.errors.keyTooShort' },
      '密钥无效或权限不足': { en: 'Invalid API key or insufficient permissions', key: 'common.errors.invalidKeyOrPermissions' },
      '调用失败': { en: 'API call failed', key: 'common.errors.callFailed' },
      '内容生成失败': { en: 'Content generation failed', key: 'common.errors.contentGenerationFailed' },
      '图像生成失败': { en: 'Image generation failed', key: 'common.errors.imageGenerationFailed' },
      '服务暂时不可用': { en: 'Service temporarily unavailable', key: 'common.errors.serviceUnavailable' },
      '调用超时': { en: 'Request timeout', key: 'common.errors.requestTimeout' },
      '网络连接失败': { en: 'Network connection failed', key: 'common.errors.networkFailed' },
      '调用频率超限': { en: 'Rate limit exceeded', key: 'common.errors.rateLimitExceeded' },
      '账户余额不足': { en: 'Insufficient account balance', key: 'common.errors.insufficientBalance' },
      '请稍后重试': { en: 'Please try again later', key: 'common.errors.tryAgainLater' },
      '未知错误': { en: 'Unknown error', key: 'common.errors.unknownError' },
      
      // 状态消息
      '内容生成成功': { en: 'Content generated successfully', key: 'common.messages.contentGeneratedSuccess' },
      '图像生成成功': { en: 'Image generated successfully', key: 'common.messages.imageGeneratedSuccess' },
      '服务正常': { en: 'Service is normal', key: 'common.status.serviceNormal' },
      '服务检查失败': { en: 'Service check failed', key: 'common.errors.serviceCheckFailed' },
      '所有服务均不可用': { en: 'All services unavailable', key: 'common.errors.allServicesUnavailable' },
      '请检查配置': { en: 'Please check configuration', key: 'common.messages.checkConfiguration' }
    };

    // 应用翻译
    for (const [zhText, translation] of Object.entries(aiTranslations)) {
      this.addTranslation(translation.key, zhText, translation.en);
      
      // 替换文本
      const regex = new RegExp(`['"]${zhText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
      const beforeCount = (content.match(regex) || []).length;
      if (beforeCount > 0) {
        content = content.replace(regex, `i18n.t('${translation.key}')`);
        processedCount += beforeCount;
      }
    }

    // 添加i18n导入
    if (processedCount > 0 && !content.includes('import i18n')) {
      content = content.replace(/^import/, `import i18n from '@/i18n';\nimport`);
    }

    // 保存文件
    fs.writeFileSync(filePath, content);
    return processedCount;
  }

  /**
   * 处理工具类文件
   */
  processUtilsFiles(content, filePath) {
    let processedCount = 0;
    
    // 定义工具类常用翻译
    const utilsTranslations = {
      // 数据存储相关
      '数据保存失败': { en: 'Data save failed', key: 'common.errors.dataSaveFailed' },
      '数据加载失败': { en: 'Data load failed', key: 'common.errors.dataLoadFailed' },
      '数据格式错误': { en: 'Invalid data format', key: 'common.errors.invalidDataFormat' },
      '存储空间不足': { en: 'Insufficient storage space', key: 'common.errors.insufficientStorage' },
      '存储空间已满': { en: 'Storage space full', key: 'common.errors.storageFull' },
      '隐私模式': { en: 'Private mode', key: 'common.status.privateMode' },
      '当前浏览器处于隐私模式': { en: 'Browser is in private mode', key: 'common.errors.browserPrivateMode' },
      '无法保存数据': { en: 'Cannot save data', key: 'common.errors.cannotSaveData' },
      '无法读取': { en: 'Cannot read', key: 'common.errors.cannotRead' },
      '数据格式损坏': { en: 'Data format corrupted', key: 'common.errors.dataCorrupted' },
      '没有找到数据': { en: 'No data found', key: 'common.errors.noDataFound' },
      
      // 用户相关
      '用户未登录': { en: 'User not logged in', key: 'common.errors.userNotLoggedIn' },
      '匿名用户': { en: 'Anonymous user', key: 'common.status.anonymousUser' },
      '数据已保存': { en: 'Data saved', key: 'common.messages.dataSaved' },
      '数据已删除': { en: 'Data deleted', key: 'common.messages.dataDeleted' },
      
      // 订阅相关
      '未订阅': { en: 'Not subscribed', key: 'common.status.notSubscribed' },
      '已过期': { en: 'Expired', key: 'common.status.expired' },
      '今日到期': { en: 'Expires today', key: 'common.status.expirestoday' },
      '天后到期': { en: 'days until expiration', key: 'common.status.daysUntilExpiration' },
      '您的订阅已过期': { en: 'Your subscription has expired', key: 'common.messages.subscriptionExpired' },
      '请立即续费以继续使用服务': { en: 'Please renew immediately to continue using the service', key: 'common.messages.renewImmediately' },
      '立即续费避免服务中断': { en: 'Renew now to avoid service interruption', key: 'common.messages.renewToAvoidInterruption' },
      
      // 支付相关
      '支付类型': { en: 'Payment type', key: 'common.labels.paymentType' },
      '订单': { en: 'Order', key: 'common.labels.order' },
      '订单用户': { en: 'Order user', key: 'common.labels.orderUser' },
      '订单号': { en: 'Order number', key: 'common.labels.orderNumber' },
      '不能为空': { en: 'Cannot be empty', key: 'common.errors.cannotBeEmpty' },
      '价格必须大于': { en: 'Price must be greater than', key: 'common.errors.priceMustBeGreaterThan' },
      
      // 平台相关
      '内容超出': { en: 'Content exceeds', key: 'common.errors.contentExceeds' },
      '字符限制': { en: 'character limit', key: 'common.labels.characterLimit' },
      '当前': { en: 'Current', key: 'common.labels.current' },
      '字符': { en: 'characters', key: 'common.labels.characters' },
      '平台最大限制': { en: 'platform maximum limit', key: 'common.labels.platformMaxLimit' }
    };

    // 应用翻译
    for (const [zhText, translation] of Object.entries(utilsTranslations)) {
      this.addTranslation(translation.key, zhText, translation.en);
      
      // 替换文本
      const regex = new RegExp(`['"]${zhText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
      const beforeCount = (content.match(regex) || []).length;
      if (beforeCount > 0) {
        content = content.replace(regex, `i18n.t('${translation.key}')`);
        processedCount += beforeCount;
      }
    }

    // 添加i18n导入
    if (processedCount > 0 && !content.includes('import i18n')) {
      content = content.replace(/^import/, `import i18n from '@/i18n';\nimport`);
    }

    // 保存文件
    fs.writeFileSync(filePath, content);
    return processedCount;
  }

  /**
   * 处理通用文件
   */
  processGenericFile(content, filePath) {
    let processedCount = 0;
    
    // 通用翻译模式
    const commonPatterns = [
      { zh: '错误', en: 'Error', key: 'common.labels.error' },
      { zh: '警告', en: 'Warning', key: 'common.labels.warning' },
      { zh: '成功', en: 'Success', key: 'common.labels.success' },
      { zh: '失败', en: 'Failed', key: 'common.labels.failed' },
      { zh: '加载中', en: 'Loading', key: 'common.status.loading' },
      { zh: '处理中', en: 'Processing', key: 'common.status.processing' },
      { zh: '已完成', en: 'Completed', key: 'common.status.completed' },
      { zh: '取消', en: 'Cancel', key: 'common.actions.cancel' },
      { zh: '确认', en: 'Confirm', key: 'common.actions.confirm' },
      { zh: '保存', en: 'Save', key: 'common.actions.save' },
      { zh: '删除', en: 'Delete', key: 'common.actions.delete' }
    ];

    // 应用通用翻译
    for (const pattern of commonPatterns) {
      this.addTranslation(pattern.key, pattern.zh, pattern.en);
      
      // 替换文本
      const regex = new RegExp(`['"]${pattern.zh}['"]`, 'g');
      const beforeCount = (content.match(regex) || []).length;
      if (beforeCount > 0) {
        content = content.replace(regex, `i18n.t('${pattern.key}')`);
        processedCount += beforeCount;
      }
    }

    // 添加i18n导入
    if (processedCount > 0 && !content.includes('import i18n')) {
      content = content.replace(/^import/, `import i18n from '@/i18n';\nimport`);
    }

    // 保存文件
    fs.writeFileSync(filePath, content);
    return processedCount;
  }

  /**
   * 添加翻译
   */
  addTranslation(key, zhText, enText) {
    const keys = key.split('.');
    let zhCurrent = this.zhTranslations;
    let enCurrent = this.enTranslations;

    // 创建嵌套对象结构
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!zhCurrent[k]) zhCurrent[k] = {};
      if (!enCurrent[k]) enCurrent[k] = {};
      zhCurrent = zhCurrent[k];
      enCurrent = enCurrent[k];
    }

    // 设置最终值
    const finalKey = keys[keys.length - 1];
    zhCurrent[finalKey] = zhText;
    enCurrent[finalKey] = enText;
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('\n💾 更新翻译文件...');
    
    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');
    
    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }
}

// 运行批量国际化处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new BatchHighPriorityI18n();
  processor.run().catch(console.error);
}

export default BatchHighPriorityI18n;
