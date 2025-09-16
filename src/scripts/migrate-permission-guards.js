#!/usr/bin/env node

/**
 * 🔄 权限守卫组件自动化迁移脚本
 * @description 将项目中剩余的权限守卫组件迁移到统一的 EnhancedUnifiedPermissionGuard
 * @author 权限系统团队
 * @created 2025-01-16
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 迁移配置
const MIGRATION_CONFIG = {
  // 组件映射关系
  componentMapping: {
    'EnhancedPermissionGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'overlay',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:'],
        ['overlayOpacity={', 'overlayIntensity="medium" // 原 overlayOpacity={']
      ]
    },
    'SubscriptionGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'card',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:'],
        ['showOverlay={true}', 'mode="card"'],
        ['showOverlay={false}', 'mode="replace"']
      ]
    },
    'FeatureZoneGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'preview',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:'],
        ['zoneName=', 'featureName='],
        ['allowPreview={true}', 'mode="preview" allowPreview={true}']
      ]
    },
    'NewPermissionGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'dialog',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:']
      ]
    },
    'UnifiedPaywallGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'button',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:']
      ]
    },
    'PermissionGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'badge',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:']
      ]
    },
    'SimplePermissionGuard': {
      newComponent: 'EnhancedUnifiedPermissionGuard',
      mode: 'replace',
      replacements: [
        ['requiredTier=', 'requiredPermission="tier:']
      ]
    }
  },

  // 权限类型映射
  permissionMapping: {
    '"trial"': '"tier:trial"',
    '"pro"': '"tier:pro"',
    '"premium"': '"tier:premium"',
    'creative-studio': 'feature:creative-studio',
    'creative-cube': 'feature:creative-cube',
    'brand-library': 'feature:brand-library',
    'marketing-calendar': 'feature:marketing-calendar',
    'emoji-generator': 'feature:emoji-generator',
    'wechat-templates': 'feature:wechat-templates',
    'unlimited-usage': 'feature:unlimited-usage',
    'advanced-models': 'feature:advanced-models'
  },

  // 需要迁移的文件模式
  filePatterns: [
    'src/**/*.tsx',
    'src/**/*.ts'
  ],

  // 排除的文件
  excludeFiles: [
    'src/components/auth/EnhancedUnifiedPermissionGuard.tsx',
    'src/components/auth/UnifiedPermissionGuard.tsx',
    'src/services/unifiedPermissionService.ts',
    'src/components/auth/LazyAuthComponents.tsx'
  ]
};

class PermissionGuardMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      componentsReplaced: 0,
      permissionsMapped: 0,
      importsUpdated: 0,
      errors: []
    };
  }

  /**
   * 执行完整的迁移流程
   */
  async migrate() {
    console.log('🚀 开始权限守卫组件迁移...\n');

    try {
      // 1. 分析现有组件使用情况
      await this.analyzeCurrentUsage();

      // 2. 备份关键文件
      await this.createBackup();

      // 3. 执行组件替换
      await this.replaceComponents();

      // 4. 更新导入语句
      await this.updateImports();

      // 5. 验证迁移结果
      await this.validateMigration();

      // 6. 生成迁移报告
      await this.generateReport();

      console.log('✅ 权限守卫组件迁移完成！');

    } catch (error) {
      console.error('❌ 迁移过程中出现错误:', error);
      throw error;
    }
  }

  /**
   * 分析现有组件使用情况
   */
  async analyzeCurrentUsage() {
    console.log('🔍 分析现有权限守卫组件使用情况...');

    const files = await this.findTargetFiles();
    const usage = {};

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      Object.keys(MIGRATION_CONFIG.componentMapping).forEach(oldComponent => {
        const regex = new RegExp(`<${oldComponent}[^>]*>`, 'g');
        const matches = content.match(regex);
        
        if (matches) {
          if (!usage[oldComponent]) {
            usage[oldComponent] = [];
          }
          usage[oldComponent].push({
            file: file,
            count: matches.length,
            examples: matches.slice(0, 3) // 只保留前3个示例
          });
        }
      });
    }

    console.log('📊 分析结果:');
    Object.entries(usage).forEach(([component, locations]) => {
      const totalCount = locations.reduce((sum, loc) => sum + loc.count, 0);
      console.log(`  - ${component}: ${totalCount} 处使用，分布在 ${locations.length} 个文件中`);
    });

    this.currentUsage = usage;
    console.log('');
  }

  /**
   * 创建备份
   */
  async createBackup() {
    console.log('💾 创建代码备份...');

    const backupDir = path.join(process.cwd(), 'backup', `permission-guard-migration-${Date.now()}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = await this.findTargetFiles();
    
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const backupPath = path.join(backupDir, relativePath);
      const backupFileDir = path.dirname(backupPath);
      
      if (!fs.existsSync(backupFileDir)) {
        fs.mkdirSync(backupFileDir, { recursive: true });
      }
      
      fs.copyFileSync(file, backupPath);
    }

    console.log(`✅ 已备份 ${files.length} 个文件到: ${backupDir}`);
    this.backupDir = backupDir;
    console.log('');
  }

  /**
   * 替换组件
   */
  async replaceComponents() {
    console.log('🔄 开始替换权限守卫组件...');

    const files = await this.findTargetFiles();

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // 替换每种组件
      Object.entries(MIGRATION_CONFIG.componentMapping).forEach(([oldComponent, config]) => {
        const { newComponent, mode, replacements } = config;

        // 替换组件标签
        const openTagRegex = new RegExp(`<${oldComponent}([^>]*)>`, 'g');
        const closeTagRegex = new RegExp(`</${oldComponent}>`, 'g');

        if (content.includes(`<${oldComponent}`)) {
          // 替换开始标签
          content = content.replace(openTagRegex, (match, attributes) => {
            let newAttributes = attributes;

            // 应用配置的替换规则
            replacements.forEach(([from, to]) => {
              newAttributes = newAttributes.replace(new RegExp(from, 'g'), to);
            });

            // 添加模式属性（如果没有明确指定）
            if (!newAttributes.includes('mode=') && mode !== 'overlay') {
              newAttributes += ` mode="${mode}"`;
            }

            this.stats.componentsReplaced++;
            modified = true;
            return `<${newComponent}${newAttributes}>`;
          });

          // 替换结束标签
          content = content.replace(closeTagRegex, `</${newComponent}>`);
        }
      });

      // 应用权限类型映射
      Object.entries(MIGRATION_CONFIG.permissionMapping).forEach(([oldPermission, newPermission]) => {
        const regex = new RegExp(`requiredPermission="${oldPermission}"`, 'g');
        if (content.includes(`requiredPermission="${oldPermission}"`)) {
          content = content.replace(regex, `requiredPermission="${newPermission}"`);
          this.stats.permissionsMapped++;
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(file, content);
        this.stats.filesProcessed++;
        console.log(`  ✅ 已处理: ${path.relative(process.cwd(), file)}`);
      }
    }

    console.log(`🎯 组件替换完成: 处理了 ${this.stats.filesProcessed} 个文件`);
    console.log('');
  }

  /**
   * 更新导入语句
   */
  async updateImports() {
    console.log('📦 更新导入语句...');

    const files = await this.findTargetFiles();

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // 旧的导入模式
      const oldImportPatterns = [
        /import\s*{\s*([^}]*)\s*}\s*from\s*['"]@\/components\/auth\/[^'"]*Guard['"];?/g,
        /import\s+(\w+)\s+from\s*['"]@\/components\/auth\/[^'"]*Guard['"];?/g
      ];

      oldImportPatterns.forEach(pattern => {
        content = content.replace(pattern, (match) => {
          // 检查是否包含需要迁移的组件
          const needsMigration = Object.keys(MIGRATION_CONFIG.componentMapping).some(comp => 
            match.includes(comp)
          );

          if (needsMigration) {
            // 替换为统一导入
            this.stats.importsUpdated++;
            modified = true;
            return `import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';`;
          }

          return match;
        });
      });

      // 合并重复的导入
      const importLines = content.split('\n').filter(line => 
        line.includes('EnhancedUnifiedPermissionGuard')
      );

      if (importLines.length > 1) {
        // 移除重复导入
        const firstImportIndex = content.indexOf(importLines[0]);
        content = content.replace(importLines[0], '');
        
        // 在第一个导入位置插入统一的导入
        const lines = content.split('\n');
        lines.splice(Math.floor(firstImportIndex / content.length * lines.length), 0, 
          `import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';`
        );
        
        content = lines.join('\n');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ 已更新导入: ${path.relative(process.cwd(), file)}`);
      }
    }

    console.log(`📦 导入语句更新完成: 更新了 ${this.stats.importsUpdated} 处导入`);
    console.log('');
  }

  /**
   * 验证迁移结果
   */
  async validateMigration() {
    console.log('🧪 验证迁移结果...');

    try {
      // 1. TypeScript类型检查
      console.log('  🔍 执行TypeScript类型检查...');
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('  ✅ TypeScript类型检查通过');

      // 2. 构建测试
      console.log('  🏗️ 执行构建测试...');
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✅ 构建测试通过');

      // 3. 检查是否还有旧组件使用
      const files = await this.findTargetFiles();
      const remainingOldComponents = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        
        Object.keys(MIGRATION_CONFIG.componentMapping).forEach(oldComponent => {
          if (content.includes(`<${oldComponent}`)) {
            remainingOldComponents.push({ file, component: oldComponent });
          }
        });
      }

      if (remainingOldComponents.length > 0) {
        console.log('  ⚠️ 发现未迁移的组件:');
        remainingOldComponents.forEach(({ file, component }) => {
          console.log(`    - ${component} in ${path.relative(process.cwd(), file)}`);
        });
      } else {
        console.log('  ✅ 所有旧组件已成功迁移');
      }

    } catch (error) {
      console.error('  ❌ 验证失败:', error.message);
      this.stats.errors.push(`验证失败: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 生成迁移报告
   */
  async generateReport() {
    console.log('📋 生成迁移报告...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      migrations: Object.entries(MIGRATION_CONFIG.componentMapping).map(([oldComponent, config]) => ({
        from: oldComponent,
        to: config.newComponent,
        mode: config.mode,
        replacements: config.replacements.length
      })),
      backup: this.backupDir,
      validation: {
        typecheck: this.stats.errors.length === 0,
        build: this.stats.errors.length === 0
      },
      errors: this.stats.errors
    };

    const reportPath = path.join(process.cwd(), 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('📊 迁移统计:');
    console.log(`  - 处理文件数: ${this.stats.filesProcessed}`);
    console.log(`  - 替换组件数: ${this.stats.componentsReplaced}`);
    console.log(`  - 权限类型映射: ${this.stats.permissionsMapped}`);
    console.log(`  - 导入语句更新: ${this.stats.importsUpdated}`);
    console.log(`  - 错误数量: ${this.stats.errors.length}`);
    console.log(`  - 报告保存至: ${reportPath}`);
    console.log('');
  }

  /**
   * 查找目标文件
   */
  async findTargetFiles() {
    const { glob } = await import('glob');
    const files = [];

    for (const pattern of MIGRATION_CONFIG.filePatterns) {
      const matches = await glob(pattern, { ignore: MIGRATION_CONFIG.excludeFiles });
      files.push(...matches);
    }

    return [...new Set(files)]; // 去重
  }
}

// 执行迁移
if (require.main === module) {
  const migrator = new PermissionGuardMigrator();
  
  migrator.migrate()
    .then(() => {
      console.log('🎉 迁移成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移失败:', error);
      process.exit(1);
    });
}

module.exports = { PermissionGuardMigrator, MIGRATION_CONFIG };