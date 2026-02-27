import { AgentConfig, FileItem, ChatMessage, DataField, Skill, EnvConfig, MockCustomer, AgentSummary } from './types';
import { RICH_MOCK_CUSTOMERS } from './mock_customers_data'; 

export const INITIAL_CONFIG: AgentConfig = {
  name: '全能财富顾问助手',
  description: '该智能体采用“SOP逻辑前置”架构。通过代码层预先执行客户分层、风控名单比对和产品合规过滤，仅将经过清洗的精准上下文传递给大模型，彻底解决上下文冗余和数值幻觉问题。',
  instructions: `# Role 
你是一名资深银行财富顾问（Relationship Manager），具备敏锐的资产配置视角和极强的共情能力。你的目标是根据客户的实际持仓和潜在需求，为客户经理提供专业、有温度，能对客的理财建议。（客户经理是你的用户）

# Response Frameworks

## 场景一：用户问“持仓分析” (Holdings Analysis) 
风格要求：专业、客观、数据驱动 
1. **风险扫描**：首先核对客户 持仓是否命中行内预警清单。 
2. **策略建议**： 
   - 若亏损且命中风险：建议调出，转投稳健的固收+或宽基指数。 
   - 若亏损但产品优质：安抚情绪，建议定投摊薄成本。 
   - 若存款占比过高：建议配置增额终身寿或稳健理财锁定收益。

## 场景二：用户问“产品推荐” (Product Recommendation) 
风格要求：个性化、千人千面 
1. **检索星座画像**： 
   - 获取客户的【星座标签】。 
   - 检索知识库中对应的《XX座客户沟通秘籍》，提取该星座的偏好关键词（如：摩羯座喜欢"稳健/数据/权威"，双子座喜欢"新奇/灵活/多变"）。 
   - 在推荐语中应用这些沟通技巧。 
2. **KYC匹配**： 
   - 保守型(A1/A2)：推荐结构性存款、大额存单、黄金积存。 
   - 平衡型(A3)：推荐“固收+”理财、低波红利ETF。 
   - 进取型(A4/A5)：推荐偏股混合基金、私募权益。 
3. **转化话术**：“[客户姓]总，这款产品特别符合您[星座特点]的投资品味...” 。你推荐的产品必须来自于知识中的重点销售产品池。请注意，推荐前，请先根据客户的风险等级，过滤掉超过客户风险等级的产品。千万不能超风险推荐

# Format 
请以Markdown格式输出。若涉及产品对比，请使用表格列出。`,
  routerSystemPrompt: `Classify user intent into: HOLDINGS_ANALYSIS, PRODUCT_RECOMMENDATION, EXTERNAL_FUNDS, or GENERAL_CHAT.`
};

export const MOCK_FILES: FileItem[] = [
  { id: 'product_pool_q3', name: '2025年Q3重点销售产品池.docx', type: 'word', status: 'completed' },
  { id: 'global_problem_list', name: '2025年Q3重点调出基金清单(全行版).xlsx', type: 'excel', status: 'completed' },
  { id: 'z_aries', name: '白羊座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_taurus', name: '金牛座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_gemini', name: '双子座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_cancer', name: '巨蟹座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_leo', name: '狮子座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_virgo', name: '处女座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_libra', name: '天秤座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_scorpio', name: '天蝎座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_sagittarius', name: '射手座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_capricorn', name: '摩羯座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_aquarius', name: '水瓶座客户沟通秘籍.docx', type: 'word', status: 'completed' },
  { id: 'z_pisces', name: '双鱼座客户沟通秘籍.docx', type: 'word', status: 'completed' },
];

export const INITIAL_DATA_FIELDS: DataField[] = [
  { id: 'd1', category: '客户信息数据', sourceName: '基本信息', name: '客户姓名', key: 'cust_name_masked', dataType: 'value', sampleValue: '张*明' },
  { id: 'd2', category: '客户信息数据', sourceName: '基本信息', name: '风险等级', key: 'risk_grade', dataType: 'value', sampleValue: 'A1 (保守型)' },
  { id: 'd5', category: '客户信息数据', sourceName: '基本信息', name: '客户星座', key: 'zodiac_sign', dataType: 'value', sampleValue: '摩羯座' },
  { id: 'd6', category: '客户信息数据', sourceName: '基本信息', name: '星座ID', key: 'zodiac_id', dataType: 'value', sampleValue: 'z_capricorn', description: '用于关联知识库文档' },
  { id: 'd3', category: '客户信息数据', sourceName: '产品持仓明细', name: '持仓列表', key: 'holdings_list_full', dataType: 'list', sampleValue: '[{...}]', description: '包含客户持有的产品明细' },
];

