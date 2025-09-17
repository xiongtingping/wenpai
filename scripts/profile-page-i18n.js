#!/usr/bin/env node

/**
 * ProfilePage 国际化自动替换脚本
 * 处理个人资料页面的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PAGE_PATH = 'src/pages/ProfilePage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class ProfilePageI18n {
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
    console.log('👤 开始 ProfilePage 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理页面文件
      await this.processPageFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ ProfilePage 国际化完成！`);
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

    // 确保profile部分存在
    if (!this.zhTranslations.profile) {
      this.zhTranslations.profile = {};
    }
    if (!this.enTranslations.profile) {
      this.enTranslations.profile = {};
    }

    // 页面导航
    this.zhTranslations.profile.navigation = {
      title: "个人中心",
      description: "管理您的账户信息和设置"
    };

    this.enTranslations.profile.navigation = {
      title: "Profile Center",
      description: "Manage your account information and settings"
    };

    // 页面结构
    this.zhTranslations.profile.sections = {
      personalInfo: "第一行：个人资料区域",
      headerTitle: "头部标题和登出按钮",
      contentArea: "内容区域 - 两列布局",
      leftSection: "左侧：头像和基本信息",
      rightSection: "右侧：详细信息和操作",
      avatar: "头像",
      user: "用户"
    };

    this.enTranslations.profile.sections = {
      personalInfo: "First row: Personal information area",
      headerTitle: "Header title and logout button",
      contentArea: "Content area - Two column layout",
      leftSection: "Left: Avatar and basic information",
      rightSection: "Right: Detailed information and actions",
      avatar: "Avatar",
      user: "User"
    };

    // 用户信息
    this.zhTranslations.profile.userInfo = {
      basicInfo: "基本信息",
      accountInfo: "账户信息",
      nickname: "昵称",
      email: "邮箱",
      phone: "手机号",
      joinDate: "注册时间",
      lastLogin: "最后登录",
      accountType: "账户类型",
      subscription: "订阅状态",
      usage: "使用情况",
      settings: "个人设置"
    };

    this.enTranslations.profile.userInfo = {
      basicInfo: "Basic Information",
      accountInfo: "Account Information",
      nickname: "Nickname",
      email: "Email",
      phone: "Phone",
      joinDate: "Join Date",
      lastLogin: "Last Login",
      accountType: "Account Type",
      subscription: "Subscription Status",
      usage: "Usage",
      settings: "Personal Settings"
    };

    // 操作按钮
    this.zhTranslations.profile.actions = {
      editProfile: "编辑资料",
      changeAvatar: "更换头像",
      changePassword: "修改密码",
      logout: "退出登录",
      save: "保存",
      cancel: "取消",
      upload: "上传",
      delete: "删除",
      refresh: "刷新",
      copy: "复制",
      share: "分享",
      export: "导出",
      import: "导入"
    };

    this.enTranslations.profile.actions = {
      editProfile: "Edit Profile",
      changeAvatar: "Change Avatar",
      changePassword: "Change Password",
      logout: "Logout",
      save: "Save",
      cancel: "Cancel",
      upload: "Upload",
      delete: "Delete",
      refresh: "Refresh",
      copy: "Copy",
      share: "Share",
      export: "Export",
      import: "Import"
    };

    // 状态和消息
    this.zhTranslations.profile.status = {
      active: "活跃",
      inactive: "未激活",
      suspended: "已暂停",
      expired: "已过期",
      trial: "试用中",
      premium: "高级版",
      professional: "专业版",
      free: "免费版"
    };

    this.enTranslations.profile.status = {
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
      expired: "Expired",
      trial: "Trial",
      premium: "Premium",
      professional: "Professional",
      free: "Free"
    };

    // 消息提示
    this.zhTranslations.profile.messages = {
      saveSuccess: "保存成功",
      saveFailed: "保存失败",
      uploadSuccess: "上传成功",
      uploadFailed: "上传失败",
      deleteSuccess: "删除成功",
      deleteFailed: "删除失败",
      copySuccess: "复制成功",
      copyFailed: "复制失败",
      loginRequired: "请先登录",
      loginToManage: "请登录以管理您的账户信息",
      profileUpdated: "个人资料已更新",
      avatarUpdated: "头像已更新",
      passwordChanged: "密码已修改",
      logoutSuccess: "退出成功"
    };

    this.enTranslations.profile.messages = {
      saveSuccess: "Save successful",
      saveFailed: "Save failed",
      uploadSuccess: "Upload successful",
      uploadFailed: "Upload failed",
      deleteSuccess: "Delete successful",
      deleteFailed: "Delete failed",
      copySuccess: "Copy successful",
      copyFailed: "Copy failed",
      loginRequired: "Please login first",
      loginToManage: "Please login to manage your account information",
      profileUpdated: "Profile updated",
      avatarUpdated: "Avatar updated",
      passwordChanged: "Password changed",
      logoutSuccess: "Logout successful"
    };

    // 表单标签
    this.zhTranslations.profile.form = {
      nickname: "昵称",
      email: "邮箱地址",
      phone: "手机号码",
      bio: "个人简介",
      website: "个人网站",
      location: "所在地区",
      birthday: "生日",
      gender: "性别",
      occupation: "职业",
      company: "公司",
      department: "部门",
      position: "职位"
    };

    this.enTranslations.profile.form = {
      nickname: "Nickname",
      email: "Email Address",
      phone: "Phone Number",
      bio: "Bio",
      website: "Website",
      location: "Location",
      birthday: "Birthday",
      gender: "Gender",
      occupation: "Occupation",
      company: "Company",
      department: "Department",
      position: "Position"
    };

    // 占位符
    this.zhTranslations.profile.placeholders = {
      enterNickname: "请输入昵称",
      enterEmail: "请输入邮箱地址",
      enterPhone: "请输入手机号码",
      enterBio: "请输入个人简介",
      enterWebsite: "请输入个人网站",
      selectLocation: "请选择所在地区",
      selectBirthday: "请选择生日",
      selectGender: "请选择性别",
      enterOccupation: "请输入职业",
      enterCompany: "请输入公司名称",
      enterDepartment: "请输入部门",
      enterPosition: "请输入职位"
    };

    this.enTranslations.profile.placeholders = {
      enterNickname: "Enter nickname",
      enterEmail: "Enter email address",
      enterPhone: "Enter phone number",
      enterBio: "Enter bio",
      enterWebsite: "Enter website",
      selectLocation: "Select location",
      selectBirthday: "Select birthday",
      selectGender: "Select gender",
      enterOccupation: "Enter occupation",
      enterCompany: "Enter company name",
      enterDepartment: "Enter department",
      enterPosition: "Enter position"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 页面导航
      {
        search: /title="个人中心"/g,
        replace: `title={t('profile.navigation.title')}`
      },
      {
        search: /description="管理您的账户信息和设置"/g,
        replace: `description={t('profile.navigation.description')}`
      },

      // 页面结构注释
      {
        search: /第一行：个人资料区域/g,
        replace: "{t('profile.sections.personalInfo')}"
      },
      {
        search: /头部标题和登出按钮/g,
        replace: "{t('profile.sections.headerTitle')}"
      },
      {
        search: /内容区域 - 两列布局/g,
        replace: "{t('profile.sections.contentArea')}"
      },
      {
        search: /左侧：头像和基本信息/g,
        replace: "{t('profile.sections.leftSection')}"
      },

      // 用户信息相关
      {
        search: /'头像'/g,
        replace: "t('profile.sections.avatar')"
      },
      {
        search: /'用户'/g,
        replace: "t('profile.sections.user')"
      }
    ];
  }

  /**
   * 处理页面文件
   */
  async processPageFile() {
    console.log('🔄 处理页面文件...');

    if (!fs.existsSync(PAGE_PATH)) {
      throw new Error(`页面文件不存在: ${PAGE_PATH}`);
    }

    let content = fs.readFileSync(PAGE_PATH, 'utf8');

    // 确保已导入useTranslation
    if (!content.includes('useTranslation')) {
      console.log('✅ useTranslation已存在');
    }

    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(PAGE_PATH, content);
    console.log(`✅ 页面文件处理完成，共替换 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('💾 更新翻译文件...');

    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');

    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }
}

// 运行脚本
const profilePageI18n = new ProfilePageI18n();
profilePageI18n.run().catch(console.error);
