import { MockCustomer } from './types';

// Helper to stringify JSON fields for the mock data
const json = (data: any) => JSON.stringify(data);

export const RICH_MOCK_CUSTOMERS: MockCustomer[] = [
  // --- 客户 1: 王强 (科技新贵，激进型) ---
  {
    id: 'c_001',
    name: '王*强',
    label: '科技高管 (激进型)',
    avatarColor: 'bg-indigo-600',
    data: {
      // 1. 基本信息
      cust_name_masked: '王*强',
      age: '38',
      gender: '男',
      zodiac_sign: '天蝎座',
      zodiac_id: 'z_scorpio',
      risk_grade: 'A5 (激进型)',
      card_level: '钻石卡',
      is_intensive: '是',
      birthday: '1986/11/15',
      manager_name: '赵专业',
      
      // 2. 资产信息
      curr_aum_point: '12,500,000.00',
      curr_aum_avg: '12,100,000.00',
      liquid_amt: '500,000.00',
      liquid_ratio: '4%',
      stable_amt: '2,000,000.00',
      stable_ratio: '16%',
      aggressive_amt: '10,000,000.00',
      aggressive_ratio: '80%',
      insure_amt: '0.00',
      aum_history_json: json([{month:'202407',aum:11000000}, {month:'202408',aum:11500000}, {month:'202409',aum:12500000}]),

      // 3. 持仓明细 (重点: 包含风险资产)
      holdings_list_full: json([
        { prodCode: "012345", 名称: "纳斯达克100ETF联接", 市值: "5,000,000", 产品分类: "QDII", 盈亏: "+28%", 收益率: "28.5%" },
        { prodCode: "014412", 名称: "招商核心竞争力混合", 市值: "3,000,000", 产品分类: "公募基金", 盈亏: "+15%", 收益率: "15.2%" },
        { prodCode: "PE001", 名称: "重阳战略才智私募", 市值: "2,000,000", 产品分类: "私募", 盈亏: "+5%", 收益率: "5.1%" },
        { prodCode: "003095", 名称: "中欧医疗健康混合C", 市值: "2,000,000", 产品分类: "公募基金", 盈亏: "-35%", 收益率: "-35.4%" }, // Risk Item
        { prodCode: "USD01", 名称: "美元活期", 市值: "500,000", 产品分类: "外币", 盈亏: "0%", 收益率: "0.5%" }
      ]),
      total_yield: '+1,250,000.00',
      total_invest_history: '10,000,000.00',

      // 4. 交易流水 (行外吸金线索)
      internet_invest_sum: '50,000.00',
      last_internet_invest: '支付宝 (50,000.00元)',
      fund_flow: json([{date:'2024-09-01', type:'赎回', amt:500000}, {date:'2024-09-15', type:'申购', amt:1000000}]),

      // 5. 特征标签
      is_executive: '是',
      executive_tags: '某头部互联网大厂VP, 拥有期权池',
      potential_asset_level: 'L7 (超高净值)',
      m_plus_level: '钻石M3',
      
      // 6. 其他
      loan_limit: '8,000,000',
      payroll_company: '字节跳动',
      monthly_payroll: '150,000.00',
      contact_history: '近期关注美股走势，对医疗基金深套表示不满，询问是否割肉。',
      family_ins_status: '未配置'
    }
  },

  // --- 客户 2: 李秀英 (退休阿姨，保守型) ---
  {
    id: 'c_002',
    name: '李*英',
    label: '退休教师 (保守型)',
    avatarColor: 'bg-green-600',
    data: {
      cust_name_masked: '李*英',
      age: '62',
      gender: '女',
      zodiac_sign: '金牛座',
      zodiac_id: 'z_taurus',
      risk_grade: 'A1 (保守型)',
      card_level: '金葵花',
      is_intensive: '否',
      birthday: '1962/05/01',
      
      curr_aum_point: '3,200,000.00',
      liquid_amt: '1,200,000.00', // High liquidity
      liquid_ratio: '37.5%',
      stable_amt: '2,000,000.00',
      stable_ratio: '62.5%',
      aggressive_amt: '0.00',
      aggressive_ratio: '0%',

      // 持仓: 大量存款和国债
      holdings_list_full: json([
        { prodCode: "CK001", 名称: "三年期大额存单2024", 市值: "1,500,000", 产品分类: "存款", 收益率: "2.85%" },
        { prodCode: "ZQ003", 名称: "储蓄国债2301期", 市值: "500,000", 产品分类: "债券", 收益率: "2.9%" },
        { prodCode: "888001", 名称: "朝朝宝", 市值: "50,000", 产品分类: "理财", 收益率: "2.1%" },
        { prodCode: "LC002", 名称: "招睿金葵18月定开", 市值: "1,150,000", 产品分类: "理财", 收益率: "3.1%" }
      ]),

      internet_invest_sum: '0.00',
      is_executive: '否',
      potential_asset_level: 'L5',
      payroll_company: '市教育局(退休金)',
      monthly_payroll: '8,500.00',
      contact_history: '阿姨对利率下行非常焦虑，担心存款到期后利息变少，想了解保险。',
      family_ins_status: '本人已配置医疗险，想给孙子买教育金'
    }
  },

  // --- 客户 3: 张伟 (小微企业主，平衡型) ---
  {
    id: 'c_003',
    name: '张*伟',
    label: '企业主 (平衡型)',
    avatarColor: 'bg-blue-500',
    data: {
      cust_name_masked: '张*伟',
      age: '42',
      gender: '男',
      zodiac_sign: '双子座',
      zodiac_id: 'z_gemini',
      risk_grade: 'A3 (平衡型)',
      card_level: '金葵花',
      is_intensive: '否',
      birthday: '1982/06/10',

      curr_aum_point: '5,500,000.00',
      liquid_amt: '3,000,000.00', // High liquidity for business
      liquid_ratio: '54%',
      stable_amt: '1,500,000.00',
      aggressive_amt: '1,000,000.00',

      holdings_list_full: json([
        { prodCode: "888001", 名称: "日日宝", 市值: "2,000,000", 产品分类: "理财", 收益率: "2.0%" },
        { prodCode: "107008", 名称: "季季宝", 市值: "1,000,000", 产品分类: "理财", 收益率: "2.2%" },
        { prodCode: "005827", 名称: "易方达蓝筹精选混合", 市值: "500,000", 产品分类: "公募基金", 盈亏: "-20%", 收益率: "-18%" }, // Risk
        { prodCode: "161716", 名称: "招商双债增强", 市值: "1,000,000", 产品分类: "公募基金", 盈亏: "+3%", 收益率: "4.5%" }
      ]),

      // 重点: 行外吸金线索 - 支付宝有大额资金
      internet_invest_sum: '800,000.00',
      last_internet_invest: '余额宝 (800,000.00元)',

      is_executive: '是',
      executive_tags: '贸易公司法人, 经常有大额周转',
      loan_limit: '5,000,000',
      loan_balance: '2,000,000', // Has loan
      contact_history: '客户表示生意需要周转，资金不能锁定期太长，但嫌弃活期利息低。',
      family_ins_status: '只买了车险'
    }
  },

  // --- 客户 4: 陈静 (中产宝妈，稳健型) ---
  {
    id: 'c_004',
    name: '陈*静',
    label: '外企经理 (稳健型)',
    avatarColor: 'bg-rose-500',
    data: {
      cust_name_masked: '陈*静',
      age: '35',
      gender: '女',
      zodiac_sign: '巨蟹座',
      zodiac_id: 'z_cancer',
      risk_grade: 'A3 (稳健型)',
      card_level: '金卡',
      birthday: '1989/07/01',

      curr_aum_point: '1,800,000.00',
      liquid_amt: '200,000.00',
      stable_amt: '800,000.00',
      aggressive_amt: '200,000.00',
      insure_amt: '600,000.00', // High Insurance

      holdings_list_full: json([
        { prodCode: "INS_001", 名称: "信诚「基石」终身寿险", 市值: "600,000", 产品分类: "保险", 收益率: "锁定3.0%" },
        { prodCode: "008888", 名称: "华夏红利低波ETF联接", 市值: "200,000", 产品分类: "公募基金", 盈亏: "+8%", 收益率: "5.2%" },
        { prodCode: "107008", 名称: "招睿金葵18月定开", 市值: "800,000", 产品分类: "理财", 收益率: "3.2%" }
      ]),

      internet_invest_sum: '100,000.00',
      payroll_company: '辉瑞制药',
      monthly_payroll: '35,000.00',
      family_ins_status: '配偶未配置, 子女已配置重疾险',
      contact_history: '客户非常关注子女教育金规划，对稳健增值最看重。'
    }
  },

  // --- 客户 5: 赵刚 (职场新人，进取型) ---
  {
    id: 'c_005',
    name: '赵*刚',
    label: '95后 (进取型)',
    avatarColor: 'bg-cyan-600',
    data: {
      cust_name_masked: '赵*刚',
      age: '26',
      gender: '男',
      zodiac_sign: '水瓶座',
      zodiac_id: 'z_aquarius',
      risk_grade: 'A4 (进取型)',
      card_level: '普卡',
      birthday: '1998/02/05',

      curr_aum_point: '250,000.00',
      liquid_amt: '20,000.00',
      stable_amt: '0.00',
      aggressive_amt: '230,000.00',

      holdings_list_full: json([
        { prodCode: "519674", 名称: "银河创新成长", 市值: "100,000", 产品分类: "公募基金", 盈亏: "-10%", 收益率: "-12%" }, // Risk
        { prodCode: "012345", 名称: "纳斯达克100ETF联接", 市值: "100,000", 产品分类: "QDII", 盈亏: "+20%", 收益率: "25%" },
        { prodCode: "GOLD_001", 名称: "黄金积存金", 市值: "30,000", 产品分类: "贵金属", 盈亏: "+5%", 收益率: "5%" }
      ]),

      internet_invest_sum: '0.00',
      payroll_company: '某初创科技公司',
      monthly_payroll: '18,000.00',
      contact_history: '客户喜欢定投，对新鲜事物（如黄金、AI基金）感兴趣，想攒首付。'
    }
  }
];
