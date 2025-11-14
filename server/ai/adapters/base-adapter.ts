import type { AIAdapter, AIMessage } from "../types";

/**
 * Base adapter interface for AI providers
 * All AI adapters should implement this interface
 */
export abstract class BaseAIAdapter implements AIAdapter {
  abstract chatCompletion(messages: AIMessage[]): Promise<string>;
  abstract embedding(text: string): Promise<number[]>;
  abstract getCostEstimate(tokens: number): number;

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (i === maxRetries - 1) throw error;
        if (error.status === 429 || error.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw error;
      }
    }
    throw new Error("Max retries exceeded");
  }
}

