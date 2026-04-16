# 银行客户经理 AI 智能体配置平台 - 核心业务逻辑与 AI Coding 解决方案深度解析

## 1. 核心设计理念：AI Coding + 确定性逻辑引擎
在银行理财场景中，纯粹的大模型（LLM）生成存在“幻觉”和“计算不准”的风险。本平台的核心设计思想是：**利用 AI Coding 能力，将模糊的业务需求转化为精确的代码逻辑（Code Interpreter / Function Calling），实现“大模型负责理解与交互，代码负责计算与风控”的混合架构。**

## 2. 针对性解决方案

### 2.1. 风险等级匹配 (Risk Matching)
**业务痛点**：合规红线。客户风险等级（如 R2-稳健型）必须严格匹配产品风险等级（R2 及以下）。LLM 容易在多轮对话中“遗忘”此约束，或对 R2/R3 的界限判断模糊。

*   **AI Coding 解决方案**：
    *   **代码级风控拦截器 (Code-based Risk Interceptor)**：
        *   **实现机制**：平台内置一个 Python/JS 函数 `check_risk_compliance(user_risk_level, product_risk_level)`。
        *   **工作流**：
            1.  LLM 识别到用户意图为“购买理财 A”。
            2.  LLM **必须**调用 `get_product_info('理财A')` 获取产品风险等级（如 R3）。
            3.  LLM **必须**调用 `get_user_info()` 获取客户风险等级（如 R2）。
            4.  **关键步骤**：将两者传入 `check_risk_compliance` 函数。函数内部执行严格的 `if user_risk < product_risk: return False` 逻辑。
            5.  **结果处理**：如果函数返回 `False`，LLM **被强制**输出合规阻断话术（“抱歉，该产品风险等级高于您的承受能力...”），无法绕过。
    *   **调试验证**：在右侧调试窗口，切换“模拟客户”为 R1（保守型），尝试购买 R3 产品，验证拦截器是否生效。

### 2.2. 产品池匹配 (Product Pool Matching)
**业务痛点**：精准营销。需要从海量产品池中，筛选出“客户未持有”且“符合当前策略”的产品。LLM 无法直接处理数据库级的筛选。

*   **AI Coding 解决方案**：
    *   **SQL/Pandas 逻辑生成 (Text-to-SQL/Code)**：
        *   **实现机制**：平台允许业务人员用自然语言描述筛选规则（如“找出收益率 > 3% 且客户没买过的理财”）。
        *   **AI Coding 引擎**：后台将此需求转化为一段精确的 Python 代码（使用 Pandas）：
            ```python
            # 伪代码
            user_holdings = get_user_holdings(user_id) # 获取持仓
            all_products = get_product_pool() # 获取全量产品
            # 过滤逻辑：收益率 > 3% AND ID 不在持仓中
            recommended = all_products[
                (all_products['yield'] > 3.0) & 
                (~all_products['id'].isin(user_holdings['id']))
            ]
            ```
        *   **执行与反馈**：这段代码在沙箱中执行，返回精确的产品列表给 LLM，LLM 再将其包装成话术推荐给客户。

### 2.3. 确定性逻辑计算 (Deterministic Logic: Calculation & Sorting)
**业务痛点**：LLM 数学能力弱。收益计算（`本金 * 利率 * 天数 / 365`）、多产品按收益率排序、同类产品参数对比，LLM 经常算错或排错。

*   **AI Coding 解决方案**：
    *   **代码解释器 (Code Interpreter) 集成**：
        *   **场景一：收益计算**。当客户问“买 10 万，放 90 天能赚多少？”，LLM 不直接生成数字，而是生成一段 Python 代码：`return 100000 * 0.035 * 90 / 365`，由代码执行引擎算出 `863.01`，LLM 再回答“预计收益 863.01 元”。
        *   **场景二：产品对比与排序**。当客户问“这三款哪个收益高？”，LLM 调用 `sort_products_by_yield([A, B, C])` 函数，代码执行排序算法，返回 `[B, A, C]`，LLM 据此回答“B 产品收益最高”。
    *   **优势**：彻底消除了“数学幻觉”，保证了金融数据的绝对准确性。

### 2.4. 复杂任务编排 (Task Orchestration & Workflow)
**业务痛点**：业务流程长且分支多。例如“客户命中‘代发薪专案’ -> 执行 A 话术；命中‘高净值流失预警’ -> 执行 B 话术 -> 调用安抚策略”。LLM 容易在多轮对话中迷失流程。

*   **AI Coding 解决方案**：
    *   **基于图的任务流引擎 (Graph-based Workflow Engine)**：
        *   **可视化编排**：平台提供“画布”，业务人员拖拽定义流程节点（Node）和连线（Edge）。
        *   **AI Coding 自动生成路由逻辑**：
            *   针对每个分支节点（Decision Node），AI 自动生成判断代码：
                ```python
                if 'payroll_project' in user.tags:
                    return 'Execute_Strategy_A'
                elif 'high_net_worth_churn' in user.tags:
                    return 'Execute_Strategy_B'
                else:
                    return 'Default_Flow'
                ```
        *   **状态机管理 (State Machine)**：系统维护当前会话的“状态指针”。LLM 每轮回复前，先检查当前处于哪个节点（State），只执行该节点允许的动作（Action），确保流程严丝合缝，不会乱跳。

## 3. 总结
本平台通过 **AI Coding** 技术，将银行理财业务中“最难啃”的硬骨头——**风控合规、数据筛选、精确计算、复杂流程**——从 LLM 的“模糊生成”剥离出来，交给**确定性的代码逻辑**去执行。

**LLM 负责“懂客户、说人话”，Code 负责“算得准、守规矩”。** 这种架构完美解决了金融场景对准确性和合规性的极致要求。
