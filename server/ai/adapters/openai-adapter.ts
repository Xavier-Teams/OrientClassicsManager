import OpenAI from "openai";
import { BaseAIAdapter } from "./base-adapter";
import type { AIMessage } from "../types";

export class OpenAIAdapter extends BaseAIAdapter {
  private client: OpenAI;
  private model: string;
  private costPer1kTokens: { input: number; output: number };

  constructor(apiKey?: string, model = "gpt-4-turbo-preview") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = model;

    // Cost per 1k tokens (USD) - Update based on current pricing
    this.costPer1kTokens = {
      input: model.includes("gpt-4") ? 0.01 : 0.0005, // $0.01 per 1k input tokens for GPT-4
      output: model.includes("gpt-4") ? 0.03 : 0.0015, // $0.03 per 1k output tokens for GPT-4
    };
  }

  async chatCompletion(messages: AIMessage[]): Promise<string> {
    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.chat.completions.create({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 2000,
        });
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return content;
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async embedding(text: string): Promise<number[]> {
    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        });
      });

      return response.data[0].embedding;
    } catch (error: any) {
      throw new Error(`OpenAI embedding error: ${error.message}`);
    }
  }

  getCostEstimate(tokens: number): number {
    // Rough estimate: assume 50% input, 50% output
    const inputCost = (tokens * 0.5 * this.costPer1kTokens.input) / 1000;
    const outputCost = (tokens * 0.5 * this.costPer1kTokens.output) / 1000;
    return inputCost + outputCost;
  }
}

