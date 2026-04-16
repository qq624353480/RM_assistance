import React, { useState } from 'react';
import { DatabaseIcon, TableIcon, CodeIcon, ChevronDownIcon, CheckCircleIcon, PlusIcon } from './Icons';
import { DataField } from '../types';

interface DataSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (field: DataField) => void;
}

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// === Mock Database Structure based on provided requirement ===
const DATA_SOURCE_TREE = [
  {
    id: 'cat_cust',
    name: '客户信息数据',
    tables: [
      {
        id: 'tbl_aum',
        name: 'AUM资产信息',
        description: '客户资产负债及AUM走势',
        fields: [
          { key: 'curr_aum_point', name: '当前时点AUM', sample: '100,000元' },
          { key: 'curr_aum_avg', name: '当前日均AUM', sample: '110,000元' },
          { key: 'liquid_amt', name: '活钱管理金额', sample: '20,000元' },
          { key: 'liquid_ratio', name: '活钱管理占比', sample: '20%' },
          { key: 'stable_amt', name: '稳健投资金额', sample: '30,000元' },
          { key: 'stable_ratio', name: '稳健投资占比', sample: '30%' },
          { key: 'aggressive_amt', name: '进取投资金额', sample: '40,000元' },
          { key: 'aggressive_ratio', name: '进取投资占比', sample: '40%' },
          { key: 'insure_amt', name: '保障管理金额', sample: '10,000元' },
          { key: 'aum_history_json', name: '客户资产走势 (JSON)', sample: '[{统计月份:202507,时点AUM:490000...}]' },
        ]
      },
      {
        id: 'tbl_holdings',
        name: '产品持仓明细',
        description: '客户持有的理财、基金、保险等明细',
        isList: true,
        fields: [
          { key: 'holdings_list_full', name: '客户当前持仓明细 (完整列表)', sample: '[{prodCode:"R1001",市值:"2449950.6"...}]' },
          { key: 'history_holdings', name: '客户历史持仓明细', sample: '[...]' },
          { key: 'family_ins_policy', name: '家庭成员保单信息 (完整)', sample: '[{zProNam:"信诚人寿", zInsSum:"500000"...}]' },
          { key: 'pension_account_status', name: '养老金账户开通情况', sample: '个养账户已开通' },
          { key: 'pension_balance', name: '个人养老金账户时点余额', sample: '1,000.00元' },
          { key: 'total_yield', name: '持仓总收益', sample: '+12,500.00' },
          { key: 'total_invest_history', name: '客户历史总投资', sample: '5,000,000.00' },
        ]
      },
      {
        id: 'tbl_trans',
        name: '收支交易流水',
        description: '资金往来与交易记录',
        isList: true,
        fields: [
          { key: 'fund_flow', name: '基金相关收支流水', sample: 'List<Transaction>' },
          { key: 'self_transfer', name: '本人资金往来收支流水', sample: 'List<Transaction>' },
          { key: 'pension_flow', name: '个人养老金账户收支流水', sample: 'List<Transaction>' },
          { key: 'realtime_trans', name: '实时产品交易', sample: 'List<Transaction>' },
          { key: 'internet_invest_sum', name: '互联网平台投资累计金额', sample: '2,000.00元' },
          { key: 'last_internet_invest', name: '最近一次互联网平台投资', sample: '支付宝 (20,000.00元)' },
        ]
      },
      {
        id: 'tbl_basic',
        name: '基本信息',
        fields: [
          { key: 'cust_name_masked', name: '客户脱敏姓名', sample: '王*强' },
          { key: 'age', name: '年龄', sample: '31' },
          { key: 'gender', name: '性别', sample: '男' },
          { key: 'zodiac_sign', name: '客户星座', sample: '天蝎座' },
          { key: 'risk_grade', name: '客户风险评级', sample: 'A4 (进取型)' },
          { key: 'card_level', name: '借记卡等级', sample: '金葵花' },
          { key: 'is_intensive', name: '集约化客户', sample: '是' },
          { key: 'birthday', name: '客户生日', sample: '1995/1/1' },
          { key: 'manager_name', name: '归属客户经理姓名', sample: '李四' },
        ]
      },
      {
        id: 'tbl_features',
        name: '客群特征 & 标签',
        fields: [
          { key: 'is_executive', name: '企业高管', sample: '是' },
          { key: 'executive_tags', name: '企业高管标签数据', sample: '腾讯科技, 股东, 注册资本10亿' },
          { key: 'potential_asset_level', name: '客户潜力资产等级', sample: 'L5' },
          { key: 'm_plus_level', name: 'M+会员等级', sample: '金葵花M2' },
          { key: 'zhonghong_level', name: '当前中宏会员等级', sample: '白金会员' },
          { key: 'complaint_detail', name: '客户风铃评价详情', sample: '2025-06-06 投诉柜面排队时间过长' },
          { key: 'private_equity_browse', name: '浏览私募信托高净值产品', sample: '浏览已购买 (招商私募高净值理财)' },
        ]
      },
      {
        id: 'tbl_loan',
        name: '个贷信息',
        fields: [
          { key: 'loan_limit', name: '贷款额度', sample: '2,000,000' },
          { key: 'loan_balance', name: '贷款余额', sample: '1,500,000' },
          { key: 'flash_loan_rate', name: '闪电贷最优定价', sample: '3.2%' },
          { key: 'housing_loan_limit', name: '住房贷款授信额度', sample: '1,000.00元' },
          { key: 'loan_list', name: '贷款信息列表 (List)', sample: '[{type:"房贷", amt:1000000...}]' },
        ]
      },
      {
        id: 'tbl_payroll',
        name: '代发工资',
        fields: [
          { key: 'payroll_company', name: '代发企业名称', sample: '腾讯科技' },
          { key: 'monthly_payroll', name: '本年月均代发金额', sample: '10,000.00元' },
          { key: 'payroll_list_12m', name: '近12月每月代发和留存列表', sample: 'List<PayrollItem>' },
          { key: 'key_person_info', name: '团金企业关键人信息', sample: '职务:总监, 部门:会计部' },
        ]
      },
      {
        id: 'tbl_contact',
        name: '近期接触总结',
        isList: true,
        fields: [
          { key: 'contact_history', name: '接触详情 (List)', sample: '[{date:"2025-09-23", summary:"定期，还不知行外新资金情况", channel:"电访"}...]' },
          { key: 'call_count', name: '电访接触次数', sample: '5' },
          { key: 'wecom_count', name: '企微接触次数', sample: '2' },
        ]
      },
      {
        id: 'tbl_ins_kyc',
        name: '保险KYC信息',
        fields: [
          { key: 'total_premium_5y', name: '近5年累计保费', sample: '500,000' },
          { key: 'family_ins_status', name: '家庭成员保险配置状况', sample: '配偶未配置, 子女已配置' },
          { key: 'ins_score_protection', name: '保障型评分', sample: '85' },
          { key: 'ins_score_investment', name: '理财型评分', sample: '60' },
        ]
      },
      {
        id: 'tbl_fund_diag',
        name: '基金健诊报告',
        description: '基金组合健康度分析结果',
        isList: true,
        fields: [
          { key: 'fund_diag_report', name: '基金健诊报告 (完整)', sample: '[{name:"performance", summary:"近1年组合收益6.94%..."}, {name:"style", summary:"风格偏向成长..."}]' },
          { key: 'fund_adjust_list', name: '待调出持仓基金产品列表', sample: '[{name:"中欧医疗", reason:"业绩下滑", yield:"-27%"...}]' },
        ]
      }
    ]
  },
  {
    id: 'cat_wealth',
    name: '财富产品数据',
    tables: [
      {
        id: 'tbl_deposit_prod',
        name: '存款产品在售清单',
        isList: true,
        fields: [
          { key: 'smart_deposit_rate', name: '智存通年利率', sample: '1.85%' },
          { key: 'struct_deposit_list', name: '结构性存款在售清单', sample: 'List<Product>' },
          { key: 'cd_list', name: '大额存单在售清单', sample: 'List<Product>' },
        ]
      },
      {
        id: 'tbl_fund_prod',
        name: '基金产品表',
        description: '全行代销公募基金详细信息',
        fields: [
          { key: 'fund_code', name: '产品代码', sample: '003988' },
          { key: 'fund_name', name: '产品全称', sample: '招商中证白酒指数分级' },
          { key: 'fund_yield_1y', name: '近1年年化涨跌幅', sample: '15.4%' },
          { key: 'fund_mgr_name', name: '基金经理', sample: '侯昊' },
          { key: 'fund_max_drawdown_1y', name: '近1年最大回撤', sample: '-12.5%' },
          { key: 'fund_asset_alloc', name: '资产分布列表', sample: '股票:92%, 债券:2%, 现金:6%' },
          { key: 'fund_ind_alloc', name: '行业分布占比', sample: '白酒: 85%, 食品: 10%' },
        ]
      },
      {
        id: 'tbl_wmp_prod',
        name: '理财产品表',
        fields: [
          { key: 'wmp_nav', name: '当日净值', sample: '1.0442' },
          { key: 'wmp_yield_est', name: '推荐收益率', sample: '3.2%~3.5%' },
          { key: 'wmp_risk', name: '风险等级', sample: 'R2' },
          { key: 'wmp_status', name: '在售状态', sample: '募集中' },
          { key: 'wmp_top10_holdings', name: '十大持仓', sample: 'List<String>' },
        ]
      },
      {
        id: 'tbl_gold_prod',
        name: '黄金产品表',
        fields: [
          { key: 'gold_price_buy', name: '黄金账户实时买入价', sample: '485.20' },
          { key: 'gold_price_sell', name: '黄金账户实时卖出价', sample: '484.80' },
          { key: 'physical_gold_info', name: '实物金产品信息', sample: '传世之宝, 10g, 9999' },
        ]
      },
      {
        id: 'tbl_ins_prod',
        name: '保险产品库',
        fields: [
          { key: 'ins_prod_name', name: '产品名称', sample: '信诚「基石」终身寿险' },
          { key: 'ins_benefit_demo', name: '利益演示 (Table)', sample: 'List<Row>' },
          { key: 'ins_features', name: '产品特色', sample: '锁定长期收益, 财富传承' },
        ]
      },
      {
        id: 'tbl_private_prod',
        name: '私募产品问答',
        fields: [
          { key: 'pe_yield_list', name: '区间涨跌幅列表', sample: 'List<Yield>' },
          { key: 'pe_status', name: '交易状态', sample: '开放期' },
          { key: 'pe_min_amt', name: '起购金额', sample: '1,000,000' },
        ]
      }
    ]
  },
  {
    id: 'cat_market',
    name: '市场信息数据',
    tables: [
      {
        id: 'tbl_market_view',
        name: '财富周速递市场观点',
        fields: [
          { key: 'view_cn_stock', name: '国内股票市场-配置策略', sample: '震荡筑底，关注结构性机会' },
          { key: 'view_cn_bond', name: '国内债券市场-本周展望', sample: '利率债区间震荡' },
          { key: 'view_us_stock', name: '美股市场-配置策略', sample: '科技股回调，逢低配置' },
          { key: 'view_gold', name: '黄金市场-配置策略', sample: '避险情绪升温，建议标配' },
        ]
      },
      {
        id: 'tbl_stock_stats',
        name: 'A股股票涨跌平信息',
        fields: [
          { key: 'stock_up_count', name: 'A股上涨股票数', sample: '3200' },
          { key: 'stock_down_count', name: 'A股下跌股票数', sample: '1500' },
          { key: 'stock_flat_count', name: 'A股持平股票数', sample: '120' },
        ]
      }
    ]
  },
  {
    id: 'cat_rm',
    name: '客户经理信息数据',
    tables: [
      {
        id: 'tbl_rm_info',
        name: '客户经理基础信息',
        fields: [
          { key: 'sap_id', name: 'SAP号', sample: '00100881' },
          { key: 'system_perm', name: 'W+系统权限类别', sample: '金葵花客户经理L2' },
        ]
      },
      {
        id: 'tbl_rm_kpi',
        name: 'AUM业绩分析',
        fields: [
          { key: 'kpi_outlet', name: '客户经理及网点指标', sample: 'JSON Object' },
          { key: 'kpi_cust', name: '客户指标', sample: 'JSON Object' },
        ]
      },
      {
        id: 'tbl_opps',
        name: '商机与专案',
        fields: [
          { key: 'active_campaigns', name: '客户当前所有活动', sample: 'MGM老带新, 养老金开户' },
          { key: 'campaign_strategy', name: '当前专案下命中的策略', sample: '高潜流失挽留策略' },
          { key: 'opp_db', name: '商机数据库数据', sample: 'List<Opportunity>' },
        ]
      }
    ]
  }
];

