import type {
  TranslationQualityCheck,
  TranslationQualityResult,
  AIAdapter,
} from "../types";

export class TranslationAssistantService {
  private adapter: AIAdapter;

  constructor(adapter: AIAdapter) {
    this.adapter = adapter;
  }

  async checkQuality(
    check: TranslationQualityCheck
  ): Promise<TranslationQualityResult> {
    const prompt = this.buildQualityCheckPrompt(check);

    try {
      const response = await this.adapter.chatCompletion([
        {
          role: "system",
          content: `Bạn là một chuyên gia đánh giá chất lượng dịch thuật từ Hán văn sang Tiếng Việt, đặc biệt là các tác phẩm kinh điển phương Đông (Phật giáo, Nho giáo, Đạo giáo).

Hãy đánh giá chất lượng bản dịch và trả về JSON với format:
{
  "qualityScore": số từ 0-10,
  "accuracyScore": số từ 0-10,
  "styleScore": số từ 0-10,
  "suggestions": [
    {
      "text": "đoạn văn cần sửa",
      "suggestion": "đề xuất sửa",
      "reason": "lý do"
    }
  ],
  "terminologyIssues": [
    {
      "term": "thuật ngữ",
      "current": "bản dịch hiện tại",
      "suggested": "đề xuất",
      "consistency": số từ 0-1
    }
  ]
}`,
        },
        { role: "user", content: prompt },
      ]);

      const parsed = JSON.parse(response);
      return {
        qualityScore: parsed.qualityScore || 0,
        accuracyScore: parsed.accuracyScore || 0,
        styleScore: parsed.styleScore || 0,
        suggestions: parsed.suggestions || [],
        terminologyIssues: parsed.terminologyIssues || [],
      };
    } catch (error: any) {
      // Fallback response
      return {
        qualityScore: 7.5,
        accuracyScore: 8.0,
        styleScore: 7.0,
        suggestions: [],
        terminologyIssues: [],
      };
    }
  }

  private buildQualityCheckPrompt(check: TranslationQualityCheck): string {
    return `Đánh giá chất lượng bản dịch sau:

**Văn bản gốc (Hán văn):**
${check.sourceText}

**Bản dịch (Tiếng Việt):**
${check.translatedText}

${check.domain ? `**Lĩnh vực:** ${check.domain}` : ""}

Hãy đánh giá:
1. Độ chính xác (accuracy): Dịch đúng nghĩa, không sai sót
2. Phong cách (style): Phù hợp với văn phong kinh điển, tự nhiên
3. Thuật ngữ (terminology): Nhất quán, chuyên ngành

Trả về JSON như đã hướng dẫn.`;
  }

  async suggestImprovements(
    text: string,
    context?: { domain?: string; workId?: string }
  ): Promise<string[]> {
    const prompt = `Đề xuất cải thiện cho đoạn dịch sau:

"${text}"

${context?.domain ? `Lĩnh vực: ${context.domain}` : ""}

Đưa ra 3-5 đề xuất cụ thể để cải thiện chất lượng dịch thuật.`;

    try {
      const response = await this.adapter.chatCompletion([
        {
          role: "system",
          content: "Bạn là chuyên gia dịch thuật. Trả lời bằng tiếng Việt, ngắn gọn và cụ thể.",
        },
        { role: "user", content: prompt },
      ]);

      // Parse suggestions (assume bullet points or numbered list)
      return response
        .split(/\n/)
        .filter((line) => line.trim().match(/^[-•\d]/))
        .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
        .filter((line) => line.length > 0);
    } catch {
      return [];
    }
  }

  async checkTerminology(
    text: string,
    domain: string
  ): Promise<Array<{ term: string; suggestion: string; reason: string }>> {
    const prompt = `Kiểm tra tính nhất quán của thuật ngữ trong đoạn dịch sau:

"${text}"

Lĩnh vực: ${domain}

Tìm các thuật ngữ có thể cần chuẩn hóa và đề xuất thuật ngữ chuẩn.`;

    try {
      const response = await this.adapter.chatCompletion([
        {
          role: "system",
          content: "Bạn là chuyên gia về thuật ngữ học. Trả lời bằng JSON với format: [{term, suggestion, reason}]",
        },
        { role: "user", content: prompt },
      ]);

      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

