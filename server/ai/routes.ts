import type { Express } from "express";
import { OpenAIAdapter } from "./adapters/openai-adapter";
import { SmartQueryService } from "./services/smart-query.service";
import { TranslationAssistantService } from "./services/translation-assistant.service";
import { z } from "zod";

// Initialize AI services
const aiAdapter = new OpenAIAdapter();
const smartQueryService = new SmartQueryService(aiAdapter);
const translationAssistantService = new TranslationAssistantService(aiAdapter);

// Validation schemas
const smartQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  context: z
    .object({
      userId: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
});

const translationCheckSchema = z.object({
  sourceText: z.string().min(1),
  translatedText: z.string().min(1),
  domain: z.string().optional(),
  workId: z.string().optional(),
});

export function registerAIRoutes(app: Express) {
  // ============================================================================
  // SMART QUERY
  // ============================================================================

  app.post("/api/ai/query", async (req, res) => {
    try {
      const validated = smartQuerySchema.parse(req.body);
      const userContext = {
        userId: validated.context?.userId || "anonymous",
        role: validated.context?.role || "user",
      };

      const result = await smartQueryService.processQuery(
        validated.query,
        userContext
      );

      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // TRANSLATION ASSISTANT
  // ============================================================================

  app.post("/api/ai/translation/check", async (req, res) => {
    try {
      const validated = translationCheckSchema.parse(req.body);

      const result = await translationAssistantService.checkQuality({
        sourceText: validated.sourceText,
        translatedText: validated.translatedText,
        domain: validated.domain,
        workId: validated.workId,
      });

      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/translation/suggest", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        domain: z.string().optional(),
        workId: z.string().optional(),
      });

      const validated = schema.parse(req.body);

      const suggestions = await translationAssistantService.suggestImprovements(
        validated.text,
        {
          domain: validated.domain,
          workId: validated.workId,
        }
      );

      res.json({ suggestions });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/translation/terminology", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().min(1),
        domain: z.string().min(1),
      });

      const validated = schema.parse(req.body);

      const issues = await translationAssistantService.checkTerminology(
        validated.text,
        validated.domain
      );

      res.json({ issues });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get("/api/ai/health", async (req, res) => {
    try {
      // Test AI connection
      const testResponse = await aiAdapter.chatCompletion([
        {
          role: "system",
          content: "You are a test assistant.",
        },
        { role: "user", content: "Say 'OK' if you can hear me." },
      ]);

      res.json({
        status: "healthy",
        adapter: "OpenAI",
        testResponse: testResponse.substring(0, 50),
      });
    } catch (error: any) {
      res.status(500).json({
        status: "unhealthy",
        error: error.message,
      });
    }
  });
}

