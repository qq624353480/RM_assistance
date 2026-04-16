import { GoogleGenAI, Type } from "@google/genai";
import { AgentConfig, ChatMessage, FileItem, Skill, EvaluationResult, EvaluationDimension, EnvConfig, DataField } from "../types";

export const calculateStaticScore = (
  config: AgentConfig,
  files: FileItem[],
  skills: Skill[],
  envConfig: EnvConfig,
  dataFields: DataField[]
): { score: number; tips: string[] } => {
  let score = 0;
  const tips: string[] = [];

  // 1. 框架描述是否清晰 (max 15)
  if (config.instructions.length > 200) {
    score += 15;
  } else if (config.instructions.length > 50) {
    score += 10;
    tips.push("提示词略显简短，建议补充更多角色背景和业务边界。");
  } else {
    score += 5;
    tips.push("提示词过于简短，AI 可能无法准确理解任务，请详细描述。");
  }

  // 2. 知识和数据挂载情况 (max 15)
  const hasKnowledge = files.length > 0;
  const hasData = dataFields.length > 0;
  
  if (hasKnowledge && hasData) {
    score += 15;
  } else if (hasKnowledge || hasData) {
    score += 10;
    if (!hasKnowledge) tips.push("未挂载知识库。如果涉及专业领域，建议上传相关文档以减少幻觉。");
    if (!hasData) tips.push("未挂载业务数据。建议接入客户或产品数据以提供个性化服务。");
  } else {
    tips.push("未挂载任何知识库或业务数据，智能体可能缺乏必要的业务上下文。");
  }

  // 3. 环境感知是否配置 (max 10)
  if (envConfig && envConfig.triggerPage && envConfig.displaySlot) {
    score += 10;
  } else {
    tips.push("未配置环境感知（触发页面/展示位置），智能体可能无法在合适的时机出现。");
  }

  return { score, tips };
};

export const evaluateAgentDynamic = async (
  config: AgentConfig,
  chatHistory: ChatMessage[]
): Promise<{
  dynamicScore: number;
  dimensions: EvaluationDimension[];
  suggestions: string[];
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
你是一个专业的 AI 智能体评测专家。请根据以下智能体的配置和最近的对话历史，对其表现进行深度评测。

### 智能体配置：
- 名称：${config.name}
- 描述：${config.description}
- 核心提示词：
${config.instructions}

### 历史对话记录：
${chatHistory
  .map((msg) => `[${msg.role === "user" ? "用户" : "智能体"}]: ${msg.content}`)
  .join("\n")}

### 评测要求：
请从以下 3 个维度进行打分（每个维度满分 20 分，总分最高 60 分）：
1. 知识与数据应用 (Knowledge & Data Usage)：在刚才的对话中，智能体是否有效利用了已挂载的知识库或业务数据？有没有出现幻觉？
2. 问答合理性与逻辑 (Reasoning & Logic)：客观评价智能体的回答是否合理、逻辑是否严密？是否解决了用户的问题？
3. 性能与 Token 利用率 (Performance & Efficiency)：回答是否啰嗦？是否在合理的篇幅内（Token利用率高）给出了有效信息？

请返回 JSON 格式的评测结果，严格遵循以下结构：
{
  "dynamicScore": 55, // 0-60 之间的整数
  "dimensions": [
    {
      "name": "知识与数据应用",
      "score": 18, // 0-20
      "analysis": "简短的分析说明..."
    },
    {
      "name": "问答合理性与逻辑",
      "score": 18, // 0-20
      "analysis": "简短的分析说明..."
    },
    {
      "name": "性能与 Token 利用率",
      "score": 19, // 0-20
      "analysis": "简短的分析说明..."
    }
  ],
  "suggestions": [
    "具体的调优建议 1",
    "具体的调优建议 2"
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dynamicScore: { type: Type.INTEGER },
            dimensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  analysis: { type: Type.STRING },
                },
                required: ["name", "score", "analysis"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["dynamicScore", "dimensions", "suggestions"],
        },
      },
    });

    let text = response.text || "{}";
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);
    return {
      dynamicScore: result.dynamicScore || 0,
      dimensions: result.dimensions || [],
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    throw new Error("评测生成失败，请稍后重试。");
  }
};
