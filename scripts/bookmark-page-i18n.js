#!/usr/bin/env node

/**
 * BookmarkPage 国际化自动替换脚本
 * 处理智能收藏页面的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PAGE_PATH = 'src/pages/BookmarkPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class BookmarkPageI18n {
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
    console.log('📚 开始 BookmarkPage 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理页面文件
      await this.processPageFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ BookmarkPage 国际化完成！`);
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

    // 确保bookmark部分存在
    if (!this.zhTranslations.bookmark) {
      this.zhTranslations.bookmark = {};
    }
    if (!this.enTranslations.bookmark) {
      this.enTranslations.bookmark = {};
    }

    // 存储相关
    this.zhTranslations.bookmark.storage = {
      useStorageKey: "使用存储键",
      unavailable: "不可用",
      cannotAccessLocalStorage: "无法访问本地存储",
      dataMayNotSave: "数据可能无法保存",
      cannotAccessLocalStorageAndDataMayNotSave: "无法访问本地存储，数据可能无法保存",
      cleaned: "已清理",
      corruptedDataItems: "项损坏的数据",
      initEmptyLibrary: "初始化空资料库",
      loadDataFailed: "加载数据失败",
      cannotLoadSavedData: "无法加载已保存的数据",
      startFromBlank: "将从空白开始",
      whenUserChanges: "当用户变化时重新加载数据",
      dataSaveSuccess: "数据保存成功",
      warning: "警告",
      currentlyUsed: "当前已使用",
      storageSpace: "存储空间",
      dataSaveFailed: "数据保存失败",
      failed: "失败",
      dataSaveFailedRetry: "数据保存失败，请重试或联系管理员"
    };

    this.enTranslations.bookmark.storage = {
      useStorageKey: "Use storage key",
      unavailable: "Unavailable",
      cannotAccessLocalStorage: "Cannot access local storage",
      dataMayNotSave: "Data may not be saved",
      cannotAccessLocalStorageAndDataMayNotSave: "Cannot access local storage, data may not be saved",
      cleaned: "Cleaned",
      corruptedDataItems: "corrupted data items",
      initEmptyLibrary: "Initialize empty library",
      loadDataFailed: "Failed to load data",
      cannotLoadSavedData: "Cannot load saved data",
      startFromBlank: "Will start from blank",
      whenUserChanges: "Reload data when user changes",
      dataSaveSuccess: "Data saved successfully",
      warning: "Warning",
      currentlyUsed: "Currently used",
      storageSpace: "storage space",
      dataSaveFailed: "Data save failed",
      failed: "Failed",
      dataSaveFailedRetry: "Data save failed, please retry or contact administrator"
    };

    // 内容提取相关
    this.zhTranslations.bookmark.extraction = {
      pleaseInput: "请输入",
      pleaseUploadFile: "请上传要提取内容的文件",
      contentExtraction: "内容提取",
      contentExtractionFailed: "内容提取失败",
      pleaseCheck: "请检查",
      configuration: "配置",
      intelligentExtractedContent: "从网页中智能提取的结构化内容",
      coreInfoAndKeyPoints: "包含核心信息和关键观点",
      through: "通过",
      ocrTechExtractText: "技术从图片中识别提取的文字内容",
      from: "从",
      documentTextAndStructure: "文档中提取的文字和结构化信息",
      intelligentExtractedCore: "从文档中智能提取的核心内容",
      contentExtractedAndAdded: "内容已智能提取并添加到资料库",
      checkNetworkOrFormat: "请检查网络连接或文件格式后重试"
    };

    this.enTranslations.bookmark.extraction = {
      pleaseInput: "Please input",
      pleaseUploadFile: "Please upload file to extract content",
      contentExtraction: "Content Extraction",
      contentExtractionFailed: "Content extraction failed",
      pleaseCheck: "Please check",
      configuration: "configuration",
      intelligentExtractedContent: "Intelligently extracted structured content from web pages",
      coreInfoAndKeyPoints: "Contains core information and key points",
      through: "Through",
      ocrTechExtractText: "OCR technology to extract text content from images",
      from: "From",
      documentTextAndStructure: "Text and structured information extracted from documents",
      intelligentExtractedCore: "Core content intelligently extracted from documents",
      contentExtractedAndAdded: "Content has been intelligently extracted and added to library",
      checkNetworkOrFormat: "Please check network connection or file format and retry"
    };

    // 操作相关
    this.zhTranslations.bookmark.actions = {
      titleAndContentRequired: "标题和内容不能为空",
      newBookmarkSaved: "新收藏已保存到资料库",
      titleAndContentCannotBeEmpty: "标题和内容不能为空",
      newContentSaved: "新文案已保存到资料库",
      contentCopied: "内容已复制",
      deleteItem: "删除项目",
      itemRemovedPermanently: "项目已从资料库中永久移除",
      contentUpdated: "内容已更新",
      contentCopiedToClipboard: "内容已复制到剪贴板",
      removedFromBookmarks: "已从我的收藏中移除"
    };

    this.enTranslations.bookmark.actions = {
      titleAndContentRequired: "Title and content cannot be empty",
      newBookmarkSaved: "New bookmark saved to library",
      titleAndContentCannotBeEmpty: "Title and content cannot be empty",
      newContentSaved: "New content saved to library",
      contentCopied: "Content copied",
      deleteItem: "Delete item",
      itemRemovedPermanently: "Item permanently removed from library",
      contentUpdated: "Content updated",
      contentCopiedToClipboard: "Content copied to clipboard",
      removedFromBookmarks: "Removed from my bookmarks"
    };

    // UI界面相关
    this.zhTranslations.bookmark.ui = {
      webClipping: "网络剪藏",
      createCopywriting: "创建文案",
      exportData: "导出资料",
      noWebClipping: "暂无网络剪藏",
      webClippingDialog: "网络剪藏对话框",
      createCopywritingDialog: "创建文案对话框",
      addWebContentToLibrary: "添加网络内容到资料库",
      createNewCopywritingContent: "创建新的文案内容"
    };

    this.enTranslations.bookmark.ui = {
      webClipping: "Web Clipping",
      createCopywriting: "Create Copywriting",
      exportData: "Export Data",
      noWebClipping: "No web clipping",
      webClippingDialog: "Web Clipping Dialog",
      createCopywritingDialog: "Create Copywriting Dialog",
      addWebContentToLibrary: "Add web content to library",
      createNewCopywritingContent: "Create new copywriting content"
    };

    // 导出相关
    this.zhTranslations.bookmark.export = {
      myLibraryExport: "我的资料库导出",
      exportTime: "导出时间",
      totalMaterials: "总计资料",
      items: "项",
      libraryContent: "资料库内容",
      type: "类型",
      createTime: "创建时间",
      source: "来源",
      category: "分类",
      tags: "标签",
      content: "内容",
      summary: "摘要",
      myBookmarkContent: "我的收藏内容",
      bookmarkTime: "收藏时间",
      platform: "平台",
      exported: "已导出",
      itemsToFile: "项资料到文件",
      file: "文件",
      exportFailed: "导出失败",
      exportError: "导出过程中发生错误",
      pleaseRetry: "请重试"
    };

    this.enTranslations.bookmark.export = {
      myLibraryExport: "My Library Export",
      exportTime: "Export Time",
      totalMaterials: "Total Materials",
      items: "items",
      libraryContent: "Library Content",
      type: "Type",
      createTime: "Create Time",
      source: "Source",
      category: "Category",
      tags: "Tags",
      content: "Content",
      summary: "Summary",
      myBookmarkContent: "My Bookmark Content",
      bookmarkTime: "Bookmark Time",
      platform: "Platform",
      exported: "Exported",
      itemsToFile: "items to file",
      file: "file",
      exportFailed: "Export failed",
      exportError: "Error occurred during export",
      pleaseRetry: "Please retry"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 存储相关 - 处理各种引号和上下文
      {
        search: /['"`]使用存储键['"`]/g,
        replace: "t('bookmark.storage.useStorageKey')"
      },
      {
        search: /localStorage['"`]?不可用['"`]?/g,
        replace: "localStorage ${t('bookmark.storage.unavailable')}"
      },
      {
        search: /['"`]无法访问本地存储，数据可能无法保存['"`]/g,
        replace: "t('bookmark.storage.cannotAccessLocalStorageAndDataMayNotSave')"
      },
      {
        search: /['"`]无法访问本地存储['"`]/g,
        replace: "t('bookmark.storage.cannotAccessLocalStorage')"
      },
      {
        search: /['"`]数据可能无法保存['"`]/g,
        replace: "t('bookmark.storage.dataMayNotSave')"
      },
      {
        search: /'已清理'/g,
        replace: "t('bookmark.storage.cleaned')"
      },
      {
        search: /'项损坏的数据'/g,
        replace: "t('bookmark.storage.corruptedDataItems')"
      },
      {
        search: /'初始化空资料库'/g,
        replace: "t('bookmark.storage.initEmptyLibrary')"
      },
      {
        search: /'加载数据失败'/g,
        replace: "t('bookmark.storage.loadDataFailed')"
      },
      {
        search: /'无法加载已保存的数据'/g,
        replace: "t('bookmark.storage.cannotLoadSavedData')"
      },
      {
        search: /'将从空白开始'/g,
        replace: "t('bookmark.storage.startFromBlank')"
      },
      {
        search: /'当用户.*?变化时重新加载数据'/g,
        replace: "t('bookmark.storage.whenUserChanges')"
      },
      {
        search: /'数据保存成功'/g,
        replace: "t('bookmark.storage.dataSaveSuccess')"
      },
      {
        search: /'警告'/g,
        replace: "t('bookmark.storage.warning')"
      },
      {
        search: /'当前已使用'/g,
        replace: "t('bookmark.storage.currentlyUsed')"
      },
      {
        search: /'存储空间'/g,
        replace: "t('bookmark.storage.storageSpace')"
      },
      {
        search: /'数据保存失败'/g,
        replace: "t('bookmark.storage.dataSaveFailed')"
      },
      {
        search: /'失败'/g,
        replace: "t('bookmark.storage.failed')"
      },
      {
        search: /'数据保存失败，请重试或联系管理员'/g,
        replace: "t('bookmark.storage.dataSaveFailedRetry')"
      },

      // 内容提取相关
      {
        search: /'请输入'/g,
        replace: "t('bookmark.extraction.pleaseInput')"
      },
      {
        search: /'请上传要提取内容的文件'/g,
        replace: "t('bookmark.extraction.pleaseUploadFile')"
      },
      {
        search: /'内容提取'/g,
        replace: "t('bookmark.extraction.contentExtraction')"
      },
      {
        search: /'内容提取失败'/g,
        replace: "t('bookmark.extraction.contentExtractionFailed')"
      },
      {
        search: /'请检查'/g,
        replace: "t('bookmark.extraction.pleaseCheck')"
      },
      {
        search: /'配置'/g,
        replace: "t('bookmark.extraction.configuration')"
      },
      {
        search: /'从网页中智能提取的结构化内容'/g,
        replace: "t('bookmark.extraction.intelligentExtractedContent')"
      },
      {
        search: /'包含核心信息和关键观点'/g,
        replace: "t('bookmark.extraction.coreInfoAndKeyPoints')"
      },
      {
        search: /'通过'/g,
        replace: "t('bookmark.extraction.through')"
      },
      {
        search: /'技术从图片中识别提取的文字内容'/g,
        replace: "t('bookmark.extraction.ocrTechExtractText')"
      },
      {
        search: /'从'/g,
        replace: "t('bookmark.extraction.from')"
      },
      {
        search: /'文档中提取的文字和结构化信息'/g,
        replace: "t('bookmark.extraction.documentTextAndStructure')"
      },
      {
        search: /'从文档中智能提取的核心内容'/g,
        replace: "t('bookmark.extraction.intelligentExtractedCore')"
      },
      {
        search: /'内容已智能提取并添加到资料库'/g,
        replace: "t('bookmark.extraction.contentExtractedAndAdded')"
      },
      {
        search: /'请检查网络连接或文件格式后重试'/g,
        replace: "t('bookmark.extraction.checkNetworkOrFormat')"
      },

      // 操作相关
      {
        search: /'标题和.*?不能为空'/g,
        replace: "t('bookmark.actions.titleAndContentCannotBeEmpty')"
      },
      {
        search: /'新收藏已保存到资料库'/g,
        replace: "t('bookmark.actions.newBookmarkSaved')"
      },
      {
        search: /'新文案已保存到资料库'/g,
        replace: "t('bookmark.actions.newContentSaved')"
      },
      {
        search: /'内容已复制'/g,
        replace: "t('bookmark.actions.contentCopied')"
      },
      {
        search: /'删除项目'/g,
        replace: "t('bookmark.actions.deleteItem')"
      },
      {
        search: /'项目已从资料库中永久移除'/g,
        replace: "t('bookmark.actions.itemRemovedPermanently')"
      },
      {
        search: /'内容已更新'/g,
        replace: "t('bookmark.actions.contentUpdated')"
      },
      {
        search: /'内容已复制到剪贴板'/g,
        replace: "t('bookmark.actions.contentCopiedToClipboard')"
      },
      {
        search: /'已从我的收藏中移除'/g,
        replace: "t('bookmark.actions.removedFromBookmarks')"
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
      const componentMatch = content.match(/export default function BookmarkPage\(\) \{/);
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
const processor = new BookmarkPageI18n();
processor.run().catch(console.error);
