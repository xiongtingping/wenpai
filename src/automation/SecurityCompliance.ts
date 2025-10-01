/**
 * 安全和合规检查模块
 * 确保自动化转发符合各平台的使用条款和安全要求
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ

export interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  passed: boolean;
  message: string;
}

export interface ComplianceResult {
  platformId: string;
  platformName: string;
  overallCompliance: boolean;
  checks: SecurityCheck[];
  recommendations: string[];
  warnings: string[];
}

export class SecurityComplianceChecker {
  private platformRules: Record<string, PlatformRule[]> = {};

  constructor() {
    this.initializePlatformRules();
  }

  /**
   * 初始化各平台的合规规则
   */
  private initializePlatformRules() {
    // 小红书合规规则
    this.platformRules['xiaohongshu'] = [
      {
        id: 'xhs_content_length',
        name: '内容长度检查',
        description: '检查内容是否符合小红书1000字符限制',
        severity: 'high',
        check: (content: string) => ({
          passed: content.length <= 1000,
          message: content.length > 1000 ? `内容超出限制：${content.length}/1000字符` : i18n.t('common.messages.内容长度符合要求')
        })
      },
      {
        id: 'xhs_sensitive_words',
        name: '敏感词检查',
        description: '检查内容是否包含敏感词汇',
        severity: 'critical',
        check: (content: string) => {
          const sensitiveWords = ['外链', '微信', 'QQ', '联系方式', '加我', '私聊'];
          const foundWords = sensitiveWords.filter(word => content.includes(word));
          return {
            passed: foundWords.length === 0,
            message: foundWords.length > 0 ? `发现敏感词：${foundWords.join(', ')}` : i18n.t('common.messages.未发现敏感词')
          };
        }
      },
      {
        id: 'xhs_image_requirement',
        name: '图片要求提醒',
        description: '提醒用户小红书需要上传图片',
        severity: 'medium',
        check: () => ({
          passed: true,
          message: '请确保上传至少1张高质量图片'
        })
      }
    ];

    // 微博合规规则
    this.platformRules['weibo'] = [
      {
        id: 'weibo_content_length',
        name: '内容长度检查',
        description: '检查内容是否符合微博2000字符限制',
        severity: 'high',
        check: (content: string) => ({
          passed: content.length <= 2000,
          message: content.length > 2000 ? `内容超出限制：${content.length}/2000字符` : i18n.t('common.messages.内容长度符合要求')
        })
      },
      {
        id: 'weibo_hashtag_format',
        name: '话题标签格式检查',
        description: '检查话题标签是否使用正确格式',
        severity: 'low',
        check: (content: string) => {
          const hashtags = content.match(/#[\u4e00-\u9fa5\w]+#?/g) || [];
          const malformedTags = hashtags.filter(tag => !tag.endsWith('#'));
          return {
            passed: malformedTags.length === 0,
            message: malformedTags.length > 0 ? `话题标签格式不正确：${malformedTags.join(', ')}` : i18n.t('common.messages.话题标签格式正确')
          };
        }
      }
    ];

    // 抖音合规规则
    this.platformRules['douyin'] = [
      {
        id: 'douyin_content_length',
        name: '内容长度检查',
        description: '检查内容是否符合抖音2200字符限制',
        severity: 'high',
        check: (content: string) => ({
          passed: content.length <= 2200,
          message: content.length > 2200 ? `内容超出限制：${content.length}/2200字符` : i18n.t('common.messages.内容长度符合要求')
        })
      },
      {
        id: 'douyin_video_requirement',
        name: '视频内容要求',
        description: '提醒用户抖音需要上传视频或图片',
        severity: 'critical',
        check: () => ({
          passed: true,
          message: i18n.t('common.messages.请确保上传视频文件或图片内容')
        })
      }
    ];

    // 微信公众号合规规则
    this.platformRules['wechat'] = [
      {
        id: 'wechat_content_length',
        name: '内容长度检查',
        description: '检查内容是否符合微信公众号要求',
        severity: 'medium',
        check: (content: string) => ({
          passed: content.length >= 200,
          message: content.length < 200 ? `内容过短，建议至少200字符，当前${content.length}字符` : i18n.t('common.messages.内容长度适合')
        })
      },
      {
        id: 'wechat_original_content',
        name: '原创内容提醒',
        description: '提醒用户确保内容原创性',
        severity: 'high',
        check: () => ({
          passed: true,
          message: '请确保内容为原创，避免版权问题'
        })
      }
    ];
  }

  /**
   * 执行平台合规检查
   */
  async checkPlatformCompliance(platformId: string, content: string): Promise<ComplianceResult> {
    const platformName = this.getPlatformName(platformId);
    const rules = this.platformRules[platformId] || [];
    
    const checks: SecurityCheck[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // 执行所有规则检查
    for (const rule of rules) {
      const result = rule.check(content);
      
      const check: SecurityCheck = {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        passed: result.passed,
        message: result.message
      };

      checks.push(check);

      // 根据检查结果生成建议和警告
      if (!result.passed) {
        if (rule.severity === 'critical' || rule.severity === 'high') {
          warnings.push(result.message);
        } else {
          recommendations.push(result.message);
        }
      }
    }

    // 添加通用安全建议
    this.addGeneralSecurityRecommendations(platformId, recommendations);

    // 计算整体合规性
    const criticalFailures = checks.filter(c => !c.passed && (c.severity === 'critical' || c.severity === 'high'));
    const overallCompliance = criticalFailures.length === 0;

    return {
      platformId,
      platformName,
      overallCompliance,
      checks,
      recommendations,
      warnings
    };
  }

  /**
   * 添加通用安全建议
   */
  private addGeneralSecurityRecommendations(platformId: string, recommendations: string[]) {
    const generalRecommendations = [
      '确保内容符合平台社区规范',
      '避免发布误导性或虚假信息',
      '尊重他人版权和知识产权',
      '不要过度频繁发布内容',
      '保护个人隐私信息'
    ];

    // 平台特定建议
    const platformSpecificRecommendations: Record<string, string[]> = {
      'xiaohongshu': [
        '添加高质量图片提高互动率',
        '使用相关话题标签增加曝光',
        '避免过度商业化内容'
      ],
      'weibo': [
        '在黄金时间发布（19-22点）',
        '适当使用@功能增加互动',
        '关注热门话题和事件'
      ],
      'douyin': [
        '使用热门音乐和特效',
        '前3秒要有吸引力',
        '保持稳定的发布频率'
      ],
      'wechat': [
        '确保内容有价值和深度',
        '使用合适的排版和格式',
        '添加相关的配图'
      ]
    };

    const specificRecommendations = platformSpecificRecommendations[platformId] || [];
    recommendations.push(...generalRecommendations, ...specificRecommendations);
  }

  /**
   * 获取平台名称
   */
  private getPlatformName(platformId: string): string {
    const platformNames: Record<string, string> = {
      'xiaohongshu': '小红书',
      'weibo': '微博',
      'douyin': '抖音',
      'wechat': '微信公众号',
      'zhihu': '知乎',
      'bilibili': 'B站'
    };

    return platformNames[platformId] || platformId;
  }

  /**
   * 批量检查多个平台的合规性
   */
  async batchCheckCompliance(platforms: Array<{ id: string; content: string }>): Promise<ComplianceResult[]> {
    const results: ComplianceResult[] = [];

    for (const platform of platforms) {
      try {
        const result = await this.checkPlatformCompliance(platform.id, platform.content);
        results.push(result);
      } catch (error) {
        console.error(`checking平台 ${platform.id} 合规性failed:`, error);
        
        // 添加错误结果
        results.push({
          platformId: platform.id,
          platformName: this.getPlatformName(platform.id),
          overallCompliance: false,
          checks: [],
          recommendations: [],
          warnings: [`合规检查失败: ${error instanceof Error ? error.message : '未知错误'}`]
        });
      }
    }

    return results;
  }

  /**
   * 生成合规报告
   */
  generateComplianceReport(results: ComplianceResult[]): string {
    let report = '# 平台合规检查报告\n\n';
    
    const totalPlatforms = results.length;
    const compliantPlatforms = results.filter(r => r.overallCompliance).length;
    const nonCompliantPlatforms = totalPlatforms - compliantPlatforms;

    report += `## 总体概况\n`;
    report += `- 检查平台数：${totalPlatforms}\n`;
    report += `- 合规平台数：${compliantPlatforms}\n`;
    report += `- 不合规平台数：${nonCompliantPlatforms}\n`;
    report += `- 合规率：${Math.round((compliantPlatforms / totalPlatforms) * 100)}%\n\n`;

    // 详细结果
    results.forEach(result => {
      report += `## ${result.platformName}\n`;
      report += `**合规状态：** ${result.overallCompliance ? '✅ 合规' : '❌ 不合规'}\n\n`;

      if (result.warnings.length > 0) {
        report += `**⚠️ 警告：**\n`;
        result.warnings.forEach(warning => {
          report += `- ${warning}\n`;
        });
        report += '\n';
      }

      if (result.recommendations.length > 0) {
        report += `**💡 建议：**\n`;
        result.recommendations.forEach(rec => {
          report += `- ${rec}\n`;
        });
        report += '\n';
      }

      report += `**检查详情：**\n`;
      result.checks.forEach(check => {
        const status = check.passed ? '✅' : '❌';
        report += `- ${status} ${check.name}: ${check.message}\n`;
      });
      report += '\n';
    });

    return report;
  }
}

// 平台规则接口
interface PlatformRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (content: string) => { passed: boolean; message: string };
}

// 导出单例实例
export const securityComplianceChecker = new SecurityComplianceChecker();
