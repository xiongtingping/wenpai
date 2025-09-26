/**
 * Emoji英文名称到中文名称的翻译映射系统
 * 用于解决ensureMinimumPerCategory函数中英文名称的国际化问题
 */

// 基础表情翻译映射
const basicEmojiTranslations: Record<string, string> = {
  // 脸部表情
  'wink': '眨眼',
  'smile': '微笑',
  'grin': '咧嘴笑',
  'laughing': '大笑',
  'joy': '开心',
  'smiley': '笑脸',
  'happy': '开心',
  'blush': '脸红',
  'relaxed': '放松',
  'winking_face': '眨眼脸',
  'heart_eyes': '爱心眼',
  'kissing_heart': '飞吻',
  'kissing': '亲吻',
  'kissing_smiling_eyes': '眯眼亲吻',
  'stuck_out_tongue': '吐舌头',
  'stuck_out_tongue_winking_eye': '眨眼吐舌',
  'stuck_out_tongue_closed_eyes': '闭眼吐舌',
  'disappointed': '失望',
  'worried': '担心',
  'angry': '生气',
  'rage': '愤怒',
  'cry': '哭泣',
  'sob': '痛哭',
  'tired_face': '疲惫',
  'sleeping': '睡觉',
  'mask': '口罩',
  'sunglasses': '墨镜',
  'confused': '困惑',
  'expressionless': '面无表情',
  'neutral_face': '中性脸',
  'no_mouth': '无嘴',
  'innocent': '无辜',
  'smirk': '得意',
  'unamused': '无趣',
  'sweat_smile': '苦笑',
  'sweat': '流汗',
  'weary': '疲倦',
  'pensive': '沉思',
  'disappointed_relieved': '失望但释然',
  'fearful': '恐惧',
  'cold_sweat': '冷汗',
  'persevere': '坚持',
  'confounded': '困扰',
  'triumph': '胜利',
  'frowning': '皱眉',
  'anguished': '痛苦',
  'grimacing': '做鬼脸',
  'open_mouth': '张嘴',
  'hushed': '安静',
  'sleepy': '困倦',
  'dizzy_face': '头晕',
  'astonished': '惊讶',
  'zipper_mouth_face': '拉链嘴',
  'nauseated_face': '恶心',
  'sneezing_face': '打喷嚏',
  'drooling_face': '流口水',
  'lying_face': '说谎脸',

  // 动物
  'cat': '猫',
  'dog': '狗',
  'mouse': '老鼠',
  'hamster': '仓鼠',
  'rabbit': '兔子',
  'fox': '狐狸',
  'bear': '熊',
  'panda': '熊猫',
  'koala': '考拉',
  'tiger': '老虎',
  'lion': '狮子',
  'cow': '牛',
  'pig': '猪',
  'frog': '青蛙',
  'monkey': '猴子',
  'chicken': '鸡',
  'penguin': '企鹅',
  'bird': '鸟',
  'duck': '鸭子',
  'eagle': '老鹰',
  'owl': '猫头鹰',
  'bat': '蝙蝠',
  'wolf': '狼',
  'horse': '马',
  'unicorn': '独角兽',
  'bee': '蜜蜂',
  'bug': '虫子',
  'butterfly': '蝴蝶',
  'snail': '蜗牛',
  'beetle': '甲虫',
  'ant': '蚂蚁',
  'spider': '蜘蛛',
  'scorpion': '蝎子',
  'crab': '螃蟹',
  'snake': '蛇',
  'lizard': '蜥蜴',
  'turtle': '乌龟',
  'fish': '鱼',
  'whale': '鲸鱼',
  'dolphin': '海豚',
  'shark': '鲨鱼',
  'octopus': '章鱼',
  'shell': '贝壳',

  // 食物
  'apple': '苹果',
  'banana': '香蕉',
  'orange': '橙子',
  'strawberry': '草莓',
  'grapes': '葡萄',
  'watermelon': '西瓜',
  'peach': '桃子',
  'pineapple': '菠萝',
  'mango': '芒果',
  'lemon': '柠檬',
  'coconut': '椰子',
  'kiwi': '猕猴桃',
  'tomato': '番茄',
  'avocado': '牛油果',
  'eggplant': '茄子',
  'carrot': '胡萝卜',
  'corn': '玉米',
  'pepper': '辣椒',
  'cucumber': '黄瓜',
  'broccoli': '西兰花',
  'mushroom': '蘑菇',
  'peanuts': '花生',
  'bread': '面包',
  'croissant': '羊角面包',
  'pancakes': '薄饼',
  'cheese': '奶酪',
  'meat': '肉',
  'bacon': '培根',
  'hamburger': '汉堡',
  'pizza': '披萨',
  'hotdog': '热狗',
  'fries': '薯条',
  'popcorn': '爆米花',
  'doughnut': '甜甜圈',
  'cookie': '饼干',
  'cake': '蛋糕',
  'pie': '派',
  'chocolate': '巧克力',
  'candy': '糖果',
  'lollipop': '棒棒糖',
  'ice_cream': '冰淇淋',
  'coffee': '咖啡',
  'tea': '茶',
  'milk': '牛奶',
  'beer': '啤酒',
  'wine': '红酒',
  'cocktail': '鸡尾酒',

  // 物品
  'car': '汽车',
  'bike': '自行车',
  'bus': '公交车',
  'train': '火车',
  'airplane': '飞机',
  'ship': '船',
  'rocket': '火箭',
  'phone': '电话',
  'computer': '电脑',
  'watch': '手表',
  'camera': '相机',
  'book': '书',
  'pen': '笔',
  'pencil': '铅笔',
  'scissors': '剪刀',
  'key': '钥匙',
  'lock': '锁',
  'hammer': '锤子',
  'wrench': '扳手',
  'gun': '枪',
  'bow': '弓',
  'shield': '盾牌',
  'crown': '皇冠',
  'hat': '帽子',
  'glasses': '眼镜',
  'necktie': '领带',
  'shirt': '衬衫',
  'jeans': '牛仔裤',
  'dress': '连衣裙',
  'shoe': '鞋',
  'sandal': '凉鞋',
  'boot': '靴子',
  'bag': '包',
  'purse': '钱包',
  'briefcase': '公文包',
  'umbrella': '雨伞',
  'ring': '戒指',
  'gem': '宝石',
  'crystal_ball': '水晶球',
  'poop': '便便',
  'pile_of_poo': '便便',
  'hankey': '便便',
  'shit': '便便',

  // 自然
  'sun': '太阳',
  'moon': '月亮',
  'star': '星星',
  'cloud': '云',
  'rain': '雨',
  'snow': '雪',
  'lightning': '闪电',
  'fire': '火',
  'water': '水',
  'earth': '地球',
  'mountain': '山',
  'volcano': '火山',
  'desert': '沙漠',
  'beach': '海滩',
  'ocean': '海洋',
  'river': '河流',
  'lake': '湖',
  'forest': '森林',
  'tree': '树',
  'flower': '花',
  'rose': '玫瑰',
  'tulip': '郁金香',
  'sunflower': '向日葵',
  'leaves': '叶子',
  'grass': '草',
  'seedling': '幼苗',
  'herb': '香草',
  'four_leaf_clover': '四叶草',
  'bamboo': '竹子',
  'evergreen_tree': '常青树',
  'deciduous_tree': '落叶树',
  'palm_tree': '棕榈树',
  'cactus': '仙人掌',

  // 活动和运动
  'soccer': '足球',
  'basketball': '篮球',
  'football': '橄榄球',
  'baseball': '棒球',
  'tennis': '网球',
  'volleyball': '排球',
  'rugby': '橄榄球',
  'golf': '高尔夫',
  'swimming': '游泳',
  'running': '跑步',
  'cycling': '骑行',
  'skiing': '滑雪',
  'snowboarding': '滑雪板',
  'surfing': '冲浪',
  'fishing': '钓鱼',
  'dancing': '跳舞',
  'singing': '唱歌',
  'music': '音乐',
  'guitar': '吉他',
  'piano': '钢琴',
  'drums': '鼓',
  'trumpet': '小号',
  'violin': '小提琴',

  // 符号和标志
  'heart': '爱心',
  'broken_heart': '心碎',
  'yellow_heart': '黄色爱心',
  'green_heart': '绿色爱心',
  'blue_heart': '蓝色爱心',
  'purple_heart': '紫色爱心',
  'black_heart': '黑色爱心',
  'white_heart': '白色爱心',
  'peace': '和平',
  'cross': '十字架',
  'star_of_david': '大卫之星',
  'wheel_of_dharma': '法轮',
  'yin_yang': '阴阳',
  'check': '勾选',
  'x': 'X',
  'exclamation': '感叹号',
  'question': '问号',
  'warning': '警告',
  'no_entry': '禁止进入',
  'stop_sign': '停止标志',
  'construction': '施工',
  'arrow_up': '向上箭头',
  'arrow_down': '向下箭头',
  'arrow_left': '向左箭头',
  'arrow_right': '向右箭头',
  'recycle': '回收',
  'infinity': '无穷',
  'atom': '原子',
  'peace_symbol': '和平符号',

  // 常见缩写和变体
  'slightly_smiling_face': '微微笑脸',
  'upside_down_face': '倒置脸',
  'smiling_face_with_3_hearts': '三颗心笑脸',
  'kissing_face': '亲吻脸',
  'face_with_tongue': '吐舌脸',
  'money_mouth_face': '钱嘴脸',
  'hugging_face': '拥抱脸',
  'thinking_face': '思考脸',
  'shushing_face': '嘘脸',
  'yawning_face': '打哈欠脸',
  'face_with_steam_from_nose': '鼻子冒气脸',
  'smiling_face_with_tear': '含泪微笑脸',
  'partying_face': '派对脸',
  'woozy_face': '头晕脸',
  'hot_face': '热脸',
  'cold_face': '冷脸',
  'ninja': '忍者',
  'disguised_face': '伪装脸',
  'imp': '小恶魔',
  'smiling_imp': '微笑小恶魔',

  // 手势
  'thumbs_up': '竖起大拇指',
  'thumbs_down': '大拇指向下',
  'clap': '鼓掌',
  'wave': '挥手',
  'ok_hand': 'OK手势',
  'peace_sign': '和平手势',
  'love_you_gesture': '爱你手势',
  'metal': '摇滚手势',
  'crossed_fingers': '交叉手指',
  'point_up': '指向上',
  'point_down': '指向下',
  'point_left': '指向左',
  'point_right': '指向右',
  'raised_hand': '举手',
  'raised_fist': '举拳',
  'fist': '拳头',
  'facepunch': '出拳',
  'handshake': '握手',
  'pray': '祈祷',
  'writing_hand': '写字手',
  'nail_care': '美甲',
  'selfie': '自拍',
  'muscle': '肌肉',
  'leg': '腿',
  'foot': '脚',
  'ear': '耳朵',
  'nose': '鼻子',
  'brain': '大脑',
  'tooth': '牙齿',
  'bone': '骨头',
  'eyes': '眼睛',
  'eye': '眼睛',
  'tongue': '舌头',
  'lips': '嘴唇',

  // 补充常见缺失翻译
  'ghost': '幽灵',
  'alien': '外星人',
  'robot': '机器人',
  'skull': '骷髅',
  'zombie': '僵尸',
  'vampire': '吸血鬼',
  'angel': '天使',
  'devil': '恶魔',
  'fairy': '仙女',
  'wizard': '巫师',
  'witch': '女巫',
  'elf': '精灵',
  'unicorn_face': '独角兽脸',
  'dragon': '龙',
  'mermaid': '美人鱼',
  'genie': '精灵',
  'demon': '恶魔',
  'santa': '圣诞老人',
  'mrs_claus': '圣诞奶奶',
  'baby_angel': '小天使',
  'superhero': '超级英雄',
  'supervillain': '超级反派',
  'mage': '法师',
  'guard': '守卫',
  'construction_worker': '建筑工人',
  'office_worker': '办公室工作者',
  'technologist': '技术人员',
  'scientist': '科学家',
  'astronaut': '宇航员',
  'firefighter': '消防员',
  'pilot': '飞行员',
  'artist': '艺术家',
  'singer': '歌手',
  'teacher': '老师',
  'student': '学生',
  'farmer': '农民',
  'chef': '厨师',
  'mechanic': '机械师',
  'factory_worker': '工厂工人',
  'detective': '侦探',
  'spy': '间谍',
  'police_officer': '警察',
  'judge': '法官',
  'vampire_tone1': '浅肤色吸血鬼',
  'vampire_tone2': '中浅肤色吸血鬼',
  'vampire_tone3': '中等肤色吸血鬼',
  'vampire_tone4': '中深肤色吸血鬼',
  'vampire_tone5': '深肤色吸血鬼',

  // 补充截图中发现的缺失翻译
  'skull_crossbones': '骷髅交叉骨',
  'skull_and_crossbones': '骷髅和交叉骨',
  'slight_frown': '轻微皱眉',
  'slight_smile': '轻微微笑',
  'slightly_frowning_face': '轻微皱眉脸',
  'smile_cat': '微笑猫',
  'smiley_cat': '笑脸猫',
  'smirk_cat': '得意猫',
  'space_invader': '太空侵略者',
  'speak_no_evil': '不说邪恶',
  'two_hearts': '两颗心',
  'yum': '美味',
  'yummy': '美味',

  // 更多常见的emoji变体
  'cat_face': '猫脸',
  'cat_with_tears_of_joy': '喜极而泣的猫',
  'crying_cat_face': '哭泣猫脸',
  'pouting_cat': '撅嘴猫',
  'kissing_cat': '亲吻猫',
  'weary_cat': '疲惫猫',
  'scream_cat': '尖叫猫',
  'joy_cat': '开心猫',
  'heart_eyes_cat': '爱心眼猫',

  // 心形系列
  'sparkling_heart': '闪闪发光的心',
  'growing_heart': '不断增长的心',
  'beating_heart': '跳动的心',
  'revolving_hearts': '旋转的心',
  'cupid': '丘比特',
  'gift_heart': '礼物心',
  'heart_decoration': '心形装饰',
  'heavy_heart_exclamation': '重心感叹号',

  // 表情系列
  'smiling_face_with_smiling_eyes': '眯眼微笑脸',
  'grinning_face': '咧嘴笑脸',
  'grinning_face_with_smiling_eyes': '眯眼咧嘴笑脸',
  'beaming_face_with_smiling_eyes': '眯眼灿烂笑脸',
  'rolling_on_the_floor_laughing': '笑得满地打滚',

  // 动物系列
  'see_no_evil': '非礼勿视',
  'hear_no_evil': '非礼勿听',
  'monkey_face': '猴脸',
  'dog_face': '狗脸',
  'wolf_face': '狼脸',
  'fox_face': '狐狸脸',
  'raccoon': '浣熊',

  // 食物系列
  'face_savoring_food': '品尝美食脸',
  'cooking': '烹饪',
  'chef_kiss': '厨师之吻',

  // 游戏/科技系列
  'video_game': '电子游戏',
  'joystick': '游戏手柄',
  'alien_monster': '外星怪物',
  'robot_face': '机器人脸',

  // 第二批截图中发现的缺失翻译
  'heartpulse': '心跳',
  'japanese_goblin': '日本恶鬼',
  'japanese_ogre': '日本食人魔',
  'kiss': '亲吻',
  'kissing_closed_eyes': '闭眼亲吻',
  'love_letter': '情书',
  'monocle': '单片眼镜',
  'monocle_face': '戴单片眼镜的脸',
  'nerd': '书呆子',
  'nerd_face': '书呆子脸',
  'pleading': '恳求',
  'pleading_face': '恳求脸',
  'relieved': '宽慰',
  'relieved_face': '宽慰脸',
  'scream': '尖叫',
  'scream_face': '尖叫脸',

  // 补充相关的日本传统角色翻译
  'tengu': '天狗',
  'oni': '鬼',
  'ogre': '食人魔',
  'goblin': '小妖精',
  'japanese_castle': '日本城堡',
  'mount_fuji': '富士山',
  'tokyo_tower': '东京塔',

  // 补充眼镜和面部表情相关
  'sunglasses_face': '戴墨镜的脸',
  'eyeglasses': '眼镜',
  'dark_sunglasses': '墨镜',
  'safety_glasses': '安全眼镜',

  // 补充心形和爱情相关
  'heartbeat': '心跳',
  'heart_pulse': '心跳',
  'kiss_mark': '唇印',
  'lipstick': '口红',
  'nail_polish': '指甲油',

  // 补充表情相关
  'face_with_monocle': '戴单片眼镜的脸',
  'nerd_with_glasses': '戴眼镜的书呆子',
  'pleading_eyes': '恳求的眼神',
  'face_with_pleading_eyes': '恳求脸',
  'relieved_smile': '宽慰的笑容',
  'screaming_face': '尖叫脸',
  'fearful_face': '恐惧脸',

  // 第三批截图中发现的缺失翻译
  'clown': '小丑',
  'clown_face': '小丑脸',
  'face_holding_back_tears': '强忍眼泪脸',
  'face_with_symbols_on_mouth': '嘴上有符号脸',
  'face_with_symbols_over_mouth': '嘴巴被符号遮住脸',
  'swearing_face': '咒骂脸',
  'cursing_face': '咒骂脸',
  'flushed': '脸红',
  'flushed_face': '脸红脸',
  'heart_exclamation': '心形感叹号',
  'heart_exclamation_point': '心形感叹点',
  'exclamation_heart': '感叹号心形',

  // 补充表情变体
  'tears_of_joy': '喜极而泣',
  'face_with_tears_of_joy': '喜极而泣脸',
  'holding_back_tears': '强忍眼泪',
  'emotional_face': '情绪化脸',
  'overwhelmed_face': '不知所措脸',

  // 补充小丑相关
  'circus': '马戏团',
  'performer': '表演者',
  'entertainer': '娱乐者',
  'comedy': '喜剧',
  'theater': '剧院',

  // 补充脸红相关  
  'embarrassed': '尴尬',
  'embarrassed_face': '尴尬脸',
  'shy': '害羞',
  'shy_face': '害羞脸',
  'bashful': '腼腆',
  'bashful_face': '腼腆脸',

  // 补充咧嘴笑相关
  'big_grin': '大笑',
  'wide_smile': '开怀大笑',
  'broad_smile': '灿烂笑容',
  'cheerful': '开朗',
  'cheerful_face': '开朗脸',

  // 补充心形感叹号相关
  'love_exclamation': '爱的感叹',
  'romantic_exclamation': '浪漫感叹',
  'heart_symbol': '心形符号',
  'love_symbol': '爱的符号'
};

