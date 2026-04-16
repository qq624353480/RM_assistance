
export interface FileItem {
  id: string;
  name: string;
  type: 'word' | 'pdf' | 'excel' | 'txt';
  status: 'learning' | 'completed';
}

export interface TraceStep {
  title: string;
  type: 'router' | 'data' | 'rag' | 'prompt' | 'skill' | 'code'; // Added 'router', 'code'
  status: 'success' | 'processing' | 'pending';
  items: string[];
  cost?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string; // The "Deep Thinking" text
  trace?: TraceStep[]; // The FKDS execution trace
  tableData?: {
    category: string;
    percentage: string;
    feature: string;
    analysis: string;
  }[];
}

export interface AssociatedItem {
  id: string;
  name: string;
  type: 'project' | 'opportunity' | 'tag' | 'activity' | 'database';
  valueType?: 'category' | 'numeric' | 'date'; // Type of tag value
  dateType?: 'MM-DD' | 'YYYY-MM-DD'; // Specific type for date tags
  values?: string[]; // Available values for category tags
  selectedValues?: string[]; // Selected values for category placement
  operator?: '>' | '<' | '>=' | '<=' | '=' | 'between'; // For numeric/date tags
  threshold?: number | string; // For numeric or date tags
  thresholdEnd?: number | string; // For range (between) tags
  isConfiguredInInsight?: boolean; // Whether the tag is visible in Customer Insight page (WE config)
}

export interface AgentConfig {
  name: string;
  description: string;
  instructions: string;
  routerSystemPrompt?: string; // NEW: System prompt for the intent classifier
  associatedItems?: AssociatedItem[]; // NEW: Associated projects/opportunities/tags
  placementLogic?: 'AND' | 'OR'; // Logical relationship between tags for placement
  // Advanced Config
  model?: string;
  temperature?: number;
  maxTokens?: number;
  searchGrounding?: boolean;
}

export interface DataField {
  id: string;
  category: string; // Top level category name
  sourceName: string; // Table or Interface name
  name: string; // Field name or Interface description
  key: string;
  dataType: 'value' | 'list' | 'object'; // 'value' for single field, 'list'/'object' for full interface
  sampleValue: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  iconType: 'calc' | 'chart' | 'card' | 'search' | 'money';
  selected: boolean;
  triggerKeywords: string[]; // NEW: For Router matching
  sopLogic?: string; // NEW: The specific SOP script for this skill
  instruction?: string; // NEW: Modular prompt specific to this skill
}

export interface EnvConfig {
  triggerPage: string;
  displaySlot: string;
}

// New Types for Version Control
export interface AppState {
  agentConfig: AgentConfig;
  files: FileItem[];
  dataFields: DataField[];
  skills: Skill[];
  envConfig: EnvConfig;
  chatHistory: ChatMessage[]; // Added chatHistory persistence
  versions: Version[];
  evaluationResult?: EvaluationResult; // NEW: Persist evaluation
}

export interface Version {
  id: string;
  label: string;
  timestamp: number;
  data: Omit<AppState, 'versions'>; // Snapshot shouldn't contain nested versions ideally, but simple here
}

export interface MockCustomer {
  id: string;
  name: string; // Masked name
  label: string; // Internal label e.g., "Tech Youth"
  avatarColor: string; // tailwind class
  data: Record<string, string>; // Key mapped to DataField.key
}

// === NEW: Agent Dashboard Types ===
export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  updatedAt: number;
  status: 'published' | 'draft';
  tags: string[];
  avatarColor: string;
  ownerId: string;
}

// === NEW: AI Evaluation Types ===
export interface EvaluationDimension {
  name: string;
  score: number; // 0-100
  analysis: string;
}

export interface EvaluationResult {
  totalScore: number; // 0-100
  staticScore: number; // 0-40
  dynamicScore: number; // 0-60
  dimensions: EvaluationDimension[];
  suggestions: string[];
  lastEvaluatedAt: number;
}