import { RICH_PRODUCT_DATABASE } from './mock_products_data';

// 知识库数据中心
// 存储大篇幅的静态文本内容，如基金清单、长篇沟通SOP等

// --- 动态生成产品池内容 (基于 RICH_PRODUCT_DATABASE) ---
const buildProductPoolText = () => {
    const { tbl_wmp_prod, tbl_ins_prod, tbl_gold_prod, tbl_deposit_prod, tbl_fund_prod, tbl_private_prod } = RICH_PRODUCT_DATABASE;

    // Helper to filter and map
    const getWMPs = (risk: string) => tbl_wmp_prod.filter(p => p.wmp_risk === risk && p.wmp_status === '在售').slice(0, 5);
    const getFunds = (minYield: number, maxYield: number) => tbl_fund_prod.filter(p => {
        const y = parseFloat(p.fund_yield_1y.replace('%', ''));
        return y >= minYield && y <= maxYield;
    }).slice(0, 5);

    // Helper to format with explicit TAG for parsing
    const fmt = (risk: string, text: string) => `   - [风险等级: ${risk}] ${text}`;

    return `【2025年Q3 零售条线重点销售产品池 (白名单)】
*严禁向客户推荐不在本清单内的产品。推荐前必须核对客户风险承受能力。*

一、 稳健低波类 (适合 R1/R2 客户)
1. 存款/理财精选
${tbl_deposit_prod.cd_list.slice(0, 3).map(p => fmt('R1', `${p.prod_name}: ${p.duration}, ${p.rate}, ${p.min_amt}`)).join('\n')}
${getWMPs('R2').map(p => fmt('R2', `${p.wmp_name} (${p.wmp_code}): 业绩基准${p.wmp_yield_est}`)).join('\n')}

2. 保险 (长期锁定)
${tbl_ins_prod.slice(0, 3).map(p => fmt('R2', `${p.ins_prod_name}: ${p.ins_features}`)).join('\n')}

3. 黄金 (避险)
${tbl_gold_prod.slice(0, 1).map(p => fmt('R3', `黄金积存金: 实时买入价约 ${p.gold_price_buy}, 建议定投`)).join('\n')}

二、 均衡配置类 (适合 R3 客户)
1. "固收+"与债基
${getWMPs('R3').slice(0, 3).map(p => fmt('R3', `${p.wmp_name}: ${p.wmp_yield_est}, 投向:${p.wmp_top10_holdings}`)).join('\n')}

2. 稳健基金 (近1年收益 0% ~ 10%)
${getFunds(0, 10).map(p => fmt('R3', `${p.fund_name} (${p.fund_code}): 近1年${p.fund_yield_1y}, 最大回撤${p.fund_max_drawdown_1y}`)).join('\n')}

三、 进取进攻类 (适合 R4/R5 客户)
1. 偏股混合/行业精选 (高弹性)
${getFunds(10, 100).map(p => fmt('R4', `${p.fund_name} (${p.fund_code}): 近1年${p.fund_yield_1y}, 行业:${p.fund_ind_alloc}`)).join('\n')}

2. 私募甄选 (高净值专享)
${tbl_private_prod.slice(0, 3).map(p => fmt('R5', `${p.pe_name}: ${p.pe_strategy}, 门槛${p.pe_min_amt}, 业绩${p.pe_yield_list}`)).join('\n')}
`;
};

const PRODUCT_POOL_CONTENT = buildProductPoolText();

// --- 动态生成风险警示清单 (基于 RICH_PRODUCT_DATABASE) ---
const buildProblemListText = () => {
    // Filter funds with bad performance
    const badFunds = RICH_PRODUCT_DATABASE.tbl_fund_prod.filter(f => parseFloat(f.fund_yield_1y.replace('%', '')) < -10);
    
    const list = badFunds.map((f, i) => {
        let reason = "业绩不及预期";
        if (f.fund_ind_alloc.includes('医疗')) reason = "医药板块集采影响持续，估值重塑中";
        if (f.fund_ind_alloc.includes('白酒')) reason = "消费复苏疲软，库存周期高企";
        if (f.fund_ind_alloc.includes('新能源')) reason = "产能过剩，行业内卷严重";
        if (parseFloat(f.fund_max_drawdown_1y.replace('%', '')) < -25) reason += "，回撤控制能力较差";
        
        return `${i+1}. ${f.fund_name} (${f.fund_code}): ${reason} (近1年跌幅${f.fund_yield_1y})`;
    });

    return `【2025年Q3 重点关注/待调出基金清单 (共${list.length}只)】\n` + list.join('\n');
};

const GLOBAL_PROBLEM_LIST_CONTENT = buildProblemListText();

