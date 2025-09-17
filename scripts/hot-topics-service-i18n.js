#!/usr/bin/env node

/**
 * HotTopicsService 国际化自动替换脚本
 * 处理热点话题服务的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const SERVICE_PATH = 'src/services/hotTopicsService.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class HotTopicsServiceI18n {
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
    console.log('🔥 开始 HotTopicsService 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理服务文件
      await this.processServiceFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ HotTopicsService 国际化完成！`);
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

    // 确保hotTopics部分存在
    if (!this.zhTranslations.hotTopics) {
      this.zhTranslations.hotTopics = {};
    }
    if (!this.enTranslations.hotTopics) {
      this.enTranslations.hotTopics = {};
    }

    // 服务相关
    this.zhTranslations.hotTopics.service = {
      loading: "正在加载热点话题...",
      loadingFailed: "加载热点话题失败",
      noData: "暂无热点话题数据",
      refreshing: "正在刷新数据...",
      refreshSuccess: "数据刷新成功",
      refreshFailed: "数据刷新失败",
      cacheExpired: "缓存已过期，正在重新获取...",
      networkError: "网络连接失败，请检查网络设置",
      serverError: "服务器错误，请稍后重试",
      dataParseError: "数据解析失败",
      requestTimeout: "请求超时，请重试"
    };

    this.enTranslations.hotTopics.service = {
      loading: "Loading hot topics...",
      loadingFailed: "Failed to load hot topics",
      noData: "No hot topics data available",
      refreshing: "Refreshing data...",
      refreshSuccess: "Data refreshed successfully",
      refreshFailed: "Failed to refresh data",
      cacheExpired: "Cache expired, fetching new data...",
      networkError: "Network connection failed, please check network settings",
      serverError: "Server error, please try again later",
      dataParseError: "Failed to parse data",
      requestTimeout: "Request timeout, please retry"
    };

    // 错误消息
    this.zhTranslations.hotTopics.errors = {
      fetchFailed: "获取热点话题失败",
      invalidResponse: "服务器响应无效",
      emptyResponse: "服务器返回空数据",
      parseError: "数据解析错误",
      networkTimeout: "网络请求超时",
      unauthorized: "未授权访问",
      rateLimitExceeded: "请求频率超限",
      serviceUnavailable: "服务暂不可用"
    };

    this.enTranslations.hotTopics.errors = {
      fetchFailed: "Failed to fetch hot topics",
      invalidResponse: "Invalid server response",
      emptyResponse: "Server returned empty data",
      parseError: "Data parsing error",
      networkTimeout: "Network request timeout",
      unauthorized: "Unauthorized access",
      rateLimitExceeded: "Rate limit exceeded",
      serviceUnavailable: "Service unavailable"
    };

    // 日志消息
    this.zhTranslations.hotTopics.logs = {
      fetchStart: "开始获取热点话题",
      fetchSuccess: "热点话题获取成功",
      fetchError: "热点话题获取失败",
      cacheHit: "使用缓存数据",
      cacheMiss: "缓存未命中，请求新数据",
      dataProcessing: "正在处理数据",
      dataProcessed: "数据处理完成",
      filterApplied: "已应用过滤条件",
      sortApplied: "已应用排序规则"
    };

    this.enTranslations.hotTopics.logs = {
      fetchStart: "Starting to fetch hot topics",
      fetchSuccess: "Hot topics fetched successfully",
      fetchError: "Failed to fetch hot topics",
      cacheHit: "Using cached data",
      cacheMiss: "Cache miss, requesting new data",
      dataProcessing: "Processing data",
      dataProcessed: "Data processing completed",
      filterApplied: "Filter conditions applied",
      sortApplied: "Sort rules applied"
    };

    // 状态消息
    this.zhTranslations.hotTopics.status = {
      idle: "空闲",
      loading: "加载中",
      success: "成功",
      error: "错误",
      refreshing: "刷新中",
      cached: "已缓存",
      expired: "已过期"
    };

    this.enTranslations.hotTopics.status = {
      idle: "Idle",
      loading: "Loading",
      success: "Success",
      error: "Error",
      refreshing: "Refreshing",
      cached: "Cached",
      expired: "Expired"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 服务消息
      {
        search: /'正在加载热点话题\.\.\.'/g,
        replace: "t('hotTopics.service.loading')"
      },
      {
        search: /'加载热点话题失败'/g,
        replace: "t('hotTopics.service.loadingFailed')"
      },
      {
        search: /'暂无热点话题数据'/g,
        replace: "t('hotTopics.service.noData')"
      },
      {
        search: /'正在刷新数据\.\.\.'/g,
        replace: "t('hotTopics.service.refreshing')"
      },
      {
        search: /'数据刷新成功'/g,
        replace: "t('hotTopics.service.refreshSuccess')"
      },
      {
        search: /'数据刷新失败'/g,
        replace: "t('hotTopics.service.refreshFailed')"
      },
      {
        search: /'缓存已过期，正在重新获取\.\.\.'/g,
        replace: "t('hotTopics.service.cacheExpired')"
      },
      {
        search: /'网络连接失败，请检查网络设置'/g,
        replace: "t('hotTopics.service.networkError')"
      },
      {
        search: /'服务器错误，请稍后重试'/g,
        replace: "t('hotTopics.service.serverError')"
      },
      {
        search: /'数据解析失败'/g,
        replace: "t('hotTopics.service.dataParseError')"
      },
      {
        search: /'请求超时，请重试'/g,
        replace: "t('hotTopics.service.requestTimeout')"
      },

      // 错误消息
      {
        search: /'获取热点话题失败'/g,
        replace: "t('hotTopics.errors.fetchFailed')"
      },
      {
        search: /'服务器响应无效'/g,
        replace: "t('hotTopics.errors.invalidResponse')"
      },
      {
        search: /'服务器返回空数据'/g,
        replace: "t('hotTopics.errors.emptyResponse')"
      },
      {
        search: /'数据解析错误'/g,
        replace: "t('hotTopics.errors.parseError')"
      },
      {
        search: /'网络请求超时'/g,
        replace: "t('hotTopics.errors.networkTimeout')"
      },
      {
        search: /'未授权访问'/g,
        replace: "t('hotTopics.errors.unauthorized')"
      },
      {
        search: /'请求频率超限'/g,
        replace: "t('hotTopics.errors.rateLimitExceeded')"
      },
      {
        search: /'服务暂不可用'/g,
        replace: "t('hotTopics.errors.serviceUnavailable')"
      },

      // 日志消息
      {
        search: /'开始获取热点话题'/g,
        replace: "t('hotTopics.logs.fetchStart')"
      },
      {
        search: /'热点话题获取成功'/g,
        replace: "t('hotTopics.logs.fetchSuccess')"
      },
      {
        search: /'热点话题获取失败'/g,
        replace: "t('hotTopics.logs.fetchError')"
      },
      {
        search: /'使用缓存数据'/g,
        replace: "t('hotTopics.logs.cacheHit')"
      },
      {
        search: /'缓存未命中，请求新数据'/g,
        replace: "t('hotTopics.logs.cacheMiss')"
      },
      {
        search: /'正在处理数据'/g,
        replace: "t('hotTopics.logs.dataProcessing')"
      },
      {
        search: /'数据处理完成'/g,
        replace: "t('hotTopics.logs.dataProcessed')"
      },
      {
        search: /'已应用过滤条件'/g,
        replace: "t('hotTopics.logs.filterApplied')"
      },
      {
        search: /'已应用排序规则'/g,
        replace: "t('hotTopics.logs.sortApplied')"
      },

      // 状态消息
      {
        search: /'空闲'/g,
        replace: "t('hotTopics.status.idle')"
      },
      {
        search: /'加载中'/g,
        replace: "t('hotTopics.status.loading')"
      },
      {
        search: /'成功'/g,
        replace: "t('hotTopics.status.success')"
      },
      {
        search: /'错误'/g,
        replace: "t('hotTopics.status.error')"
      },
      {
        search: /'刷新中'/g,
        replace: "t('hotTopics.status.refreshing')"
      },
      {
        search: /'已缓存'/g,
        replace: "t('hotTopics.status.cached')"
      },
      {
        search: /'已过期'/g,
        replace: "t('hotTopics.status.expired')"
      }
    ];
  }

  /**
   * 处理服务文件
   */
  async processServiceFile() {
    console.log('📝 处理服务文件...');
    
    if (!fs.existsSync(SERVICE_PATH)) {
      console.log(`⚠️ 服务文件不存在: ${SERVICE_PATH}，跳过处理`);
      return;
    }

    let content = fs.readFileSync(SERVICE_PATH, 'utf8');
    
    // 应用所有替换
    for (const replacement of this.replacements) {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        this.processedCount += matches.length;
      }
    }

    fs.writeFileSync(SERVICE_PATH, content, 'utf8');
    console.log(`✅ 服务文件处理完成，替换了 ${this.processedCount} 处文本`);
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
const processor = new HotTopicsServiceI18n();
processor.run().catch(console.error);
