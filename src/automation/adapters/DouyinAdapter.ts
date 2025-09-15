/**
 * 抖音平台适配器
 * 实现抖音特定的自动化发布逻辑
 */

import i18n from '@/i18n';
import { PlatformAdapterBase, LoginStatus, PublishOptions, PublishResult } from './PlatformAdapterBase';
import { logger } from '@/utils/logger';

export class DouyinAdapter extends PlatformAdapterBase {
  constructor(timeout: number = 30000) {
    super('douyin'); // 基类只接受 platformId 参数
    // 其他配置可以在类中定义
    this.platformName = '抖音';
    this.uploadUrl = 'https://creator.douyin.com/creator-micro/content/upload';
    this.timeout = timeout;
  }

  private platformName: string = '抖音';
  private uploadUrl: string = 'https://creator.douyin.com/creator-micro/content/upload';
  private timeout: number = 30000;

  /**
   * 检查抖音登录状态
   */
  async checkLoginStatus(): Promise<LoginStatus> {
    try {
      return {
        isLoggedIn: false, // 保守假设
        needsVerification: true,
        loginUrl: 'https://creator.douyin.com/'
      };
    } catch (error) {
      console.error('检查抖音登录状态失败:', error);
      return {
        isLoggedIn: false,
        needsVerification: true,
        loginUrl: 'https://creator.douyin.com/'
      };
    }
  }

  /**
   * 填充抖音内容
   */
  async fillContent(content: string, options?: PublishOptions): Promise<void> {
    try {
      console.log('📝 准备填充抖音内容...');

      // 检查内容长度（抖音限制2200字符）
      if (content.length > 2200) {
        console.warn('⚠️ 内容超过抖音2200字符限制，建议精简');
      }

      // 复制内容到剪贴板
      await this.copyToClipboard(content);

      // 抖音发布指引
      const instructions = `
        <strong>抖音发布步骤：</strong><br>
        1. 确保已登录抖音创作者中心<br>
        2. 点击"发布视频"或"发布图文"<br>
        3. 上传视频文件或图片<br>
        4. 在描述框中粘贴内容 (Ctrl+V 或 Cmd+V)<br>
        5. 添加合适的话题标签<br>
        6. 设置封面和标题<br>
        7. 选择发布时间和可见性<br>
        8. 点击"发布"按钮<br><br>
        
        <strong>当前内容信息：</strong><br>
        • 字符数：${content.length}/2200<br>
        • 状态：${content.length <= 2200 ? '✅ 符合长度要求' : '⚠️ 超出长度限制'}<br><br>
        
        <strong>抖音发布要点：</strong><br>
        • 必须上传视频或图片内容<br>
        • 使用热门音乐提高推荐<br>
        • 添加相关话题标签<br>
        • 选择合适的发布时间<br>
        • 封面图要吸引眼球
      `;

      this.showUserInstructions(instructions);

    } catch (error) {
      console.error('填充抖音内容失败:', error);
      throw error;
    }
  }

  /**
   * 触发抖音发布
   */
  async triggerPublish(): Promise<PublishResult> {
    // 抖音采用半自动化方案
    return {
      success: true,
      platformId: this.platformId, // 添加必需属性
      needsManualAction: true
      // manualInstructions: '请按照提示手动完成抖音发布' // 移除不支持的属性
    };
  }

  /**
   * 处理抖音特殊情况
   */
  async handleSpecialCases(): Promise<void> {
    try {
      logger.debug('🔧 处理抖音特殊情况...');

      const specialInstructions = `
        <strong>抖音特殊注意事项：</strong><br>
        
        🎵 <strong>音乐选择：</strong><br>
        • 使用热门背景音乐<br>
        • 选择与内容匹配的音乐<br>
        • 关注音乐版权问题<br><br>
        
        🎬 <strong>视频要求：</strong><br>
        • 竖屏比例9:16最佳<br>
        • 时长建议15-60秒<br>
        • 画质清晰，声音清楚<br>
        • 前3秒要抓住注意力<br><br>
        
        📱 <strong>图文内容：</strong><br>
        • 支持多张图片轮播<br>
        • 图片比例9:16或1:1<br>
        • 文字要简洁有力<br><br>
        
        🏷️ <strong>标签策略：</strong><br>
        • 使用热门话题标签<br>
        • 添加地理位置<br>
        • 关联相关挑战<br><br>
        
        ⚠️ <strong>内容规范：</strong><br>
        • 避免违规内容<br>
        • 不要搬运他人作品<br>
        • 遵守社区规范<br>
        • 注意未成年人保护
      `;

      setTimeout(() => {
        this.showUserInstructions(specialInstructions);
      }, 3000);

    } catch (error) {
      console.error('处理抖音特殊情况失败:', error);
    }
  }

