
// 测试话题标签生成功能
import { hashtagGenerator } from './src/utils/hashtagGenerator.js';

async function testTopicTags() {
  const testContent = '今天分享一个实用的教程，教大家如何使用新的美妆产品，这是我的真实体验和测评心得。';
  
  console.log('测试内容:', testContent);
  
  try {
    const topicTags = await hashtagGenerator.generateTopicTagsForSmartTagging(testContent, 'xiaohongshu');
    console.log('生成的话题标签:', topicTags);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testTopicTags();
