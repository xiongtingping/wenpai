/**
 * 组件保护检查器
 * 用于检查受保护组件的完整性和防止意外修改
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ProtectedComponent {
  name: string;
  path: string;
  protectionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  lockDate: string;
  description: string;
  protectedSections: string[];
  modificationPolicy: {
    coreModification: string;
    featureRemoval: string;
    dataFlowChanges: string;
    newFeatures: string;
    bugFixes: string;
  };
  contact: string;
  lastModified: string;
  checksum: string;
  dependencies: string[];
}

interface ProtectionConfig {
  protectedComponents: ProtectedComponent[];
  protectionRules: Record<string, any>;
  enforcementMethods: string[];
  bypassProcedure: Record<string, string>;
}

/**
 * 保护检查器类
 */
export class ProtectionChecker {
  private configPath: string;
  private config: ProtectionConfig | null = null;

  constructor(configPath: string = 'src/config/protected-components.json') {
    this.configPath = configPath;
    this.loadConfig();
  }

  /**
   * 加载保护配置
   */
  private loadConfig(): void {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('Failed to load protection config:', error);
      this.config = null;
    }
  }

  /**
   * 计算文件校验和
   */
  private calculateChecksum(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      console.error(`Failed to calculate checksum for ${filePath}:`, error);
      return '';
    }
  }

  /**
   * 检查组件是否受保护
   */
  public isProtected(filePath: string): boolean {
    if (!this.config) return false;
    
    return this.config.protectedComponents.some(
      component => component.path === filePath
    );
  }

  /**
   * 获取组件保护级别
   */
  public getProtectionLevel(filePath: string): string | null {
    if (!this.config) return null;
    
    const component = this.config.protectedComponents.find(
      comp => comp.path === filePath
    );
    
    return component?.protectionLevel || null;
  }

  /**
   * 验证组件完整性
   */
  public verifyIntegrity(filePath: string): {
    isValid: boolean;
    message: string;
    component?: ProtectedComponent;
  } {
    if (!this.config) {
      return { isValid: false, message: 'Protection config not loaded' };
    }

    const component = this.config.protectedComponents.find(
      comp => comp.path === filePath
    );

    if (!component) {
      return { isValid: true, message: 'Component not protected' };
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        isValid: false,
        message: `Protected component file not found: ${filePath}`,
        component
      };
    }

    // 计算当前校验和
    const currentChecksum = this.calculateChecksum(filePath);
    
    // 如果校验和不匹配，可能被修改
    if (component.checksum !== 'auto-generated' && component.checksum !== currentChecksum) {
      return {
        isValid: false,
        message: `Protected component may have been modified: ${filePath}`,
        component
      };
    }

    return {
      isValid: true,
      message: 'Component integrity verified',
      component
    };
  }

  /**
   * 检查保护标记
   */
  public checkProtectionMarkers(filePath: string): {
    hasMarkers: boolean;
    markers: string[];
    missing: string[];
  } {
    const requiredMarkers = [
      'PROTECTED',
      'LOCKED',
      'DO NOT MODIFY',
      'CRITICAL'
    ];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const foundMarkers = requiredMarkers.filter(marker => 
        content.includes(marker)
      );
      const missingMarkers = requiredMarkers.filter(marker => 
        !content.includes(marker)
      );

      return {
        hasMarkers: foundMarkers.length > 0,
        markers: foundMarkers,
        missing: missingMarkers
      };
    } catch (error) {
      return {
        hasMarkers: false,
        markers: [],
        missing: requiredMarkers
      };
    }
  }

  /**
   * 生成保护报告
   */
  public generateReport(): string {
    if (!this.config) {
      return 'Protection config not available';
    }

    let report = '=== COMPONENT PROTECTION REPORT ===\n\n';
    
    this.config.protectedComponents.forEach(component => {
      const integrity = this.verifyIntegrity(component.path);
      const markers = this.checkProtectionMarkers(component.path);
      
      report += `Component: ${component.name}\n`;
      report += `Path: ${component.path}\n`;
      report += `Protection Level: ${component.protectionLevel}\n`;
      report += `Lock Date: ${component.lockDate}\n`;
      report += `Integrity: ${integrity.isValid ? 'VALID' : 'INVALID'}\n`;
      report += `Protection Markers: ${markers.hasMarkers ? 'PRESENT' : 'MISSING'}\n`;
      
      if (!integrity.isValid) {
        report += `⚠️  Issue: ${integrity.message}\n`;
      }
      
      if (!markers.hasMarkers) {
        report += `⚠️  Missing markers: ${markers.missing.join(', ')}\n`;
      }
      
      report += '\n';
    });

    return report;
  }

  /**
   * 更新组件校验和
   */
  public updateChecksum(filePath: string): boolean {
    if (!this.config) return false;

    const componentIndex = this.config.protectedComponents.findIndex(
      comp => comp.path === filePath
    );

    if (componentIndex === -1) return false;

    const newChecksum = this.calculateChecksum(filePath);
    this.config.protectedComponents[componentIndex].checksum = newChecksum;
    this.config.protectedComponents[componentIndex].lastModified = new Date().toISOString();

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to update config:', error);
      return false;
    }
  }
}

/**
 * 默认保护检查器实例
 */
export const protectionChecker = new ProtectionChecker();

/**
 * 检查文件是否受保护的便捷函数
 */
export function isFileProtected(filePath: string): boolean {
  return protectionChecker.isProtected(filePath);
}

/**
 * 验证受保护文件完整性的便捷函数
 */
export function verifyFileIntegrity(filePath: string) {
  return protectionChecker.verifyIntegrity(filePath);
}

/**
 * 生成保护报告的便捷函数
 */
export function generateProtectionReport(): string {
  return protectionChecker.generateReport();
}
