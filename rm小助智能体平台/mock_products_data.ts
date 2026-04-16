// 模拟产品数据库
// 包含: 基金, 理财, 保险, 存款, 私募, 黄金
// 每个品类至少 50 条数据

// --- Helper Functions ---
const getRandomFloat = (min: number, max: number, decimals: number = 2) => 
  (Math.random() * (max - min) + min).toFixed(decimals);

const getRandomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- Data Generators ---

// 1. 基金产品生成器
const SECTORS = ['新能源', '半导体', '白酒消费', '医疗健康', '军工', '人工智能', '高端制造', '金融地产'];
const MANAGERS = ['张坤', '葛兰', '谢治宇', '朱少醒', '刘格菘', '蔡嵩松', '侯昊', '赵诣', '周应波', '冯明远'];
const FUND_COMPANIES = ['易方达', '中欧', '汇添富', '广发', '富国', '招商', '兴全', '景顺长城', '诺安', '银河'];

const generateFunds = (count: number) => {
  const funds = [];
  // Add some famous ones manually for realism
  funds.push({
    fund_code: '005827', fund_name: '易方达蓝筹精选混合', fund_yield_1y: '-15.40%', fund_mgr_name: '张坤',
    fund_max_drawdown_1y: '-22.5%', fund_asset_alloc: '股票:93%, 债券:1%, 现金:6%', fund_ind_alloc: '白酒: 65%, 互联网: 20%, 银行: 10%'
  });
  funds.push({
    fund_code: '003095', fund_name: '中欧医疗健康混合C', fund_yield_1y: '-25.80%', fund_mgr_name: '葛兰',
    fund_max_drawdown_1y: '-30.1%', fund_asset_alloc: '股票:88%, 债券:5%, 现金:7%', fund_ind_alloc: '医疗服务: 70%, 创新药: 25%'
  });

  for (let i = 0; i < count - 2; i++) {
    const company = getRandomItem(FUND_COMPANIES);
    const sector = getRandomItem(SECTORS);
    const type = Math.random() > 0.7 ? 'ETF联接' : '混合';
    const yieldVal = parseFloat(getRandomFloat(-30, 20, 2));
    
    funds.push({
      fund_code: String(getRandomInt(100000, 999999)),
      fund_name: `${company}${sector}${type}${getRandomItem(['A','C',''])}`,
      fund_yield_1y: `${yieldVal > 0 ? '+' : ''}${yieldVal}%`,
      fund_mgr_name: getRandomItem(MANAGERS),
      fund_max_drawdown_1y: `-${getRandomFloat(10, 40, 2)}%`,
      fund_asset_alloc: `股票:${getRandomInt(80,95)}%, 债券:${getRandomInt(0,10)}%, 现金:${getRandomInt(1,10)}%`,
      fund_ind_alloc: `${sector}: ${getRandomInt(50,80)}%, 其他: ${getRandomInt(20,50)}%`
    });
  }
  return funds;
};

// 2. 理财产品生成器
const WMP_SERIES = ['招睿金葵', '招睿青葵', '季季宝', '周周发', '月月结', '步步生金'];
const generateWMPs = (count: number) => {
  const wmps = [];
  for (let i = 0; i < count; i++) {
    const series = getRandomItem(WMP_SERIES);
    const period = getRandomItem(['30天', '60天', '90天', '180天', '360天']);
    const risk = getRandomItem(['R1', 'R2', 'R3']);
    const yieldBase = risk === 'R1' ? 2.0 : (risk === 'R2' ? 2.8 : 3.5);
    const yieldMax = parseFloat((yieldBase + Math.random()).toFixed(2));
    
    wmps.push({
      wmp_name: `${series}${period}持有期${i+1}号`,
      wmp_code: `WMP${getRandomInt(10000, 99999)}`,
      wmp_nav: getRandomFloat(1.01, 1.08, 4),
      wmp_yield_est: `${yieldBase}%~${yieldMax}%`,
      wmp_risk: risk,
      wmp_status: Math.random() > 0.2 ? '在售' : '售罄',
      wmp_top10_holdings: `城投债${getRandomInt(1,5)}期, 银行存单, 信用债组合${getRandomInt(10,99)}`
    });
  }
  return wmps;
};