export const INITIAL_SKILLS: Skill[] = [
  { 
    id: 's1', 
    name: '持仓分析 (Holdings Analysis)', 
    description: '通过代码精确比对风险清单并计算资产分布，解决LLM数值计算不准的痛点。', 
    iconType: 'chart', 
    selected: true,
    triggerKeywords: ['持仓', '分析', '亏损', '基金', '账户', '诊断', '体检'],
    sopLogic: `async function execute_holdings_analysis(context) {
  // [Step 1] 获取原始数据
  const holdings = await context.db.get('holdings_list_full');
  
  // [Step 2] 代码级逻辑运算 (解决痛点3: 数值与匹配准确性)
  const problem_list = await context.kb.load('global_problem_list');
  
  // 精确筛选风险产品 (不交给LLM判断)
  const risk_hits = holdings.filter(h => 
    problem_list.includes(h.prodCode) || problem_list.includes(h.名称)
  );

  // 精确计算存款比例 (解决LLM算数差的问题)
  const total_mv = holdings.reduce((sum, h) => sum + parseFloat(h.市值?.replace(/,/g,'') || 0), 0);
  const deposit_mv = holdings.filter(h => h.产品分类 === '存款').reduce((sum, h) => sum + parseFloat(h.市值?.replace(/,/g,'') || 0), 0);
  const deposit_ratio = total_mv > 0 ? (deposit_mv / total_mv) : 0;

  // [Step 3] 组装极简上下文 (解决痛点1&2: 防止上下文溢出)
  return {
    skill: 'HOLDINGS_ANALYSIS',
    data_context: {
       full_holdings: holdings, // 传递给LLM用于展示表格
       risk_hits: risk_hits.map(h => \`\${h.名称}(\${h.prodCode})\`),
       deposit_warning: deposit_ratio > 0.7 ? "存款占比超过70%，存在购买力缩水风险" : null
    },
    dynamic_instruction: risk_hits.length > 0 ? "重点提示风险资产调出！" : "持仓尚可，建议优化结构。"
  };
}` 
  },
  { 
    id: 's2', 
    name: '产品推荐 (Product Rec)', 
    description: '代码前置过滤准入等级，物理隔绝超风险推荐，实现分层客群精细化话术加载。', 
    iconType: 'search', 
    selected: true,
    triggerKeywords: ['推荐', '买什么', '理财', '黄金', '存款', '产品', '投资'],
    sopLogic: `async function execute_product_rec(context) {
  // [Step 1] 获取客户画像
  const profile = await context.db.get('customer_profile');
  const risk_grade = profile.risk_grade || 'A1';

  // [Step 2] 计算准入等级 (KYC Logic)
  // 规则：向下兼容，R2客户可以买R1, R2产品，不能买R3
  let allowed_risks = ['R1']; 
  if (risk_grade.includes('A2') || risk_grade.includes('稳健')) allowed_risks = ['R1', 'R2'];
  if (risk_grade.includes('A3') || risk_grade.includes('平衡')) allowed_risks = ['R1', 'R2', 'R3'];
  if (risk_grade.includes('A4') || risk_grade.includes('进取')) allowed_risks = ['R1', 'R2', 'R3', 'R4'];
  if (risk_grade.includes('A5') || risk_grade.includes('激进')) allowed_risks = ['R1', 'R2', 'R3', 'R4', 'R5'];

  // [Step 3] 知识库物理过滤 (Robust Parsing)
  const full_pool_text = await context.kb.load('product_pool_q3');
  
  // 按行分割，提取包含 [风险等级: Rx] 且符合准入的产品
  const filtered_lines = full_pool_text.split('\\n').filter(line => {
      const match = line.match(/\\[风险等级: (R\\d)\\]/); // Match [风险等级: R2]
      if (match) {
          const product_risk = match[1];
          return allowed_risks.includes(product_risk);
      }
      return false; // 过滤掉不含风险标签的行（如标题、说明）
  });
  
  const filtered_pool = filtered_lines.join('\\n');

  // [Step 4] 按需加载星座话术
  const zodiac_guide = await context.kb.load(profile.zodiac_id);

  return {
    skill: 'PRODUCT_RECOMMENDATION',
    knowledge_context: {
        allowed_risks: allowed_risks,
        valid_product_list: filtered_pool, // 仅传入合规产品列表，LLM无权看到其他产品
        communication_style: zodiac_guide
    },
    dynamic_instruction: \`你推荐的产品必须严格来自 'valid_product_list'。禁止编造产品。使用 'communication_style' 中的技巧进行话术包装。\`
  };
}` 
  },
  { 
    id: 's3', 
    name: '行外吸金 (External Funds)', 
    description: '通过代码计算竞品流失规模，自动匹配高收益“钩子”产品。', 
    iconType: 'money', 
    selected: true,
    triggerKeywords: ['行外', '支付宝', '微信', '转入', '吸金', '闲钱', '他行'],
    sopLogic: `async function execute_external_funds(context) {
  // [Step 1] 获取流水数据
  const internet_invest = await context.db.get('internet_invest_sum');
  const amt = parseFloat(internet_invest?.replace(/,/g,'') || 0);

  // [Step 2] 逻辑判定
  const is_high_value = amt > 50000;

  // [Step 3] 组装上下文
  return {
    skill: 'EXTERNAL_FUNDS',
    data_context: {
        detected_outflow_amt: internet_invest,
        competitor: "支付宝/余额宝"
    },
    knowledge_context: {
        hook_product: is_high_value ? "私行专属稳健理财(3.6%)" : "新客专享固收+(3.2%)",
        highlights: ["T+0到账", "业绩比较基准高出竞品40BP"]
    },
    dynamic_instruction: "突出收益优势，引导客户将闲钱转入我行管理。"
  };
}`
  },
];

