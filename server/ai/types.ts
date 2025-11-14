// AI Service Types

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIAdapter {
  chatCompletion(messages: AIMessage[]): Promise<string>;
  embedding(text: string): Promise<number[]>;
  getCostEstimate(tokens: number): number;
}

export interface QueryIntent {
  type: "list" | "filter" | "aggregate" | "detail" | "unknown";
  entity: "work" | "contract" | "payment" | "review" | "user" | "unknown";
  filters?: Record<string, any>;
  aggregations?: string[];
}

export interface QueryResult {
  queryType: string;
  results: any[];
  explanation: string;
  metadata?: Record<string, any>;
}

export interface TranslationQualityCheck {
  sourceText: string;
  translatedText: string;
  domain?: string;
  workId?: string;
}

export interface TranslationQualityResult {
  qualityScore: number;
  accuracyScore: number;
  styleScore: number;
  suggestions: Array<{
    text: string;
    suggestion: string;
    reason: string;
  }>;
  terminologyIssues?: Array<{
    term: string;
    current: string;
    suggested: string;
    consistency: number;
  }>;
}

export interface UserContext {
  userId: string;
  role: string;
  permissions?: string[];
}

