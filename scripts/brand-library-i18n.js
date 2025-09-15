// BrandLibraryPage 国际化替换脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BrandLibraryPage 替换映射
const brandLibraryReplacements = [
  // 基础UI文本
  {
    search: '"品牌库"',
    replace: 't("brandLibraryPage.title")',
    description: '页面标题'
  },
  {
    search: '"管理您的品牌资产和资源库"',
    replace: 't("brandLibraryPage.description")',
    description: '页面描述'
  },
  {
    search: '"智能资料管理"',
    replace: 't("brandLibraryPage.tabs.assets")',
    description: '资料管理标签'
  },
  {
    search: '"品牌语料库"',
    replace: 't("brandLibraryPage.tabs.dimensions")',
    description: '语料库标签'
  },
  
  // 上传相关
  {
    search: '"点击上传或拖拽文件到此处"',
    replace: 't("brandLibraryPage.upload.title")',
    description: '上传标题'
  },
  {
    search: '"支持 PDF、Word、Excel、PowerPoint、图片等多种格式"',
    replace: 't("brandLibraryPage.upload.description")',
    description: '上传描述'
  },
  {
    search: '"选择文件"',
    replace: 't("brandLibraryPage.upload.selectFiles")',
    description: '选择文件按钮'
  },
  {
    search: '"支持的文件格式"',
    replace: 't("brandLibraryPage.upload.supportedFormats")',
    description: '支持格式'
  },
  {
    search: '"单个文件建议不超过10MB，支持批量上传和网页内容提取"',
    replace: 't("brandLibraryPage.upload.sizeLimit")',
    description: '文件大小限制'
  },
  {
    search: '"网页内容提取"',
    replace: 't("brandLibraryPage.upload.webExtraction")',
    description: '网页提取'
  },
  {
    search: '"输入网页链接，如：https://example.com"',
    replace: 't("brandLibraryPage.upload.urlPlaceholder")',
    description: 'URL占位符'
  },
  {
    search: '"提取内容"',
    replace: 't("brandLibraryPage.upload.extractContent")',
    description: '提取内容按钮'
  },
  {
    search: '"提取中..."',
    replace: 't("brandLibraryPage.upload.extracting")',
    description: '提取中状态'
  },
  {
    search: '"提取进度"',
    replace: 't("brandLibraryPage.upload.extractionProgress")',
    description: '提取进度'
  },
  {
    search: '"正在验证URL..."',
    replace: 't("brandLibraryPage.upload.verifyingUrl")',
    description: '验证URL'
  },
  {
    search: '"正在提取网页内容..."',
    replace: 't("brandLibraryPage.upload.extractingContent")',
    description: '提取网页内容'
  },
  {
    search: '"正在分析内容..."',
    replace: 't("brandLibraryPage.upload.analyzingContent")',
    description: '分析内容'
  },
  {
    search: '"正在保存到资料库..."',
    replace: 't("brandLibraryPage.upload.savingToLibrary")',
    description: '保存到资料库'
  },
  
  // 管理相关
  {
    search: '"管理已上传的品牌资料，支持AI分析、PDF对话、分类搜索和批量操作"',
    replace: 't("brandLibraryPage.management.description")',
    description: '管理描述'
  },
  {
    search: '"搜索资料名称..."',
    replace: 't("brandLibraryPage.management.searchPlaceholder")',
    description: '搜索占位符'
  },
  {
    search: '"全部分类"',
    replace: 't("brandLibraryPage.management.allCategories")',
    description: '全部分类'
  },
  {
    search: '"最新上传"',
    replace: 't("brandLibraryPage.management.sortOptions.dateNew")',
    description: '最新上传排序'
  },
  {
    search: '"最早上传"',
    replace: 't("brandLibraryPage.management.sortOptions.dateOld")',
    description: '最早上传排序'
  },
  {
    search: '"名称A-Z"',
    replace: 't("brandLibraryPage.management.sortOptions.nameAsc")',
    description: '名称升序'
  },
  {
    search: '"名称Z-A"',
    replace: 't("brandLibraryPage.management.sortOptions.nameDesc")',
    description: '名称降序'
  },
  {
    search: '"文件最大"',
    replace: 't("brandLibraryPage.management.sortOptions.sizeLarge")',
    description: '文件最大'
  },
  {
    search: '"文件最小"',
    replace: 't("brandLibraryPage.management.sortOptions.sizeSmall")',
    description: '文件最小'
  },
  {
    search: '"PDF对话"',
    replace: 't("brandLibraryPage.management.pdfChat")',
    description: 'PDF对话'
  },
  {
    search: '"网格视图"',
    replace: 't("brandLibraryPage.management.viewModes.grid")',
    description: '网格视图'
  },
  {
    search: '"列表视图"',
    replace: 't("brandLibraryPage.management.viewModes.list")',
    description: '列表视图'
  },
  {
    search: '"批量下载"',
    replace: 't("brandLibraryPage.management.batchActions.download")',
    description: '批量下载'
  },
  {
    search: '"批量复制"',
    replace: 't("brandLibraryPage.management.batchActions.copy")',
    description: '批量复制'
  },
  {
    search: '"批量删除"',
    replace: 't("brandLibraryPage.management.batchActions.delete")',
    description: '批量删除'
  },
  {
    search: '"总文件数"',
    replace: 't("brandLibraryPage.management.stats.totalFiles")',
    description: '总文件数'
  },
  {
    search: '"已分析"',
    replace: 't("brandLibraryPage.management.stats.analyzed")',
    description: '已分析'
  },
  {
    search: '"待分析"',
    replace: 't("brandLibraryPage.management.stats.pending")',
    description: '待分析'
  },
  {
    search: '"暂无上传的品牌资料"',
    replace: 't("brandLibraryPage.management.emptyState.noFiles")',
    description: '无文件状态'
  },
  {
    search: '"上传文件后即可使用智能分析功能"',
    replace: 't("brandLibraryPage.management.emptyState.noFilesDesc")',
    description: '无文件描述'
  },
  {
    search: '"没有找到匹配的资料"',
    replace: 't("brandLibraryPage.management.emptyState.noResults")',
    description: '无搜索结果'
  },
  {
    search: '"请尝试调整搜索条件或筛选选项"',
    replace: 't("brandLibraryPage.management.emptyState.noResultsDesc")',
    description: '无搜索结果描述'
  },
  
  // 文件操作
  {
    search: '"分析"',
    replace: 't("brandLibraryPage.management.fileActions.analyze")',
    description: '分析按钮'
  },
  {
    search: '"分析中"',
    replace: 't("brandLibraryPage.management.fileActions.analyzing")',
    description: '分析中状态'
  },
  {
    search: '"重试分析"',
    replace: 't("brandLibraryPage.management.fileActions.reanalyze")',
    description: '重试分析'
  },
  {
    search: '"查看结果"',
    replace: 't("brandLibraryPage.management.fileActions.viewResults")',
    description: '查看结果'
  },
  {
    search: '"对话"',
    replace: 't("brandLibraryPage.management.fileActions.chat")',
    description: '对话按钮'
  },
  {
    search: '"下载文件"',
    replace: 't("brandLibraryPage.management.fileActions.download")',
    description: '下载文件'
  },
  {
    search: '"分类编辑"',
    replace: 't("brandLibraryPage.management.fileActions.editCategory")',
    description: '分类编辑'
  },
  {
    search: '"删除文件"',
    replace: 't("brandLibraryPage.management.fileActions.delete")',
    description: '删除文件'
  },
  {
    search: '"错误"',
    replace: 't("brandLibraryPage.management.status.error")',
    description: '错误状态'
  },
  {
    search: '"处理中"',
    replace: 't("brandLibraryPage.management.status.processing")',
    description: '处理中状态'
  },

  // 语料库相关
  {
    search: '"基础信息"',
    replace: 't("brandLibraryPage.corpus.categories.basic")',
    description: '基础信息分类'
  },
  {
    search: '"品牌的基本信息和核心定位"',
    replace: 't("brandLibraryPage.corpus.categories.basicDesc")',
    description: '基础信息描述'
  },
  {
    search: '"语调风格"',
    replace: 't("brandLibraryPage.corpus.categories.voice")',
    description: '语调风格分类'
  },
  {
    search: '"品牌的语音特征和表达方式"',
    replace: 't("brandLibraryPage.corpus.categories.voiceDesc")',
    description: '语调风格描述'
  },
  {
    search: '"品牌身份"',
    replace: 't("brandLibraryPage.corpus.categories.identity")',
    description: '品牌身份分类'
  },
  {
    search: '"品牌的核心价值观和使命愿景"',
    replace: 't("brandLibraryPage.corpus.categories.identityDesc")',
    description: '品牌身份描述'
  },
  {
    search: '"内容策略"',
    replace: 't("brandLibraryPage.corpus.categories.content")',
    description: '内容策略分类'
  },
  {
    search: '"品牌内容创作的核心要素和策略"',
    replace: 't("brandLibraryPage.corpus.categories.contentDesc")',
    description: '内容策略描述'
  },

  // 品牌维度
  {
    search: '"品牌名称"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandName")',
    description: '品牌名称'
  },
  {
    search: '"品牌的正式名称、简称、英文名等"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandNameDesc")',
    description: '品牌名称描述'
  },
  {
    search: '"品牌描述"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandDescription")',
    description: '品牌描述'
  },
  {
    search: '"品牌的基本介绍和核心定位"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandDescriptionDesc")',
    description: '品牌描述说明'
  },
  {
    search: '"品牌语调/语气"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandTone")',
    description: '品牌语调'
  },
  {
    search: '"品牌的沟通语调和表达风格"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandToneDesc")',
    description: '品牌语调描述'
  },
  {
    search: '"品牌个性"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandPersonality")',
    description: '品牌个性'
  },
  {
    search: '"品牌的性格特征和人格化特点"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandPersonalityDesc")',
    description: '品牌个性描述'
  },
  {
    search: '"品牌Slogan"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandSlogan")',
    description: '品牌Slogan'
  },
  {
    search: '"品牌的核心口号和标语"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandSloganDesc")',
    description: '品牌Slogan描述'
  },
  {
    search: '"品牌价值观"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandValues")',
    description: '品牌价值观'
  },
  {
    search: '"品牌坚持的核心价值观念"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandValuesDesc")',
    description: '品牌价值观描述'
  },
  {
    search: '"品牌愿景与使命"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandVisionMission")',
    description: '品牌愿景与使命'
  },
  {
    search: '"品牌的长远愿景和使命目标"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandVisionMissionDesc")',
    description: '品牌愿景与使命描述'
  },
  {
    search: '"品牌故事"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandStory")',
    description: '品牌故事'
  },
  {
    search: '"品牌的发展历程和核心故事"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandStoryDesc")',
    description: '品牌故事描述'
  },
  {
    search: '"广告语集"',
    replace: 't("brandLibraryPage.corpus.dimensions.advertisingSlogans")',
    description: '广告语集'
  },
  {
    search: '"品牌的各类广告语和宣传语"',
    replace: 't("brandLibraryPage.corpus.dimensions.advertisingSlogansDesc")',
    description: '广告语集描述'
  },
  {
    search: '"产品描述词库"',
    replace: 't("brandLibraryPage.corpus.dimensions.productDescriptions")',
    description: '产品描述词库'
  },
  {
    search: '"产品介绍和描述的常用词汇"',
    replace: 't("brandLibraryPage.corpus.dimensions.productDescriptionsDesc")',
    description: '产品描述词库描述'
  },
  {
    search: '"品牌核心话题"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandTopics")',
    description: '品牌核心话题'
  },
  {
    search: '"品牌经常讨论的核心主题"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandTopicsDesc")',
    description: '品牌核心话题描述'
  },
  {
    search: '"品牌Hashtags"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandHashtags")',
    description: '品牌Hashtags'
  },
  {
    search: '"品牌的标签和话题标签"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandHashtagsDesc")',
    description: '品牌Hashtags描述'
  },
  {
    search: '"品牌关键词"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandKeywords")',
    description: '品牌关键词'
  },
  {
    search: '"品牌的核心关键词和搜索词"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandKeywordsDesc")',
    description: '品牌关键词描述'
  },
  {
    search: '"品牌禁用词"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandForbiddenWords")',
    description: '品牌禁用词'
  },
  {
    search: '"品牌不应使用的词汇和表达"',
    replace: 't("brandLibraryPage.corpus.dimensions.brandForbiddenWordsDesc")',
    description: '品牌禁用词描述'
  },

  // 操作按钮
  {
    search: '"添加新信息"',
    replace: 't("brandLibraryPage.corpus.actions.addNew")',
    description: '添加新信息'
  },
  {
    search: '"保存"',
    replace: 't("brandLibraryPage.corpus.actions.save")',
    description: '保存按钮'
  },
  {
    search: '"取消"',
    replace: 't("brandLibraryPage.corpus.actions.cancel")',
    description: '取消按钮'
  },
  {
    search: '"编辑内容"',
    replace: 't("brandLibraryPage.corpus.actions.edit")',
    description: '编辑内容'
  },
  {
    search: '"钉住"',
    replace: 't("brandLibraryPage.corpus.actions.pin")',
    description: '钉住按钮'
  },
  {
    search: '"取消钉住"',
    replace: 't("brandLibraryPage.corpus.actions.unpin")',
    description: '取消钉住'
  },
  {
    search: '"屏蔽"',
    replace: 't("brandLibraryPage.corpus.actions.block")',
    description: '屏蔽按钮'
  },
  {
    search: '"取消屏蔽"',
    replace: 't("brandLibraryPage.corpus.actions.unblock")',
    description: '取消屏蔽'
  },
  {
    search: '"删除"',
    replace: 't("brandLibraryPage.corpus.actions.delete")',
    description: '删除按钮'
  },
  {
    search: '"查看来源"',
    replace: 't("brandLibraryPage.corpus.actions.viewSource")',
    description: '查看来源'
  },
  {
    search: '"管理来源"',
    replace: 't("brandLibraryPage.corpus.actions.manageSources")',
    description: '管理来源'
  },
  {
    search: '"停止分析"',
    replace: 't("brandLibraryPage.corpus.actions.stopAnalysis")',
    description: '停止分析'
  },

  // Toast消息
  {
    search: '"数据迁移成功"',
    replace: 't("brandLibraryPage.messages.dataMigrationSuccess")',
    description: '数据迁移成功'
  },
  {
    search: '`已将 ${legacyAssets.data.length} 项品牌资产迁移到云端存储`',
    replace: 't("brandLibraryPage.messages.dataMigrationDesc", { count: legacyAssets.data.length })',
    description: '数据迁移描述'
  },
  {
    search: '"数据迁移失败"',
    replace: 't("brandLibraryPage.messages.dataMigrationFailed")',
    description: '数据迁移失败'
  },
  {
    search: '"部分数据可能无法正常显示，请刷新页面重试"',
    replace: 't("brandLibraryPage.messages.dataMigrationFailedDesc")',
    description: '数据迁移失败描述'
  },
  {
    search: '"保存失败"',
    replace: 't("brandLibraryPage.messages.saveFailed")',
    description: '保存失败'
  },
  {
    search: '"品牌资产保存失败，请重试"',
    replace: 't("brandLibraryPage.messages.saveFailedDesc")',
    description: '保存失败描述'
  },
  {
    search: '"保存异常"',
    replace: 't("brandLibraryPage.messages.saveException")',
    description: '保存异常'
  },
  {
    search: '"品牌资产保存时发生异常，请重试"',
    replace: 't("brandLibraryPage.messages.saveExceptionDesc")',
    description: '保存异常描述'
  },
  {
    search: '"🎉 AI分析完成"',
    replace: 't("brandLibraryPage.messages.analysisComplete")',
    description: 'AI分析完成'
  },
  {
    search: '`已完成 ${assets.length} 个文件的智能分析，信息已自动添加到品牌语料库并完成智能去重`',
    replace: 't("brandLibraryPage.messages.analysisCompleteDesc", { count: assets.length })',
    description: 'AI分析完成描述'
  },
  {
    search: '"❌ 后台分析出错"',
    replace: 't("brandLibraryPage.messages.analysisError")',
    description: '后台分析出错'
  },
  {
    search: '"部分文件分析失败，请稍后重试"',
    replace: 't("brandLibraryPage.messages.analysisErrorDesc")',
    description: '后台分析出错描述'
  },
  {
    search: '"🛑 已停止AI分析"',
    replace: 't("brandLibraryPage.messages.analysisStopped")',
    description: '已停止AI分析'
  },
  {
    search: '"AI分析已被用户取消，您可以稍后重新尝试"',
    replace: 't("brandLibraryPage.messages.analysisStoppedDesc")',
    description: '已停止AI分析描述'
  },
  {
    search: '"批量AI分析失败"',
    replace: 't("brandLibraryPage.messages.batchAnalysisFailed")',
    description: '批量AI分析失败'
  },
  {
    search: '"保存成功"',
    replace: 't("brandLibraryPage.messages.saveSuccess")',
    description: '保存成功'
  },
  {
    search: '"品牌语料库已保存到云端存储"',
    replace: 't("brandLibraryPage.messages.saveSuccessDesc")',
    description: '保存成功描述'
  },
  {
    search: '"保存过程中出现错误"',
    replace: 't("brandLibraryPage.messages.saveFailedGeneric")',
    description: '保存过程中出现错误'
  },
  {
    search: '"没有可处理的文件"',
    replace: 't("brandLibraryPage.messages.noFilesToProcess")',
    description: '没有可处理的文件'
  },
  {
    search: '"所有文件都已处理完成"',
    replace: 't("brandLibraryPage.messages.noFilesToProcessDesc")',
    description: '所有文件都已处理完成'
  },
  {
    search: '"配置提示"',
    replace: 't("brandLibraryPage.messages.configTip")',
    description: '配置提示'
  },
  {
    search: '"请在项目根目录的.env文件中配置正确的VITE_DEEPSEEK_API_KEY"',
    replace: 't("brandLibraryPage.messages.configTipDesc")',
    description: '配置提示描述'
  },
  {
    search: '"批量语料库提取完成"',
    replace: 't("brandLibraryPage.messages.batchExtractionComplete")',
    description: '批量语料库提取完成'
  },
  {
    search: '`已成功处理 ${extractions.length} 个资料，信息已追加到语料库`',
    replace: 't("brandLibraryPage.messages.batchExtractionCompleteDesc", { count: extractions.length })',
    description: '批量语料库提取完成描述'
  },
  {
    search: '"批量处理失败"',
    replace: 't("brandLibraryPage.messages.batchProcessingFailed")',
    description: '批量处理失败'
  },
  {
    search: '"部分资料处理失败，请重试"',
    replace: 't("brandLibraryPage.messages.batchProcessingFailedDesc")',
    description: '批量处理失败描述'
  },
  {
    search: '"删除成功"',
    replace: 't("brandLibraryPage.messages.deleteSuccess")',
    description: '删除成功'
  },
  {
    search: '`${assetToDelete.name} 及其相关的 ${deletedItemsCount} 条语料信息已被删除`',
    replace: 't("brandLibraryPage.messages.deleteSuccessDesc", { name: assetToDelete.name, count: deletedItemsCount })',
    description: '删除成功描述'
  },
  {
    search: '"批量删除成功"',
    replace: 't("brandLibraryPage.messages.batchDeleteSuccess")',
    description: '批量删除成功'
  },
  {
    search: '`已删除 ${assetsToDelete.length} 个资产及其相关的 ${totalDeletedItemsCount} 条语料信息`',
    replace: 't("brandLibraryPage.messages.batchDeleteSuccessDesc", { assetCount: assetsToDelete.length, itemCount: totalDeletedItemsCount })',
    description: '批量删除成功描述'
  },

  // 更多Toast消息
  {
    search: '"清理完成"',
    replace: 't("brandLibraryPage.messages.cleanupComplete")',
    description: '清理完成'
  },
  {
    search: '`已清理 ${cleanedItemsCount} 条孤立的语料信息`',
    replace: 't("brandLibraryPage.messages.cleanupCompleteDesc", { count: cleanedItemsCount })',
    description: '清理完成描述'
  },
  {
    search: '"没有发现需要清理的孤立语料信息"',
    replace: 't("brandLibraryPage.messages.cleanupCompleteNoItems")',
    description: '清理完成无项目'
  },
  {
    search: '"分类更新成功"',
    replace: 't("brandLibraryPage.messages.categoryUpdateSuccess")',
    description: '分类更新成功'
  },
  {
    search: '`${assetToEdit.name} 已更新为 ${categoryLabel} 分类`',
    replace: 't("brandLibraryPage.messages.categoryUpdateSuccessDesc", { name: assetToEdit.name, category: categoryLabel })',
    description: '分类更新成功描述'
  },
  {
    search: '"下载开始"',
    replace: 't("brandLibraryPage.messages.downloadStarted")',
    description: '下载开始'
  },
  {
    search: '`正在下载 ${asset.name}`',
    replace: 't("brandLibraryPage.messages.downloadStartedDesc", { name: asset.name })',
    description: '下载开始描述'
  },
  {
    search: '"文件格式不支持"',
    replace: 't("brandLibraryPage.messages.unsupportedFileFormat")',
    description: '文件格式不支持'
  },
  {
    search: '`文件 ${file.name} 的格式不受支持`',
    replace: 't("brandLibraryPage.messages.unsupportedFileFormatDesc", { name: file.name })',
    description: '文件格式不支持描述'
  },
  {
    search: '"✅ 上传成功"',
    replace: 't("brandLibraryPage.messages.uploadSuccess")',
    description: '上传成功'
  },
  {
    search: '`成功上传 ${newAssets.length} 个文件。AI分析将在后台进行，您可以自由导航到其他页面。`',
    replace: 't("brandLibraryPage.messages.uploadSuccessDesc", { count: newAssets.length })',
    description: '上传成功描述'
  },
  {
    search: '"💡 温馨提示"',
    replace: 't("brandLibraryPage.messages.uploadTip")',
    description: '温馨提示'
  },
  {
    search: '"AI分析正在后台进行，您可以离开此页面。分析完成后会有通知提醒。"',
    replace: 't("brandLibraryPage.messages.uploadTipDesc")',
    description: '温馨提示描述'
  },
  {
    search: '"上传失败"',
    replace: 't("brandLibraryPage.messages.uploadFailed")',
    description: '上传失败'
  },
  {
    search: '"文件上传过程中出现错误"',
    replace: 't("brandLibraryPage.messages.uploadFailedDesc")',
    description: '上传失败描述'
  },
  {
    search: '"请输入URL"',
    replace: 't("brandLibraryPage.messages.enterUrl")',
    description: '请输入URL'
  },
  {
    search: '"请输入有效的网页链接"',
    replace: 't("brandLibraryPage.messages.enterUrlDesc")',
    description: '请输入URL描述'
  },
  {
    search: '"网页内容提取成功"',
    replace: 't("brandLibraryPage.messages.webExtractionSuccess")',
    description: '网页内容提取成功'
  },
  {
    search: '`已成功提取 ${extractionResult.title} 的内容并添加到品牌资料库`',
    replace: 't("brandLibraryPage.messages.webExtractionSuccessDesc", { title: extractionResult.title })',
    description: '网页内容提取成功描述'
  },
  {
    search: '"网页内容提取失败"',
    replace: 't("brandLibraryPage.messages.webExtractionFailed")',
    description: '网页内容提取失败'
  },
  {
    search: '"请检查URL格式是否正确"',
    replace: 't("brandLibraryPage.messages.checkUrlFormat")',
    description: '检查URL格式'
  },
  {
    search: '"网络连接失败，请检查网络或稍后重试"',
    replace: 't("brandLibraryPage.messages.networkError")',
    description: '网络错误'
  },
  {
    search: '"无法访问该网页，可能需要登录或权限"',
    replace: 't("brandLibraryPage.messages.accessError")',
    description: '访问错误'
  },
  {
    search: '"请求超时，请稍后重试"',
    replace: 't("brandLibraryPage.messages.timeoutError")',
    description: '超时错误'
  },
  {
    search: '"提取失败"',
    replace: 't("brandLibraryPage.messages.extractionFailed")',
    description: '提取失败'
  },
  {
    search: '"开始AI分析"',
    replace: 't("brandLibraryPage.messages.startAnalysis")',
    description: '开始AI分析'
  },
  {
    search: '`正在分析 ${asset.name}，您可以继续其他操作`',
    replace: 't("brandLibraryPage.messages.startAnalysisDesc", { name: asset.name })',
    description: '开始AI分析描述'
  },

  // 功能特性
  {
    search: '"多维品牌语料库"',
    replace: 't("brandLibraryPage.features.multiBrandCorpus")',
    description: '多维品牌语料库'
  },
  {
    search: '"该功能区为高级版专属，包含AI智能分析、品牌资料管理、PDF智能对话等专业功能"',
    replace: 't("brandLibraryPage.features.multiBrandCorpusDesc")',
    description: '多维品牌语料库描述'
  },
  {
    search: '"上传品牌资料功能说明：支持PDF、Word、PPT、图片、HTML等多种格式，AI会自动分析文件内容并提取关键信息，分析结果会自动添加到品牌语料库，建议上传品牌手册、产品介绍、营销文案等资料"',
    replace: 't("brandLibraryPage.features.uploadTooltip")',
    description: '上传功能说明'
  },
  {
    search: '"品牌资料上传"',
    replace: 't("brandLibraryPage.features.brandAssetUpload")',
    description: '品牌资料上传'
  },
  {
    search: '"网页内容提取输入"',
    replace: 't("brandLibraryPage.features.webExtractionInput")',
    description: '网页内容提取输入'
  },
  {
    search: '"品牌资料搜索"',
    replace: 't("brandLibraryPage.features.brandAssetSearch")',
    description: '品牌资料搜索'
  },
  {
    search: '"分类筛选"',
    replace: 't("brandLibraryPage.features.categoryFilter")',
    description: '分类筛选'
  },
  {
    search: '"排序选择"',
    replace: 't("brandLibraryPage.features.sortSelection")',
    description: '排序选择'
  },
  {
    search: '"PDF智能对话"',
    replace: 't("brandLibraryPage.features.pdfChat")',
    description: 'PDF智能对话'
  },
  {
    search: '"AI智能分析"',
    replace: 't("brandLibraryPage.features.aiAnalysis")',
    description: 'AI智能分析'
  },
  {
    search: '"重新分析"',
    replace: 't("brandLibraryPage.features.reAnalysis")',
    description: '重新分析'
  },
  {
    search: '"添加品牌信息"',
    replace: 't("brandLibraryPage.features.addBrandInfo")',
    description: '添加品牌信息'
  },

  // 占位符
  {
    search: '"选择分类"',
    replace: 't("brandLibraryPage.placeholders.selectCategory")',
    description: '选择分类占位符'
  },
  {
    search: '"排序"',
    replace: 't("brandLibraryPage.placeholders.sort")',
    description: '排序占位符'
  },
  {
    search: '"请选择文件分类"',
    replace: 't("brandLibraryPage.dialogs.selectCategory")',
    description: '请选择文件分类'
  },
  {
    search: '"编辑信息内容..."',
    replace: 't("brandLibraryPage.dialogs.editPlaceholder")',
    description: '编辑信息内容占位符'
  },
  {
    search: '"信息条目操作菜单：可以钉住、屏蔽、编辑或查看来源等操作"',
    replace: 't("brandLibraryPage.dialogs.itemActionsTooltip")',
    description: '信息条目操作菜单提示'
  }
];

