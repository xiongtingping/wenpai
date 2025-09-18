#!/usr/bin/env node

/**
 * PromptSystem 综合国际化自动替换脚本
 * 处理提示词系统的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const SERVICE_PATH = 'src/prompts/PromptSystem.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class PromptSystemComprehensiveI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('🤖 开始 PromptSystem 综合国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理服务文件
      await this.processServiceFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ PromptSystem 综合国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📖 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      this.zhTranslations = JSON.parse(fs.readFileSync(ZH_LOCALE_PATH, 'utf8'));
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      this.enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
    }
    
    console.log('✅ 翻译文件加载完成');
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 确保promptSystem部分存在
    if (!this.zhTranslations.promptSystem) {
      this.zhTranslations.promptSystem = {};
    }
    if (!this.enTranslations.promptSystem) {
      this.enTranslations.promptSystem = {};
    }

    // 提示词系统翻译
    this.zhTranslations.promptSystem = {
      // 基础概念
      system: {
        expert: "专家",
        professional: "专业",
        assistant: "助手",
        specialist: "专家",
        consultant: "顾问",
        analyst: "分析师",
        designer: "设计师",
        manager: "管理专家",
        advisor: "顾问"
      },

      // 内容相关
      content: {
        title: "标题",
        content: "内容",
        article: "文章",
        text: "文本",
        description: "描述",
        analysis: "分析",
        generation: "生成",
        adaptation: "适配",
        optimization: "优化",
        processing: "处理",
        extraction: "提取",
        summary: "摘要",
        quality: "质量",
        structure: "结构",
        style: "风格",
        tone: "调性",
        format: "格式",
        template: "模板",
        framework: "框架"
      },

      // 品牌相关
      brand: {
        brand: "品牌",
        brandTone: "品牌调性",
        brandPersonality: "品牌个性",
        brandStory: "品牌故事",
        brandDescription: "品牌描述",
        brandKeywords: "品牌关键词",
        brandValues: "品牌价值观",
        brandStyle: "品牌风格",
        brandVoice: "品牌声音",
        brandIdentity: "品牌识别",
        corpus: "语料库",
        extraction: "提取",
        conflict: "冲突",
        resolution: "解决方案"
      },

      // 平台相关
      platform: {
        platform: "平台",
        xiaohongshu: "小红书",
        weibo: "微博",
        douyin: "抖音",
        wechat: "微信",
        adaptation: "适配",
        characteristics: "特征",
        userHabits: "用户习惯",
        contentStyle: "内容风格",
        interactionStyle: "互动方式"
      },

      // 生成要求
      requirements: {
        generate: "生成",
        create: "创作",
        produce: "产出",
        output: "输出",
        ensure: "确保",
        maintain: "保持",
        avoid: "避免",
        include: "包含",
        exclude: "排除",
        focus: "专注",
        emphasize: "强调",
        highlight: "突出",
        optimize: "优化"
      },

      // 质量标准
      quality: {
        highQuality: "高质量",
        professional: "专业",
        accurate: "准确",
        precise: "精确",
        detailed: "详细",
        comprehensive: "全面",
        systematic: "系统化",
        structured: "结构化",
        coherent: "连贯",
        logical: "逻辑",
        natural: "自然",
        fluent: "流畅",
        engaging: "吸引人",
        compelling: "引人注目",
        effective: "有效"
      },

      // 分析维度
      analysis: {
        dimension: "维度",
        aspect: "方面",
        factor: "因素",
        element: "元素",
        component: "组成部分",
        feature: "特征",
        characteristic: "特性",
        attribute: "属性",
        criterion: "标准",
        metric: "指标",
        measurement: "测量",
        evaluation: "评估",
        assessment: "评价",
        scoring: "评分",
        rating: "评级"
      },

      // 创意相关
      creative: {
        creative: "创意",
        creativity: "创造力",
        innovation: "创新",
        originality: "原创性",
        uniqueness: "独特性",
        novelty: "新颖性",
        inspiration: "灵感",
        imagination: "想象力",
        brainstorming: "头脑风暴",
        ideation: "构思",
        conceptualization: "概念化",
        visualization: "可视化"
      },

      // 用户相关
      user: {
        user: "用户",
        audience: "受众",
        target: "目标",
        customer: "客户",
        reader: "读者",
        viewer: "观众",
        participant: "参与者",
        community: "社区",
        group: "群体",
        segment: "细分",
        persona: "用户画像",
        behavior: "行为",
        preference: "偏好",
        need: "需求",
        pain: "痛点",
        benefit: "收益",
        value: "价值"
      },

      // 技术相关
      technical: {
        system: "系统",
        algorithm: "算法",
        model: "模型",
        framework: "框架",
        architecture: "架构",
        structure: "结构",
        component: "组件",
        module: "模块",
        function: "功能",
        feature: "特性",
        capability: "能力",
        performance: "性能",
        efficiency: "效率",
        optimization: "优化",
        automation: "自动化"
      },

      // 常用动词
      actions: {
        analyze: "分析",
        generate: "生成",
        create: "创建",
        produce: "产生",
        extract: "提取",
        identify: "识别",
        recognize: "识别",
        understand: "理解",
        comprehend: "理解",
        interpret: "解释",
        evaluate: "评估",
        assess: "评价",
        measure: "测量",
        calculate: "计算",
        determine: "确定",
        define: "定义",
        describe: "描述",
        explain: "解释",
        illustrate: "说明",
        demonstrate: "演示",
        provide: "提供",
        offer: "提供",
        deliver: "交付",
        present: "呈现",
        display: "显示",
        show: "显示",
        reveal: "揭示",
        uncover: "发现",
        discover: "发现",
        explore: "探索",
        investigate: "调查",
        research: "研究",
        study: "研究",
        examine: "检查",
        review: "审查",
        inspect: "检查",
        monitor: "监控",
        track: "跟踪",
        follow: "跟随",
        guide: "指导",
        direct: "指导",
        lead: "引导",
        assist: "协助",
        help: "帮助",
        support: "支持",
        enable: "启用",
        facilitate: "促进",
        enhance: "增强",
        improve: "改进",
        upgrade: "升级",
        update: "更新",
        modify: "修改",
        adjust: "调整",
        adapt: "适应",
        customize: "定制",
        personalize: "个性化",
        tailor: "定制",
        configure: "配置",
        setup: "设置",
        install: "安装",
        implement: "实施",
        execute: "执行",
        perform: "执行",
        operate: "操作",
        manage: "管理",
        control: "控制",
        handle: "处理",
        process: "处理",
        transform: "转换",
        convert: "转换",
        translate: "翻译",
        interpret: "解释",
        decode: "解码",
        encode: "编码",
        format: "格式化",
        structure: "结构化",
        organize: "组织",
        arrange: "安排",
        sort: "排序",
        classify: "分类",
        categorize: "分类",
        group: "分组",
        cluster: "聚类",
        segment: "分段",
        divide: "分割",
        separate: "分离",
        isolate: "隔离",
        filter: "过滤",
        select: "选择",
        choose: "选择",
        pick: "挑选",
        decide: "决定",
        determine: "确定",
        resolve: "解决",
        solve: "解决",
        fix: "修复",
        repair: "修复",
        correct: "纠正",
        adjust: "调整",
        calibrate: "校准",
        tune: "调整",
        optimize: "优化",
        maximize: "最大化",
        minimize: "最小化",
        balance: "平衡",
        stabilize: "稳定",
        maintain: "维护",
        preserve: "保持",
        protect: "保护",
        secure: "保护",
        safeguard: "保护",
        ensure: "确保",
        guarantee: "保证",
        verify: "验证",
        validate: "验证",
        confirm: "确认",
        check: "检查",
        test: "测试",
        try: "尝试",
        attempt: "尝试",
        experiment: "实验",
        explore: "探索",
        investigate: "调查",
        research: "研究"
      },

      // 常用形容词
      adjectives: {
        high: "高",
        low: "低",
        good: "好",
        bad: "坏",
        best: "最好",
        worst: "最坏",
        better: "更好",
        worse: "更坏",
        great: "伟大",
        excellent: "优秀",
        outstanding: "杰出",
        superior: "优越",
        inferior: "劣质",
        perfect: "完美",
        imperfect: "不完美",
        ideal: "理想",
        optimal: "最优",
        maximum: "最大",
        minimum: "最小",
        major: "主要",
        minor: "次要",
        primary: "主要",
        secondary: "次要",
        main: "主要",
        key: "关键",
        important: "重要",
        significant: "重要",
        critical: "关键",
        essential: "必要",
        necessary: "必要",
        required: "必需",
        optional: "可选",
        recommended: "推荐",
        suggested: "建议",
        preferred: "首选",
        alternative: "替代",
        additional: "额外",
        extra: "额外",
        supplementary: "补充",
        complementary: "互补",
        comprehensive: "全面",
        complete: "完整",
        partial: "部分",
        full: "完整",
        empty: "空",
        total: "总计",
        overall: "整体",
        general: "一般",
        specific: "具体",
        particular: "特定",
        special: "特殊",
        unique: "独特",
        common: "常见",
        rare: "罕见",
        frequent: "频繁",
        occasional: "偶尔",
        regular: "定期",
        irregular: "不规则",
        consistent: "一致",
        inconsistent: "不一致",
        stable: "稳定",
        unstable: "不稳定",
        reliable: "可靠",
        unreliable: "不可靠",
        accurate: "准确",
        inaccurate: "不准确",
        precise: "精确",
        imprecise: "不精确",
        exact: "确切",
        approximate: "大约",
        rough: "粗略",
        detailed: "详细",
        brief: "简短",
        long: "长",
        short: "短",
        wide: "宽",
        narrow: "窄",
        broad: "广泛",
        limited: "有限",
        unlimited: "无限",
        finite: "有限",
        infinite: "无限",
        large: "大",
        small: "小",
        huge: "巨大",
        tiny: "微小",
        massive: "巨大",
        compact: "紧凑",
        dense: "密集",
        sparse: "稀疏",
        thick: "厚",
        thin: "薄",
        heavy: "重",
        light: "轻",
        strong: "强",
        weak: "弱",
        powerful: "强大",
        powerless: "无力",
        effective: "有效",
        ineffective: "无效",
        efficient: "高效",
        inefficient: "低效",
        productive: "高产",
        unproductive: "低产",
        successful: "成功",
        unsuccessful: "不成功",
        positive: "积极",
        negative: "消极",
        favorable: "有利",
        unfavorable: "不利",
        beneficial: "有益",
        harmful: "有害",
        useful: "有用",
        useless: "无用",
        valuable: "有价值",
        worthless: "无价值",
        meaningful: "有意义",
        meaningless: "无意义",
        significant: "重要",
        insignificant: "不重要",
        relevant: "相关",
        irrelevant: "不相关",
        appropriate: "合适",
        inappropriate: "不合适",
        suitable: "适合",
        unsuitable: "不适合",
        proper: "正确",
        improper: "不正确",
        correct: "正确",
        incorrect: "错误",
        right: "正确",
        wrong: "错误",
        true: "真实",
        false: "虚假",
        real: "真实",
        fake: "虚假",
        genuine: "真正",
        artificial: "人工",
        natural: "自然",
        synthetic: "合成",
        original: "原始",
        modified: "修改",
        new: "新",
        old: "旧",
        fresh: "新鲜",
        stale: "陈旧",
        modern: "现代",
        traditional: "传统",
        contemporary: "当代",
        ancient: "古代",
        recent: "最近",
        past: "过去",
        current: "当前",
        future: "未来",
        present: "现在",
        immediate: "立即",
        delayed: "延迟",
        quick: "快速",
        slow: "缓慢",
        fast: "快",
        rapid: "快速",
        gradual: "逐渐",
        sudden: "突然",
        instant: "即时",
        permanent: "永久",
        temporary: "临时",
        lasting: "持久",
        brief: "短暂",
        continuous: "连续",
        discontinuous: "不连续",
        constant: "恒定",
        variable: "可变",
        fixed: "固定",
        flexible: "灵活",
        rigid: "刚性",
        soft: "软",
        hard: "硬",
        smooth: "光滑",
        rough: "粗糙",
        sharp: "尖锐",
        blunt: "钝",
        clear: "清晰",
        unclear: "不清晰",
        obvious: "明显",
        obscure: "模糊",
        visible: "可见",
        invisible: "不可见",
        transparent: "透明",
        opaque: "不透明",
        bright: "明亮",
        dark: "黑暗",
        colorful: "多彩",
        colorless: "无色",
        loud: "大声",
        quiet: "安静",
        silent: "沉默",
        noisy: "嘈杂",
        calm: "平静",
        chaotic: "混乱",
        organized: "有组织",
        disorganized: "无组织",
        neat: "整洁",
        messy: "混乱",
        clean: "干净",
        dirty: "脏",
        pure: "纯净",
        impure: "不纯",
        simple: "简单",
        complex: "复杂",
        complicated: "复杂",
        easy: "容易",
        difficult: "困难",
        hard: "困难",
        challenging: "有挑战性",
        demanding: "要求高",
        accessible: "可访问",
        inaccessible: "不可访问",
        available: "可用",
        unavailable: "不可用",
        open: "开放",
        closed: "关闭",
        public: "公共",
        private: "私人",
        personal: "个人",
        professional: "专业",
        amateur: "业余",
        expert: "专家",
        novice: "新手",
        experienced: "有经验",
        inexperienced: "无经验",
        skilled: "熟练",
        unskilled: "不熟练",
        qualified: "合格",
        unqualified: "不合格",
        certified: "认证",
        uncertified: "未认证",
        licensed: "许可",
        unlicensed: "无许可",
        authorized: "授权",
        unauthorized: "未授权",
        legal: "合法",
        illegal: "非法",
        legitimate: "合法",
        illegitimate: "非法",
        valid: "有效",
        invalid: "无效",
        acceptable: "可接受",
        unacceptable: "不可接受",
        satisfactory: "满意",
        unsatisfactory: "不满意",
        adequate: "足够",
        inadequate: "不足",
        sufficient: "充分",
        insufficient: "不充分",
        enough: "足够",
        too_much: "太多",
        too_little: "太少",
        balanced: "平衡",
        unbalanced: "不平衡",
        equal: "相等",
        unequal: "不相等",
        fair: "公平",
        unfair: "不公平",
        just: "公正",
        unjust: "不公正",
        honest: "诚实",
        dishonest: "不诚实",
        trustworthy: "可信",
        untrustworthy: "不可信",
        reliable: "可靠",
        unreliable: "不可靠",
        dependable: "可靠",
        undependable: "不可靠",
        consistent: "一致",
        inconsistent: "不一致",
        predictable: "可预测",
        unpredictable: "不可预测",
        stable: "稳定",
        unstable: "不稳定",
        secure: "安全",
        insecure: "不安全",
        safe: "安全",
        dangerous: "危险",
        risky: "有风险",
        risk_free: "无风险",
        certain: "确定",
        uncertain: "不确定",
        sure: "确定",
        unsure: "不确定",
        confident: "自信",
        unconfident: "不自信",
        optimistic: "乐观",
        pessimistic: "悲观",
        hopeful: "有希望",
        hopeless: "无希望",
        promising: "有前途",
        unpromising: "无前途",
        encouraging: "鼓励",
        discouraging: "令人沮丧",
        motivating: "激励",
        demotivating: "令人沮丧",
        inspiring: "鼓舞人心",
        uninspiring: "不鼓舞人心",
        exciting: "令人兴奋",
        boring: "无聊",
        interesting: "有趣",
        uninteresting: "无趣",
        engaging: "吸引人",
        disengaging: "不吸引人",
        attractive: "有吸引力",
        unattractive: "无吸引力",
        appealing: "吸引人",
        unappealing: "不吸引人",
        charming: "迷人",
        uncharming: "不迷人",
        pleasant: "愉快",
        unpleasant: "不愉快",
        enjoyable: "令人愉快",
        unenjoyable: "不令人愉快",
        satisfying: "令人满意",
        unsatisfying: "不令人满意",
        fulfilling: "令人满足",
        unfulfilling: "不令人满足",
        rewarding: "有回报",
        unrewarding: "无回报",
        worthwhile: "值得",
        not_worthwhile: "不值得",
        beneficial: "有益",
        detrimental: "有害",
        advantageous: "有利",
        disadvantageous: "不利",
        favorable: "有利",
        unfavorable: "不利",
        positive: "积极",
        negative: "消极",
        constructive: "建设性",
        destructive: "破坏性",
        productive: "生产性",
        counterproductive: "适得其反",
        helpful: "有帮助",
        unhelpful: "无帮助",
        supportive: "支持",
        unsupportive: "不支持",
        cooperative: "合作",
        uncooperative: "不合作",
        collaborative: "协作",
        competitive: "竞争",
        friendly: "友好",
        unfriendly: "不友好",
        kind: "善良",
        unkind: "不善良",
        generous: "慷慨",
        stingy: "吝啬",
        selfish: "自私",
        selfless: "无私",
        considerate: "体贴",
        inconsiderate: "不体贴",
        thoughtful: "体贴",
        thoughtless: "不体贴",
        caring: "关心",
        uncaring: "不关心",
        loving: "爱",
        unloving: "不爱",
        affectionate: "深情",
        cold: "冷漠",
        warm: "温暖",
        cool: "凉爽",
        hot: "热",
        comfortable: "舒适",
        uncomfortable: "不舒适",
        cozy: "舒适",
        spacious: "宽敞",
        cramped: "拥挤",
        crowded: "拥挤",
        empty: "空",
        full: "满",
        busy: "忙碌",
        idle: "空闲",
        active: "活跃",
        inactive: "不活跃",
        energetic: "精力充沛",
        lethargic: "无精打采",
        dynamic: "动态",
        static: "静态",
        lively: "活泼",
        dull: "沉闷",
        vibrant: "充满活力",
        lifeless: "无生气",
        animated: "生动",
        inanimate: "无生命",
        alive: "活着",
        dead: "死",
        living: "活着",
        deceased: "已故",
        healthy: "健康",
        unhealthy: "不健康",
        fit: "健康",
        unfit: "不健康",
        strong: "强壮",
        weak: "虚弱",
        robust: "强健",
        frail: "虚弱",
        sturdy: "坚固",
        fragile: "脆弱",
        durable: "耐用",
        perishable: "易腐",
        lasting: "持久",
        temporary: "临时",
        permanent: "永久",
        eternal: "永恒",
        immortal: "不朽",
        mortal: "凡人",
        finite: "有限",
        infinite: "无限",
        limited: "有限",
        unlimited: "无限",
        boundless: "无边",
        restricted: "受限",
        unrestricted: "不受限",
        free: "自由",
        constrained: "受约束",
        independent: "独立",
        dependent: "依赖",
        autonomous: "自主",
        controlled: "受控",
        voluntary: "自愿",
        involuntary: "非自愿",
        optional: "可选",
        mandatory: "强制",
        required: "必需",
        forbidden: "禁止",
        allowed: "允许",
        permitted: "允许",
        prohibited: "禁止",
        legal: "合法",
        illegal: "非法",
        lawful: "合法",
        unlawful: "非法",
        legitimate: "合法",
        illegitimate: "非法",
        authorized: "授权",
        unauthorized: "未授权",
        official: "官方",
        unofficial: "非官方",
        formal: "正式",
        informal: "非正式",
        casual: "随意",
        serious: "严肃",
        strict: "严格",
        lenient: "宽松",
        rigid: "刚性",
        flexible: "灵活",
        adaptable: "适应性",
        inflexible: "不灵活",
        versatile: "多才多艺",
        specialized: "专业",
        general: "一般",
        specific: "具体",
        particular: "特定",
        universal: "通用",
        global: "全球",
        local: "本地",
        regional: "区域",
        national: "国家",
        international: "国际",
        domestic: "国内",
        foreign: "外国",
        native: "本地",
        imported: "进口",
        exported: "出口",
        internal: "内部",
        external: "外部",
        inside: "内部",
        outside: "外部",
        inner: "内部",
        outer: "外部",
        central: "中央",
        peripheral: "外围",
        core: "核心",
        marginal: "边缘",
        mainstream: "主流",
        alternative: "替代",
        conventional: "传统",
        unconventional: "非传统",
        standard: "标准",
        nonstandard: "非标准",
        normal: "正常",
        abnormal: "异常",
        typical: "典型",
        atypical: "非典型",
        usual: "通常",
        unusual: "不寻常",
        common: "常见",
        uncommon: "不常见",
        ordinary: "普通",
        extraordinary: "非凡",
        regular: "定期",
        irregular: "不规则",
        consistent: "一致",
        inconsistent: "不一致",
        uniform: "统一",
        varied: "多样",
        diverse: "多样",
        homogeneous: "同质",
        heterogeneous: "异质",
        similar: "相似",
        different: "不同",
        identical: "相同",
        distinct: "不同",
        unique: "独特",
        duplicate: "重复",
        original: "原始",
        copy: "复制",
        authentic: "真实",
        fake: "虚假",
        genuine: "真正",
        artificial: "人工",
        real: "真实",
        imaginary: "想象",
        actual: "实际",
        theoretical: "理论",
        practical: "实用",
        impractical: "不实用",
        realistic: "现实",
        unrealistic: "不现实",
        feasible: "可行",
        infeasible: "不可行",
        possible: "可能",
        impossible: "不可能",
        probable: "可能",
        improbable: "不可能",
        likely: "可能",
        unlikely: "不可能",
        certain: "确定",
        uncertain: "不确定",
        definite: "明确",
        indefinite: "不明确",
        clear: "清楚",
        unclear: "不清楚",
        obvious: "明显",
        obscure: "模糊",
        evident: "明显",
        hidden: "隐藏",
        apparent: "明显",
        concealed: "隐藏",
        visible: "可见",
        invisible: "不可见",
        transparent: "透明",
        opaque: "不透明",
        open: "开放",
        closed: "关闭",
        accessible: "可访问",
        inaccessible: "不可访问",
        available: "可用",
        unavailable: "不可用",
        present: "存在",
        absent: "缺席",
        existing: "存在",
        nonexistent: "不存在",
        current: "当前",
        outdated: "过时",
        modern: "现代",
        ancient: "古代",
        new: "新",
        old: "旧",
        fresh: "新鲜",
        stale: "陈旧",
        recent: "最近",
        past: "过去",
        future: "未来",
        upcoming: "即将到来",
        previous: "以前",
        next: "下一个",
        following: "以下",
        preceding: "前面",
        first: "第一",
        last: "最后",
        initial: "初始",
        final: "最终",
        beginning: "开始",
        ending: "结束",
        starting: "开始",
        finishing: "结束",
        early: "早期",
        late: "晚期",
        timely: "及时",
        untimely: "不及时",
        prompt: "及时",
        delayed: "延迟",
        immediate: "立即",
        gradual: "逐渐",
        sudden: "突然",
        abrupt: "突然",
        smooth: "平滑",
        rough: "粗糙",
        gentle: "温和",
        harsh: "严厉",
        mild: "温和",
        severe: "严重",
        extreme: "极端",
        moderate: "适度",
        intense: "强烈",
        weak: "弱",
        strong: "强",
        powerful: "强大",
        feeble: "微弱",
        robust: "强健",
        delicate: "精致",
        tough: "坚韧",
        tender: "嫩",
        hard: "硬",
        soft: "软",
        firm: "坚定",
        loose: "松散",
        tight: "紧",
        relaxed: "放松",
        tense: "紧张",
        calm: "平静",
        agitated: "激动",
        peaceful: "和平",
        violent: "暴力",
        quiet: "安静",
        loud: "大声",
        silent: "沉默",
        noisy: "嘈杂"
      }
    };

    this.enTranslations.promptSystem = {
      // 基础概念
      system: {
        expert: "Expert",
        professional: "Professional",
        assistant: "Assistant",
        specialist: "Specialist",
        consultant: "Consultant",
        analyst: "Analyst",
        designer: "Designer",
        manager: "Manager",
        advisor: "Advisor"
      },

      // 内容相关
      content: {
        title: "Title",
        content: "Content",
        article: "Article",
        text: "Text",
        description: "Description",
        analysis: "Analysis",
        generation: "Generation",
        adaptation: "Adaptation",
        optimization: "Optimization",
        processing: "Processing",
        extraction: "Extraction",
        summary: "Summary",
        quality: "Quality",
        structure: "Structure",
        style: "Style",
        tone: "Tone",
        format: "Format",
        template: "Template",
        framework: "Framework"
      },

      // 品牌相关
      brand: {
        brand: "Brand",
        brandTone: "Brand Tone",
        brandPersonality: "Brand Personality",
        brandStory: "Brand Story",
        brandDescription: "Brand Description",
        brandKeywords: "Brand Keywords",
        brandValues: "Brand Values",
        brandStyle: "Brand Style",
        brandVoice: "Brand Voice",
        brandIdentity: "Brand Identity",
        corpus: "Corpus",
        extraction: "Extraction",
        conflict: "Conflict",
        resolution: "Resolution"
      },

      // 平台相关
      platform: {
        platform: "Platform",
        xiaohongshu: "Xiaohongshu",
        weibo: "Weibo",
        douyin: "Douyin",
        wechat: "WeChat",
        adaptation: "Adaptation",
        characteristics: "Characteristics",
        userHabits: "User Habits",
        contentStyle: "Content Style",
        interactionStyle: "Interaction Style"
      },

      // 生成要求
      requirements: {
        generate: "Generate",
        create: "Create",
        produce: "Produce",
        output: "Output",
        ensure: "Ensure",
        maintain: "Maintain",
        avoid: "Avoid",
        include: "Include",
        exclude: "Exclude",
        focus: "Focus",
        emphasize: "Emphasize",
        highlight: "Highlight",
        optimize: "Optimize"
      },

      // 质量标准
      quality: {
        highQuality: "High Quality",
        professional: "Professional",
        accurate: "Accurate",
        precise: "Precise",
        detailed: "Detailed",
        comprehensive: "Comprehensive",
        systematic: "Systematic",
        structured: "Structured",
        coherent: "Coherent",
        logical: "Logical",
        natural: "Natural",
        fluent: "Fluent",
        engaging: "Engaging",
        compelling: "Compelling",
        effective: "Effective"
      },

      // 分析维度
      analysis: {
        dimension: "Dimension",
        aspect: "Aspect",
        factor: "Factor",
        element: "Element",
        component: "Component",
        feature: "Feature",
        characteristic: "Characteristic",
        attribute: "Attribute",
        criterion: "Criterion",
        metric: "Metric",
        measurement: "Measurement",
        evaluation: "Evaluation",
        assessment: "Assessment",
        scoring: "Scoring",
        rating: "Rating"
      },

      // 创意相关
      creative: {
        creative: "Creative",
        creativity: "Creativity",
        innovation: "Innovation",
        originality: "Originality",
        uniqueness: "Uniqueness",
        novelty: "Novelty",
        inspiration: "Inspiration",
        imagination: "Imagination",
        brainstorming: "Brainstorming",
        ideation: "Ideation",
        conceptualization: "Conceptualization",
        visualization: "Visualization"
      },

      // 用户相关
      user: {
        user: "User",
        audience: "Audience",
        target: "Target",
        customer: "Customer",
        reader: "Reader",
        viewer: "Viewer",
        participant: "Participant",
        community: "Community",
        group: "Group",
        segment: "Segment",
        persona: "Persona",
        behavior: "Behavior",
        preference: "Preference",
        need: "Need",
        pain: "Pain Point",
        benefit: "Benefit",
        value: "Value"
      },

      // 技术相关
      technical: {
        system: "System",
        algorithm: "Algorithm",
        model: "Model",
        framework: "Framework",
        architecture: "Architecture",
        structure: "Structure",
        component: "Component",
        module: "Module",
        function: "Function",
        feature: "Feature",
        capability: "Capability",
        performance: "Performance",
        efficiency: "Efficiency",
        optimization: "Optimization",
        automation: "Automation"
      }
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 基础专家角色
      {
        search: /"你是一个专业的"/g,
        replace: "t('promptSystem.system.professional') + ' '"
      },
      {
        search: /"你是一位专业的"/g,
        replace: "t('promptSystem.system.professional') + ' '"
      },
      {
        search: /"专家"/g,
        replace: "t('promptSystem.system.expert')"
      },
      {
        search: /"助手"/g,
        replace: "t('promptSystem.system.assistant')"
      },
      {
        search: /"顾问"/g,
        replace: "t('promptSystem.system.consultant')"
      },
      {
        search: /"分析师"/g,
        replace: "t('promptSystem.system.analyst')"
      },

      // 内容相关
      {
        search: /"标题"/g,
        replace: "t('promptSystem.content.title')"
      },
      {
        search: /"内容"/g,
        replace: "t('promptSystem.content.content')"
      },
      {
        search: /"文章"/g,
        replace: "t('promptSystem.content.article')"
      },
      {
        search: /"分析"/g,
        replace: "t('promptSystem.content.analysis')"
      },
      {
        search: /"生成"/g,
        replace: "t('promptSystem.content.generation')"
      },
      {
        search: /"适配"/g,
        replace: "t('promptSystem.content.adaptation')"
      },
      {
        search: /"处理"/g,
        replace: "t('promptSystem.content.processing')"
      },
      {
        search: /"提取"/g,
        replace: "t('promptSystem.content.extraction')"
      },
      {
        search: /"质量"/g,
        replace: "t('promptSystem.content.quality')"
      },
      {
        search: /"风格"/g,
        replace: "t('promptSystem.content.style')"
      },
      {
        search: /"调性"/g,
        replace: "t('promptSystem.content.tone')"
      },

      // 品牌相关
      {
        search: /"品牌"/g,
        replace: "t('promptSystem.brand.brand')"
      },
      {
        search: /"品牌调性"/g,
        replace: "t('promptSystem.brand.brandTone')"
      },
      {
        search: /"品牌个性"/g,
        replace: "t('promptSystem.brand.brandPersonality')"
      },
      {
        search: /"品牌故事"/g,
        replace: "t('promptSystem.brand.brandStory')"
      },
      {
        search: /"品牌描述"/g,
        replace: "t('promptSystem.brand.brandDescription')"
      },
      {
        search: /"语料库"/g,
        replace: "t('promptSystem.brand.corpus')"
      },

      // 平台相关
      {
        search: /"平台"/g,
        replace: "t('promptSystem.platform.platform')"
      },
      {
        search: /"小红书"/g,
        replace: "t('promptSystem.platform.xiaohongshu')"
      },
      {
        search: /"微博"/g,
        replace: "t('promptSystem.platform.weibo')"
      },
      {
        search: /"抖音"/g,
        replace: "t('promptSystem.platform.douyin')"
      },
      {
        search: /"微信"/g,
        replace: "t('promptSystem.platform.wechat')"
      },

      // 生成要求
      {
        search: /"请"/g,
        replace: "t('promptSystem.requirements.generate')"
      },
      {
        search: /"确保"/g,
        replace: "t('promptSystem.requirements.ensure')"
      },
      {
        search: /"避免"/g,
        replace: "t('promptSystem.requirements.avoid')"
      },
      {
        search: /"包含"/g,
        replace: "t('promptSystem.requirements.include')"
      },
      {
        search: /"专注"/g,
        replace: "t('promptSystem.requirements.focus')"
      },
      {
        search: /"强调"/g,
        replace: "t('promptSystem.requirements.emphasize')"
      },
      {
        search: /"优化"/g,
        replace: "t('promptSystem.requirements.optimize')"
      },

      // 质量标准
      {
        search: /"高质量"/g,
        replace: "t('promptSystem.quality.highQuality')"
      },
      {
        search: /"专业"/g,
        replace: "t('promptSystem.quality.professional')"
      },
      {
        search: /"准确"/g,
        replace: "t('promptSystem.quality.accurate')"
      },
      {
        search: /"详细"/g,
        replace: "t('promptSystem.quality.detailed')"
      },
      {
        search: /"全面"/g,
        replace: "t('promptSystem.quality.comprehensive')"
      },
      {
        search: /"系统化"/g,
        replace: "t('promptSystem.quality.systematic')"
      },
      {
        search: /"结构化"/g,
        replace: "t('promptSystem.quality.structured')"
      },
      {
        search: /"自然"/g,
        replace: "t('promptSystem.quality.natural')"
      },
      {
        search: /"流畅"/g,
        replace: "t('promptSystem.quality.fluent')"
      },
      {
        search: /"吸引人"/g,
        replace: "t('promptSystem.quality.engaging')"
      },
      {
        search: /"有效"/g,
        replace: "t('promptSystem.quality.effective')"
      }
    ];
  }

  /**
   * 处理服务文件
   */
  async processServiceFile() {
    console.log('📝 处理服务文件...');
    
    if (!fs.existsSync(SERVICE_PATH)) {
      console.log(`⚠️ 文件不存在: ${SERVICE_PATH}，跳过处理`);
      return;
    }

    let content = fs.readFileSync(SERVICE_PATH, 'utf8');
    
    // 应用所有替换
    for (const replacement of this.replacements) {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        this.processedCount += matches.length;
      }
    }

    fs.writeFileSync(SERVICE_PATH, content, 'utf8');
    console.log(`✅ 服务文件处理完成，替换了 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('📄 更新翻译文件...');
    
    // 更新中文翻译文件
    fs.writeFileSync(
      ZH_LOCALE_PATH,
      JSON.stringify(this.zhTranslations, null, 2),
      'utf8'
    );
    
    // 更新英文翻译文件
    fs.writeFileSync(
      EN_LOCALE_PATH,
      JSON.stringify(this.enTranslations, null, 2),
      'utf8'
    );
    
    console.log('✅ 翻译文件更新完成');
  }
}

// 运行脚本
const processor = new PromptSystemComprehensiveI18n();
processor.run().catch(console.error);