// 3. 保险产品生成器
const INS_COMPANIES = ['信诚', '友邦', '泰康', '平安', '招商信诺'];
const INS_TYPES = ['终身寿险', '年金险', '重疾险', '高端医疗'];
const generateInsurance = (count: number) => {
  const ins = [];
  ins.push({
      ins_prod_name: "信诚「基石」终身寿险",
      ins_benefit_demo: "30岁男性，年交10万，交5年。60岁现价: 890,000 (IRR 2.9%)",
      ins_features: "锁定长期收益, 财富传承, 现价增长快"
  });

  for (let i = 0; i < count - 1; i++) {
    const company = getRandomItem(INS_COMPANIES);
    const type = getRandomItem(INS_TYPES);
    ins.push({
      ins_prod_name: `${company}「${getRandomItem(['金', '赢', '福', '安', '康'])}${getRandomItem(['未来', '人生', '传世', '臻享'])}」${type}`,
      ins_benefit_demo: `利益演示数据表_v${getRandomInt(1,5)}.xlsx (IRR约 ${getRandomFloat(2.5, 2.9, 2)}%)`,
      ins_features: type === '终身寿险' ? '锁定利率, 减保灵活' : (type === '年金险' ? '养老补充, 稳定现金流' : '百种重疾, 绿通服务')
    });
  }
  return ins;
};

// 4. 存款产品 (结构性 + 大额)
const generateDeposits = (count: number) => {
  const struct = [];
  const cd = [];
  for (let i = 0; i < count; i++) {
    // Structural
    struct.push({
      prod_name: `挂钩黄金结构性存款${getRandomInt(1,12)}个月`,
      rate_range: `1.65% ~ ${getRandomFloat(2.8, 3.2, 2)}%`,
      link_asset: '伦敦金定盘价'
    });
    // CD
    cd.push({
      prod_name: `2025年第${i+1}期大额存单`,
      duration: getRandomItem(['1年', '2年', '3年']),
      rate: getRandomItem(['2.1%', '2.3%', '2.6%']),
      min_amt: '20万起'
    });
  }
  return { struct, cd };
};

// 5. 私募产品
const generatePE = (count: number) => {
  const pes = [];
  const strategies = ['股票多头', '量化中性', 'CTA', '宏观对冲'];
  for (let i = 0; i < count; i++) {
     pes.push({
         pe_name: `重阳${getRandomItem(['价值', '成长', '对冲'])}${i+1}号`,
         pe_yield_list: `近1月: ${getRandomFloat(-2, 5, 2)}%, 近1年: ${getRandomFloat(-10, 20, 2)}%`,
         pe_status: Math.random() > 0.5 ? '开放期' : '封闭期',
         pe_min_amt: getRandomItem(['100万', '300万', '500万']),
         pe_strategy: getRandomItem(strategies)
     });
  }
  return pes;
};


// --- EXPORTED DATABASE ---
// 结构完全对齐 DataSelectorModal.tsx 中的 DATA_SOURCE_TREE

const deposits = generateDeposits(50);

export const RICH_PRODUCT_DATABASE = {
  // 1. 基金
  tbl_fund_prod: generateFunds(60),

  // 2. 理财
  tbl_wmp_prod: generateWMPs(60),

  // 3. 保险
  tbl_ins_prod: generateInsurance(50),

  // 4. 存款 (混合表)
  tbl_deposit_prod: {
    smart_deposit_rate: '1.85%',
    struct_deposit_list: deposits.struct,
    cd_list: deposits.cd
  },

  // 5. 黄金
  tbl_gold_prod: Array(50).fill(null).map((_, i) => ({
      gold_price_buy: getRandomFloat(480, 490, 2),
      gold_price_sell: getRandomFloat(479, 489, 2),
      physical_gold_info: `招行金-${getRandomItem(['生肖', '贺岁', '婚嫁'])}系列 ${getRandomItem(['10g', '20g', '50g', '100g'])}`
  })),

  // 6. 私募
  tbl_private_prod: generatePE(50)
};