const DataSelectorModal: React.FC<DataSelectorModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCategory, setSelectedCategory] = useState(DATA_SOURCE_TREE[0]);
  const [selectedTable, setSelectedTable] = useState(DATA_SOURCE_TREE[0].tables[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50">
           <div className="flex items-center gap-2">
               <DatabaseIcon />
               <span className="font-bold text-slate-700">添加数据源引用</span>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* 1. Category Column */}
            <div className="w-1/4 border-r border-gray-200 bg-gray-50/50 flex flex-col">
                <div className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">数据分类</div>
                <div className="flex-1 overflow-y-auto">
                    {DATA_SOURCE_TREE.map(cat => (
                        <div 
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedTable(cat.tables[0]);
                            }}
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm ${selectedCategory.id === cat.id ? 'bg-white border-l-4 border-blue-600 text-blue-700 font-medium shadow-sm' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            {cat.name}
                            <ChevronDownIcon className={`w-3 h-3 text-gray-400 -rotate-90`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Table Column */}
            <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                 <div className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                     {selectedCategory.name} - 数据表
                 </div>
                 <div className="flex-1 overflow-y-auto">
                     {selectedCategory.tables.map(tbl => (
                         <div 
                             key={tbl.id}
                             onClick={() => setSelectedTable(tbl)}
                             className={`px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${selectedTable.id === tbl.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                         >
                             <div className="flex items-center gap-2 mb-1">
                                 <TableIcon />
                                 <span className={`text-sm ${selectedTable.id === tbl.id ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>
                                     {tbl.name}
                                 </span>
                             </div>
                             {(tbl as any).description && (
                                 <p className="text-xs text-gray-400 truncate pl-6">{(tbl as any).description}</p>
                             )}
                         </div>
                     ))}
                 </div>
            </div>

            {/* 3. Field/Action Column */}
            <div className="flex-1 bg-white flex flex-col">
                 <div className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex justify-between items-center">
                     <span>字段选择</span>
                     <span className="text-xs normal-case text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                         Table: {selectedTable.name}
                     </span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     
                     {/* Option A: Whole Interface Reference */}
                     <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                                 <CodeIcon />
                                 引用完整接口数据 (JSON)
                             </div>
                             <button 
                                onClick={() => {
                                    onAdd({
                                        id: Date.now().toString(),
                                        category: selectedCategory.name,
                                        sourceName: selectedTable.name,
                                        name: `${selectedTable.name} (完整)`,
                                        key: `${selectedTable.id}_full`,
                                        dataType: (selectedTable as any).isList ? 'list' : 'object',
                                        sampleValue: (selectedTable as any).isList ? '[{...}, {...}]' : '{...}',
                                        description: (selectedTable as any).description || '完整表数据'
                                    });
                                    onClose();
                                }}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                             >
                                <PlusIcon /> 添加整表
                             </button>
                         </div>
                         <p className="text-xs text-purple-600/80 leading-relaxed">
                             将 {selectedTable.name} 的所有记录和字段作为结构化数据（{(selectedTable as any).isList ? 'List列表' : 'Object对象'}）传递给模型。
                             <br/>适用于模型需要分析多条记录趋势或聚合计算的场景。
                         </p>
                     </div>

                     <div className="border-t border-gray-100 my-4"></div>
                     <p className="text-xs text-gray-400 mb-2">或选择单一字段：</p>

                     {/* Option B: Single Fields */}
                     <div className="grid grid-cols-1 gap-2">
                         {selectedTable.fields.map(field => (
                             <div key={field.key} className="flex items-center justify-between p-3 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 group transition-all">
                                 <div>
                                     <div className="text-sm font-medium text-slate-700">{field.name}</div>
                                     <div className="flex items-center gap-2 mt-0.5">
                                         <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 rounded">{field.key}</span>
                                         <span className="text-[10px] text-gray-400">示例: {field.sample}</span>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => {
                                        onAdd({
                                            id: Date.now().toString(),
                                            category: selectedCategory.name,
                                            sourceName: selectedTable.name,
                                            name: field.name,
                                            key: field.key,
                                            dataType: 'value',
                                            sampleValue: field.sample
                                        });
                                        onClose();
                                    }}
                                    className="opacity-0 group-hover:opacity-100 px-2 py-1 border border-blue-600 text-blue-600 rounded text-xs hover:bg-blue-600 hover:text-white transition-all"
                                 >
                                     添加
                                 </button>
                             </div>
                         ))}
                     </div>

                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DataSelectorModal;