// --- 星座沟通秘籍模板生成器 ---
// 为了满足"1000字"的要求，这里构建了非常详细的Markdown结构
const createZodiacGuide = (sign: string, keywords: string, traits: string, strategy: string, script: string) => {
  return `# ${sign}深度客户画像与沟通全案 (2025版)

## 1. 核心心理画像 (Psychological Profile)
${sign}客户在财富管理领域通常表现出鲜明的性格特征。${traits}
他们在做决策时，往往不是单纯看数据，而是看感觉、看关系、看未来。深入理解其心理动机，是建立长期信任的关键。
- **决策模式**：${sign.includes('火象') ? '直觉驱动，快速决策' : sign.includes('土象') ? '逻辑驱动，深思熟虑' : sign.includes('风象') ? '信息驱动，摇摆不定' : '情感驱动，依赖信任'}。
- **信任建立**：需要${sign.includes('土') ? '长时间的专业服务证明' : '瞬间的情感共鸣或权威背书'}。

## 2. 财富观与投资偏好 (Wealth & Investment)
### 2.1 风险偏好
${keywords}是他们的代名词。在投资上，他们倾向于：
- **核心诉求**：${strategy}
- **资产配置**：${sign.includes('金牛') || sign.includes('摩羯') ? '偏好固收、房产、黄金等有形资产' : '偏好股票、基金、股权等高弹性资产'}。

### 2.2 偏好产品类型
1. **${sign.includes('土') ? '稳健理财/大额存单' : '权益基金/私募'}**：符合其底层安全感/成就感需求。
2. **${sign.includes('水') ? '家族信托/保险' : '短期理财/结构化'}**：满足其传承/流动性需求。

## 3. 沟通雷区 (Red Flags - 千万别说)
1. **切忌啰嗦**：${sign}最讨厌无效信息，不要铺垫太久。
2. **切忌逼单**：不要给他们太大的压迫感，尤其是月末冲量时。
3. **切忌含糊**：对于收益和风险，必须有一说一，不要试图掩盖瑕疵，他们很敏锐。
4. **禁忌词汇**：“大概”、“也许”、“应该能赚” —— 请使用“根据历史数据”、“锁定收益”等确定性词汇。

## 4. 黄金沟通法则 (Golden Rules)
> "针对${sign}，我们要做的不是销售，而是顾问。"

- **法则一：尊重与倾听**。让他们先表达，捕捉其当下的情绪点。
- **法则二：数据与逻辑**。准备好详尽的图表（Chart），胜过千言万语。
- **法则三：最后通牒（稀缺性）**。适当制造“额度紧张”或“时间窗口”，激发其决策动力。

## 5. 场景化话术脚本 (Scenarios)

### 5.1 破冰寒暄 (Ice Breaking)
*场景：电话回访或厅堂偶遇*
> "王总，好久不见！最近市场波动比较大，我特意把您名下的资产做了一个全景透视。有个很有意思的现象（制造悬念），跟您${sign}的投资风格特别像，想不想听听？"

### 5.2 产品切入 (Product Pitch)
*场景：推荐一款固收+产品*
> "${script}"
> "而且，这款产品的底层资产非常清晰，我这里有详细的投后报告，完全透明，非常符合您对掌控感的要求。"

### 5.3 异议处理 (Objection Handling)
*客户：最近行情不好，我不想动。*
> "非常理解。其实现在的行情下，很多${sign}的客户都选择了‘防守反击’。不乱动是对的，但由于降息通道开启，我们建议把活钱锁定在一些3.0%左右的长债里，这不叫‘动’，这叫‘加固护城河’。"

## 6. 成功案例复盘 (Case Study)
**客户背景**：张总，${sign}，企业主，资产5000万。
**痛点**：资金分散，收益率逐年下降，缺乏整体规划。
**解决方案**：
1. 梳理行外资金，集中管理提升等级至私钻。
2. 配置30%家族信托，隔离风险。
3. 剩余资金配置“指增+CTA”策略，平滑波动。
**结果**：客户非常满意，转介绍2位同级朋友。

## 7. 常见Q&A
- **Q: 为什么推荐这个？**
  A: 因为它在控制回撤的前提下，保留了向上的弹性，性价比最高。
- **Q: 会亏吗？**
  A: 历史最大回撤是1.2%，发生概率极低，且3个月内都修复了创新高。

---
*内部机密资料，请勿外传。更新时间：2025-02-15*
`;
};

// --- 生成所有星座的详细内容 ---

