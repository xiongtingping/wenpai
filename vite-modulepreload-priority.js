/**
 * Vite插件：强制控制modulepreload加载顺序
 * 解决React TDZ问题的根本原因 - 确保React核心库优先加载
 */

export default function modulePreloadPriority() {
  return {
    name: 'modulepreload-priority',
    apply: 'build',
    generateBundle(options, bundle) {
      // 在生成bundle时，确保React核心chunk优先级
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          // 调整imports顺序，确保React相关chunk优先
          if (chunk.imports) {
            chunk.imports.sort((a, b) => {
              // React核心库绝对优先
              if (a.includes('aaaa-react-core')) return -1;
              if (b.includes('aaaa-react-core')) return 1;
              
              // React生态系统其次
              if (a.includes('bbbb-react-ecosystem')) return -1;
              if (b.includes('bbbb-react-ecosystem')) return 1;
              
              // 按字母顺序排列其他
              return a.localeCompare(b);
            });
          }
        }
      }
    },
    transformIndexHtml(html) {
      // 后处理HTML，重新排序modulepreload链接
      const modulePreloadRegex = /<link[^>]*rel="modulepreload"[^>]*>/g;
      const preloadLinks = html.match(modulePreloadRegex) || [];
      
      if (preloadLinks.length === 0) return html;
      
      // 按优先级排序preload链接
      const sortedLinks = preloadLinks.sort((a, b) => {
        // Extract href from link tags
        const getHref = (link) => {
          const match = link.match(/href="([^"]*)"/) || link.match(/href='([^']*)'/);
          return match ? match[1] : '';
        };
        
        const hrefA = getHref(a);
        const hrefB = getHref(b);
        
        // 🔧 CRITICAL: React核心库绝对优先
        if (hrefA.includes('aaaa-react-core')) return -1;
        if (hrefB.includes('aaaa-react-core')) return 1;
        
        // React生态系统其次
        if (hrefA.includes('bbbb-react-ecosystem')) return -1;
        if (hrefB.includes('bbbb-react-ecosystem')) return 1;
        
        // UI组件库
        if (hrefA.includes('cccc-ui-vendor')) return -1;
        if (hrefB.includes('cccc-ui-vendor')) return 1;
        
        // 工具库
        if (hrefA.includes('dddd-utils-vendor')) return -1;
        if (hrefB.includes('dddd-utils-vendor')) return 1;
        
        // 其他按字母顺序
        return hrefA.localeCompare(hrefB);
      });
      
      // 移除原有的modulepreload链接
      let newHtml = html;
      preloadLinks.forEach(link => {
        newHtml = newHtml.replace(link, '');
      });
      
      // 在适当位置插入排序后的链接
      const insertPoint = newHtml.indexOf('<link rel="stylesheet"');
      if (insertPoint !== -1) {
        const before = newHtml.substring(0, insertPoint);
        const after = newHtml.substring(insertPoint);
        newHtml = before + sortedLinks.join('\n    ') + '\n    ' + after;
      } else {
        // 如果没有找到CSS链接，插入到head结束前
        const headEnd = newHtml.indexOf('</head>');
        if (headEnd !== -1) {
          const before = newHtml.substring(0, headEnd);
          const after = newHtml.substring(headEnd);
          newHtml = before + '    ' + sortedLinks.join('\n    ') + '\n  ' + after;
        }
      }
      
      console.log('🔧 Module preload order optimized for React priority');
      return newHtml;
    }
  };
}