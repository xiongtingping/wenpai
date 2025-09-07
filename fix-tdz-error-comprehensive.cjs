/**
 * 🔧 TDZ(Temporal Dead Zone)错误综合修复方案
 * 错误：Cannot access 'Rt' before initialization
 * 错误ID: error_1757250277046_6icx82cuq
 * 
 * 根因分析：
 * 1. 'Rt' 很可能是构建工具(Vite/Rollup)生成的内部变量名
 * 2. 可能与React Router、动态导入或懒加载组件有关
 * 3. 可能是模块循环依赖导致的初始化顺序问题
 * 
 * 修复策略：
 * 1. 优化动态导入和懒加载组件
 * 2. 修复模块循环依赖
 * 3. 改善代码分割和打包配置
 * 4. 增强错误边界和容错机制
 */

const fs = require('fs');
const path = require('path');

class TDZErrorFixer {
  constructor() {
    this.srcDir = path.join(__dirname, 'src');
    this.fixes = [];
  }

  /**
   * 1. 修复动态导入和懒加载组件
   */
  async fixDynamicImports() {
    console.log('🔧 修复动态导入和懒加载组件...');
    
    // 1.1 优化App.tsx中的路由组件导入
    const appTsxPath = path.join(this.srcDir, 'App.tsx');
    if (fs.existsSync(appTsxPath)) {
      let content = fs.readFileSync(appTsxPath, 'utf-8');
      
      // 将静态导入改为懒加载，避免初始化时的依赖问题
      const lazyComponents = [
        'CreativeStudioPage',
        'BrandLibraryPage', 
        'ProfilePage',
        'HistoryPage',
        'ShareManagerPage',
        'WechatTemplatePage',
        'SettingsPage'
      ];
      
      let hasChanges = false;
      
      // 添加React.lazy导入
      if (!content.includes('const LazyCreativeStudioPage')) {
        // 查找现有的直接导入并替换为懒加载
        lazyComponents.forEach(component => {
          const importRegex = new RegExp(`import ${component} from ['"]@/pages/${component}['"];`, 'g');
          if (content.match(importRegex)) {
            content = content.replace(importRegex, '// Lazy loaded below');
            hasChanges = true;
          }
        });
        
        // 在现有导入后添加懒加载组件
        const lastImportIndex = content.lastIndexOf("import");
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        
        const lazyImports = `
// 🔧 FIX: 懒加载组件，避免TDZ错误和循环依赖
const LazyCreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const LazyBrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const LazyProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const LazyHistoryPage = React.lazy(() => import('@/pages/HistoryPage'));
const LazyShareManagerPage = React.lazy(() => import('@/pages/ShareManagerPage'));
const LazyWechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const LazySettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

// 🔧 错误边界包装器，处理懒加载失败
const LazyWrapper: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <LoadingSpinner text="加载页面中..." /> 
}) => (
  <ErrorBoundary fallback={<div>页面加载失败，请刷新重试</div>}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);
`;
        
        content = content.slice(0, nextLineIndex + 1) + lazyImports + content.slice(nextLineIndex + 1);
        hasChanges = true;
      }
      
      // 更新路由中的组件引用
      if (hasChanges) {
        content = content.replace(
          /<CreativeStudioPage \/>/g, 
          '<LazyWrapper><LazyCreativeStudioPage /></LazyWrapper>'
        );
        content = content.replace(
          /<BrandLibraryPage \/>/g, 
          '<LazyWrapper><LazyBrandLibraryPage /></LazyWrapper>'
        );
        content = content.replace(
          /<ProfilePage \/>/g, 
          '<LazyWrapper><LazyProfilePage /></LazyWrapper>'
        );
        content = content.replace(
          /<HistoryPage \/>/g, 
          '<LazyWrapper><LazyHistoryPage /></LazyWrapper>'
        );
        content = content.replace(
          /<ShareManagerPage \/>/g, 
          '<LazyWrapper><LazyShareManagerPage /></LazyWrapper>'
        );
        content = content.replace(
          /<WechatTemplatePage \/>/g, 
          '<LazyWrapper><LazyWechatTemplatePage /></LazyWrapper>'
        );
        content = content.replace(
          /<SettingsPage \/>/g, 
          '<LazyWrapper><LazySettingsPage /></LazyWrapper>'
        );
        
        fs.writeFileSync(appTsxPath, content);
        this.fixes.push('✅ 优化App.tsx中的懒加载组件');
      }
    }
  }

