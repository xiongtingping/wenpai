/**
 * MD2Card服务单元测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MD2CardService, generateCard, exportCard } from '../md2cardService';
import { CardTemplate, CardConfiguration } from '@/components/creative/MD2CardPage';
import { ExportOptions } from '@/components/creative/md2card/ExportControls';

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    scale: vi.fn(),
    globalAlpha: 1
  })),
  width: 800,
  height: 600,
  toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData'),
  toBlob: vi.fn((callback) => {
    const blob = new Blob(['mock'], { type: 'image/png' });
    callback(blob);
  })
};

// Mock Document.createElement
vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return {} as any;
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(['mock'], { type: 'image/png' }))
  } as Response)
);

describe('MD2CardService', () => {
  let service: MD2CardService;
  
  const mockTemplate: CardTemplate = {
    id: 'test-template',
    name: 'test-template',
    displayName: '测试模板',
    description: '用于测试的模板',
    category: 'knowledge',
    dimensions: { width: 800, height: 600, aspectRatio: '4:3' },
    previewImage: '/test.png',
    isCustomizable: true,
    isFree: true,
    tags: ['测试'],
    constraints: {
      maxSections: 5,
      maxWordsPerSection: 50,
      allowImages: true,
      allowLists: true
    }
  };

  const mockConfiguration: CardConfiguration = {
    templateId: 'test-template',
    branding: {
      enableBrandLogo: false,
      logoPosition: 'top-right',
      brandColors: ['#3B82F6'],
      watermark: undefined
    },
    typography: {
      primaryFont: 'Arial',
      secondaryFont: 'Arial',
      fontSize: 'medium'
    },
    colors: {
      background: '#FFFFFF',
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      text: '#1F2937',
      accent: '#F59E0B'
    },
    layout: {
      padding: 32,
      spacing: 16,
      alignment: 'left'
    }
  };

  beforeEach(() => {
    service = new MD2CardService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCard', () => {
    test('应该成功生成卡片', async () => {
      const request = {
        markdown: '# 测试标题\n\n这是测试内容',
        templateId: 'test-template',
        configuration: mockConfiguration
      };

      // Mock getTemplateById
      vi.spyOn(service as any, 'getTemplateById').mockReturnValue(mockTemplate);

      const result = await service.generateCard(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.parsedContent).toBeDefined();
      expect(result.data?.imageData).toBeDefined();
      expect(result.data?.metadata).toBeDefined();
    });

    test('应该处理空内容', async () => {
      const request = {
        markdown: '',
        templateId: 'test-template',
        configuration: mockConfiguration
      };

      const result = await service.generateCard(request);

      expect(result.success).toBe(true);
      expect(result.data?.parsedContent.title).toBe('未命名卡片');
    });

    test('应该处理不存在的模板', async () => {
      const request = {
        markdown: '# 测试',
        templateId: 'non-existent',
        configuration: mockConfiguration
      };

      // Mock getTemplateById返回null
      vi.spyOn(service as any, 'getTemplateById').mockReturnValue(null);

      const result = await service.generateCard(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('模板不存在');
    });

    test('应该计算处理时间', async () => {
      const request = {
        markdown: '# 测试标题',
        templateId: 'test-template',
        configuration: mockConfiguration
      };

      vi.spyOn(service as any, 'getTemplateById').mockReturnValue(mockTemplate);

      const result = await service.generateCard(request);

      expect(result.success).toBe(true);
      expect(result.data?.metadata.processingTime).toBeGreaterThan(0);
    });

    test('应该处理生成错误', async () => {
      const request = {
        markdown: '# 测试',
        templateId: 'test-template',
        configuration: mockConfiguration
      };

      // Mock渲染失败
      vi.spyOn(service as any, 'renderCard').mockRejectedValue(new Error('渲染失败'));
      vi.spyOn(service as any, 'getTemplateById').mockReturnValue(mockTemplate);

      const result = await service.generateCard(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('渲染失败');
    });
  });

  describe('exportCard', () => {
    const mockParsedContent = {
      title: '测试标题',
      subtitle: '测试副标题',
      sections: [
        { type: 'text' as const, content: '测试内容', style: 'normal' as const }
      ],
      metadata: {
        wordCount: 10,
        estimatedReadTime: 1,
        hasImages: false,
        hasList: false,
        hasCode: false,
        complexity: 'simple' as const
      }
    };

    const mockExportOptions: ExportOptions = {
      format: {
        id: 'png',
        name: 'PNG',
        extension: 'png',
        mimeType: 'image/png',
        description: 'PNG格式',
        supportsTransparency: true,
        supportsVectorGraphics: false,
        recommendedFor: ['网页']
      },
      quality: {
        id: 'high',
        name: '高质量',
        scale: 2,
        jpegQuality: 0.9,
        description: '高质量'
      },
      includeWatermark: false
    };

    test('应该导出PNG格式', async () => {
      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: mockExportOptions
      };

      const result = await service.exportCard(request);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/png');
    });

    test('应该导出JPG格式', async () => {
      const jpgOptions = {
        ...mockExportOptions,
        format: {
          ...mockExportOptions.format,
          id: 'jpg' as const,
          mimeType: 'image/jpeg'
        },
        backgroundColor: '#FFFFFF'
      };

      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: jpgOptions
      };

      const result = await service.exportCard(request);

      expect(result).toBeInstanceOf(Blob);
    });

    test('应该导出SVG格式', async () => {
      const svgOptions = {
        ...mockExportOptions,
        format: {
          ...mockExportOptions.format,
          id: 'svg' as const,
          mimeType: 'image/svg+xml'
        }
      };

      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: svgOptions
      };

      const result = await service.exportCard(request);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/svg+xml');
    });

    test('应该导出PDF格式', async () => {
      const pdfOptions = {
        ...mockExportOptions,
        format: {
          ...mockExportOptions.format,
          id: 'pdf' as const,
          mimeType: 'application/pdf'
        }
      };

      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: pdfOptions
      };

      const result = await service.exportCard(request);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });

    test('应该处理不支持的格式', async () => {
      const invalidOptions = {
        ...mockExportOptions,
        format: {
          ...mockExportOptions.format,
          id: 'invalid' as any
        }
      };

      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: invalidOptions
      };

      await expect(service.exportCard(request)).rejects.toThrow('不支持的导出格式');
    });

    test('应该应用质量设置', async () => {
      const highQualityOptions = {
        ...mockExportOptions,
        quality: {
          id: 'ultra' as const,
          name: '超高质量',
          scale: 3,
          jpegQuality: 0.95,
          description: '超高质量'
        }
      };

      const request = {
        parsedContent: mockParsedContent,
        template: mockTemplate,
        configuration: mockConfiguration,
        options: highQualityOptions
      };

      await service.exportCard(request);

      // 验证Canvas缩放被调用
      expect(mockCanvas.getContext().scale).toHaveBeenCalledWith(3, 3);
    });
  });

  describe('renderCard', () => {
    test('应该正确渲染标题', async () => {
      const content = {
        title: '测试标题',
        sections: [],
        metadata: {
          wordCount: 2,
          estimatedReadTime: 1,
          hasImages: false,
          hasList: false,
          hasCode: false,
          complexity: 'simple' as const
        }
      };

      const result = await (service as any).renderCard(content, mockTemplate, mockConfiguration);

      expect(result).toBeDefined();
      expect(mockCanvas.getContext().fillText).toHaveBeenCalled();
    });

    test('应该处理长文本换行', async () => {
      const content = {
        title: '很长的标题内容 '.repeat(20),
        sections: [],
        metadata: {
          wordCount: 40,
          estimatedReadTime: 1,
          hasImages: false,
          hasList: false,
          hasCode: false,
          complexity: 'simple' as const
        }
      };

      const result = await (service as any).renderCard(content, mockTemplate, mockConfiguration);

      expect(result).toBeDefined();
      // 验证measureText被调用以计算文本宽度
      expect(mockCanvas.getContext().measureText).toHaveBeenCalled();
    });

    test('应该渲染品牌水印', async () => {
      const configWithWatermark = {
        ...mockConfiguration,
        branding: {
          ...mockConfiguration.branding,
          enableBrandLogo: true,
          watermark: '测试水印'
        }
      };

      const content = {
        title: '测试',
        sections: [],
        metadata: {
          wordCount: 1,
          estimatedReadTime: 1,
          hasImages: false,
          hasList: false,
          hasCode: false,
          complexity: 'simple' as const
        }
      };

      const result = await (service as any).renderCard(content, mockTemplate, configWithWatermark);

      expect(result).toBeDefined();
      // 验证水印渲染
      expect(mockCanvas.getContext().fillText).toHaveBeenCalledWith(
        '测试水印',
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('便捷函数', () => {
    test('generateCard函数应该调用服务', async () => {
      const request = {
        markdown: '# 测试',
        templateId: 'test',
        configuration: mockConfiguration
      };

      // Mock服务实例
      const mockService = {
        generateCard: vi.fn().mockResolvedValue({ success: true })
      };
      
      vi.spyOn(MD2CardService.prototype, 'generateCard').mockImplementation(mockService.generateCard);

      await generateCard(request);

      expect(mockService.generateCard).toHaveBeenCalledWith(request);
    });

    test('exportCard函数应该调用服务', async () => {
      const request = {
        parsedContent: {
          title: '测试',
          sections: [],
          metadata: {
            wordCount: 1,
            estimatedReadTime: 1,
            hasImages: false,
            hasList: false,
            hasCode: false,
            complexity: 'simple' as const
          }
        },
        template: mockTemplate,
        configuration: mockConfiguration,
        options: mockExportOptions
      };

      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockService = {
        exportCard: vi.fn().mockResolvedValue(mockBlob)
      };
      
      vi.spyOn(MD2CardService.prototype, 'exportCard').mockImplementation(mockService.exportCard);

      const result = await exportCard(request);

      expect(mockService.exportCard).toHaveBeenCalledWith(request);
      expect(result).toBe(mockBlob);
    });
  });

  describe('辅助方法', () => {
    test('getFontSize应该返回正确的字体大小', () => {
      expect((service as any).getFontSize('small')).toBe(14);
      expect((service as any).getFontSize('medium')).toBe(16);
      expect((service as any).getFontSize('large')).toBe(20);
    });

    test('getSVGTextAnchor应该返回正确的锚点', () => {
      expect((service as any).getSVGTextAnchor('left')).toBe('start');
      expect((service as any).getSVGTextAnchor('center')).toBe('middle');
      expect((service as any).getSVGTextAnchor('right')).toBe('end');
    });

    test('escapeXML应该正确转义XML字符', () => {
      const input = '< > & " \'';
      const expected = '&lt; &gt; &amp; &quot; &#39;';
      
      expect((service as any).escapeXML(input)).toBe(expected);
    });

    test('estimateImageSize应该估算图片大小', () => {
      const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const size = (service as any).estimateImageSize(dataURL);
      
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });
  });
});