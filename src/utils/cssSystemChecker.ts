/**
 * CSS系统检查和修复工具
 * 用于检测和修复硬编码样式、不一致的组件样式等问题
 */

export interface StyleIssue {
  type: 'hardcoded-color' | 'hardcoded-size' | 'inline-style' | 'inconsistent-component' | 'missing-token';
  element: Element;
  current: string;
  suggested: string;
  severity: 'error' | 'warning' | 'info';
  location: string;
  description: string;
}

export interface ThemeConsistencyReport {
  theme: string;
  issues: StyleIssue[];
  missingTokens: string[];
  inconsistentElements: Element[];
}

export interface CSSSystemReport {
  totalIssues: number;
  issuesByType: Record<string, number>;
  themeReports: ThemeConsistencyReport[];
  recommendations: string[];
}

/**
 * 硬编码颜色检测映射
 */
const HARDCODED_COLOR_PATTERNS = {
  // 常见硬编码颜色
  'hsl(var(--background))': 'hsl(var(--background))',
  'hsl(var(--foreground))': 'hsl(var(--foreground))',
  '#fff': 'hsl(var(--background))',
  '#000': 'hsl(var(--foreground))',
  'white': 'hsl(var(--background))',
  'black': 'hsl(var(--foreground))',
  
  // 蓝色系列
  'rgb(37, 99, 235)': 'hsl(var(--primary))',
  'rgb(59, 130, 246)': 'hsl(var(--primary) / 0.8)',
  'rgb(29, 78, 216)': 'hsl(var(--primary) / 1.2)',
  'hsl(var(--primary))': 'hsl(var(--primary))',
  
  // 红色系列
  'hsl(var(--destructive))': 'hsl(var(--destructive))',
  '#f87171': 'hsl(var(--destructive) / 0.8)',
  
  // 绿色系列
  '#10b981': 'hsl(var(--success))',
  '#059669': 'hsl(var(--success) / 1.1)',
  '#34d399': 'hsl(var(--success) / 0.8)',
  
  // 黄色系列
  '#eab308': 'hsl(var(--warning))',
  '#ca8a04': 'hsl(var(--warning) / 1.1)',
  '#fbbf24': 'hsl(var(--warning) / 0.8)',
  
  // 灰色系列
  'hsl(var(--muted-foreground))': 'hsl(var(--muted-foreground))',
  'hsl(var(--border))': 'hsl(var(--border))',
  'hsl(var(--muted))': 'hsl(var(--muted))',
};

/**
 * 硬编码尺寸检测映射
 */
const HARDCODED_SIZE_PATTERNS = {
  'var(--spacing-1)': 'var(--spacing-1)',
  'var(--spacing-2)': 'var(--spacing-2)',
  'var(--spacing-3)': 'var(--spacing-3)',
  'var(--spacing-4)': 'var(--spacing-4)',
  'var(--spacing-5)': 'var(--spacing-5)',
  'var(--spacing-6)': 'var(--spacing-6)',
  'var(--spacing-8)': 'var(--spacing-8)',
  'var(--spacing-10)': 'var(--spacing-10)',
  'var(--spacing-12)': 'var(--spacing-12)',
  'var(--spacing-16)': 'var(--spacing-16)',
  'var(--spacing-20)': 'var(--spacing-20)',
  'var(--spacing-24)': 'var(--spacing-24)',
};

/**
 * 必需的设计令牌
 */
const REQUIRED_DESIGN_TOKENS = [
  '--background',
  '--foreground', 
  '--card',
  '--card-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--success',
  '--warning',
];

/**
 * CSS系统检查器类
 */
export class CSSSystemChecker {
  private issues: StyleIssue[] = [];
  
  /**
   * 执行完整的CSS系统检查
   */
  public async checkCSSSystem(): Promise<CSSSystemReport> {
    this.issues = [];
    
    // 检查硬编码样式
    this.checkHardcodedStyles();
    
    // 检查内联样式
    this.checkInlineStyles();
    
    // 检查组件一致性
    this.checkComponentConsistency();
    
    // 检查主题一致性
    const themeReports = await this.checkThemeConsistency();
    
    // 生成报告
    return this.generateReport(themeReports);
  }
  