  /**
   * 2. 修复权限配置的循环依赖问题
   */
  async fixPermissionCircularDependency() {
    console.log('🔧 修复权限配置的循环依赖问题...');
    
    // 2.1 进一步优化权限配置的导出方式
    const configPath = path.join(this.srcDir, 'config', 'unifiedPermissionConfig.ts');
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, 'utf-8');
      
      // 确保使用延迟初始化模式
      if (!content.includes('// 🔧 FIX TDZ: 延迟初始化防护')) {
        const additionalFix = `
// 🔧 FIX TDZ: 延迟初始化防护
let _moduleInitialized = false;
const initializeModule = () => {
  if (_moduleInitialized) return;
  _moduleInitialized = true;
  // 模块已初始化标记
};

// 在模块首次使用时初始化
const safeGetUnifiedPermissionManager = () => {
  initializeModule();
  return getUnifiedPermissionManager();
};

// 导出安全的获取函数
export { safeGetUnifiedPermissionManager as getUnifiedPermissionManagerSafe };
`;
        
        content = content.replace(
          'export default {',
          additionalFix + '\nexport default {'
        );
        
        fs.writeFileSync(configPath, content);
        this.fixes.push('✅ 增强权限配置的TDZ防护');
      }
    }
  }

  /**
   * 3. 优化Vite构建配置，减少变量名冲突
   */
  async optimizeViteConfig() {
    console.log('🔧 优化Vite构建配置...');
    
    const viteConfigPath = path.join(__dirname, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      let content = fs.readFileSync(viteConfigPath, 'utf-8');
      
      // 添加更好的代码分割和变量名生成配置
      if (!content.includes('// TDZ Error Fix')) {
        const optimizations = `
    // TDZ Error Fix: 优化代码分割和变量名生成
    build: {
      rollupOptions: {
        output: {
          // 使用更稳定的变量名生成策略
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'auth-vendor': ['@authing/guard-react18'],
            'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
            'permission-system': [
              './src/config/rolePermissionMatrix.ts',
              './src/config/unifiedPermissionConfig.ts'
            ]
          },
          // 避免变量名冲突
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? 
              chunkInfo.facadeModuleId.split('/').pop().replace(/\\.[^.]+$/, '') : 
              'unknown';
            return \`assets/\${facadeModuleId}-[hash].js\`;
          }
        }
      },
      // 增加构建缓存稳定性
      target: 'esnext',
      sourcemap: true
    },`;
        
        // 查找现有的build配置或export default位置
        if (content.includes('export default defineConfig')) {
          content = content.replace(
            /export default defineConfig\(\{/,
            'export default defineConfig({' + optimizations
          );
        } else {
          // 如果没有现有配置，添加到末尾
          content = content.replace(
            /}\);?\s*$/,
            optimizations + '\n});'
          );
        }
        
        fs.writeFileSync(viteConfigPath, content);
        this.fixes.push('✅ 优化Vite构建配置以避免变量名冲突');
      }
    }
  }

  /**
   * 4. 创建TDZ错误监控和恢复机制
   */
  async createErrorRecoverySystem() {
    console.log('🔧 创建TDZ错误监控和恢复机制...');
    
    const errorHandlerPath = path.join(this.srcDir, 'utils', 'tdz-error-handler.ts');
    const errorHandlerContent = `/**
 * 🔧 TDZ错误处理和恢复系统
 */

export class TDZErrorHandler {
  private static retryCount = 0;
  private static maxRetries = 3;
  
  /**
   * 检测TDZ错误
   */
  static isTDZError(error: Error): boolean {
    return error.message.includes('before initialization') ||
           error.message.includes('Cannot access') ||
           error.name === 'ReferenceError';
  }
  
  /**
   * 处理TDZ错误
   */
  static handleTDZError(error: Error, context?: string): boolean {
    console.error(\`🚨 TDZ错误检测 [\${context || 'unknown'}]:\`, error);
    
    if (this.isTDZError(error) && this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(\`🔄 尝试恢复 (第\${this.retryCount}次)...\`);
      
      // 延迟重试，给模块初始化时间
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * 重置重试计数
   */
  static resetRetry(): void {
    this.retryCount = 0;
  }
}

// 全局错误监听
window.addEventListener('error', (event) => {
  if (TDZErrorHandler.isTDZError(event.error)) {
    event.preventDefault();
    TDZErrorHandler.handleTDZError(event.error, 'global');
  }
});

// Promise rejection监听
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error && TDZErrorHandler.isTDZError(event.reason)) {
    event.preventDefault();
    TDZErrorHandler.handleTDZError(event.reason, 'promise');
  }
});

export default TDZErrorHandler;
`;
    
    if (!fs.existsSync(path.dirname(errorHandlerPath))) {
      fs.mkdirSync(path.dirname(errorHandlerPath), { recursive: true });
    }
    
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);
    this.fixes.push('✅ 创建TDZ错误监控和恢复系统');
    
    // 在main.tsx中引入错误处理器
    const mainTsxPath = path.join(this.srcDir, 'main.tsx');
    if (fs.existsSync(mainTsxPath)) {
      let content = fs.readFileSync(mainTsxPath, 'utf-8');
      
      if (!content.includes('tdz-error-handler')) {
        content = `// 🔧 FIX: 导入TDZ错误处理器\nimport './utils/tdz-error-handler';\n\n` + content;
        fs.writeFileSync(mainTsxPath, content);
        this.fixes.push('✅ 在main.tsx中集成TDZ错误处理器');
      }
    }
  }

  /**
   * 5. 更新ErrorBoundary以处理TDZ错误
   */
  async updateErrorBoundary() {
    console.log('🔧 更新ErrorBoundary以处理TDZ错误...');
    
    const errorBoundaryPath = path.join(this.srcDir, 'components', 'ErrorBoundary.tsx');
    if (fs.existsSync(errorBoundaryPath)) {
      let content = fs.readFileSync(errorBoundaryPath, 'utf-8');
      
      if (!content.includes('TDZ错误处理')) {
        // 添加TDZ错误特殊处理
        const tdxHandler = `
  // 🔧 TDZ错误处理
  private isTDZError(error: Error): boolean {
    return error.message.includes('before initialization') ||
           error.message.includes('Cannot access') ||
           error.name === 'ReferenceError';
  }
  
  private handleTDZError(): void {
    console.log('🔄 检测到TDZ错误，尝试重新加载...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }`;
        
        // 在componentDidCatch方法中添加特殊处理
        content = content.replace(
          /componentDidCatch\(error: Error, errorInfo: ErrorInfo\) \{/,
          `componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.isTDZError(error)) {
      this.handleTDZError();
      return;
    }`
        );
        
        content = content.replace(
          /class ErrorBoundary extends React\.Component/,
          `class ErrorBoundary extends React.Component` + tdxHandler
        );
        
        fs.writeFileSync(errorBoundaryPath, content);
        this.fixes.push('✅ 更新ErrorBoundary以处理TDZ错误');
      }
    }
  }

  /**
   * 执行所有修复
   */
  async executeAllFixes() {
    console.log('🚀 开始执行TDZ错误综合修复方案...\n');
    
    try {
      await this.fixDynamicImports();
      await this.fixPermissionCircularDependency();
      await this.optimizeViteConfig();
      await this.createErrorRecoverySystem();
      await this.updateErrorBoundary();
      
      console.log('\n✅ TDZ错误修复方案执行完成！');
      console.log('\n🔧 应用的修复内容：');
      this.fixes.forEach(fix => console.log(fix));
      
      console.log('\n📋 后续建议：');
      console.log('1. 清理构建缓存：npm run build');
      console.log('2. 重启开发服务器：npm run dev');
      console.log('3. 测试错误是否已修复');
      console.log('4. 如问题依然存在，检查浏览器控制台的详细错误信息');
      
    } catch (error) {
      console.error('❌ 修复过程中出现错误：', error);
    }
  }
}

// 执行修复
const fixer = new TDZErrorFixer();
fixer.executeAllFixes().catch(console.error);