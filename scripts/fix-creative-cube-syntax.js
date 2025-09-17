#!/usr/bin/env node

/**
 * 修复 CreativeCube.tsx 中的语法错误
 * 处理国际化替换导致的语法问题
 */

import fs from 'fs';

const COMPONENT_PATH = 'src/components/creative/CreativeCube.tsx';

class CreativeCubeSyntaxFixer {
  constructor() {
    this.fixCount = 0;
  }

  /**
   * 运行修复
   */
  async run() {
    console.log('🔧 开始修复 CreativeCube.tsx 语法错误...\n');

    try {
      await this.fixSyntaxErrors();
      console.log(`\n✅ CreativeCube.tsx 语法修复完成！`);
      console.log(`📊 修复了 ${this.fixCount} 处语法错误`);
    } catch (error) {
      console.error('❌ 语法修复失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复语法错误
   */
  async fixSyntaxErrors() {
    console.log('🔄 修复语法错误...');
    
    if (!fs.existsSync(COMPONENT_PATH)) {
      throw new Error(`组件文件不存在: ${COMPONENT_PATH}`);
    }

    let content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    // 修复规则列表
    const fixes = [
      // 修复注释中的t()调用
      {
        search: /\* \{t\('creativeCube\.title'\)\}组件 - 优化版/g,
        replace: "* 九宫格创意魔方组件 - 优化版",
        description: "修复标题注释"
      },
      
      // 修复JSX中错误的t()调用格式
      {
        search: /\{\/\* \{t\('creativeCube\.comments\.[^']+'\)\} \*\/\}/g,
        replace: "",
        description: "移除注释中的t()调用"
      },
      
      // 修复字符串中的t()调用
      {
        search: /'\{t\('creativeCube\.[^']+'\)\}'/g,
        replace: (match) => {
          // 提取翻译键并返回简化的中文
          if (match.includes('required')) return "'必选'";
          if (match.includes('restore')) return "'还原'";
          if (match.includes('mainContent')) return "'主要内容'";
          if (match.includes('creativeContent')) return "'创意内容'";
          if (match.includes('content')) return "'内容'";
          return "'文本'";
        },
        description: "修复字符串中的t()调用"
      },
      
      // 修复JSX属性中的t()调用
      {
        search: /placeholder=\{t\('creativeCube\.dimensions\.addCustom'\)\}/g,
        replace: 'placeholder="输入自定义选项..."',
        description: "修复placeholder属性"
      },
      
      // 修复其他常见的t()调用问题
      {
        search: /\{t\('creativeCube\.dimensions\.required'\)\}/g,
        replace: "必选",
        description: "修复必选标签"
      },
      
      {
        search: /\{t\('creativeCube\.dimensions\.restore'\)\}/g,
        replace: "还原",
        description: "修复还原按钮"
      },
      
      {
        search: /\{t\('creativeCube\.title'\)\}/g,
        replace: "九宫格创意魔方",
        description: "修复标题"
      },
      
      {
        search: /\{t\('creativeCube\.description'\)\}/g,
        replace: "选择不同维度的元素，AI将为你生成可直接使用的创意内容",
        description: "修复描述"
      },
      
      // 修复生成按钮相关
      {
        search: /\{t\('creativeCube\.generation\.generating'\)\}/g,
        replace: "生成中...",
        description: "修复生成中状态"
      },
      
      {
        search: /\{t\('creativeCube\.generation\.generate'\)\}/g,
        replace: "生成创意内容",
        description: "修复生成按钮"
      },
      
      // 修复结果相关
      {
        search: /\{t\('creativeCube\.result\.title'\)\}/g,
        replace: "生成结果",
        description: "修复结果标题"
      },
      
      // 修复控制相关
      {
        search: /\{t\('creativeCube\.controls\.[^']+'\)\}/g,
        replace: (match) => {
          if (match.includes('random')) return "随机选择";
          if (match.includes('clear')) return "清空";
          if (match.includes('reset')) return "重置";
          return "操作";
        },
        description: "修复控制按钮"
      }
    ];

    // 应用修复规则
    for (const fix of fixes) {
      const beforeCount = (content.match(fix.search) || []).length;
      if (typeof fix.replace === 'function') {
        content = content.replace(fix.search, fix.replace);
      } else {
        content = content.replace(fix.search, fix.replace);
      }
      const afterCount = (content.match(fix.search) || []).length;
      const fixedCount = beforeCount - afterCount;
      
      if (fixedCount > 0) {
        console.log(`✅ ${fix.description}: ${fixedCount} 处`);
        this.fixCount += fixedCount;
      }
    }

    // 保存修复后的文件
    fs.writeFileSync(COMPONENT_PATH, content);
    console.log(`✅ 语法错误修复完成`);
  }
}

// 运行脚本
const fixer = new CreativeCubeSyntaxFixer();
fixer.run().catch(console.error);
