#!/usr/bin/env node

/**
 * Emoji CDN 功能测试脚本
 * 测试不同的CDN源和显示模式
 * @module test-emoji-cdn
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 模拟 emoji 服务函数
function getEmojiCDNUrl(unified, cdnType = 'noto-color') {
  const CDN_CONFIGS = {
    'noto-color': {
      name: 'Google Noto Color',
      baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128',
      format: 'png',
      size: 128
    },
    'noto-outline': {
      name: 'Google Noto Outline', 
      baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128',
      format: 'png',
      size: 128
    },
    'twemoji': {
      name: 'Twitter Emoji',
      baseUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72',
      format: 'png',
      size: 72
    },
    'emojione': {
      name: 'EmojiOne',
      baseUrl: 'https://cdn.jsdelivr.net/gh/emojione/emojione@latest/assets/png',
      format: 'png',
      size: 64
    }
  };

  const config = CDN_CONFIGS[cdnType];
  const filename = unified.toLowerCase().replace(/-/g, '_');
  return `${config.baseUrl}/emoji_u${filename}.${config.format}`;
}

function getEmojiUnicode(unified) {
  return String.fromCodePoint(...unified.split('-').map(hex => parseInt(hex, 16)));
}

/**
 * 测试 CDN URL 生成
 */
function testCDNUrlGeneration() {
  console.log('🔗 Testing CDN URL Generation...\n');

  const testEmojis = [
    { unified: '1f600', name: 'grinning face' },
    { unified: '1f603', name: 'grinning face with big eyes' },
    { unified: '1f604', name: 'grinning face with smiling eyes' },
    { unified: '2764', name: 'red heart' },
    { unified: '1f34e', name: 'red apple' },
    { unified: '1f436', name: 'dog face' }
  ];

  const cdnTypes = ['noto-color', 'twemoji', 'emojione'];

  testEmojis.forEach(emoji => {
    console.log(`📱 ${emoji.name} (${emoji.unified}):`);
    console.log(`   Unicode: ${getEmojiUnicode(emoji.unified)}`);
    
    cdnTypes.forEach(cdnType => {
      const url = getEmojiCDNUrl(emoji.unified, cdnType);
      console.log(`   ${cdnType}: ${url}`);
    });
    console.log('');
  });
}

/**
 * 测试 CDN 可用性
 */
async function testCDNAvailability() {
  console.log('🌐 Testing CDN Availability...\n');

  const testEmoji = '1f600'; // 笑脸
  const cdnTypes = ['noto-color', 'twemoji', 'emojione'];

  for (const cdnType of cdnTypes) {
    const url = getEmojiCDNUrl(testEmoji, cdnType);
    console.log(`Testing ${cdnType}: ${url}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ ${cdnType}: Available (${response.status})`);
      } else {
        console.log(`❌ ${cdnType}: Not available (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${cdnType}: Error - ${error.message}`);
    }
  }
  console.log('');
}

/**
 * 生成测试 HTML 页面
 */
async function generateTestHTML() {
  console.log('📄 Generating Test HTML...\n');

  const testEmojis = [
    { unified: '1f600', name: 'grinning face' },
    { unified: '1f603', name: 'grinning face with big eyes' },
    { unified: '1f604', name: 'grinning face with smiling eyes' },
    { unified: '2764', name: 'red heart' },
    { unified: '1f34e', name: 'red apple' },
    { unified: '1f436', name: 'dog face' },
    { unified: '1f44d', name: 'thumbs up' },
    { unified: '1f600', name: 'grinning face' }
  ];

  const cdnTypes = ['noto-color', 'twemoji', 'emojione'];

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emoji CDN 测试</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
        }
        .test-section h2 {
            color: #555;
            margin-bottom: 15px;
        }
        .emoji-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .emoji-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fafafa;
        }
        .emoji-display {
            font-size: 2em;
            margin-right: 15px;
            min-width: 60px;
            text-align: center;
        }
        .emoji-info {
            flex: 1;
        }
        .emoji-name {
            font-weight: bold;
            color: #333;
        }
        .emoji-url {
            font-size: 0.8em;
            color: #666;
            word-break: break-all;
            margin-top: 5px;
        }
        .cdn-label {
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.7em;
            margin-bottom: 5px;
            display: inline-block;
        }
        .error {
            color: #dc3545;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Emoji CDN 功能测试</h1>
        
        <div class="test-section">
            <h2>📱 Unicode 显示模式</h2>
            <div class="emoji-grid">
`;

  // Unicode 显示
  testEmojis.forEach(emoji => {
    html += `
                <div class="emoji-item">
                    <div class="emoji-display">${getEmojiUnicode(emoji.unified)}</div>
                    <div class="emoji-info">
                        <div class="emoji-name">${emoji.name}</div>
                        <div>Unified: ${emoji.unified}</div>
                        <div>Unicode: ${getEmojiUnicode(emoji.unified)}</div>
                    </div>
                </div>
    `;
  });

  html += `
            </div>
        </div>
        
        <div class="test-section">
            <h2>🌐 CDN 图片显示模式</h2>
`;

  // CDN 显示
  cdnTypes.forEach(cdnType => {
    html += `
            <h3>${cdnType.toUpperCase()}</h3>
            <div class="emoji-grid">
    `;

    testEmojis.forEach(emoji => {
      const url = getEmojiCDNUrl(emoji.unified, cdnType);
      html += `
                <div class="emoji-item">
                    <div class="emoji-display">
                        <img src="${url}" alt="${emoji.name}" style="width: 48px; height: 48px; object-fit: contain;" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none; color: #dc3545;">❌</span>
                    </div>
                    <div class="emoji-info">
                        <div class="cdn-label">${cdnType}</div>
                        <div class="emoji-name">${emoji.name}</div>
                        <div>Unified: ${emoji.unified}</div>
                        <div class="emoji-url">${url}</div>
                    </div>
                </div>
      `;
    });

    html += `
            </div>
    `;
  });

  html += `
        </div>
        
        <div class="test-section">
            <h2>📊 测试说明</h2>
            <ul>
                <li><strong>Unicode 模式</strong>: 使用系统字体显示 emoji，依赖系统支持</li>
                <li><strong>CDN 模式</strong>: 从在线CDN加载图片，显示效果一致</li>
                <li><strong>错误处理</strong>: 如果图片加载失败，会显示 ❌ 标记</li>
                <li><strong>兼容性</strong>: Unicode 模式兼容性更好，CDN 模式显示效果更一致</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;

  const outputPath = path.join(__dirname, 'test-emoji-cdn.html');
  await fs.writeFile(outputPath, html);
  console.log(`✅ Generated test HTML: ${outputPath}`);
  console.log(`🌐 Open in browser: file://${outputPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Emoji CDN 功能测试\n');

  try {
    // 测试 CDN URL 生成
    testCDNUrlGeneration();

    // 测试 CDN 可用性
    await testCDNAvailability();

    // 生成测试 HTML
    await generateTestHTML();

    console.log('🎉 All tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open test-emoji-cdn.html in browser');
    console.log('2. Check emoji display in different modes');
    console.log('3. Verify CDN availability and image loading');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// 运行测试
main(); 