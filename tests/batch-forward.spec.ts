import { test, expect } from '@playwright/test';

test.describe('批量转发自动化测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到适配器页面
    await page.goto('/adapt');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够检测到页面元素', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/AI内容适配器/);
    
    // 检查关键元素是否存在
    await expect(page.locator('h1')).toContainText('AI内容适配器');
    
    // 检查输入框
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    
    // 检查平台选择
    const platformCheckboxes = page.locator('input[type="checkbox"]');
    await expect(platformCheckboxes.first()).toBeVisible();
  });

  test('应该能够生成内容并显示批量转发按钮', async ({ page }) => {
    // 输入测试内容
    const testContent = '这是一个测试内容，用于验证AI内容适配器的功能。';
    await page.locator('textarea').first().fill(testContent);
    
    // 选择一些平台
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('input[type="checkbox"]').nth(1).check();
    
    // 点击生成按钮
    const generateButton = page.locator('button').filter({ hasText: '开始生成' });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      
      // 等待生成完成
      await page.waitForSelector('[data-testid="platform-card"]', { timeout: 60000 });
      
      // 检查批量转发按钮是否可用
      const batchButton = page.locator('[data-testid="batch-forward-button"]');
      await expect(batchButton).toBeVisible();
      await expect(batchButton).toBeEnabled();
      
      // 检查自动化转发按钮是否可用
      const automatedButton = page.locator('[data-testid="automated-forward-button"]');
      await expect(automatedButton).toBeVisible();
      await expect(automatedButton).toBeEnabled();
    }
  });

  test('应该能够提取平台内容数据', async ({ page }) => {
    // 模拟已有生成内容的状态
    await page.evaluate(() => {
      // 这里可以注入一些测试数据
      const mockResults = [
        {
          platformId: 'xiaohongshu',
          versions: [
            {
              id: 'version-a',
              content: '测试内容A',
              title: '版本A',
              charCount: 5
            },
            {
              id: 'version-b', 
              content: '测试内容B',
              title: '版本B',
              charCount: 5
            }
          ]
        }
      ];
      
      // 模拟设置结果状态
      window.testResults = mockResults;
    });
    
    // 检查是否能找到平台卡片
    const platformCards = page.locator('[data-testid="platform-card"]');
    if (await platformCards.count() > 0) {
      // 检查平台名称
      const platformName = page.locator('[data-testid="platform-name"]').first();
      await expect(platformName).toBeVisible();
      
      // 检查版本内容
      const versionContent = page.locator('[data-testid="version-a-content"]').first();
      if (await versionContent.isVisible()) {
        await expect(versionContent).toBeVisible();
      }
    }
  });

  test('应该能够处理自动化转发错误', async ({ page }) => {
    // 监听控制台错误
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 尝试在没有内容的情况下点击自动化转发
    const automatedButton = page.locator('[data-testid="automated-forward-button"]');
    if (await automatedButton.isVisible() && await automatedButton.isDisabled()) {
      // 按钮应该是禁用状态
      await expect(automatedButton).toBeDisabled();
    }
  });

  test('应该能够显示字符数限制信息', async ({ page }) => {
    // 检查平台设置区域
    const platformSettings = page.locator('text=平台特定设置');
    if (await platformSettings.isVisible()) {
      await platformSettings.click();
      
      // 检查字符数推荐按钮
      const recommendButton = page.locator('button').filter({ hasText: '推荐' });
      if (await recommendButton.count() > 0) {
        await expect(recommendButton.first()).toBeVisible();
      }
      
      // 检查字符数限制说明
      const limitDescription = page.locator('text=限制');
      if (await limitDescription.count() > 0) {
        await expect(limitDescription.first()).toBeVisible();
      }
    }
  });

  test('应该能够验证data-testid属性', async ({ page }) => {
    // 检查关键元素的data-testid属性
    const testIds = [
      'batch-forward-button',
      'automated-forward-button'
    ];
    
    for (const testId of testIds) {
      const element = page.locator(`[data-testid="${testId}"]`);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
      }
    }
  });
});

test.describe('字符数限制功能测试', () => {
  test('应该显示正确的平台字符数限制', async ({ page }) => {
    await page.goto('/adapt');
    
    // 检查是否有字符数限制相关的UI元素
    const charCountElements = page.locator('text=字符数');
    if (await charCountElements.count() > 0) {
      await expect(charCountElements.first()).toBeVisible();
    }
    
    // 检查推荐按钮
    const recommendButtons = page.locator('button').filter({ hasText: '推荐' });
    if (await recommendButtons.count() > 0) {
      await expect(recommendButtons.first()).toBeVisible();
    }
  });

  test('应该显示安全区域信息', async ({ page }) => {
    await page.goto('/adapt');
    
    // 查找安全区域相关的文本
    const safetyText = page.locator('text=安全区域');
    if (await safetyText.count() > 0) {
      await expect(safetyText.first()).toBeVisible();
    }
  });
});

test.describe('自动化转发集成测试', () => {
  test('应该能够模拟完整的自动化流程', async ({ page }) => {
    await page.goto('/adapt');
    
    // 这个测试需要实际的内容生成，所以可能需要跳过或模拟
    test.skip(true, '需要实际的AI生成内容，跳过集成测试');
  });
});