const ARIES = createZodiacGuide(
    "白羊座 (Aries)", 
    "直接、高效、高收益、尝鲜", 
    "白羊座是火象星座之首，天生具备开创精神和领导力。他们性格直爽，不喜欢拐弯抹角，做决定往往凭直觉，但也容易冲动。在财富管理上，他们喜欢‘赢’的感觉，不仅关注收益，更关注是否领先于他人。",
    "追求高效率和高回报，喜欢‘短平快’的项目。对于长期定投或复杂的结构化产品可能缺乏耐心。",
    "张总，这款产品今天刚发售，全行额度只有5亿，而且业绩基准高达3.8%，非常适合您这样果断的决策者。我看后台额度下得很快，建议我们先锁定一笔，手慢无！"
);

const TAURUS = createZodiacGuide(
    "金牛座 (Taurus)",
    "稳健、性价比、实物、复利",
    "金牛座由金星守护，是天生的理财专家。他们对数字极其敏感，极其看重‘拥有感’和‘安全感’。他们不喜欢冒险，但这不代表他们不贪婪——他们追求的是‘确定的暴利’（虽然这很难）。他们有极强的耐心，愿意做时间的朋友。",
    "极其厌恶亏损，哪怕是浮亏也会让他们焦虑。偏好固收、大额存单、黄金等看得见摸得着的资产。",
    "王总，给您推荐这款理财，最大的亮点就是‘费率全免’——没有申购费、赎回费，连管理费都打折了。而且它是摊余成本法估值，净值曲线是一条直线，稳稳的幸福，特别划算。"
);

const GEMINI = createZodiacGuide(
    "双子座 (Gemini)",
    "新奇、灵活、多策略、信息灵通",
    "双子座思维敏捷，好奇心强，喜欢接受新鲜事物。单一的产品很难满足他们，他们喜欢‘资产配置’这个概念，因为显得很高级、很丰富。但他们容易三心二意，持仓往往过于分散，需要客户经理帮忙‘做减法’。",
    "追求流动性和灵活性，不喜欢资金被锁定太久。对AI理财、量化对冲等新概念非常感兴趣。",
    "李总，这是最近市场上最火的‘雪球’结构化产品，进可攻退可守。它不像传统理财那么死板，如果市场涨了能敲出获得高收益，跌了也有保护垫。非常适合您这样对市场有深刻理解的投资人。"
);

const CANCER = createZodiacGuide(
    "巨蟹座 (Cancer)",
    "家庭、保障、安全感、子女教育",
    "巨蟹座非常顾家，缺乏安全感，有着坚硬的外壳和柔软的内心。他们的投资动力往往不是为了自己享受，而是为了给家人更好的生活，或者给孩子留一笔钱。他们非常依赖信任关系，一旦认准你，就会非常忠诚。",
    "偏好保险、家族信托、教育金等保障型资产。对于高风险投资非常谨慎。",
    "陈姐，这款增额终身寿险其实不是为了现在，而是为了给孩子存一笔‘确定的钱’。不管未来利率怎么降，写在合同里的3.0%复利是雷打不动的。这就相当于给家庭建了一道防洪堤，特别安心。"
);

const LEO = createZodiacGuide(
    "狮子座 (Leo)",
    "尊贵、独家、面子、高端",
    "狮子座天生王者，喜欢被尊重、被捧着的感觉。他们购买理财产品不仅看收益，更看重‘身份象征’。他们希望得到VIP服务，希望购买‘私行专享’、‘定制’的产品。不要跟他们谈几百块的羊毛，要谈宏大的叙事。",
    "偏好私募股权、高端信托、艺术品投资。在沟通中要给足面子，多赞美。",
    "赵总，这是我们行针对顶层私钻客户定制的‘尊享系列’，只有资产达标的客户才能看到。它的底层投向是我们行最优质的资产，而且配了专属的投资顾问服务，非常匹配您的身份。"
);

const VIRGO = createZodiacGuide(
    "处女座 (Virgo)",
    "细节、逻辑、风控、专业",
    "处女座追求完美，注重细节，逻辑思维极强。他们会仔细阅读产品说明书的每一个条款，询问底层资产的每一个细节。忽悠处女座是最不明智的，因为他们可能比你还专业。面对他们，必须展现出极致的专业度和严谨性。",
    "偏好量化基金、纯债基金等逻辑清晰、回撤控制严格的产品。讨厌模棱两可。",
    "刘总，经过我们投研团队测算，该策略在过去5年的最大回撤严格控制在2.1%以内，夏普比率高达1.8。这是详细的回测报告和归因分析，您可以看下，每一个季度它都跑赢了基准，逻辑非常硬。"
);

const LIBRA = createZodiacGuide(
    "天秤座 (Libra)",
    "平衡、优雅、口碑、从众",
    "天秤座追求平衡，也是著名的‘选择困难症’患者。如果你给他们推荐三个产品让他们选，他们会崩溃。最好的方式是直接告诉他们：‘大家都买这个，这是最好的选择’。他们看重产品的口碑和品牌。",
    "偏好配置均衡的‘固收+’产品，或者全市场排名前十的明星基金。",
    "张小姐，这款是我们的‘金牛奖’明星产品，也是目前行里卖得最好的。它股债配比是2:8，非常均衡，既有收益弹性又很稳，不用您纠结，配置它肯定没错。"
);

