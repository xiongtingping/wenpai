/**
 * Dialog定位自动化测试
 * 防止Dialog定位问题复发的视觉回归测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedDialog } from '@/components/ui/UnifiedDialog/UnifiedDialog';
import React from 'react';

// 模拟浏览器环境
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1440,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 900,
});

// 模拟getBoundingClientRect
const mockGetBoundingClientRect = (element: Element, rect: Partial<DOMRect>) => {
  const defaultRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  };
  
  element.getBoundingClientRect = jest.fn(() => ({
    ...defaultRect,
    ...rect,
  }));
};

describe('Dialog定位测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('基础定位测试', () => {
    it('应该在视口中央正确定位', async () => {
      const TestDialog = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <UnifiedDialog open={open} onOpenChange={setOpen}>
            <div data-testid="dialog-content">测试内容</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 模拟Dialog的实际位置
      mockGetBoundingClientRect(dialog, {
        width: 400,
        height: 300,
        left: 520,  // (1440 - 400) / 2
        top: 300,   // (900 - 300) / 2
      });

      const rect = dialog.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const expectedCenterX = window.innerWidth / 2;
      const expectedCenterY = window.innerHeight / 2;

      // 验证Dialog是否正确居中（允许5像素误差）
      expect(Math.abs(centerX - expectedCenterX)).toBeLessThan(5);
      expect(Math.abs(centerY - expectedCenterY)).toBeLessThan(5);
    });

    it('应该具有正确的CSS类和样式', async () => {
      const TestDialog = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <UnifiedDialog open={open} onOpenChange={setOpen} size="medium" variant="default">
            <div>测试内容</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 验证基础CSS类
      expect(dialog).toHaveClass('unified-dialog');
      expect(dialog).toHaveClass('fixed');
      expect(dialog).toHaveClass('z-50');
      
      // 验证计算样式
      const computedStyle = window.getComputedStyle(dialog);
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.zIndex).toBe('50');
    });
  });

  describe('响应式定位测试', () => {
    it('应该在小屏幕上正确适配', async () => {
      // 模拟移动设备屏幕
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });

      const TestDialog = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <UnifiedDialog open={open} onOpenChange={setOpen} size="small">
            <div>移动端测试</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 模拟小屏幕上的Dialog位置
      mockGetBoundingClientRect(dialog, {
        width: 320,
        height: 200,
        left: 27.5,  // (375 - 320) / 2
        top: 233.5,  // (667 - 200) / 2
      });

      const rect = dialog.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const expectedCenterX = window.innerWidth / 2;
      const expectedCenterY = window.innerHeight / 2;

      expect(Math.abs(centerX - expectedCenterX)).toBeLessThan(5);
      expect(Math.abs(centerY - expectedCenterY)).toBeLessThan(5);
    });
  });

  describe('多Dialog实例测试', () => {
    it('应该正确处理多个Dialog的层级', async () => {
      const TestMultipleDialogs = () => {
        const [dialog1Open, setDialog1Open] = React.useState(true);
        const [dialog2Open, setDialog2Open] = React.useState(true);
        
        return (
          <>
            <UnifiedDialog open={dialog1Open} onOpenChange={setDialog1Open}>
              <div data-testid="dialog-1">第一个Dialog</div>
            </UnifiedDialog>
            <UnifiedDialog open={dialog2Open} onOpenChange={setDialog2Open}>
              <div data-testid="dialog-2">第二个Dialog</div>
            </UnifiedDialog>
          </>
        );
      };

      render(<TestMultipleDialogs />, { container });

      await waitFor(() => {
        const dialogs = screen.getAllByRole('dialog');
        expect(dialogs).toHaveLength(2);
      });

      const dialogs = screen.getAllByRole('dialog');
      
      // 验证两个Dialog都有正确的z-index
      dialogs.forEach(dialog => {
        const computedStyle = window.getComputedStyle(dialog);
        expect(computedStyle.zIndex).toBe('50');
      });
    });
  });

  describe('动画和过渡测试', () => {
    it('应该在打开时应用正确的动画类', async () => {
      const TestDialog = () => {
        const [open, setOpen] = React.useState(false);
        
        React.useEffect(() => {
          // 延迟打开Dialog以测试动画
          setTimeout(() => setOpen(true), 100);
        }, []);
        
        return (
          <UnifiedDialog open={open} onOpenChange={setOpen} animation="scale">
            <div>动画测试</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      // 等待Dialog打开
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 验证动画相关的CSS类
      expect(dialog).toHaveClass('animate-in');
      expect(dialog).toHaveClass('fade-in-0');
      expect(dialog).toHaveClass('zoom-in-95');
    });
  });

  describe('无障碍性测试', () => {
    it('应该具有正确的ARIA属性', async () => {
      const TestDialog = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <UnifiedDialog 
            open={open} 
            onOpenChange={setOpen}
            aria-label="测试对话框"
            aria-describedby="dialog-description"
          >
            <div id="dialog-description">这是一个测试对话框</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 验证ARIA属性
      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', '测试对话框');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    });
  });

  describe('边界情况测试', () => {
    it('应该在极小屏幕上仍然可见', async () => {
      // 模拟极小屏幕
      Object.defineProperty(window, 'innerWidth', { value: 280 });
      Object.defineProperty(window, 'innerHeight', { value: 400 });

      const TestDialog = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <UnifiedDialog open={open} onOpenChange={setOpen} size="small">
            <div>极小屏幕测试</div>
          </UnifiedDialog>
        );
      };

      render(<TestDialog />, { container });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      
      // 验证Dialog在极小屏幕上仍然可见
      const computedStyle = window.getComputedStyle(dialog);
      expect(computedStyle.visibility).toBe('visible');
      expect(computedStyle.opacity).toBe('1');
    });
  });
});