  /**
   * 抖音专用：话题标签优化
   */
  optimizeDouyinHashtags(content: string): string {
    // 检测现有话题标签
    const existingHashtags = content.match(/#[\u4e00-\u9fa5\w]+/g) || [];
    
    // 抖音话题标签建议
    const suggestedTags = [
      '#抖音小助手',
      '#热门',
      '#推荐',
      '#生活',
      '#分享',
      '#日常'
    ];

    let optimizedContent = content;

    // 如果没有话题标签，建议添加
    if (existingHashtags.length === 0) {
      const keywords = this.extractContentKeywords(content);
      if (keywords.length > 0) {
        optimizedContent += `\n\n#${keywords[0]} #抖音小助手`;
      } else {
        optimizedContent += '\n\n#分享 #抖音小助手';
      }
    }

    return optimizedContent;
  }

  /**
   * 提取内容关键词
   */
  private extractContentKeywords(content: string): string[] {
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没', '看', '好', '自己', '这', '那'];
    
    const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    const keywords = words
      .filter(word => !commonWords.includes(word))
      .filter(word => word.length >= 2 && word.length <= 4)
      .slice(0, 2);

    return keywords;
  }

  /**
   * 抖音专用：内容类型建议
   */
  getContentTypeSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    // 基于内容分析建议内容类型
    if (content.includes('教程') || content.includes('方法') || content.includes('技巧')) {
      suggestions.push('📚 教程类：制作分步骤的教学视频');
    }
    
    if (content.includes(i18n.t('common.text.分享_kpl')) || content.includes('推荐')) {
      suggestions.push('💡 分享类：展示产品或经验分享');
    }
    
    if (content.includes('生活') || content.includes('日常')) {
      suggestions.push('🏠 生活类：记录日常生活片段');
    }
    
    if (content.includes('美食') || content.includes('做菜')) {
      suggestions.push('🍳 美食类：制作美食制作过程');
    }

    // 默认建议
    if (suggestions.length === 0) {
      suggestions.push('🎬 图文轮播：制作多张图片的轮播内容');
      suggestions.push('🎤 口播视频：真人出镜讲解内容');
    }

    return suggestions;
  }

  /**
   * 抖音专用：执行增强发布流程
   */
  async executeEnhancedPublish(content: string, options?: PublishOptions): Promise<PublishResult> {
    try {
      logger.system('🚀 开始抖音增强发布流程...');

      // 1. 内容优化
      const optimizedContent = this.optimizeDouyinHashtags(content);
      const contentTypeSuggestions = this.getContentTypeSuggestions(content);

      // 2. 显示优化建议
      const optimizationInfo = `
        <strong>📊 抖音内容优化：</strong><br><br>
        
        <strong>🎯 内容类型建议：</strong><br>
        ${contentTypeSuggestions.map(s => `• ${s}`).join('<br>')}<br><br>
        
        <strong>⏰ 最佳发布时间：</strong><br>
        • 工作日：12:00-13:00, 18:00-20:00<br>
        • 周末：10:00-12:00, 14:00-16:00, 19:00-21:00<br><br>
        
        <strong>📈 提升技巧：</strong><br>
        • 前3秒要有亮点吸引观众<br>
        • 使用热门音乐和特效<br>
        • 积极回复评论互动<br>
        • 保持稳定的发布频率<br><br>
        
        <strong>🔥 热门要素：</strong><br>
        • 跟上热门话题和挑战<br>
        • 内容要有情感共鸣<br>
        • 画面要清晰美观<br>
        • 标题要简洁有力
      `;

      this.showUserInstructions(optimizationInfo);

      // 使用优化后的内容
      await this.copyToClipboard(optimizedContent);

      // 3. 执行基础发布流程
      return await this.executePublish(optimizedContent, options || {
        content: optimizedContent,
        platform: 'douyin'
      });

    } catch (error) {
      console.error('抖音增强发布流程失败:', error);
      throw error;
    }
  }

  /**
   * 实现抽象方法：标准发布接口
   */
  async publish(options: PublishOptions): Promise<PublishResult> {
    try {
      // 调用增强发布流程
      return await this.executeEnhancedPublish(options.content, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('common.errors.发布失败'),
        platformId: this.platformId,
        needsManualAction: true
      };
    }
  }
}