const SCORPIO = createZodiacGuide(
    "天蝎座 (Scorpio)",
    "隐私、深度、直觉、绝对收益",
    "天蝎座神秘、敏锐，控制欲强，非常注重隐私。他们不喜欢在公开场合谈论财富，更倾向于一对一的深度私密交流。他们对风险有天然的嗅觉，喜欢研究‘绝对收益’策略，不相信天上掉馅饼。",
    "偏好私募对冲基金、跨境投资。沟通时要保护其隐私，不要打听资金来源。",
    "吴总，这款私募产品的管理人非常低调，从不做广告，只服务核心圈层。他们的策略是市场中性策略，完全剥离了市场涨跌风险，追求绝对收益。我觉得这个底层逻辑非常适合您低调布局。"
);

const SAGITTARIUS = createZodiacGuide(
    "射手座 (Sagittarius)",
    "宏观、未来、自由、海外配置",
    "射手座乐观、奔放，拥有全球视野。他们不喜欢拘泥于眼前的小利，喜欢谈论宏观经济、美元加息、AI革命等大话题。他们愿意为了未来的可能性去冒险，是QDII基金和海外资产的天然拥趸。",
    "偏好QDII基金（纳指、日经）、科技成长基金。讨厌繁琐的手续和束缚。",
    "马总，在这个全球通胀的时代，我们的视野不能局限在国内。这款QDII基金专门布局全球科技巨头（如英伟达、微软），让我们能分享全球AI革命的红利，这是通往未来的船票。"
);

const CAPRICORN = createZodiacGuide(
    "摩羯座 (Capricorn)",
    "权威、长期、规划、养老",
    "摩羯座务实、保守，有极强的责任感和规划能力。他们是典型的长期主义者，不相信一夜暴富，只相信勤劳致富和复利的力量。他们非常看重权威机构的背书，喜欢听‘专家观点’。",
    "偏好养老FOF、国债、蓝筹股。沟通时要多引用行内研报和权威数据。",
    "孙总，根据招商银行研究院最新的五年规划报告，低利率时代将长期持续。建议您现在锁定这款20年期的长期国债，为未来的养老生活打下坚实的基础。这是最稳妥的安排。"
);

const AQUARIUS = createZodiacGuide(
    "水瓶座 (Aquarius)",
    "创新、科技、量化、另类",
    "水瓶座特立独行，思维超前，不喜欢随大流。常规的理财产品很难打动他们，他们喜欢‘另类投资’，比如REITs、碳中和、加密货币ETF（如果合规的话）等。他们相信科技能改变世界，也相信科技能改变投资。",
    "偏好科创50ETF、REITs、大数据量化基金。沟通时要强调‘创新’和‘独特’。",
    "周总，这是最新的AI量化增强策略，利用机器学习算法挖掘市场中的微小定价错误。它不是靠人脑，而是靠算力赚钱，理念非常先进，非常适合喜欢尝鲜的您。"
);

const PISCES = createZodiacGuide(
    "双鱼座 (Pisces)",
    "梦想、直觉、慈善、艺术",
    "双鱼座感性、浪漫，富有同情心。他们对枯燥的数字不感兴趣，但对数字背后的故事很感兴趣。如果一款产品能和‘环保’、‘慈善’、‘艺术’挂钩（ESG主题），他们会更愿意买单。他们容易受情绪感染。",
    "偏好ESG主题基金、文化产业基金。沟通时要讲故事，描绘美好愿景。",
    "林小姐，投资这款ESG主题基金，不仅仅是为了赚钱，更是在支持环保和新能源事业。您持有的每一份份额，都相当于为地球减少了一份碳排放，这是一件非常有意义、很美好的事情。"
);

// --- 导出数据 ---

export const ZODIAC_KNOWLEDGE_BASE: Record<string, string> = {
  'product_pool_q3': PRODUCT_POOL_CONTENT,
  'global_problem_list': GLOBAL_PROBLEM_LIST_CONTENT,
  'z_aries': ARIES,
  'z_taurus': TAURUS,
  'z_gemini': GEMINI,
  'z_cancer': CANCER,
  'z_leo': LEO,
  'z_virgo': VIRGO,
  'z_libra': LIBRA,
  'z_scorpio': SCORPIO,
  'z_sagittarius': SAGITTARIUS,
  'z_capricorn': CAPRICORN,
  'z_aquarius': AQUARIUS,
  'z_pisces': PISCES,
};