export const INITIAL_ENV_CONFIG: EnvConfig = {
    triggerPage: 'W+客户全景视图 (Client 360)',
    displaySlot: '右侧智能助手栏'
};

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: '持仓分析'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    trace: [
        {
            title: '意图路由 (Router)',
            type: 'router',
            status: 'success',
            items: ['[D] User Input: "持仓分析"', '[S] Match: HOLDINGS_ANALYSIS', 'Routing to: SOP_Holdings.js'],
            cost: '5ms'
        },
        {
            title: '准备阶段 (Preparation)',
            type: 'code',
            status: 'success',
            items: [
                '[S] 逻辑运算: Risk Scan Complete. Hits: 2', 
                '[D] 引用数据: [{"prodCode":"005827", "名称":"易方达蓝筹精选"...}, {"prodCode":"003095"...}]', 
                '[K] 知识检索: 风险清单匹配项: 005827(赛道拥挤), 003095(业绩下滑)', 
                '[F] 动态框架: 策略="风险警示"; 指令="Use warning tone, suggest sell."'
            ],
            cost: '15ms'
        },
        {
            title: 'LLM 生成回答',
            type: 'prompt',
            status: 'success',
            items: ['[P] SYSTEM: You are an RM Agent...\nCONTEXT: {...}\nUSER: 持仓分析', '[F] Thinking Process Started'],
            cost: '1.2s'
        }
    ],
    thinking: 'SOP已经提供了精确的持仓清单和风险扫描结果。我不需要再次通过语言模型去猜测客户持有什么。我将首先以表格形式展示所有持仓，然后重点点名那两只命中的风险基金。',
    content: '根据您的账户体检，以下是您的持仓明细：\n\n| 产品名称 | 产品代码 | 当前市值 | 盈亏/收益 |\n| :--- | :--- | :--- | :--- |\n| 易方达蓝筹精选混合 | 005827 | 350,000 | -15% |\n| 中欧医疗健康混合C | 003095 | 280,000 | -25% |\n| 纳斯达克100ETF | QD001 | 50,000 | +12% |\n\n⚠️ **风险提示**：您的持仓中，**易方达蓝筹**和**中欧医疗**已命中我行Q3重点调出清单。主要原因为该赛道景气度下行且超额收益获取能力下降。建议您考虑逢高减仓，调配至更稳健的固收类产品。',
  }
];

export const MOCK_CUSTOMERS: MockCustomer[] = RICH_MOCK_CUSTOMERS;

// === NEW: INITIAL AGENT LIST ===
export const INITIAL_AGENT_LIST: AgentSummary[] = [
    {
        id: 'agent_001',
        name: '持仓分析智能体',
        description: '专为财富顾问设计的持仓诊断助手，集成了行内特色的风险清单和产品池。',
        updatedAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
        status: 'published',
        tags: ['财富管理', '持仓诊断', '分行专用'],
        avatarColor: 'bg-blue-600'
    },
    {
        id: 'agent_002',
        name: '个贷审批流助手 (Beta)',
        description: '辅助个贷经理快速预审客户资质，基于征信数据自动生成面签建议。',
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
        status: 'draft',
        tags: ['个贷业务', '流程辅助', '合规检查'],
        avatarColor: 'bg-purple-600'
    },
    {
        id: 'agent_003',
        name: '私人银行税务筹划顾问',
        description: '针对超高净值客户的税务合规 with 家族信托架构搭建建议。',
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
        status: 'published',
        tags: ['私行', '税务', '家族信托'],
        avatarColor: 'bg-amber-600'
    }
];