// 执行替换
function performBrandLibraryReplacements() {
  const filePath = path.join(process.cwd(), 'src/pages/BrandLibraryPage.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let replacementCount = 0;
  
  // 确保导入了useTranslation
  if (!content.includes('import { useTranslation }')) {
    // 查找合适的导入位置
    const importMatch = content.match(/import.*from ['"]react['"];?\n/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + "import { useTranslation } from 'react-i18next';\n"
      );
      console.log('✅ 添加了useTranslation导入');
    }
  }
  
  // 确保在组件中使用了useTranslation
  if (!content.includes('const { t } = useTranslation();')) {
    const componentMatch = content.match(/export default function BrandLibraryPage\(\) \{/);
    if (componentMatch) {
      content = content.replace(
        componentMatch[0],
        componentMatch[0] + '\n  const { t } = useTranslation();'
      );
      console.log('✅ 添加了useTranslation Hook调用');
    }
  }
  
  // 执行文本替换
  brandLibraryReplacements.forEach(({ search, replace, description }) => {
    if (content.includes(search)) {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      replacementCount++;
      console.log(`✅ ${description}: 替换成功`);
    }
  });
  
  if (replacementCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n📝 BrandLibraryPage.tsx: 完成 ${replacementCount} 处替换\n`);
  } else {
    console.log(`\n⚠️ BrandLibraryPage.tsx: 未找到需要替换的内容\n`);
  }
  
  return replacementCount;
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 开始执行BrandLibraryPage国际化替换...\n');
  const count = performBrandLibraryReplacements();
  console.log(`\n🎉 总计完成 ${count} 处国际化替换`);
}

export { performBrandLibraryReplacements };
