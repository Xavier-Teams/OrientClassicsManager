import type {
  QueryIntent,
  QueryResult,
  UserContext,
  AIAdapter,
} from "../types";
import { db } from "../../db";
import { works, contracts, payments, reviews, users } from "@shared/schema";
import { eq, and, like, or, sql, desc } from "drizzle-orm";

export class SmartQueryService {
  private adapter: AIAdapter;

  constructor(adapter: AIAdapter) {
    this.adapter = adapter;
  }

  async processQuery(
    query: string,
    userContext: UserContext
  ): Promise<QueryResult> {
    try {
      // Step 1: Parse intent với AI
      const intent = await this.parseIntent(query);

      // Step 2: Generate database query
      const dbQuery = this.generateQuery(intent, userContext);

      // Step 3: Execute query
      const results = await this.executeQuery(dbQuery);

      // Step 4: Format response
      const explanation = await this.generateExplanation(query, results, intent);

      return {
        queryType: `${intent.type}_${intent.entity}`,
        results,
        explanation,
        metadata: {
          intent,
          resultCount: results.length,
        },
      };
    } catch (error: any) {
      throw new Error(`Smart query error: ${error.message}`);
    }
  }

  private async parseIntent(query: string): Promise<QueryIntent> {
    const prompt = `Bạn là một hệ thống phân tích truy vấn cho hệ thống quản lý dịch thuật.

Phân tích câu truy vấn sau và trả về JSON với format:
{
  "type": "list" | "filter" | "aggregate" | "detail",
  "entity": "work" | "contract" | "payment" | "review" | "user",
  "filters": { "field": "value" },
  "aggregations": ["count", "sum", "avg"]
}

Truy vấn: "${query}"

Chỉ trả về JSON, không có text khác.`;

    const response = await this.adapter.chatCompletion([
      { role: "system", content: "You are a query analysis system. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ]);

    try {
      const parsed = JSON.parse(response);
      return {
        type: parsed.type || "unknown",
        entity: parsed.entity || "unknown",
        filters: parsed.filters || {},
        aggregations: parsed.aggregations || [],
      };
    } catch {
      // Fallback: Simple keyword matching
      return this.fallbackIntentParsing(query);
    }
  }

  private fallbackIntentParsing(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase();

    // Detect entity
    let entity: QueryIntent["entity"] = "unknown";
    if (lowerQuery.includes("tác phẩm") || lowerQuery.includes("work")) {
      entity = "work";
    } else if (lowerQuery.includes("hợp đồng") || lowerQuery.includes("contract")) {
      entity = "contract";
    } else if (lowerQuery.includes("thanh toán") || lowerQuery.includes("payment")) {
      entity = "payment";
    } else if (lowerQuery.includes("thẩm định") || lowerQuery.includes("review")) {
      entity = "review";
    }

    // Detect type
    let type: QueryIntent["type"] = "list";
    if (lowerQuery.includes("tổng hợp") || lowerQuery.includes("tổng")) {
      type = "aggregate";
    } else if (lowerQuery.includes("chi tiết") || lowerQuery.includes("detail")) {
      type = "detail";
    }

    return { type, entity, filters: {} };
  }

  private generateQuery(intent: QueryIntent, userContext: UserContext) {
    const { type, entity, filters } = intent;

    switch (entity) {
      case "work":
        return this.buildWorkQuery(type, filters);
      case "contract":
        return this.buildContractQuery(type, filters);
      case "payment":
        return this.buildPaymentQuery(type, filters);
      case "review":
        return this.buildReviewQuery(type, filters);
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  private buildWorkQuery(type: string, filters: Record<string, any> = {}) {
    let query = db.select().from(works);

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(works.translationStatus, filters.status));
    }
    if (filters.translatorId) {
      conditions.push(eq(works.translatorId, filters.translatorId));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(works.name, `%${filters.search}%`),
          like(works.author, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (type === "aggregate") {
      return db
        .select({
          total: sql<number>`count(*)`,
          inProgress: sql<number>`count(*) filter (where ${works.translationStatus} = 'in_progress')`,
          completed: sql<number>`count(*) filter (where ${works.translationStatus} = 'completed')`,
        })
        .from(works);
    }

    return query.orderBy(desc(works.createdAt)).limit(50);
  }

  private buildContractQuery(type: string, filters: Record<string, any> = {}) {
    let query = db.select().from(contracts);

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(contracts.status, filters.status));
    }
    if (filters.workId) {
      conditions.push(eq(contracts.workId, filters.workId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(contracts.createdAt)).limit(50);
  }

  private buildPaymentQuery(type: string, filters: Record<string, any> = {}) {
    let query = db.select().from(payments);

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(payments.status, filters.status));
    }
    if (filters.contractId) {
      conditions.push(eq(payments.contractId, filters.contractId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(payments.createdAt)).limit(50);
  }

  private buildReviewQuery(type: string, filters: Record<string, any> = {}) {
    let query = db.select().from(reviews);

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(reviews.status, filters.status));
    }
    if (filters.workId) {
      conditions.push(eq(reviews.workId, filters.workId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(reviews.createdAt)).limit(50);
  }

  private async executeQuery(query: any): Promise<any[]> {
    try {
      const results = await query;
      return results;
    } catch (error: any) {
      throw new Error(`Query execution error: ${error.message}`);
    }
  }

  private async generateExplanation(
    originalQuery: string,
    results: any[],
    intent: QueryIntent
  ): Promise<string> {
    const prompt = `Giải thích ngắn gọn kết quả truy vấn bằng tiếng Việt.

Truy vấn gốc: "${originalQuery}"
Số lượng kết quả: ${results.length}
Loại: ${intent.type} - ${intent.entity}

Trả về một câu giải thích ngắn gọn (tối đa 50 từ).`;

    try {
      const explanation = await this.adapter.chatCompletion([
        { role: "system", content: "You are a helpful assistant. Respond in Vietnamese only." },
        { role: "user", content: prompt },
      ]);
      return explanation.trim();
    } catch {
      return `Tìm thấy ${results.length} kết quả cho truy vấn "${originalQuery}"`;
    }
  }
}

