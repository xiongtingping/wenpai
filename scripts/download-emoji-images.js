#!/usr/bin/env node

/**
 * Emoji 图片下载脚本
 * 从Google Noto Emoji项目下载完整的emoji图片集
 * @module download-emoji-images
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // 输出目录
  outputDir: path.join(__dirname, '../src/assets/emoji-images'),
  // CDN基础URL
  cdnBaseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128',
  // 图片格式
  format: 'png',
  // 并发下载数量
  concurrency: 5,
  // 重试次数
  maxRetries: 3,
  // 延迟时间（毫秒）
  delay: 100
};

/**
 * 下载单个文件
 * @param {string} url - 下载URL
 * @param {string} filepath - 保存路径
 * @param {number} retries - 重试次数
 * @returns {Promise<void>}
 */
async function downloadFile(url, filepath, retries = 0) {
  try {
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else if (res.statusCode === 404) {
          reject(new Error(`File not found: ${url}`));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        }
      }).on('error', reject);
    });

    await pipeline(response, fs.createWriteStream(filepath));
    console.log(`✅ Downloaded: ${path.basename(filepath)}`);
  } catch (error) {
    if (retries < CONFIG.maxRetries) {
      console.log(`⚠️  Retrying (${retries + 1}/${CONFIG.maxRetries}): ${path.basename(filepath)}`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay * (retries + 1)));
      return downloadFile(url, filepath, retries + 1);
    } else {
      console.error(`❌ Failed to download: ${path.basename(filepath)} - ${error.message}`);
    }
  }
}

/**
 * 并发下载文件
 * @param {Array<{url: string, filepath: string}>} downloads - 下载任务列表
 * @param {number} concurrency - 并发数量
 * @returns {Promise<void>}
 */
async function downloadWithConcurrency(downloads, concurrency) {
  const chunks = [];
  for (let i = 0; i < downloads.length; i += concurrency) {
    chunks.push(downloads.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(({ url, filepath }) => downloadFile(url, filepath)));
    await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
  }
}

/**
 * 生成emoji文件名
 * @param {string} unified - emoji统一码
 * @returns {string} 文件名
 */
function generateEmojiFilename(unified) {
  return `emoji_u${unified.toLowerCase().replace(/-/g, '_')}.${CONFIG.format}`;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 Starting emoji image download...');
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
    console.log(`🌐 CDN base URL: ${CONFIG.cdnBaseUrl}`);

    // 创建输出目录
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    console.log('✅ Created output directory');

    // 读取emoji数据
    const emojiDataPath = path.join(__dirname, '../src/assets/emoji/emoji-data.json');
    const emojiData = JSON.parse(await fs.readFile(emojiDataPath, 'utf8'));
    console.log(`📊 Found ${emojiData.length} emojis in data file`);

    // 生成下载任务
    const downloads = emojiData.map(emoji => {
      const filename = generateEmojiFilename(emoji.unified);
      const url = `${CONFIG.cdnBaseUrl}/${filename}`;
      const filepath = path.join(CONFIG.outputDir, filename);
      return { url, filepath, unified: emoji.unified };
    });

    console.log(`📥 Starting download of ${downloads.length} emoji images...`);
    console.log(`⚡ Using ${CONFIG.concurrency} concurrent downloads`);

    // 开始下载
    const startTime = Date.now();
    await downloadWithConcurrency(downloads, CONFIG.concurrency);
    const endTime = Date.now();

    // 统计结果
    const downloadedFiles = await fs.readdir(CONFIG.outputDir);
    const successCount = downloadedFiles.filter(file => file.endsWith(`.${CONFIG.format}`)).length;
    const failedCount = downloads.length - successCount;

    console.log('\n📈 Download Summary:');
    console.log(`⏱️  Total time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`✅ Successfully downloaded: ${successCount}`);
    console.log(`❌ Failed downloads: ${failedCount}`);
    console.log(`📁 Files saved to: ${CONFIG.outputDir}`);

    if (failedCount > 0) {
      console.log('\n💡 Some downloads failed. This is normal for:');
      console.log('   - Emojis that don\'t have image files');
      console.log('   - Network issues (will be retried)');
      console.log('   - Rate limiting from CDN');
    }

    // 创建索引文件
    const indexData = {
      totalEmojis: emojiData.length,
      downloadedImages: successCount,
      failedDownloads: failedCount,
      cdnBaseUrl: CONFIG.cdnBaseUrl,
      format: CONFIG.format,
      downloadTime: new Date().toISOString(),
      files: downloadedFiles.filter(file => file.endsWith(`.${CONFIG.format}`))
    };

    const indexPath = path.join(CONFIG.outputDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`📝 Created index file: ${indexPath}`);

    console.log('\n🎉 Emoji image download completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update emoji service to use local images');
    console.log('2. Test emoji display in the application');
    console.log('3. Consider optimizing images for web use');

  } catch (error) {
    console.error('💥 Download failed:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