// 分类特定翻译映射
const categorySpecificTranslations: Record<string, Record<string, string>> = {
  animals: {
    'cat_face': '猫脸',
    'dog_face': '狗脸',
    'mouse_face': '老鼠脸',
    'hamster_face': '仓鼠脸',
    'rabbit_face': '兔子脸',
    'fox_face': '狐狸脸',
    'bear_face': '熊脸',
    'panda_face': '熊猫脸',
    'koala_face': '考拉脸',
    'tiger_face': '老虎脸',
    'lion_face': '狮子脸',
    'cow_face': '牛脸',
    'pig_face': '猪脸',
    'frog_face': '青蛙脸',
    'monkey_face': '猴子脸',
    'see_no_evil': '非礼勿视猴',
    'hear_no_evil': '非礼勿听猴',
    'speak_no_evil': '非礼勿言猴',
  },
  
  food: {
    'green_apple': '青苹果',
    'red_apple': '红苹果',
    'tangerine': '橘子',
    'cherries': '樱桃',
    'hot_pepper': '辣椒',
    'sweet_potato': '红薯',
    'french_fries': '薯条',
    'hot_dog': '热狗',
    'green_salad': '绿色沙拉',
    'shallow_pan_of_food': '浅锅食物',
    'canned_food': '罐装食品',
    'bento': '便当',
    'rice_ball': '饭团',
    'rice': '米饭',
    'curry': '咖喱',
    'ramen': '拉面',
    'spaghetti': '意大利面',
    'oden': '关东煮',
    'sushi': '寿司',
    'fried_shrimp': '炸虾',
    'fish_cake': '鱼糕',
    'dumplings': '饺子',
    'takeout_box': '外卖盒',
  },

  objects: {
    'red_car': '红色汽车',
    'blue_car': '蓝色汽车',
    'taxi': '出租车',
    'police_car': '警车',
    'ambulance': '救护车',
    'fire_engine': '消防车',
    'minibus': '小巴',
    'truck': '卡车',
    'articulated_lorry': '挂车',
    'tractor': '拖拉机',
    'racing_car': '赛车',
    'motorcycle': '摩托车',
    'motor_scooter': '小型摩托车',
    'bicycle': '自行车',
    'kick_scooter': '踏板车',
    'bus': '公交车',
    'trolleybus': '无轨电车',
    'railway_car': '火车车厢',
    'train': '火车',
    'monorail': '单轨列车',
    'metro': '地铁',
    'tram': '电车',
    'steam_locomotive': '蒸汽机车',
    'high_speed_train': '高速列车',
    'bullet_train': '子弹头列车',
    'light_rail': '轻轨',
    'mountain_railway': '登山铁路',
    'suspension_railway': '悬挂式铁路',
  },

  emotions: {
    'grinning_face': '露齿笑脸',
    'grinning_face_with_big_eyes': '大眼露齿笑脸',
    'grinning_face_with_smiling_eyes': '眯眼露齿笑脸',
    'beaming_face_with_smiling_eyes': '眯眼开心脸',
    'grinning_squinting_face': '眯眼咧嘴笑脸',
    'rolling_on_the_floor_laughing': '笑得在地上打滚',
    'face_with_tears_of_joy': '喜极而泣脸',
    'slightly_smiling_face': '轻微笑脸',
    'upside_down_face': '颠倒脸',
    'melting_face': '融化脸',
    'winking_face': '眨眼脸',
    'smiling_face_with_smiling_eyes': '眯眼笑脸',
    'face_savoring_food': '品尝美食脸',
    'relieved_face': '如释重负脸',
    'smiling_face_with_heart_eyes': '爱心眼笑脸',
    'star_struck': '星光眼',
    'face_blowing_a_kiss': '飞吻脸',
    'kissing_face': '亲吻脸',
    'smiling_face': '笑脸',
    'kissing_face_with_closed_eyes': '闭眼亲吻脸',
    'kissing_face_with_smiling_eyes': '眯眼亲吻脸',
    'face_with_tongue': '吐舌脸',
    'winking_face_with_tongue': '眨眼吐舌脸',
    'zany_face': '疯狂脸',
    'squinting_face_with_tongue': '眯眼吐舌脸',
    'money_mouth_face': '钱嘴脸',
    'hugging_face': '拥抱脸',
    'face_with_hand_over_mouth': '捂嘴脸',
    'face_with_open_eyes_and_hand_over_mouth': '睁眼捂嘴脸',
    'face_with_peeking_eye': '偷看脸',
    'shushing_face': '嘘脸',
    'thinking_face': '思考脸',
    'saluting_face': '敬礼脸'
  },

  nature: {
    'new_moon': '新月',
    'waxing_crescent_moon': '峨眉月',
    'first_quarter_moon': '上弦月',
    'waxing_gibbous_moon': '盈凸月',
    'full_moon': '满月',
    'waning_gibbous_moon': '亏凸月',
    'last_quarter_moon': '下弦月',
    'waning_crescent_moon': '残月',
    'crescent_moon': '弦月',
    'new_moon_face': '新月脸',
    'first_quarter_moon_face': '上弦月脸',
    'last_quarter_moon_face': '下弦月脸',
    'full_moon_face': '满月脸',
    'sun_with_face': '太阳脸',
    'glowing_star': '发光星',
    'shooting_star': '流星',
    'milky_way': '银河',
    'cloud': '云',
    'partly_sunny': '多云',
    'cloud_with_lightning_and_rain': '雷雨云',
    'sun_behind_small_cloud': '小云后的太阳',
    'sun_behind_large_cloud': '大云后的太阳',
    'sun_behind_rain_cloud': '雨云后的太阳',
    'cloud_with_rain': '雨云',
    'cloud_with_snow': '雪云',
    'cloud_with_lightning': '闪电云',
    'tornado': '龙卷风',
    'fog': '雾',
    'wind_face': '风脸',
    'cyclone': '台风',
    'rainbow': '彩虹',
    'closed_umbrella': '收起的雨伞',
    'umbrella_with_rain_drops': '带雨滴的雨伞',
    'umbrella_on_ground': '地上的雨伞',
    'high_voltage': '高压电',
    'snowflake': '雪花',
    'snowman': '雪人',
    'snowman_without_snow': '无雪雪人',
    'comet': '彗星',
    'fire': '火焰',
    'droplet': '水滴',
    'ocean': '海浪'
  }
};

