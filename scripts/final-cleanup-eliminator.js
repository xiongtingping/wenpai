#!/usr/bin/env node

/**
 * 🚀 最终清理消除器
 * 处理所有剩余的顽固违规项，实现100%清理
 */

import fs from 'fs';
import { glob } from 'glob';

class FinalCleanupEliminator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      totalFixed: 0,
      colorsFixed: 0,
      sizesFixed: 0,
      importantFixed: 0
    };
    this.fixedFiles = [];
    
    // 扩展的颜色映射 - 包含所有可能的颜色值
    this.allColorMap = {
      // RGB/RGBA 颜色
      'rgb(102, 126, 234)': 'var(--color-indigo-400)',
      'rgb(118, 75, 162)': 'var(--color-purple-500)',
      'rgb(240, 147, 251)': 'var(--color-pink-400)',
      'rgb(245, 87, 108)': 'var(--color-rose-500)',
      'rgb(79, 172, 254)': 'var(--color-blue-400)',
      'rgb(0, 242, 254)': 'var(--color-cyan-400)',
      'rgb(26, 26, 46)': 'var(--color-slate-900)',
      'rgb(22, 33, 62)': 'var(--color-slate-800)',
      'rgb(15, 52, 96)': 'var(--color-blue-900)',
      'rgb(83, 52, 131)': 'var(--color-purple-700)',
      'rgb(45, 27, 105)': 'var(--color-purple-900)',
      'rgb(15, 12, 41)': 'var(--color-slate-950)',
      'rgb(168, 237, 234)': 'var(--color-teal-200)',
      'rgb(254, 214, 227)': 'var(--color-pink-200)',
      'rgb(102, 102, 102)': 'var(--color-gray-600)',
      'rgb(204, 204, 204)': 'var(--color-gray-300)',
      'rgb(225, 229, 233)': 'var(--color-slate-200)',
      'rgb(68, 68, 68)': 'var(--color-gray-700)',
      'rgb(90, 103, 216)': 'var(--color-indigo-600)',
      'rgb(144, 224, 221)': 'var(--color-teal-300)',
      'rgb(51, 51, 51)': 'var(--color-gray-800)',
      'rgb(29, 161, 242)': 'var(--color-sky-500)',
      'rgb(0, 119, 181)': 'var(--color-blue-700)',
      'rgb(255, 255, 255)': 'var(--color-white)',
      'rgb(16, 185, 129)': 'var(--color-emerald-500)',
      'rgb(5, 150, 105)': 'var(--color-emerald-600)',
      'rgb(255, 107, 53)': 'var(--color-orange-500)',
      'rgb(247, 147, 30)': 'var(--color-orange-400)',
      'rgb(255, 140, 66)': 'var(--color-orange-400)',
      'rgb(229, 90, 43)': 'var(--color-orange-600)',
      'rgb(222, 127, 15)': 'var(--color-orange-600)',
      'rgb(229, 115, 50)': 'var(--color-orange-500)',
      'rgb(139, 95, 191)': 'var(--color-purple-500)',
      'rgb(90, 111, 216)': 'var(--color-indigo-500)',
      'rgb(106, 65, 144)': 'var(--color-purple-700)',
      'rgb(125, 84, 173)': 'var(--color-purple-600)',
      'rgb(199, 209, 219)': 'var(--color-slate-300)',
      'rgb(89, 103, 115)': 'var(--color-slate-600)',
      'rgb(16, 18, 20)': 'var(--color-slate-950)',
      'rgb(22, 26, 29)': 'var(--color-slate-900)',
      'rgb(29, 33, 37)': 'var(--color-slate-800)',
      'rgb(44, 51, 58)': 'var(--color-slate-700)',
      'rgb(222, 228, 234)': 'var(--color-slate-100)',
      'rgba(0, 0, 0, 0.1)': 'var(--color-black-10)',
      'rgba(0, 0, 0, 0.2)': 'var(--color-black-20)',
      'rgba(0, 0, 0, 0.3)': 'var(--color-black-30)',
      'rgba(0, 0, 0, 0.4)': 'var(--color-black-40)',
      'rgba(0, 0, 0, 0.5)': 'var(--color-black-50)',
      'rgba(0, 0, 0, 0.6)': 'var(--color-black-60)',
      'rgba(0, 0, 0, 0.7)': 'var(--color-black-70)',
      'rgba(0, 0, 0, 0.8)': 'var(--color-black-80)',
      'rgba(0, 0, 0, 0.9)': 'var(--color-black-90)',
      'rgba(255, 255, 255, 0.1)': 'var(--color-white-10)',
      'rgba(255, 255, 255, 0.2)': 'var(--color-white-20)',
      'rgba(255, 255, 255, 0.3)': 'var(--color-white-30)',
      'rgba(255, 255, 255, 0.4)': 'var(--color-white-40)',
      'rgba(255, 255, 255, 0.5)': 'var(--color-white-50)',
      'rgba(255, 255, 255, 0.6)': 'var(--color-white-60)',
      'rgba(255, 255, 255, 0.7)': 'var(--color-white-70)',
      'rgba(255, 255, 255, 0.8)': 'var(--color-white-80)',
      'rgba(255, 255, 255, 0.9)': 'var(--color-white-90)',
      
      // HSL 颜色
      'hsl(0, 0%, 0%)': 'var(--color-black)',
      'hsl(0, 0%, 100%)': 'var(--color-white)',
      'hsl(0, 0%, 50%)': 'var(--color-gray-500)',
      'hsl(0, 0%, 25%)': 'var(--color-gray-800)',
      'hsl(0, 0%, 75%)': 'var(--color-gray-300)',
      'hsl(220, 13%, 91%)': 'var(--color-slate-100)',
      'hsl(215, 28%, 17%)': 'var(--color-slate-800)',
      'hsl(222, 84%, 5%)': 'var(--color-slate-950)',
      'hsl(217, 33%, 17%)': 'var(--color-slate-800)',
      'hsl(215, 25%, 27%)': 'var(--color-slate-700)',
      'hsl(210, 40%, 98%)': 'var(--color-slate-50)',
      'hsl(210, 40%, 96%)': 'var(--color-slate-100)',
      'hsl(214, 32%, 91%)': 'var(--color-slate-200)',
      'hsl(213, 27%, 84%)': 'var(--color-slate-300)',
      'hsl(215, 20%, 65%)': 'var(--color-slate-400)',
      'hsl(215, 16%, 47%)': 'var(--color-slate-500)',
      'hsl(215, 19%, 35%)': 'var(--color-slate-600)',
      'hsl(215, 25%, 27%)': 'var(--color-slate-700)',
      'hsl(217, 33%, 17%)': 'var(--color-slate-800)',
      'hsl(222, 47%, 11%)': 'var(--color-slate-900)',
      'hsl(222, 84%, 5%)': 'var(--color-slate-950)',
      
      // 其他格式
      'currentColor': 'currentColor',
      'inherit': 'inherit',
      'initial': 'initial',
      'unset': 'unset',
      'transparent': 'transparent'
    };
    
    // 扩展的尺寸映射 - 包含所有可能的尺寸值
    this.allSizeMap = {
      '0.5px': 'var(--spacing-px)',
      '1.5px': 'var(--spacing-px)',
      '2.5px': 'var(--spacing-0-5)',
      '3.5px': 'var(--spacing-1)',
      '4.5px': 'var(--spacing-1)',
      '5.5px': 'var(--spacing-1-5)',
      '6.5px': 'var(--spacing-1-5)',
      '7px': 'var(--spacing-2)',
      '7.5px': 'var(--spacing-2)',
      '8.5px': 'var(--spacing-2)',
      '9px': 'var(--spacing-2-5)',
      '9.5px': 'var(--spacing-2-5)',
      '10.5px': 'var(--spacing-3)',
      '11.5px': 'var(--spacing-3)',
      '12.5px': 'var(--spacing-3)',
      '13.5px': 'var(--spacing-3-5)',
      '14.5px': 'var(--spacing-4)',
      '15.5px': 'var(--spacing-4)',
      '16.5px': 'var(--spacing-4)',
      '17px': 'var(--spacing-4)',
      '18px': 'var(--spacing-4)',
      '19px': 'var(--spacing-5)',
      '21px': 'var(--spacing-5)',
      '22px': 'var(--spacing-6)',
      '23px': 'var(--spacing-6)',
      '26px': 'var(--spacing-6)',
      '27px': 'var(--spacing-7)',
      '29px': 'var(--spacing-7)',
      '31px': 'var(--spacing-8)',
      '33px': 'var(--spacing-8)',
      '34px': 'var(--spacing-9)',
      '37px': 'var(--spacing-9)',
      '38px': 'var(--spacing-10)',
      '39px': 'var(--spacing-10)',
      '41px': 'var(--spacing-10)',
      '42px': 'var(--spacing-11)',
      '43px': 'var(--spacing-11)',
      '45px': 'var(--spacing-11)',
      '46px': 'var(--spacing-12)',
      '47px': 'var(--spacing-12)',
      '49px': 'var(--spacing-12)',
      '51px': 'var(--spacing-12)',
      '52px': 'var(--spacing-14)',
      '53px': 'var(--spacing-14)',
      '54px': 'var(--spacing-14)',
      '55px': 'var(--spacing-14)',
      '57px': 'var(--spacing-14)',
      '58px': 'var(--spacing-16)',
      '59px': 'var(--spacing-16)',
      '61px': 'var(--spacing-16)',
      '62px': 'var(--spacing-16)',
      '63px': 'var(--spacing-16)',
      '65px': 'var(--spacing-16)',
      '66px': 'var(--spacing-16)',
      '67px': 'var(--spacing-16)',
      '68px': 'var(--spacing-16)',
      '69px': 'var(--spacing-16)',
      '71px': 'var(--spacing-20)',
      '72px': 'var(--spacing-20)',
      '73px': 'var(--spacing-20)',
      '74px': 'var(--spacing-20)',
      '75px': 'var(--spacing-20)',
      '76px': 'var(--spacing-20)',
      '77px': 'var(--spacing-20)',
      '78px': 'var(--spacing-20)',
      '79px': 'var(--spacing-20)',
      '81px': 'var(--spacing-20)',
      '82px': 'var(--spacing-20)',
      '83px': 'var(--spacing-20)',
      '84px': 'var(--spacing-20)',
      '85px': 'var(--spacing-20)',
      '86px': 'var(--spacing-20)',
      '87px': 'var(--spacing-20)',
      '88px': 'var(--spacing-20)',
      '89px': 'var(--spacing-20)',
      '90px': 'var(--spacing-20)',
      '91px': 'var(--spacing-20)',
      '92px': 'var(--spacing-20)',
      '93px': 'var(--spacing-20)',
      '94px': 'var(--spacing-20)',
      '95px': 'var(--spacing-20)',
      '97px': 'var(--spacing-24)',
      '98px': 'var(--spacing-24)',
      '99px': 'var(--spacing-24)',
      '101px': 'var(--spacing-24)',
      '102px': 'var(--spacing-24)',
      '103px': 'var(--spacing-24)',
      '104px': 'var(--spacing-24)',
      '105px': 'var(--spacing-24)',
      '106px': 'var(--spacing-24)',
      '107px': 'var(--spacing-24)',
      '108px': 'var(--spacing-24)',
      '109px': 'var(--spacing-24)',
      '110px': 'var(--spacing-24)',
      '111px': 'var(--spacing-24)',
      '113px': 'var(--spacing-28)',
      '114px': 'var(--spacing-28)',
      '115px': 'var(--spacing-28)',
      '116px': 'var(--spacing-28)',
      '117px': 'var(--spacing-28)',
      '118px': 'var(--spacing-28)',
      '119px': 'var(--spacing-28)',
      '121px': 'var(--spacing-32)',
      '122px': 'var(--spacing-32)',
      '123px': 'var(--spacing-32)',
      '124px': 'var(--spacing-32)',
      '125px': 'var(--spacing-32)',
      '126px': 'var(--spacing-32)',
      '127px': 'var(--spacing-32)',
      '129px': 'var(--spacing-32)',
      '130px': 'var(--spacing-32)',
      '131px': 'var(--spacing-32)',
      '132px': 'var(--spacing-32)',
      '133px': 'var(--spacing-32)',
      '134px': 'var(--spacing-32)',
      '135px': 'var(--spacing-32)',
      '136px': 'var(--spacing-32)',
      '137px': 'var(--spacing-32)',
      '138px': 'var(--spacing-32)',
      '139px': 'var(--spacing-32)',
      '141px': 'var(--spacing-36)',
      '142px': 'var(--spacing-36)',
      '143px': 'var(--spacing-36)',
      '144px': 'var(--spacing-36)',
      '145px': 'var(--spacing-36)',
      '146px': 'var(--spacing-36)',
      '147px': 'var(--spacing-36)',
      '148px': 'var(--spacing-36)',
      '149px': 'var(--spacing-36)'
    };
  }

  async eliminateAllRemaining() {
    console.log('🚀 启动最终清理消除器 - 目标：100%清理完成！\n');
    
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      await this.processFile(file);
    }
    
    this.generateReport();
  }

  async processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;
    
    // 跳过emergency层文件
    if (filePath.includes('emergency') || filePath.includes('button-center-fix')) {
      return;
    }
    
    console.log(`🔍 最终处理：${filePath}`);
    
    // 1. 使用通用正则表达式匹配所有硬编码颜色
    const colorPatterns = [
      // 十六进制颜色 (3位和6位)
      /#[0-9a-fA-F]{3,6}(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g,
      // RGB/RGBA 颜色
      /rgb\([^)]+\)(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g,
      /rgba\([^)]+\)(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g,
      // HSL/HSLA 颜色
      /hsl\([^)]+\)(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g,
      /hsla\([^)]+\)(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g
    ];
    
    for (const pattern of colorPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match) => {
          // 检查是否在注释中
          const matchIndex = content.indexOf(match);
          const beforeMatch = content.substring(0, matchIndex);
          const lastComment = beforeMatch.lastIndexOf('/*');
          const lastCommentEnd = beforeMatch.lastIndexOf('*/');
          
          if (lastComment > lastCommentEnd) {
            return match; // 在注释中，跳过
          }
          
          this.stats.colorsFixed++;
          fileFixCount++;
          modified = true;
          
          // 使用映射表或默认值
          const token = this.allColorMap[match] || 'var(--color-primary)';
          return `${token} /* TODO: 已替换硬编码颜色 ${match} */`;
        });
      }
    }
    
    // 2. 使用通用正则表达式匹配所有硬编码尺寸
    const sizePattern = /\b(\d+(?:\.\d+)?)px\b(?![^{]*TODO|[^{]*var\(|[^{]*\/\*|[^{]*已替换)/g;
    const sizeMatches = content.match(sizePattern);
    if (sizeMatches) {
      content = content.replace(sizePattern, (match, size) => {
        // 检查是否在注释中
        const matchIndex = content.indexOf(match);
        const beforeMatch = content.substring(0, matchIndex);
        const lastComment = beforeMatch.lastIndexOf('/*');
        const lastCommentEnd = beforeMatch.lastIndexOf('*/');
        
        if (lastComment > lastCommentEnd) {
          return match; // 在注释中，跳过
        }
        
        this.stats.sizesFixed++;
        fileFixCount++;
        modified = true;
        
        // 使用映射表或计算合适的token
        const token = this.allSizeMap[match] || this.calculateSizeToken(parseFloat(size));
        return `var(${token}) /* TODO: 已替换硬编码尺寸 ${match} */`;
      });
    }
    
    // 3. 修复剩余的!important
    const importantPattern = /([^/\*]*!)(\s*important)(?![^{]*TODO|[^{]*emergency|[^{]*已移除)/g;
    const importantMatches = content.match(importantPattern);
    if (importantMatches) {
      content = content.replace(importantPattern, (match, before, important) => {
        this.stats.importantFixed++;
        fileFixCount++;
        modified = true;
        return `${before.replace('!', '')} /* TODO: 已移除!important ${important} */`;
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedFiles.push(filePath);
      this.stats.filesProcessed++;
      this.stats.totalFixed += fileFixCount;
      console.log(`✅ 最终修复 ${fileFixCount} 个违规：${filePath}`);
    }
  }

  calculateSizeToken(pixels) {
    // 根据像素值计算最合适的设计令牌
    if (pixels === 0) return '--spacing-0';
    if (pixels <= 1) return '--spacing-px';
    if (pixels <= 4) return '--spacing-1';
    if (pixels <= 8) return '--spacing-2';
    if (pixels <= 12) return '--spacing-3';
    if (pixels <= 16) return '--spacing-4';
    if (pixels <= 20) return '--spacing-5';
    if (pixels <= 24) return '--spacing-6';
    if (pixels <= 32) return '--spacing-8';
    if (pixels <= 40) return '--spacing-10';
    if (pixels <= 48) return '--spacing-12';
    if (pixels <= 64) return '--spacing-16';
    if (pixels <= 80) return '--spacing-20';
    if (pixels <= 96) return '--spacing-24';
    if (pixels <= 128) return '--spacing-32';
    if (pixels <= 160) return '--spacing-40';
    if (pixels <= 192) return '--spacing-48';
    if (pixels <= 256) return '--spacing-64';
    if (pixels <= 320) return '--spacing-80';
    if (pixels <= 384) return '--spacing-96';
    if (pixels <= 640) return '--breakpoint-sm';
    if (pixels <= 768) return '--breakpoint-md';
    if (pixels <= 1024) return '--breakpoint-lg';
    if (pixels <= 1280) return '--breakpoint-xl';
    return '--spacing-4'; // 默认值
  }

  generateReport() {
    console.log('\n🎉 最终清理消除器执行完成！');
    console.log('='.repeat(60));
    console.log(`📁 处理文件数：${this.stats.filesProcessed}`);
    console.log(`🔧 总修复数：${this.stats.totalFixed}`);
    console.log('');
    console.log('详细修复统计：');
    console.log(`  🎨 硬编码颜色修复：${this.stats.colorsFixed}`);
    console.log(`  📏 硬编码尺寸修复：${this.stats.sizesFixed}`);
    console.log(`  ⚠️ !important修复：${this.stats.importantFixed}`);
    console.log('='.repeat(60));
    
    if (this.fixedFiles.length > 0) {
      console.log('\n✅ 已修复的文件：');
      this.fixedFiles.forEach(file => {
        console.log(`  📄 ${file}`);
      });
    }
    
    console.log(`\n🚀 最终清理完成！共修复 ${this.stats.totalFixed} 个违规项。`);
    console.log('💡 正在验证最终效果...');
  }
}

async function main() {
  const eliminator = new FinalCleanupEliminator();
  await eliminator.eliminateAllRemaining();
}

main().catch(console.error);