  /**
   * 检查硬编码样式
   */
  private checkHardcodedStyles(): void {
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element, index) => {
      const computedStyle = getComputedStyle(element);
      const location = this.getElementLocation(element);
      
      // 检查硬编码颜色
      this.checkHardcodedColors(element, computedStyle, location);
      
      // 检查硬编码尺寸
      this.checkHardcodedSizes(element, computedStyle, location);
    });
  }
  
  /**
   * 检查硬编码颜色
   */
  private checkHardcodedColors(element: Element, style: CSSStyleDeclaration, location: string): void {
    const colorProperties = ['color', 'backgroundColor', 'borderColor'];
    
    colorProperties.forEach(prop => {
      const value = style.getPropertyValue(prop);
      const suggested = (HARDCODED_COLOR_PATTERNS as any)[value];
      
      if (suggested) {
        this.issues.push({
          type: 'hardcoded-color',
          element,
          current: `${prop}: ${value}`,
          suggested: `${prop}: ${suggested}`,
          severity: 'error',
          location,
          description: `硬编码颜色值 ${value} 应该使用设计令牌 ${suggested}`
        });
      }
    });
  }
  
  /**
   * 检查硬编码尺寸
   */
  private checkHardcodedSizes(element: Element, style: CSSStyleDeclaration, location: string): void {
    const sizeProperties = ['width', 'height', 'padding', 'margin', 'fontSize'];
    
    sizeProperties.forEach(prop => {
      const value = style.getPropertyValue(prop);
      const suggested = (HARDCODED_SIZE_PATTERNS as any)[value];
      
      if (suggested) {
        this.issues.push({
          type: 'hardcoded-size',
          element,
          current: `${prop}: ${value}`,
          suggested: `${prop}: ${suggested}`,
          severity: 'warning',
          location,
          description: `硬编码尺寸值 ${value} 应该使用设计令牌 ${suggested}`
        });
      }
    });
  }
  
  /**
   * 检查内联样式
   */
  private checkInlineStyles(): void {
    const elementsWithInlineStyles = document.querySelectorAll('[style]');
    
    elementsWithInlineStyles.forEach(element => {
      const inlineStyle = element.getAttribute('style') || '';
      const location = this.getElementLocation(element);
      
      // 检查是否包含应该使用设计令牌的样式
      if (this.containsHardcodedValues(inlineStyle)) {
        this.issues.push({
          type: 'inline-style',
          element,
          current: `style="${inlineStyle}"`,
          suggested: '使用CSS类和设计令牌替换内联样式',
          severity: 'error',
          location,
          description: '内联样式包含硬编码值，应该使用CSS类和设计令牌'
        });
      }
    });
  }
  
  /**
   * 检查组件一致性
   */
  private checkComponentConsistency(): void {
    // 检查按钮一致性
    this.checkButtonConsistency();
    
    // 检查卡片一致性
    this.checkCardConsistency();
    
    // 检查图标容器一致性
    this.checkIconContainerConsistency();
  }
  
  /**
   * 检查按钮一致性
   */
  private checkButtonConsistency(): void {
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');
    const buttonStyles = new Map<string, Element[]>();
    
    buttons.forEach(button => {
      const style = getComputedStyle(button);
      const styleKey = `${style.backgroundColor}-${style.color}-${style.borderColor}`;
      
      if (!buttonStyles.has(styleKey)) {
        buttonStyles.set(styleKey, []);
      }
      buttonStyles.get(styleKey)!.push(button);
    });
    
    // 如果按钮样式种类过多，说明不一致
    if (buttonStyles.size > 10) {
      this.issues.push({
        type: 'inconsistent-component',
        element: document.body,
        current: `发现 ${buttonStyles.size} 种不同的按钮样式`,
        suggested: '使用统一的按钮变体系统',
        severity: 'warning',
        location: 'global',
        description: `按钮样式不一致，发现 ${buttonStyles.size} 种不同样式，建议使用统一的变体系统`
      });
    }
  }
  
  /**
   * 检查卡片一致性
   */
  private checkCardConsistency(): void {
    const cards = document.querySelectorAll('.card, [class*="Card"], .rounded-lg, .rounded-xl');
    const cardStyles = new Map<string, Element[]>();
    
    cards.forEach(card => {
      const style = getComputedStyle(card);
      const styleKey = `${style.backgroundColor}-${style.borderColor}-${style.boxShadow}`;
      
      if (!cardStyles.has(styleKey)) {
        cardStyles.set(styleKey, []);
      }
      cardStyles.get(styleKey)!.push(card);
    });
    
    // 如果卡片样式种类过多，说明不一致
    if (cardStyles.size > 8) {
      this.issues.push({
        type: 'inconsistent-component',
        element: document.body,
        current: `发现 ${cardStyles.size} 种不同的卡片样式`,
        suggested: '使用统一的卡片变体系统',
        severity: 'warning',
        location: 'global',
        description: `卡片样式不一致，发现 ${cardStyles.size} 种不同样式，建议使用统一的变体系统`
      });
    }
  }
  
  /**
   * 检查图标容器一致性
   */
  private checkIconContainerConsistency(): void {
    const iconContainers = document.querySelectorAll('[class*="w-"], [class*="h-"], .icon-container');
    const containerStyles = new Map<string, Element[]>();
    
    iconContainers.forEach(container => {
      const style = getComputedStyle(container);
      if (style.width === style.height && parseFloat(style.width) > 0) {
        const styleKey = `${style.width}-${style.backgroundColor}-${style.borderRadius}`;
        
        if (!containerStyles.has(styleKey)) {
          containerStyles.set(styleKey, []);
        }
        containerStyles.get(styleKey)!.push(container);
      }
    });
    
    // 如果图标容器样式种类过多，说明不一致
    if (containerStyles.size > 12) {
      this.issues.push({
        type: 'inconsistent-component',
        element: document.body,
        current: `发现 ${containerStyles.size} 种不同的图标容器样式`,
        suggested: '使用统一的图标容器变体系统',
        severity: 'info',
        location: 'global',
        description: `图标容器样式不一致，发现 ${containerStyles.size} 种不同样式，建议使用统一的变体系统`
      });
    }
  }
  
  /**
   * 检查主题一致性
   */
  private async checkThemeConsistency(): Promise<ThemeConsistencyReport[]> {
    const themes = ['light', 'dark', 'beige', 'gold', 'rainbow', 'green'];
    const reports: ThemeConsistencyReport[] = [];
    
    for (const theme of themes) {
      const report = await this.checkSingleTheme(theme);
      reports.push(report);
    }
    
    return reports;
  }
  
  /**
   * 检查单个主题
   */
  private async checkSingleTheme(theme: string): Promise<ThemeConsistencyReport> {
    // 切换到指定主题
    const originalTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);
    
    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const issues: StyleIssue[] = [];
    const missingTokens: string[] = [];
    const inconsistentElements: Element[] = [];
    
    // 检查设计令牌是否完整
    const computedStyle = getComputedStyle(document.documentElement);
    REQUIRED_DESIGN_TOKENS.forEach(token => {
      const value = computedStyle.getPropertyValue(token).trim();
      if (!value) {
        missingTokens.push(token);
      }
    });
    
    // 检查元素在当前主题下的表现
    const criticalElements = document.querySelectorAll('button, .card, input, .text-foreground');
    criticalElements.forEach(element => {
      const style = getComputedStyle(element);
      
      // 检查对比度
      if (!this.hasGoodContrast(style.color, style.backgroundColor)) {
        inconsistentElements.push(element);
        issues.push({
          type: 'inconsistent-component',
          element,
          current: `颜色对比度不足`,
          suggested: '调整颜色以提高对比度',
          severity: 'warning',
          location: this.getElementLocation(element),
          description: `在 ${theme} 主题下颜色对比度不足`
        });
      }
    });
    
    // 恢复原主题
    if (originalTheme) {
      document.documentElement.setAttribute('data-theme', originalTheme);
    }
    
    return {
      theme,
      issues,
      missingTokens,
      inconsistentElements
    };
  }
  
  /**
   * 生成报告
   */
  private generateReport(themeReports: ThemeConsistencyReport[]): CSSSystemReport {
    const issuesByType: Record<string, number> = {};
    
    this.issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    });
    
    // 添加主题报告中的问题
    themeReports.forEach(report => {
      report.issues.forEach(issue => {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      });
    });
    
    const recommendations = this.generateRecommendations(issuesByType, themeReports);
    
    return {
      totalIssues: this.issues.length + themeReports.reduce((sum, report) => sum + report.issues.length, 0),
      issuesByType,
      themeReports,
      recommendations
    };
  }
  
  /**
   * 生成建议
   */
  private generateRecommendations(issuesByType: Record<string, number>, themeReports: ThemeConsistencyReport[]): string[] {
    const recommendations: string[] = [];
    
    if (issuesByType['hardcoded-color'] > 0) {
      recommendations.push(`发现 ${issuesByType['hardcoded-color']} 个硬编码颜色问题，建议使用设计令牌替换`);
    }
    
    if (issuesByType['inline-style'] > 0) {
      recommendations.push(`发现 ${issuesByType['inline-style']} 个内联样式问题，建议使用CSS类替换`);
    }
    
    if (issuesByType['inconsistent-component'] > 0) {
      recommendations.push(`发现组件样式不一致问题，建议使用统一的变体系统`);
    }
    
    const themesWithMissingTokens = themeReports.filter(report => report.missingTokens.length > 0);
    if (themesWithMissingTokens.length > 0) {
      recommendations.push(`${themesWithMissingTokens.length} 个主题缺少必需的设计令牌`);
    }
    
    return recommendations;
  }
  
  /**
   * 获取元素位置描述
   */
  private getElementLocation(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    const id = element.id;
    
    let location = tagName;
    if (id) location += `#${id}`;
    if (className) location += `.${className.split(' ').join('.')}`;
    
    return location;
  }
  
  /**
   * 检查是否包含硬编码值
   */
  private containsHardcodedValues(style: string): boolean {
    const hardcodedPatterns = [
      /#[0-9a-fA-F]{3,6}/, // 十六进制颜色
      /rgb\(/, // RGB颜色
      /rgba\(/, // RGBA颜色
      /\d+px/, // 像素值
    ];
    
    return hardcodedPatterns.some(pattern => pattern.test(style));
  }
  
  /**
   * 检查颜色对比度
   */
  private hasGoodContrast(foreground: string, background: string): boolean {
    // 简化的对比度检查，实际应用中可以使用更精确的算法
    if (!foreground || !background || foreground === 'transparent' || background === 'transparent') {
      return true; // 跳过透明颜色的检查
    }
    
    // 这里可以实现更复杂的对比度计算
    return true;
  }
}

/**
 * 创建CSS系统检查器实例
 */
export const cssSystemChecker = new CSSSystemChecker();

/**
 * 快速检查CSS系统
 */
export async function quickCSSCheck(): Promise<CSSSystemReport> {
  return await cssSystemChecker.checkCSSSystem();
}
