/**
 * Markdown解析器单元测试
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { MarkdownParser, ContentAdapter, ParsedContent } from '../MarkdownParser';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('基础解析功能', () => {
    test('应该正确解析标题', () => {
      const markdown = '# 主标题\n## 副标题\n### 三级标题';
      const result = parser.parse(markdown);

      expect(result.title).toBe('主标题');
      expect(result.subtitle).toBe('副标题');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0]).toEqual({
        type: 'text',
        content: '三级标题',
        level: 3,
        style: 'emphasis'
      });
    });

    test('应该正确解析段落文本', () => {
      const markdown = '这是一个普通段落。\n\n这是另一个段落。';
      const result = parser.parse(markdown);

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0]).toEqual({
        type: 'text',
        content: '这是一个普通段落。',
        style: 'normal'
      });
      expect(result.sections[1]).toEqual({
        type: 'text',
        content: '这是另一个段落。',
        style: 'normal'
      });
    });

    test('应该正确解析列表', () => {
      const markdown = '- 第一项\n- 第二项\n- 第三项';
      const result = parser.parse(markdown);

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('list');
      expect(result.sections[0].content).toEqual(['第一项', '第二项', '第三项']);
    });

    test('应该正确解析引用', () => {
      const markdown = '> 这是一个引用';
      const result = parser.parse(markdown);

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0]).toEqual({
        type: 'quote',
        content: '这是一个引用'
      });
    });

    test('应该正确解析代码块', () => {
      const markdown = '```javascript\nconsole.log("Hello World");\n```';
      const result = parser.parse(markdown);

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0]).toEqual({
        type: 'code',
        content: 'console.log("Hello World");'
      });
    });
  });

  describe('内联元素解析', () => {
    test('应该正确处理粗体文本', () => {
      const markdown = '这是**粗体**文本';
      const result = parser.parse(markdown);

      expect(result.sections[0].content).toBe('这是<strong>粗体</strong>文本');
    });

    test('应该正确处理斜体文本', () => {
      const markdown = '这是*斜体*文本';
      const result = parser.parse(markdown);

      expect(result.sections[0].content).toBe('这是<em>斜体</em>文本');
    });

    test('应该正确处理内联代码', () => {
      const markdown = '这是`代码`文本';
      const result = parser.parse(markdown);

      expect(result.sections[0].content).toBe('这是<code>代码</code>文本');
    });

    test('应该正确处理链接', () => {
      const markdown = '这是[链接](https://example.com)文本';
      const result = parser.parse(markdown);

      expect(result.sections[0].content).toBe('这是<a href="https://example.com">链接</a>文本');
    });
  });

  describe('元数据生成', () => {
    test('应该正确计算字数', () => {
      const markdown = '# 标题\n\n这是一个包含十个字的测试段落内容。';
      const result = parser.parse(markdown);

      expect(result.metadata.wordCount).toBe(8); // 不包括标记符号
    });

    test('应该正确估算阅读时间', () => {
      const longMarkdown = '# 标题\n\n' + '这是一个很长的段落内容。'.repeat(50);
      const result = parser.parse(longMarkdown);

      expect(result.metadata.estimatedReadTime).toBeGreaterThan(0);
    });

    test('应该正确检测内容类型', () => {
      const markdown = `
# 标题
这是文本段落
- 列表项
> 引用内容
\`\`\`
代码块
\`\`\`
![图片](image.jpg)
      `;
      const result = parser.parse(markdown);

      expect(result.metadata.hasList).toBe(true);
      expect(result.metadata.hasCode).toBe(true);
      expect(result.metadata.hasImages).toBe(true);
    });

    test('应该正确评估内容复杂度', () => {
      const simpleMarkdown = '# 简单标题\n简单内容';
      const complexMarkdown = '# 复杂标题\n' + '复杂段落内容。'.repeat(100);

      const simpleResult = parser.parse(simpleMarkdown);
      const complexResult = parser.parse(complexMarkdown);

      expect(simpleResult.metadata.complexity).toBe('simple');
      expect(complexResult.metadata.complexity).toBe('complex');
    });
  });

  describe('边界情况处理', () => {
    test('应该处理空内容', () => {
      const result = parser.parse('');

      expect(result.title).toBe('未命名卡片');
      expect(result.sections).toHaveLength(0);
      expect(result.metadata.wordCount).toBe(0);
    });

    test('应该处理只有空白的内容', () => {
      const result = parser.parse('   \n\n  \t  ');

      expect(result.title).toBe('未命名卡片');
      expect(result.sections).toHaveLength(0);
    });

    test('应该处理无效的Markdown语法', () => {
      const markdown = '### 不完整的标题\n[无效链接]()\n**不闭合的粗体';
      const result = parser.parse(markdown);

      expect(result).toBeDefined();
      expect(result.sections).toHaveLength(2);
    });
  });
});

describe('ContentAdapter', () => {
  let mockParsedContent: ParsedContent;

  beforeEach(() => {
    mockParsedContent = {
      title: '测试标题',
      subtitle: '测试副标题',
      sections: [
        { type: 'text', content: '第一段内容', style: 'normal' },
        { type: 'list', content: ['项目1', '项目2', '项目3'] },
        { type: 'text', content: '第二段内容', style: 'normal' }
      ],
      metadata: {
        wordCount: 50,
        estimatedReadTime: 1,
        hasImages: false,
        hasList: true,
        hasCode: false,
        complexity: 'medium'
      }
    };
  });

  describe('内容适配功能', () => {
    test('应该正确截断过长内容', () => {
      const longContent = {
        ...mockParsedContent,
        sections: [
          { type: 'text', content: '很长的内容 '.repeat(20), style: 'normal' as const }
        ]
      };

      const adapted = ContentAdapter.adaptContent(longContent, 5, 10);
      const adaptedContent = adapted.sections[0].content as string;

      expect(adaptedContent).toMatch(/\.\.\.$/);
      expect(adaptedContent.split(' ').length).toBeLessThanOrEqual(11); // 10 + "..."
    });

    test('应该限制列表项数量', () => {
      const longList = {
        ...mockParsedContent,
        sections: [
          { type: 'list' as const, content: ['项目1', '项目2', '项目3', '项目4', '项目5'] }
        ]
      };

      const adapted = ContentAdapter.adaptContent(longList);
      const adaptedList = adapted.sections[0].content as string[];

      expect(adaptedList).toHaveLength(3);
    });

    test('应该限制段落数量', () => {
      const manySection = {
        ...mockParsedContent,
        sections: Array(10).fill({ type: 'text', content: '段落内容', style: 'normal' })
      };

      const adapted = ContentAdapter.adaptContent(manySection, 3);

      expect(adapted.sections).toHaveLength(3);
    });
  });

  describe('内容摘要生成', () => {
    test('应该生成正确长度的摘要', () => {
      const summary = ContentAdapter.generateSummary(mockParsedContent, 20);

      expect(summary.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(summary).toMatch(/第一段内容/);
    });

    test('应该处理短内容不添加省略号', () => {
      const shortContent = {
        ...mockParsedContent,
        sections: [{ type: 'text' as const, content: '短内容', style: 'normal' as const }]
      };

      const summary = ContentAdapter.generateSummary(shortContent, 50);

      expect(summary).toBe('短内容');
      expect(summary).not.toMatch(/\.\.\.$/);
    });
  });

  describe('模板验证功能', () => {
    const templateConstraints = {
      maxSections: 3,
      maxWordsPerSection: 20,
      allowImages: false,
      allowLists: true
    };

    test('应该验证通过的内容', () => {
      const result = ContentAdapter.validateContentForTemplate(mockParsedContent, templateConstraints);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('应该检测段落过多', () => {
      const tooManySections = {
        ...mockParsedContent,
        sections: Array(5).fill({ type: 'text', content: '内容', style: 'normal' })
      };

      const result = ContentAdapter.validateContentForTemplate(tooManySections, templateConstraints);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(expect.stringContaining('段落过多'));
    });

    test('应该检测段落过长', () => {
      const longSection = {
        ...mockParsedContent,
        sections: [{ type: 'text' as const, content: '很长的内容 '.repeat(30), style: 'normal' as const }]
      };

      const result = ContentAdapter.validateContentForTemplate(longSection, templateConstraints);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(expect.stringContaining('段落内容过长'));
    });

    test('应该检测不支持的图片', () => {
      const withImages = {
        ...mockParsedContent,
        metadata: { ...mockParsedContent.metadata, hasImages: true }
      };

      const noImageConstraints = { ...templateConstraints, allowImages: false };
      const result = ContentAdapter.validateContentForTemplate(withImages, noImageConstraints);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(expect.stringContaining('不支持图片'));
    });
  });

  describe('模板优化功能', () => {
    test('应该为知识模板优化内容', () => {
      const optimized = ContentAdapter.optimizeForTemplate(mockParsedContent, 'knowledge');

      expect(optimized).toBeDefined();
      // 知识模板应该保持列表格式，但限制为前3项
      const listSection = optimized.sections.find(s => s.type === 'list');
      if (listSection && Array.isArray(listSection.content)) {
        expect(listSection.content.length).toBeLessThanOrEqual(3);
      }
    });

    test('应该为社交模板优化内容', () => {
      const withCode = {
        ...mockParsedContent,
        sections: [
          ...mockParsedContent.sections,
          { type: 'code' as const, content: 'console.log("test");' }
        ]
      };

      const optimized = ContentAdapter.optimizeForTemplate(withCode, 'social');

      // 社交模板应该移除代码块
      expect(optimized.sections.find(s => s.type === 'code')).toBeUndefined();
      // 限制为最多3个段落
      expect(optimized.sections.length).toBeLessThanOrEqual(3);
    });

    test('应该为教育模板添加序号', () => {
      const optimized = ContentAdapter.optimizeForTemplate(mockParsedContent, 'education');

      const listSection = optimized.sections.find(s => s.type === 'list');
      if (listSection && Array.isArray(listSection.content)) {
        expect(listSection.content[0]).toMatch(/^1\./);
        expect(listSection.content[1]).toMatch(/^2\./);
      }
    });

    test('应该为商务模板保持完整性', () => {
      const optimized = ContentAdapter.optimizeForTemplate(mockParsedContent, 'business');

      // 商务模板应该保持原始内容的完整性
      expect(optimized.sections.length).toBe(mockParsedContent.sections.length);
    });
  });
});