/**
 * 权限守卫迁移脚本
 * 
 * 帮助将现有的权限守卫组件迁移到新的统一守卫系统
 */

import { AuthGuard, ProtectedRoute, PermissionGuard, PreviewGuard, VIPGuard, FeatureGuard } from './index';

/**
 * 迁移映射表
 * 将旧的守卫组件映射到新的守卫组件
 */
export const guardMigrationMap = {
  // 旧组件 -> 新组件
  'AuthGuard': AuthGuard,
  'ProtectedRoute': ProtectedRoute,
  'PermissionGuard': PermissionGuard,
  'PreviewGuard': PreviewGuard,
  'VIPGuard': VIPGuard,
  'FeatureGuard': FeatureGuard,
};

/**
 * 迁移示例：App.tsx
 * 
 * 将现有的 App.tsx 中的守卫组件迁移到新的统一守卫系统
 */
export const migrateAppTsx = () => {
  const oldCode = `
// 旧的导入方式
import AuthGuard from '@/components/auth/AuthGuard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PermissionGuard from '@/components/auth/PermissionGuard';
import PreviewGuard from '@/components/auth/PreviewGuard';
import VIPGuard from '@/components/auth/VIPGuard';
import FeatureGuard from '@/components/auth/FeatureGuard';

// 旧的路由配置
<Route path="/adapt" element={
  <AuthGuard>
    <AdaptPage />
  </AuthGuard>
} />

<Route path="/creative-studio" element={
  <AuthGuard>
    <PreviewGuard
      featureId="creative-studio"
      featureName="创意魔方"
      featureDescription="AI驱动的创意内容生成工具，包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器"
      allowClose={true}
    >
      <CreativeStudioPage />
    </PreviewGuard>
  </AuthGuard>
} />
  `;

  const newCode = `
// 新的导入方式
import { 
  AuthGuard, 
  ProtectedRoute, 
  PermissionGuard, 
  PreviewGuard, 
  VIPGuard, 
  FeatureGuard 
} from '@/guards';

// 新的路由配置
<Route path="/adapt" element={
  <AuthGuard>
    <AdaptPage />
  </AuthGuard>
} />

<Route path="/creative-studio" element={
  <AuthGuard>
    <PreviewGuard
      featureId="creative-studio"
      featureName="创意魔方"
      featureDescription="AI驱动的创意内容生成工具，包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器"
      allowClose={true}
    >
      <CreativeStudioPage />
    </PreviewGuard>
  </AuthGuard>
} />
  `;

  return { oldCode, newCode };
};

/**
 * 迁移检查函数
 * 检查代码中是否使用了旧的守卫组件
 */
export const checkMigrationNeeded = (code: string): string[] => {
  const oldImports = [
    "from '@/components/auth/AuthGuard'",
    "from '@/components/auth/ProtectedRoute'",
    "from '@/components/auth/PermissionGuard'",
    "from '@/components/auth/PreviewGuard'",
    "from '@/components/auth/VIPGuard'",
    "from '@/components/auth/FeatureGuard'",
  ];

  const foundImports: string[] = [];
  
  oldImports.forEach(importPath => {
    if (code.includes(importPath)) {
      foundImports.push(importPath);
    }
  });

  return foundImports;
};

/**
 * 自动迁移函数
 * 自动替换代码中的旧导入为新导入
 */
export const autoMigrate = (code: string): string => {
  let migratedCode = code;

  // 替换导入语句
  const importReplacements = [
    {
      old: "from '@/components/auth/AuthGuard'",
      new: "from '@/guards'"
    },
    {
      old: "from '@/components/auth/ProtectedRoute'",
      new: "from '@/guards'"
    },
    {
      old: "from '@/components/auth/PermissionGuard'",
      new: "from '@/guards'"
    },
    {
      old: "from '@/components/auth/PreviewGuard'",
      new: "from '@/guards'"
    },
    {
      old: "from '@/components/auth/VIPGuard'",
      new: "from '@/guards'"
    },
    {
      old: "from '@/components/auth/FeatureGuard'",
      new: "from '@/guards'"
    }
  ];

  importReplacements.forEach(({ old, new: newImport }) => {
    migratedCode = migratedCode.replace(new RegExp(old, 'g'), newImport);
  });

  // 合并多个导入语句
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@\/guards['"];?\s*/g;
  const imports = new Set<string>();
  
  migratedCode = migratedCode.replace(importRegex, (match, importList) => {
    importList.split(',').forEach(imp => {
      imports.add(imp.trim());
    });
    return '';
  });

  // 添加统一的导入语句
  if (imports.size > 0) {
    const importStatement = `import { ${Array.from(imports).join(', ')} } from '@/guards';`;
    migratedCode = importStatement + '\n' + migratedCode;
  }

  return migratedCode;
};

/**
 * 迁移验证函数
 * 验证迁移后的代码是否正确
 */
export const validateMigration = (code: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 检查是否还有旧的导入
  const oldImports = checkMigrationNeeded(code);
  if (oldImports.length > 0) {
    errors.push(`发现旧的导入语句: ${oldImports.join(', ')}`);
  }

  // 检查是否有新的导入
  if (!code.includes("from '@/guards'")) {
    errors.push('缺少新的守卫组件导入');
  }

  // 检查守卫组件使用是否正确
  const guardComponents = ['AuthGuard', 'ProtectedRoute', 'PermissionGuard', 'PreviewGuard', 'VIPGuard', 'FeatureGuard'];
  const usedGuards = guardComponents.filter(guard => code.includes(guard));
  
  if (usedGuards.length > 0 && !code.includes("from '@/guards'")) {
    errors.push(`使用了守卫组件但未导入: ${usedGuards.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 迁移指南
 */
export const migrationGuide = {
  step1: '检查现有代码中的守卫组件使用情况',
  step2: '更新导入语句，使用统一的 @/guards 导入',
  step3: '验证守卫组件的 Props 是否兼容',
  step4: '测试迁移后的功能是否正常',
  step5: '删除旧的守卫组件文件（可选）'
};

export default {
  migrateAppTsx,
  checkMigrationNeeded,
  autoMigrate,
  validateMigration,
  migrationGuide
}; 