/**
 * 将英文emoji名称翻译为中文
 */
export function translateEmojiName(englishName: string, category?: string): string {
  // 清理名称：移除下划线，转换为小写
  const cleanName = englishName.toLowerCase().replace(/_/g, '_');
  
  // 首先查找分类特定的翻译
  if (category && categorySpecificTranslations[category]) {
    const categoryTranslation = categorySpecificTranslations[category][cleanName];
    if (categoryTranslation) {
      return categoryTranslation;
    }
  }
  
  // 然后查找基础翻译
  const basicTranslation = basicEmojiTranslations[cleanName];
  if (basicTranslation) {
    return basicTranslation;
  }
  
  // 处理常见的变体和后缀
  const withoutFace = cleanName.replace(/_face$/, '');
  if (withoutFace !== cleanName) {
    const withoutFaceTranslation = basicEmojiTranslations[withoutFace];
    if (withoutFaceTranslation) {
      return withoutFaceTranslation + '脸';
    }
  }
  
  // 处理颜色前缀
  const colorPrefixes = {
    'red_': '红色',
    'blue_': '蓝色',
    'green_': '绿色',
    'yellow_': '黄色',
    'orange_': '橙色',
    'purple_': '紫色',
    'pink_': '粉色',
    'brown_': '棕色',
    'black_': '黑色',
    'white_': '白色',
    'gray_': '灰色',
    'grey_': '灰色'
  };
  
  for (const [prefix, chinesePrefix] of Object.entries(colorPrefixes)) {
    if (cleanName.startsWith(prefix)) {
      const baseWord = cleanName.substring(prefix.length);
      const baseTranslation = basicEmojiTranslations[baseWord];
      if (baseTranslation) {
        return chinesePrefix + baseTranslation;
      }
    }
  }
  
  // 处理常见的后缀
  const suffixMappings = {
    '_symbol': '符号',
    '_sign': '标志',
    '_button': '按钮',
    '_emoji': '表情',
    '_face': '脸',
    '_with_': '带有',
    '_and_': '和',
    '_or_': '或',
    '_of_': '的'
  };
  
  let processedName = cleanName;
  for (const [suffix, chineseSuffix] of Object.entries(suffixMappings)) {
    if (processedName.includes(suffix)) {
      // 这里可以进行更复杂的处理，暂时简化
      const baseWord = processedName.replace(suffix, '');
      const baseTranslation = basicEmojiTranslations[baseWord];
      if (baseTranslation && suffix === '_face') {
        return baseTranslation + chineseSuffix;
      }
    }
  }
  
  // 如果都没有找到，尝试分词翻译
  const words = cleanName.split('_');
  if (words.length > 1) {
    const translatedWords = words.map(word => basicEmojiTranslations[word] || word);
    const hasTranslation = translatedWords.some(word => basicEmojiTranslations[word]);
    if (hasTranslation) {
      return translatedWords.join('');
    }
  }
  
  // 最后的fallback：返回优化后的英文名称（首字母大写，下划线转空格）
  return englishName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * 批量翻译emoji名称
 */
export function batchTranslateEmojiNames(
  emojiList: Array<{ name: string; category?: string }>
): Array<{ originalName: string; translatedName: string; category?: string }> {
  return emojiList.map(emoji => ({
    originalName: emoji.name,
    translatedName: translateEmojiName(emoji.name, emoji.category),
    category: emoji.category
  }));
}

/**
 * 检查名称是否为英文（包含英文字母）
 */
export function isEnglishName(name: string): boolean {
  return /[a-zA-Z]/.test(name);
}

/**
 * 智能翻译：只翻译英文名称，保留中文名称
 */
export function smartTranslateEmojiName(name: string, category?: string): string {
  if (!isEnglishName(name)) {
    return name; // 已经是中文，直接返回
  }
  return translateEmojiName(name, category);
}