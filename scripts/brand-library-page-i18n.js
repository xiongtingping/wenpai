#!/usr/bin/env node

/**
 * BrandLibraryPage 国际化自动替换脚本
 * 处理品牌库页面的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PAGE_PATH = 'src/pages/BrandLibraryPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class BrandLibraryPageI18n {
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
    console.log('🏢 开始 BrandLibraryPage 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理页面文件
      await this.processPageFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ BrandLibraryPage 国际化完成！`);
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

    // 确保brandLibrary部分存在
    if (!this.zhTranslations.brandLibrary) {
      this.zhTranslations.brandLibrary = {};
    }
    if (!this.enTranslations.brandLibrary) {
      this.enTranslations.brandLibrary = {};
    }

    // 品牌库页面翻译
    this.zhTranslations.brandLibrary = {
      // 页面标题和导航
      title: "品牌库",
      subtitle: "管理您的品牌资产和素材",
      navigation: {
        home: "首页",
        brands: "品牌",
        assets: "素材",
        templates: "模板",
        settings: "设置"
      },
      
      // 搜索和筛选
      search: {
        placeholder: "搜索品牌、产品或关键词...",
        filter: "筛选",
        sort: "排序",
        category: "分类",
        brand: "品牌",
        product: "产品",
        keyword: "关键词",
        all: "全部",
        recent: "最近",
        popular: "热门",
        alphabetical: "字母顺序",
        dateCreated: "创建时间",
        dateModified: "修改时间"
      },
      
      // 品牌信息
      brand: {
        name: "品牌名称",
        logo: "品牌标志",
        description: "品牌描述",
        website: "官方网站",
        industry: "所属行业",
        founded: "成立时间",
        headquarters: "总部地址",
        employees: "员工数量",
        revenue: "年营收",
        products: "主要产品",
        services: "主要服务",
        mission: "使命愿景",
        values: "核心价值",
        culture: "企业文化"
      },
      
      // 素材类型
      assets: {
        logo: "标志",
        images: "图片",
        videos: "视频",
        documents: "文档",
        templates: "模板",
        guidelines: "品牌指南",
        colors: "品牌色彩",
        fonts: "品牌字体",
        icons: "图标",
        patterns: "图案",
        textures: "纹理",
        backgrounds: "背景"
      },
      
      // 操作
      actions: {
        add: "添加",
        edit: "编辑",
        delete: "删除",
        copy: "复制",
        download: "下载",
        share: "分享",
        preview: "预览",
        upload: "上传",
        import: "导入",
        export: "导出",
        save: "保存",
        cancel: "取消",
        confirm: "确认",
        view: "查看",
        manage: "管理"
      },
      
      // 状态
      status: {
        loading: "加载中...",
        empty: "暂无数据",
        error: "加载失败",
        success: "操作成功",
        uploading: "上传中...",
        processing: "处理中...",
        completed: "已完成",
        failed: "操作失败",
        pending: "待处理",
        approved: "已审核",
        rejected: "已拒绝"
      },
      
      // 表单
      form: {
        required: "必填项",
        optional: "选填项",
        placeholder: {
          brandName: "请输入品牌名称",
          description: "请输入品牌描述",
          website: "请输入网站地址",
          industry: "请选择所属行业",
          keywords: "请输入关键词，用逗号分隔"
        },
        validation: {
          required: "此字段为必填项",
          invalidUrl: "请输入有效的网址",
          invalidEmail: "请输入有效的邮箱地址",
          tooShort: "内容太短",
          tooLong: "内容太长",
          invalidFormat: "格式不正确"
        }
      },
      
      // 消息提示
      messages: {
        addSuccess: "品牌添加成功",
        editSuccess: "品牌编辑成功",
        deleteSuccess: "品牌删除成功",
        uploadSuccess: "文件上传成功",
        downloadSuccess: "文件下载成功",
        copySuccess: "内容已复制到剪贴板",
        shareSuccess: "分享链接已生成",
        addError: "品牌添加失败",
        editError: "品牌编辑失败",
        deleteError: "品牌删除失败",
        uploadError: "文件上传失败",
        downloadError: "文件下载失败",
        networkError: "网络连接失败",
        permissionError: "权限不足",
        fileTypeError: "文件类型不支持",
        fileSizeError: "文件大小超出限制",
        duplicateError: "品牌名称已存在"
      },
      
      // 对话框
      dialogs: {
        delete: {
          title: "删除确认",
          message: "确定要删除这个品牌吗？此操作不可撤销。",
          confirm: "确定删除",
          cancel: "取消"
        },
        upload: {
          title: "上传文件",
          message: "请选择要上传的文件",
          dragDrop: "拖拽文件到此处或点击选择",
          fileTypes: "支持的文件类型",
          maxSize: "最大文件大小"
        },
        share: {
          title: "分享品牌",
          message: "选择分享方式",
          link: "复制链接",
          email: "邮件分享",
          social: "社交媒体"
        }
      },
      
      // 统计信息
      stats: {
        totalBrands: "品牌总数",
        totalAssets: "素材总数",
        recentUploads: "最近上传",
        popularBrands: "热门品牌",
        storageUsed: "已用存储",
        storageTotal: "总存储空间"
      },
      
      // 设置
      settings: {
        general: "常规设置",
        display: "显示设置",
        privacy: "隐私设置",
        notifications: "通知设置",
        storage: "存储设置",
        backup: "备份设置",
        theme: "主题设置",
        language: "语言设置"
      }
    };

    this.enTranslations.brandLibrary = {
      // 页面标题和导航
      title: "Brand Library",
      subtitle: "Manage your brand assets and materials",
      navigation: {
        home: "Home",
        brands: "Brands",
        assets: "Assets",
        templates: "Templates",
        settings: "Settings"
      },
      
      // 搜索和筛选
      search: {
        placeholder: "Search brands, products or keywords...",
        filter: "Filter",
        sort: "Sort",
        category: "Category",
        brand: "Brand",
        product: "Product",
        keyword: "Keyword",
        all: "All",
        recent: "Recent",
        popular: "Popular",
        alphabetical: "Alphabetical",
        dateCreated: "Date Created",
        dateModified: "Date Modified"
      },
      
      // 品牌信息
      brand: {
        name: "Brand Name",
        logo: "Brand Logo",
        description: "Brand Description",
        website: "Official Website",
        industry: "Industry",
        founded: "Founded",
        headquarters: "Headquarters",
        employees: "Employees",
        revenue: "Annual Revenue",
        products: "Main Products",
        services: "Main Services",
        mission: "Mission & Vision",
        values: "Core Values",
        culture: "Corporate Culture"
      },
      
      // 素材类型
      assets: {
        logo: "Logo",
        images: "Images",
        videos: "Videos",
        documents: "Documents",
        templates: "Templates",
        guidelines: "Brand Guidelines",
        colors: "Brand Colors",
        fonts: "Brand Fonts",
        icons: "Icons",
        patterns: "Patterns",
        textures: "Textures",
        backgrounds: "Backgrounds"
      },
      
      // 操作
      actions: {
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        copy: "Copy",
        download: "Download",
        share: "Share",
        preview: "Preview",
        upload: "Upload",
        import: "Import",
        export: "Export",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        view: "View",
        manage: "Manage"
      },
      
      // 状态
      status: {
        loading: "Loading...",
        empty: "No data",
        error: "Load failed",
        success: "Operation successful",
        uploading: "Uploading...",
        processing: "Processing...",
        completed: "Completed",
        failed: "Operation failed",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected"
      },
      
      // 表单
      form: {
        required: "Required",
        optional: "Optional",
        placeholder: {
          brandName: "Enter brand name",
          description: "Enter brand description",
          website: "Enter website URL",
          industry: "Select industry",
          keywords: "Enter keywords, separated by commas"
        },
        validation: {
          required: "This field is required",
          invalidUrl: "Please enter a valid URL",
          invalidEmail: "Please enter a valid email address",
          tooShort: "Content too short",
          tooLong: "Content too long",
          invalidFormat: "Invalid format"
        }
      },
      
      // 消息提示
      messages: {
        addSuccess: "Brand added successfully",
        editSuccess: "Brand edited successfully",
        deleteSuccess: "Brand deleted successfully",
        uploadSuccess: "File uploaded successfully",
        downloadSuccess: "File downloaded successfully",
        copySuccess: "Content copied to clipboard",
        shareSuccess: "Share link generated",
        addError: "Failed to add brand",
        editError: "Failed to edit brand",
        deleteError: "Failed to delete brand",
        uploadError: "Failed to upload file",
        downloadError: "Failed to download file",
        networkError: "Network connection failed",
        permissionError: "Insufficient permissions",
        fileTypeError: "File type not supported",
        fileSizeError: "File size exceeds limit",
        duplicateError: "Brand name already exists"
      },
      
      // 对话框
      dialogs: {
        delete: {
          title: "Delete Confirmation",
          message: "Are you sure you want to delete this brand? This action cannot be undone.",
          confirm: "Confirm Delete",
          cancel: "Cancel"
        },
        upload: {
          title: "Upload File",
          message: "Please select files to upload",
          dragDrop: "Drag files here or click to select",
          fileTypes: "Supported file types",
          maxSize: "Maximum file size"
        },
        share: {
          title: "Share Brand",
          message: "Choose sharing method",
          link: "Copy Link",
          email: "Email Share",
          social: "Social Media"
        }
      },
      
      // 统计信息
      stats: {
        totalBrands: "Total Brands",
        totalAssets: "Total Assets",
        recentUploads: "Recent Uploads",
        popularBrands: "Popular Brands",
        storageUsed: "Storage Used",
        storageTotal: "Total Storage"
      },
      
      // 设置
      settings: {
        general: "General Settings",
        display: "Display Settings",
        privacy: "Privacy Settings",
        notifications: "Notification Settings",
        storage: "Storage Settings",
        backup: "Backup Settings",
        theme: "Theme Settings",
        language: "Language Settings"
      }
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 页面标题
      {
        search: /"品牌库"/g,
        replace: "t('brandLibrary.title')"
      },
      {
        search: /"管理您的品牌资产和素材"/g,
        replace: "t('brandLibrary.subtitle')"
      },

      // 导航
      {
        search: /"首页"/g,
        replace: "t('brandLibrary.navigation.home')"
      },
      {
        search: /"品牌"/g,
        replace: "t('brandLibrary.navigation.brands')"
      },
      {
        search: /"素材"/g,
        replace: "t('brandLibrary.navigation.assets')"
      },
      {
        search: /"模板"/g,
        replace: "t('brandLibrary.navigation.templates')"
      },
      {
        search: /"设置"/g,
        replace: "t('brandLibrary.navigation.settings')"
      },

      // 搜索
      {
        search: /"搜索品牌、产品或关键词\.\.\."/g,
        replace: "t('brandLibrary.search.placeholder')"
      },
      {
        search: /"筛选"/g,
        replace: "t('brandLibrary.search.filter')"
      },
      {
        search: /"排序"/g,
        replace: "t('brandLibrary.search.sort')"
      },
      {
        search: /"分类"/g,
        replace: "t('brandLibrary.search.category')"
      },
      {
        search: /"产品"/g,
        replace: "t('brandLibrary.search.product')"
      },
      {
        search: /"关键词"/g,
        replace: "t('brandLibrary.search.keyword')"
      },
      {
        search: /"全部"/g,
        replace: "t('brandLibrary.search.all')"
      },
      {
        search: /"最近"/g,
        replace: "t('brandLibrary.search.recent')"
      },
      {
        search: /"热门"/g,
        replace: "t('brandLibrary.search.popular')"
      },

      // 品牌信息
      {
        search: /"品牌名称"/g,
        replace: "t('brandLibrary.brand.name')"
      },
      {
        search: /"品牌标志"/g,
        replace: "t('brandLibrary.brand.logo')"
      },
      {
        search: /"品牌描述"/g,
        replace: "t('brandLibrary.brand.description')"
      },
      {
        search: /"官方网站"/g,
        replace: "t('brandLibrary.brand.website')"
      },
      {
        search: /"所属行业"/g,
        replace: "t('brandLibrary.brand.industry')"
      },

      // 操作
      {
        search: /"添加"/g,
        replace: "t('brandLibrary.actions.add')"
      },
      {
        search: /"编辑"/g,
        replace: "t('brandLibrary.actions.edit')"
      },
      {
        search: /"删除"/g,
        replace: "t('brandLibrary.actions.delete')"
      },
      {
        search: /"复制"/g,
        replace: "t('brandLibrary.actions.copy')"
      },
      {
        search: /"下载"/g,
        replace: "t('brandLibrary.actions.download')"
      },
      {
        search: /"分享"/g,
        replace: "t('brandLibrary.actions.share')"
      },
      {
        search: /"预览"/g,
        replace: "t('brandLibrary.actions.preview')"
      },
      {
        search: /"上传"/g,
        replace: "t('brandLibrary.actions.upload')"
      },
      {
        search: /"导入"/g,
        replace: "t('brandLibrary.actions.import')"
      },
      {
        search: /"导出"/g,
        replace: "t('brandLibrary.actions.export')"
      },
      {
        search: /"保存"/g,
        replace: "t('brandLibrary.actions.save')"
      },
      {
        search: /"取消"/g,
        replace: "t('brandLibrary.actions.cancel')"
      },
      {
        search: /"确认"/g,
        replace: "t('brandLibrary.actions.confirm')"
      },
      {
        search: /"查看"/g,
        replace: "t('brandLibrary.actions.view')"
      },
      {
        search: /"管理"/g,
        replace: "t('brandLibrary.actions.manage')"
      },

      // 状态
      {
        search: /"加载中\.\.\."/g,
        replace: "t('brandLibrary.status.loading')"
      },
      {
        search: /"暂无数据"/g,
        replace: "t('brandLibrary.status.empty')"
      },
      {
        search: /"加载失败"/g,
        replace: "t('brandLibrary.status.error')"
      },
      {
        search: /"操作成功"/g,
        replace: "t('brandLibrary.status.success')"
      },
      {
        search: /"上传中\.\.\."/g,
        replace: "t('brandLibrary.status.uploading')"
      },
      {
        search: /"处理中\.\.\."/g,
        replace: "t('brandLibrary.status.processing')"
      },
      {
        search: /"已完成"/g,
        replace: "t('brandLibrary.status.completed')"
      },
      {
        search: /"操作失败"/g,
        replace: "t('brandLibrary.status.failed')"
      }
    ];
  }

  /**
   * 处理页面文件
   */
  async processPageFile() {
    console.log('📝 处理页面文件...');
    
    if (!fs.existsSync(PAGE_PATH)) {
      console.log(`⚠️ 文件不存在: ${PAGE_PATH}，跳过处理`);
      return;
    }

    let content = fs.readFileSync(PAGE_PATH, 'utf8');
    
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
const processor = new BrandLibraryPageI18n();
processor.run().catch(console.error);
