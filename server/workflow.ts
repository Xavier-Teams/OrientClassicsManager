import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { rateLimit } from "./middleware/rateLimit";

const translationTransitions: Record<string, string[]> = {
  draft: ["approved"],
  approved: ["translator_assigned"],
  translator_assigned: ["trial_translation", "in_progress"],
  trial_translation: ["trial_reviewed"],
  trial_reviewed: ["in_progress"],
  in_progress: ["progress_checked", "completed"],
  progress_checked: ["in_progress", "completed"],
  completed: [],
  cancelled: [],
};

function canTransition(current: string, target: string): boolean {
  const next = translationTransitions[current] || [];
  return next.includes(target);
}

async function logAction(
  workId: string,
  entityType: string,
  entityId: string,
  action: string,
  fromStatus: string | null,
  toStatus: string | null,
  performedById?: string | null,
  metadata?: any,
) {
  await db.insert(schema.workflowAuditLog).values({
    workId,
    entityType,
    entityId,
    action,
    fromStatus: fromStatus || null,
    toStatus: toStatus || null,
    performedById: performedById || null,
    metadata: metadata ? metadata : null,
  });
}

export function registerWorkflowRoutes(app: Express) {
  const assignTranslatorSchema = z.object({
    translatorId: z.string().min(1),
    performedById: z.string().optional(),
    autoAdvance: z.boolean().optional(),
  });

  app.post(
    "/api/works/:id/assign-translator",
    rateLimit({ windowMs: 60000, max: 30 }),
    async (req, res) => {
      try {
        const body = assignTranslatorSchema.parse(req.body);
        const workId = req.params.id;
        const [work] = await db
          .select()
          .from(schema.works)
          .where(eq(schema.works.id, workId));
        if (!work) return res.status(404).json({ error: "Work not found" });
        const [updated] = await db
          .update(schema.works)
          .set({ translatorId: body.translatorId, updatedAt: new Date() })
          .where(eq(schema.works.id, workId))
          .returning();
        await logAction(
          workId,
          "work",
          workId,
          "assign_translator",
          null,
          null,
          body.performedById || null,
          { translatorId: body.translatorId },
        );
        if (body.autoAdvance) {
          if (canTransition(updated.translationStatus, "translator_assigned")) {
            const [u2] = await db
              .update(schema.works)
              .set({
                translationStatus: "translator_assigned",
                updatedAt: new Date(),
              })
              .where(eq(schema.works.id, workId))
              .returning();
            await logAction(
              workId,
              "work",
              workId,
              "status_change",
              updated.translationStatus,
              "translator_assigned",
              body.performedById || null,
            );
            return res.json(u2);
          }
        }
        return res.json(updated);
      } catch (e: any) {
        if (e instanceof z.ZodError)
          return res.status(400).json({ error: e.errors });
        return res.status(500).json({ error: e.message });
      }
    },
  );

  const transitionSchema = z.object({
    toStatus: z.enum([
      "approved",
      "translator_assigned",
      "trial_translation",
      "trial_reviewed",
      "in_progress",
      "progress_checked",
      "completed",
      "cancelled",
    ]),
    performedById: z.string().optional(),
  });

  app.post(
    "/api/works/:id/transition",
    rateLimit({ windowMs: 60000, max: 30 }),
    async (req, res) => {
      try {
        const body = transitionSchema.parse(req.body);
        const workId = req.params.id;
        const [work] = await db
          .select()
          .from(schema.works)
          .where(eq(schema.works.id, workId));
        if (!work) return res.status(404).json({ error: "Work not found" });
        const current = work.translationStatus as string;
        if (!canTransition(current, body.toStatus)) {
          return res.status(400).json({
            error: `Cannot transition from ${current} to ${body.toStatus}`,
          });
        }
        const [updated] = await db
          .update(schema.works)
          .set({ translationStatus: body.toStatus, updatedAt: new Date() })
          .where(eq(schema.works.id, workId))
          .returning();
        await logAction(
          workId,
          "work",
          workId,
          "status_change",
          current,
          body.toStatus,
          body.performedById || null,
        );
        if (body.toStatus === "trial_translation") {
          await db.insert(schema.reviews).values({
            workId,
            type: "trial_review",
            status: "pending",
            metadata: null,
          });
          await logAction(
            workId,
            "review",
            workId,
            "create_trial_review",
            null,
            null,
            body.performedById || null,
          );
        }
        if (body.toStatus === "progress_checked") {
          await db.insert(schema.reviews).values({
            workId,
            type: "progress_check",
            status: "pending",
            metadata: null,
          });
          await logAction(
            workId,
            "review",
            workId,
            "create_progress_check",
            null,
            null,
            body.performedById || null,
          );
        }
        if (body.toStatus === "completed") {
          await db.insert(schema.reviews).values({
            workId,
            type: "project_acceptance",
            status: "pending",
            metadata: null,
          });
          await logAction(
            workId,
            "review",
            workId,
            "create_project_acceptance",
            null,
            null,
            body.performedById || null,
          );
        }
        return res.json(updated);
      } catch (e: any) {
        if (e instanceof z.ZodError)
          return res.status(400).json({ error: e.errors });
        return res.status(500).json({ error: e.message });
      }
    },
  );

  const scheduleReviewSchema = z.object({
    type: z.enum([
      "trial_review",
      "progress_check",
      "expert_review",
      "project_acceptance",
      "proofreading_review",
    ]),
    scheduledDate: z.string().optional(),
    performedById: z.string().optional(),
  });

  app.post(
    "/api/works/:id/reviews/schedule",
    rateLimit({ windowMs: 60000, max: 30 }),
    async (req, res) => {
      try {
        const body = scheduleReviewSchema.parse(req.body);
        const workId = req.params.id;
        const [work] = await db
          .select()
          .from(schema.works)
          .where(eq(schema.works.id, workId));
        if (!work) return res.status(404).json({ error: "Work not found" });
        const [review] = await db
          .insert(schema.reviews)
          .values({
            workId,
            type: body.type,
            status: "pending",
            scheduledDate: body.scheduledDate
              ? new Date(body.scheduledDate)
              : null,
          })
          .returning();
        await db
          .update(schema.works)
          .set({ reviewStatus: "in_progress", updatedAt: new Date() })
          .where(eq(schema.works.id, workId));
        await logAction(
          workId,
          "review",
          review.id,
          "schedule_review",
          null,
          null,
          body.performedById || null,
          { type: body.type },
        );
        return res.status(201).json(review);
      } catch (e: any) {
        if (e instanceof z.ZodError)
          return res.status(400).json({ error: e.errors });
        return res.status(500).json({ error: e.message });
      }
    },
  );

  const bootstrapEditingSchema = z.object({
    steps: z.array(z.string()).optional(),
    performedById: z.string().optional(),
  });

  app.post(
    "/api/works/:id/editing/bootstrap",
    rateLimit({ windowMs: 60000, max: 20 }),
    async (req, res) => {
      try {
        const body = bootstrapEditingSchema.parse(req.body);
        const workId = req.params.id;
        const [work] = await db
          .select()
          .from(schema.works)
          .where(eq(schema.works.id, workId));
        if (!work) return res.status(404).json({ error: "Work not found" });
        const defaultSteps = [
          "proofreading",
          "editing_draft",
          "proof_1",
          "proof_2",
          "final_approval",
        ];
        const steps =
          body.steps && body.steps.length > 0 ? body.steps : defaultSteps;
        const inserts = steps.map((s) => ({
          workId,
          stepName: s,
          status: "pending",
        }));
        await db.insert(schema.editingTasks).values(inserts);
        await db
          .update(schema.works)
          .set({ editingStatus: "pending", updatedAt: new Date() })
          .where(eq(schema.works.id, workId));
        await logAction(
          workId,
          "editing",
          workId,
          "bootstrap_editing_tasks",
          null,
          null,
          body.performedById || null,
          { steps },
        );
        return res.json({ created: steps.length });
      } catch (e: any) {
        if (e instanceof z.ZodError)
          return res.status(400).json({ error: e.errors });
        return res.status(500).json({ error: e.message });
      }
    },
  );

  const updatePublishingSchema = z.object({
    status: z.enum([
      "pending",
      "license_pending",
      "licensed",
      "in_production",
      "published",
    ]),
    performedById: z.string().optional(),
  });

  app.post(
    "/api/works/:id/publishing",
    rateLimit({ windowMs: 60000, max: 20 }),
    async (req, res) => {
      try {
        const body = updatePublishingSchema.parse(req.body);
        const workId = req.params.id;
        const [work] = await db
          .select()
          .from(schema.works)
          .where(eq(schema.works.id, workId));
        if (!work) return res.status(404).json({ error: "Work not found" });
        const [updated] = await db
          .update(schema.works)
          .set({ publishingStatus: body.status, updatedAt: new Date() })
          .where(eq(schema.works.id, workId))
          .returning();
        await logAction(
          workId,
          "publishing",
          workId,
          "publishing_status_change",
          work.publishingStatus || null,
          body.status,
          body.performedById || null,
        );
        return res.json(updated);
      } catch (e: any) {
        if (e instanceof z.ZodError)
          return res.status(400).json({ error: e.errors });
        return res.status(500).json({ error: e.message });
      }
    },
  );

  app.get("/api/works/:id/audit-log", async (req, res) => {
    try {
      const workId = req.params.id;
      const limitParam = req.query.limit as string | undefined;
      const cursorParam = req.query.cursor as string | undefined;
      const limit = Math.min(
        Math.max(parseInt(limitParam || "20", 10), 1),
        100,
      );
      const conditions: any[] = [eq(schema.workflowAuditLog.workId, workId)];
      if (cursorParam) {
        try {
          const decoded = JSON.parse(
            Buffer.from(cursorParam, "base64").toString("utf8"),
          ) as { createdAt: string; id: string };
          const cAt = new Date(decoded.createdAt);
          const cId = decoded.id;
          conditions.push(
            sql`${schema.workflowAuditLog.createdAt} < ${cAt} OR (${schema.workflowAuditLog.createdAt} = ${cAt} AND ${schema.workflowAuditLog.id} < ${cId})`,
          );
        } catch {}
      }
      const logs = await db
        .select()
        .from(schema.workflowAuditLog)
        .where(and(...conditions))
        .orderBy(
          sql`${schema.workflowAuditLog.createdAt} DESC, ${schema.workflowAuditLog.id} DESC`,
        )
        .limit(limit + 1);
      let nextCursor: string | null = null;
      if (logs.length > limit) {
        const last = logs[limit - 1] as any;
        nextCursor = Buffer.from(
          JSON.stringify({ createdAt: last.createdAt, id: last.id }),
          "utf8",
        ).toString("base64");
      }
      const items = logs.slice(0, limit);
      return res.json({ items, nextCursor });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });
}
