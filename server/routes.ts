import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerAIRoutes } from "./ai/routes";
import {
  insertUserSchema,
  insertWorkSchema,
  insertContractSchema,
  insertContractTemplateSchema,
  insertPaymentSchema,
  insertReviewSchema,
  insertReviewCouncilSchema,
  insertEditingTaskSchema,
  insertAdministrativeTaskSchema,
  updateUserSchema,
  updateWorkSchema,
  updateContractSchema,
  updateContractTemplateSchema,
  updatePaymentSchema,
  updateReviewSchema,
  updateReviewCouncilSchema,
  updateEditingTaskSchema,
  updateAdministrativeTaskSchema,
} from "@shared/schema";
import path from "path";
import fs from "fs/promises";
import { uploadMiddleware } from "./middleware/upload";
import { z } from "zod";
import { registerWorkflowRoutes } from "./workflow";
import { rateLimit } from "./middleware/rateLimit";
import { acquireLock, releaseLock } from "./lib/lock";
import {
  sendMattermost,
  setMattermostWebhook,
  getMattermostConfig,
} from "./lib/mattermost";
import { db } from "./db";
import * as schema from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireRole } from "./middleware/roles";

export async function registerRoutes(app: Express): Promise<Server> {
  function buildBoardUrl(req: any, listId?: string) {
    const ext = (req.headers["x-external-base-url"] as string) || "";
    const proto =
      (req.headers["x-forwarded-proto"] as string) || (req.protocol || "http");
    const host = req.get("host");
    const base = ext || (host ? `${proto}://${host}` : "");
    const qs = listId ? `?listId=${listId}` : "";
    return `${base}/tasks/board${qs}`;
  }
  // ============================================================================
  // USERS
  // ============================================================================

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // WORKS
  // ============================================================================

  app.get("/api/works", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        translatorId: req.query.translatorId as string | undefined,
        search: req.query.search as string | undefined,
      };
      const works = await storage.getWorks(filters);
      res.json(works);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get(
    "/api/works.cursor",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        const status = req.query.status as string | undefined;
        const priority = req.query.priority as string | undefined;
        const translatorId = req.query.translatorId as string | undefined;
        const search = req.query.search as string | undefined;
        const limitParam = req.query.limit as string | undefined;
        const cursorParam = req.query.cursor as string | undefined;
        const limit = Math.min(
          Math.max(parseInt(limitParam || "20", 10), 1),
          100,
        );
        let query = db.select().from(schema.works).$dynamic();
        const conditions: any[] = [];
        if (status)
          conditions.push(eq(schema.works.translationStatus, status as any));
        if (priority)
          conditions.push(eq(schema.works.priority, priority as any));
        if (translatorId)
          conditions.push(eq(schema.works.translatorId, translatorId));
        if (search) {
          conditions.push(
            sql`(${schema.works.name} ILIKE ${`%${search}%`} OR ${schema.works.author} ILIKE ${`%${search}%`})`,
          );
        }
        if (cursorParam) {
          try {
            const decoded = JSON.parse(
              Buffer.from(cursorParam, "base64").toString("utf8"),
            ) as { createdAt: string; id: string };
            const cAt = new Date(decoded.createdAt);
            const cId = decoded.id;
            conditions.push(
              sql`${schema.works.createdAt} < ${cAt} OR (${schema.works.createdAt} = ${cAt} AND ${schema.works.id} < ${cId})`,
            );
          } catch {}
        }
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        const rows = await query
          .orderBy(sql`${schema.works.createdAt} DESC, ${schema.works.id} DESC`)
          .limit(limit + 1);
        let nextCursor: string | null = null;
        if (rows.length > limit) {
          const last: any = rows[limit - 1];
          nextCursor = Buffer.from(
            JSON.stringify({ createdAt: last.createdAt, id: last.id }),
            "utf8",
          ).toString("base64");
        }
        const items = rows.slice(0, limit);
        res.json({ items, nextCursor });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.get("/api/works/:id", async (req, res) => {
    try {
      const work = await storage.getWork(req.params.id);
      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }
      res.json(work);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/works", async (req, res) => {
    try {
      const validatedData = insertWorkSchema.parse(req.body);
      const work = await storage.createWork(validatedData);
      res.status(201).json(work);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/works/:id", async (req, res) => {
    try {
      const validatedData = updateWorkSchema.parse(req.body);
      const work = await storage.updateWork(req.params.id, validatedData);
      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }
      res.json(work);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/works/:id", async (req, res) => {
    try {
      const success = await storage.deleteWork(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Work not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // CONTRACTS
  // ============================================================================

  app.get("/api/contracts", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        workId: req.query.workId as string | undefined,
      };
      const contracts = await storage.getContracts(filters);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const validatedData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(validatedData);
      res.status(201).json(contract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const validatedData = updateContractSchema.parse(req.body);
      const contract = await storage.updateContract(
        req.params.id,
        validatedData,
      );
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContract(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // PAYMENTS
  // ============================================================================

  app.get("/api/payments", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        contractId: req.query.contractId as string | undefined,
      };
      const payments = await storage.getPayments(filters);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const validatedData = updatePaymentSchema.parse(req.body);
      const payment = await storage.updatePayment(req.params.id, validatedData);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const success = await storage.deletePayment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // REVIEWS
  // ============================================================================

  app.get("/api/reviews", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        workId: req.query.workId as string | undefined,
      };
      const reviews = await storage.getReviews(filters);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const review = await storage.getReview(req.params.id);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const validatedData = updateReviewSchema.parse(req.body);
      const review = await storage.updateReview(req.params.id, validatedData);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const success = await storage.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // REVIEW COUNCILS
  // ============================================================================

  app.get("/api/councils", async (req, res) => {
    try {
      const councils = await storage.getReviewCouncils();
      res.json(councils);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/councils/:id", async (req, res) => {
    try {
      const council = await storage.getReviewCouncil(req.params.id);
      if (!council) {
        return res.status(404).json({ error: "Council not found" });
      }
      res.json(council);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/councils", async (req, res) => {
    try {
      const validatedData = insertReviewCouncilSchema.parse(req.body);
      const council = await storage.createReviewCouncil(validatedData);
      res.status(201).json(council);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/councils/:id", async (req, res) => {
    try {
      const validatedData = updateReviewCouncilSchema.parse(req.body);
      const council = await storage.updateReviewCouncil(
        req.params.id,
        validatedData,
      );
      if (!council) {
        return res.status(404).json({ error: "Council not found" });
      }
      res.json(council);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/councils/:id", async (req, res) => {
    try {
      const success = await storage.deleteReviewCouncil(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Council not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EDITING TASKS
  // ============================================================================

  app.get("/api/editing-tasks", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        workId: req.query.workId as string | undefined,
      };
      const tasks = await storage.getEditingTasks(filters);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/editing-tasks/:id", async (req, res) => {
    try {
      const task = await storage.getEditingTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Editing task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/editing-tasks", async (req, res) => {
    try {
      const validatedData = insertEditingTaskSchema.parse(req.body);
      const task = await storage.createEditingTask(validatedData);
      res.status(201).json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/editing-tasks/:id", async (req, res) => {
    try {
      const validatedData = updateEditingTaskSchema.parse(req.body);
      const task = await storage.updateEditingTask(
        req.params.id,
        validatedData,
      );
      if (!task) {
        return res.status(404).json({ error: "Editing task not found" });
      }
      res.json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/editing-tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteEditingTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Editing task not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // ADMINISTRATIVE TASKS
  // ============================================================================

  app.get("/api/admin-tasks", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
      };
      const tasks = await storage.getAdminTasks(filters);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // INTEGRATIONS
  // ============================================================================

  app.get(
    "/api/integrations/mattermost/health",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      const cfg = getMattermostConfig();
      res.json(cfg);
    },
  );

  app.get(
    "/api/integrations/mattermost/config",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      const cfg = getMattermostConfig();
      res.json(cfg);
    },
  );

  app.post(
    "/api/integrations/mattermost/config",
    rateLimit({ windowMs: 60000, max: 20 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = z
          .object({
            webhookUrl: z.string().url().nullable().optional(),
          })
          .parse(req.body);
        setMattermostWebhook(body.webhookUrl ?? null);
        const cfg = getMattermostConfig();
        res.json(cfg);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/integrations/mattermost/test",
    rateLimit({ windowMs: 60000, max: 10 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = z
          .object({
            text: z.string().min(1),
            username: z.string().optional(),
            channel: z.string().optional(),
            icon_url: z.string().url().optional(),
          })
          .parse(req.body);
        if (!process.env.MATTERMOST_WEBHOOK_URL) {
          return res
            .status(501)
            .json({ error: "MATTERMOST_WEBHOOK_URL is not configured" });
        }
        await sendMattermost(body.text, {
          username: body.username,
          channel: body.channel,
          icon_url: body.icon_url,
        });
        res.json({ ok: true });
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.get("/api/admin-tasks/:id", async (req, res) => {
    try {
      const task = await storage.getAdminTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Admin task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin-tasks", async (req, res) => {
    try {
      const validatedData = insertAdministrativeTaskSchema.parse(req.body);
      const task = await storage.createAdminTask(validatedData);
      res.status(201).json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin-tasks/:id", async (req, res) => {
    try {
      const validatedData = updateAdministrativeTaskSchema.parse(req.body);
      const task = await storage.updateAdminTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Admin task not found" });
      }
      res.json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin-tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteAdminTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Admin task not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // TASK LISTS & TASKS (CLICKUP-LIKE)
  // ============================================================================

  app.get(
    "/api/task-lists",
    rateLimit({ windowMs: 60000, max: 120 }),
    async (req, res) => {
      try {
        const rows = await db
          .select()
          .from(schema.taskLists)
          .orderBy(sql`${schema.taskLists.createdAt} DESC`);
        res.json(rows);
      } catch (error: any) {
        if (error?.code === "42P01") {
          return res.json([]);
        }
        res.status(500).json({ error: error.message });
      }
    },
  );
  app.post(
    "/api/task-lists",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        const body = schema.insertTaskListSchema.parse(req.body);
        const [row] = await db
          .insert(schema.taskLists)
          .values({ ...body })
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.patch(
    "/api/task-lists/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        const body = schema.updateTaskListSchema.parse(req.body);
        const [row] = await db
          .update(schema.taskLists)
          .set({ ...body, updatedAt: new Date() })
          .where(eq(schema.taskLists.id, req.params.id))
          .returning();
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/task-lists/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        await db
          .delete(schema.taskLists)
          .where(eq(schema.taskLists.id, req.params.id));
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.get(
    "/api/tasks.cursor",
    rateLimit({ windowMs: 60000, max: 120 }),
    async (req, res) => {
      try {
        const listId = req.query.listId as string | undefined;
        const status = req.query.status as string | undefined;
        const priority = req.query.priority as string | undefined;
        const assigneeId = req.query.assigneeId as string | undefined;
        const search = req.query.search as string | undefined;
        const limitParam = req.query.limit as string | undefined;
        const cursorParam = req.query.cursor as string | undefined;
        const limit = Math.min(
          Math.max(parseInt(limitParam || "20", 10), 1),
          100,
        );
        let query = db.select().from(schema.tasks).$dynamic();
        const conditions: any[] = [];
        if (listId) conditions.push(eq(schema.tasks.listId, listId));
        if (status) conditions.push(eq(schema.tasks.status, status as any));
        if (priority)
          conditions.push(eq(schema.tasks.priority, priority as any));
        if (search)
          conditions.push(
            sql`(${schema.tasks.name} ILIKE ${`%${search}%`} OR ${schema.tasks.description} ILIKE ${`%${search}%`})`,
          );
        if (conditions.length > 0) query = query.where(and(...conditions));
        if (assigneeId) {
          query = query.where(
            sql`${schema.tasks.id} IN (SELECT task_id FROM task_assignees WHERE user_id = ${assigneeId})`,
          );
        }
        if (cursorParam) {
          try {
            const decoded = JSON.parse(
              Buffer.from(cursorParam, "base64").toString("utf8"),
            ) as { createdAt: string; id: string };
            const cAt = new Date(decoded.createdAt);
            const cId = decoded.id;
            query = query.where(
              sql`${schema.tasks.createdAt} < ${cAt} OR (${schema.tasks.createdAt} = ${cAt} AND ${schema.tasks.id} < ${cId})`,
            );
          } catch {}
        }
        const rows = await query
          .orderBy(sql`${schema.tasks.createdAt} DESC, ${schema.tasks.id} DESC`)
          .limit(limit + 1);
        let nextCursor: string | null = null;
        if (rows.length > limit) {
          const last: any = rows[limit - 1];
          nextCursor = Buffer.from(
            JSON.stringify({ createdAt: last.createdAt, id: last.id }),
            "utf8",
          ).toString("base64");
        }
        const items = rows.slice(0, limit);
        res.json({ items, nextCursor });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Board columns (group by status), trả 20 item mỗi cột (mặc định)
  app.get(
    "/api/tasks.board",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        const listId = req.query.listId as string | undefined;
        const assigneeId = req.query.assigneeId as string | undefined;
        const limitParam = req.query.limit as string | undefined;
        const perCol = Math.min(
          Math.max(parseInt(limitParam || "20", 10), 1),
          100,
        );
        const statuses = [
          "pending",
          "in_progress",
          "completed",
          "cancelled",
        ] as const;
        const result: Record<string, any> = {};
        for (const st of statuses) {
          let q = db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.status, st as any))
            .$dynamic();
          if (listId) q = q.where(eq(schema.tasks.listId, listId));
          if (assigneeId) {
            q = q.where(
              sql`${schema.tasks.id} IN (SELECT task_id FROM task_assignees WHERE user_id = ${assigneeId})`,
            );
          }
          const items = await q
            .orderBy(sql`${schema.tasks.updatedAt} DESC`)
            .limit(perCol);
          const [{ count }] = await db.execute(
            sql`SELECT COUNT(*)::int as count FROM tasks WHERE status = ${st} ${listId ? sql`AND list_id = ${listId}` : sql``} ${assigneeId ? sql`AND id IN (SELECT task_id FROM task_assignees WHERE user_id = ${assigneeId})` : sql``}`,
          );
          result[st] = { count, items };
        }
        res.json({ columns: result });
      } catch (error: any) {
        if (error?.code === "42P01") {
          return res.json({
            columns: {
              pending: { count: 0, items: [] },
              in_progress: { count: 0, items: [] },
              completed: { count: 0, items: [] },
              cancelled: { count: 0, items: [] },
            },
          });
        }
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Get task assignees (user IDs)
  app.get(
    "/api/tasks/:id/assignees",
    rateLimit({ windowMs: 60000, max: 120 }),
    async (req, res) => {
      try {
        const rows = await db
          .select()
          .from(schema.taskAssignees)
          .where(eq(schema.taskAssignees.taskId, req.params.id));
        res.json(rows.map((r) => ({ userId: r.userId })));
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // Drag-drop move (đổi status/parent/list)
  app.post(
    "/api/tasks/board-move",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = z
          .object({
            taskId: z.string().min(1),
            toStatus: z
              .enum(["pending", "in_progress", "completed", "cancelled"])
              .optional(),
            toListId: z.string().optional(),
            newParentId: z.string().nullable().optional(),
          })
          .parse(req.body);
        const updates: any = { updatedAt: new Date() };
        if (body.toStatus) updates.status = body.toStatus;
        if (body.toListId !== undefined) updates.listId = body.toListId;
        if (body.newParentId !== undefined) updates.parentId = body.newParentId;
        const [row] = await db
          .update(schema.tasks)
          .set(updates)
          .where(eq(schema.tasks.id, body.taskId))
          .returning();
        if (!row) return res.status(404).json({ error: "Task not found" });
        res.json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/tasks",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = schema.insertTaskSchema.parse(req.body);
        const [row] = await db
          .insert(schema.tasks)
          .values({ ...body })
          .returning();
        await db.insert(schema.workflowAuditLog).values({
          workId: body.relatedWorkId || null,
          entityType: "task",
          entityId: row.id,
          action: "create_task",
          fromStatus: null,
          toStatus: row.status,
          performedById: body.createdById || null,
          metadata: null,
        });
        try {
          const title = row.name || row.id;
          const link = buildBoardUrl(req, row.listId || undefined);
          await sendMattermost(
            `#### 🚀 Tạo nhiệm vụ mới\n**${title}** · \`${row.status}\`\n[↗️ Mở Board](${link})`,
          );
        } catch {}
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.patch(
    "/api/tasks/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = schema.updateTaskSchema.parse(req.body);
        const [oldTask] = await db
          .select()
          .from(schema.tasks)
          .where(eq(schema.tasks.id, req.params.id));
        const [row] = await db
          .update(schema.tasks)
          .set({ ...body, updatedAt: new Date() })
          .where(eq(schema.tasks.id, req.params.id))
          .returning();
        if (!row) return res.status(404).json({ error: "Not found" });
        if (body.status && oldTask) {
          await db.insert(schema.workflowAuditLog).values({
            workId: row.relatedWorkId || null,
            entityType: "task",
            entityId: row.id,
            action: "status_change",
            fromStatus: oldTask.status,
            toStatus: row.status,
            performedById: body.createdById || null,
            metadata: null,
          });
          try {
            const title = row.name || row.id;
            const link = buildBoardUrl(req, row.listId || undefined);
            await sendMattermost(
              `#### 🔄 Cập nhật trạng thái\n**${title}**: \`${oldTask.status}\` → \`${row.status}\`\n[↗️ Mở Board](${link})`,
            );
          } catch {}
        }
        res.json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/tasks/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky"]),
    async (req, res) => {
      try {
        await db.delete(schema.tasks).where(eq(schema.tasks.id, req.params.id));
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/tasks/:id/assign",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const userId = z.string().min(1).parse(req.body.userId);
        const [row] = await db
          .insert(schema.taskAssignees)
          .values({ taskId: req.params.id, userId })
          .returning();
        try {
          const [task] = await db
            .select()
            .from(schema.tasks)
            .where(eq(schema.tasks.id, req.params.id));
          const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, userId));
          const title = task?.name || req.params.id;
          const assigneeName =
            (user as any)?.fullName ||
            (user as any)?.username ||
            (user as any)?.email ||
            userId;
          const link = buildBoardUrl(req, task?.listId || undefined);
          await sendMattermost(
            `#### 👤 Gán người phụ trách\n**${title}** ← **${assigneeName}**\n[↗️ Mở Board](${link})`,
          );
        } catch {}
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/tasks/:id/assign/:userId",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        await db
          .delete(schema.taskAssignees)
          .where(
            sql`${schema.taskAssignees.taskId} = ${req.params.id} AND ${schema.taskAssignees.userId} = ${req.params.userId}`,
          );
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/tasks/:id/watch",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole([
      "chu_nhiem",
      "truong_ban_thu_ky",
      "thu_ky_hop_phan",
      "dich_gia",
      "bien_tap_vien",
      "ky_thuat_vien",
      "van_phong",
      "van_thu",
      "ke_toan",
      "pho_chu_nhiem",
      "chuyen_gia",
    ]),
    async (req, res) => {
      try {
        const userId = z.string().min(1).parse(req.body.userId);
        const [row] = await db
          .insert(schema.taskWatchers)
          .values({ taskId: req.params.id, userId })
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/tasks/:id/watch/:userId",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole([
      "chu_nhiem",
      "truong_ban_thu_ky",
      "thu_ky_hop_phan",
      "dich_gia",
      "bien_tap_vien",
      "ky_thuat_vien",
      "van_phong",
      "van_thu",
      "ke_toan",
      "pho_chu_nhiem",
      "chuyen_gia",
    ]),
    async (req, res) => {
      try {
        await db
          .delete(schema.taskWatchers)
          .where(
            sql`${schema.taskWatchers.taskId} = ${req.params.id} AND ${schema.taskWatchers.userId} = ${req.params.userId}`,
          );
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.get(
    "/api/tasks/:id/comments",
    rateLimit({ windowMs: 60000, max: 120 }),
    requireRole([
      "chu_nhiem",
      "truong_ban_thu_ky",
      "thu_ky_hop_phan",
      "dich_gia",
      "bien_tap_vien",
      "ky_thuat_vien",
      "van_phong",
      "van_thu",
      "ke_toan",
      "pho_chu_nhiem",
      "chuyen_gia",
    ]),
    async (req, res) => {
      try {
        const rows = await db
          .select()
          .from(schema.taskComments)
          .where(eq(schema.taskComments.taskId, req.params.id))
          .orderBy(sql`${schema.taskComments.createdAt} ASC`);
        res.json(rows);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/tasks/:id/comments",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole([
      "chu_nhiem",
      "truong_ban_thu_ky",
      "thu_ky_hop_phan",
      "dich_gia",
      "bien_tap_vien",
      "ky_thuat_vien",
      "van_phong",
      "van_thu",
      "ke_toan",
      "pho_chu_nhiem",
      "chuyen_gia",
    ]),
    async (req, res) => {
      try {
        const body = schema.insertTaskCommentSchema.parse({
          ...req.body,
          taskId: req.params.id,
        });
        const [row] = await db
          .insert(schema.taskComments)
          .values(body)
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/tasks/:id/dependencies",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = schema.insertTaskDependencySchema.parse({
          ...req.body,
          taskId: req.params.id,
        });
        const [row] = await db
          .insert(schema.taskDependencies)
          .values(body)
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/tasks/:id/dependencies/:dependsOnId",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        await db
          .delete(schema.taskDependencies)
          .where(
            sql`${schema.taskDependencies.taskId} = ${req.params.id} AND ${schema.taskDependencies.dependsOnTaskId} = ${req.params.dependsOnId}`,
          );
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.get(
    "/api/task-views",
    rateLimit({ windowMs: 60000, max: 120 }),
    async (req, res) => {
      try {
        const ownerId = req.query.ownerId as string | undefined;
        let q = db.select().from(schema.savedViews).$dynamic();
        if (ownerId) q = q.where(eq(schema.savedViews.ownerId, ownerId));
        const rows = await q.orderBy(sql`${schema.savedViews.createdAt} DESC`);
        res.json(rows);
      } catch (error: any) {
        if (error?.code === "42P01") {
          // Table missing: return empty for graceful degradation
          return res.json([]);
        }
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/task-views",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = schema.insertSavedViewSchema.parse(req.body);
        const [row] = await db
          .insert(schema.savedViews)
          .values(body)
          .returning();
        res.status(201).json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.patch(
    "/api/task-views/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        const body = schema.updateSavedViewSchema.parse(req.body);
        const [row] = await db
          .update(schema.savedViews)
          .set({ ...body, updatedAt: new Date() })
          .where(eq(schema.savedViews.id, req.params.id))
          .returning();
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(row);
      } catch (error: any) {
        if (error instanceof z.ZodError)
          return res.status(400).json({ error: error.errors });
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/task-views/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    requireRole(["chu_nhiem", "truong_ban_thu_ky", "thu_ky_hop_phan"]),
    async (req, res) => {
      try {
        await db
          .delete(schema.savedViews)
          .where(eq(schema.savedViews.id, req.params.id));
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // ============================================================================
  // CONTRACT TEMPLATES
  // ============================================================================

  app.get("/api/v1/contract-templates", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        translationPart: req.query.translation_part as string | undefined,
      };
      const templates = await storage.getContractTemplates(filters);
      res.json({ count: templates.length, results: templates });
    } catch (error: any) {
      console.error("Error fetching contract templates:", error);
      res.status(500).json({
        error: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  app.get("/api/v1/contract-templates/:id", async (req, res) => {
    try {
      const template = await storage.getContractTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post(
    "/api/v1/contract-templates",
    rateLimit({ windowMs: 60000, max: 30 }),
    uploadMiddleware(),
    async (req: any, res) => {
      try {
        const body = req.body;
        const files = req.files;

        const templateData: any = {
          name: body.name,
          description: body.description || null,
          type: body.type,
          translationPart: body.translation_part || null,
          isDefault: body.is_default === true || body.is_default === "true",
        };

        if (body.type === "rich_text") {
          templateData.content = body.content || "";
        } else if (body.type === "word_file") {
          if (files?.file && files.file.length > 0) {
            const uploadedFile = files.file[0];
            // Store relative path from project root
            const relativePath = path.relative(
              process.cwd(),
              uploadedFile.filepath,
            );
            templateData.fileUrl = `/${relativePath.replace(/\\/g, "/")}`;
            templateData.fileName =
              uploadedFile.originalFilename || "template.docx";
          } else if (body.file_url) {
            templateData.fileUrl = body.file_url;
            templateData.fileName = body.file_name || "template.docx";
          }
        }

        const validatedData = insertContractTemplateSchema.parse(templateData);
        const template = await storage.createContractTemplate(validatedData);
        res.status(201).json(template);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.patch(
    "/api/v1/contract-templates/:id",
    rateLimit({ windowMs: 60000, max: 30 }),
    uploadMiddleware(),
    async (req: any, res) => {
      try {
        const body = req.body;
        const files = req.files;

        const templateData: any = {};
        if (body.name) templateData.name = body.name;
        if (body.description !== undefined)
          templateData.description = body.description;
        if (body.type) templateData.type = body.type;
        if (body.translation_part !== undefined)
          templateData.translationPart = body.translation_part;
        if (body.is_default !== undefined)
          templateData.isDefault =
            body.is_default === true || body.is_default === "true";

        if (body.type === "rich_text" && body.content !== undefined) {
          templateData.content = body.content;
        } else if (body.type === "word_file") {
          if (files?.file && files.file.length > 0) {
            const uploadedFile = files.file[0];
            // Delete old file if exists
            const oldTemplate = await storage.getContractTemplate(
              req.params.id,
            );
            if (oldTemplate?.fileUrl) {
              try {
                const oldFilePath = path.join(
                  process.cwd(),
                  oldTemplate.fileUrl.replace(/^\//, ""),
                );
                await fs.unlink(oldFilePath);
              } catch (err) {
                // Ignore if file doesn't exist
              }
            }
            // Store relative path from project root
            const relativePath = path.relative(
              process.cwd(),
              uploadedFile.filepath,
            );
            templateData.fileUrl = `/${relativePath.replace(/\\/g, "/")}`;
            templateData.fileName =
              uploadedFile.originalFilename || "template.docx";
          } else if (body.file_url) {
            templateData.fileUrl = body.file_url;
            templateData.fileName = body.file_name || "template.docx";
          }
        }

        const validatedData = updateContractTemplateSchema.parse(templateData);
        const template = await storage.updateContractTemplate(
          req.params.id,
          validatedData,
        );
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        res.json(template);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.delete(
    "/api/v1/contract-templates/:id",
    rateLimit({ windowMs: 60000, max: 60 }),
    async (req, res) => {
      try {
        // Get template to delete file if exists
        const template = await storage.getContractTemplate(req.params.id);
        if (template?.fileUrl) {
          try {
            const filePath = path.join(
              process.cwd(),
              template.fileUrl.replace(/^\//, ""),
            );
            await fs.unlink(filePath);
          } catch (err) {
            // Ignore if file doesn't exist
          }
        }

        const success = await storage.deleteContractTemplate(req.params.id);
        if (!success) {
          return res.status(404).json({ error: "Template not found" });
        }
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  app.post(
    "/api/v1/contract-templates/:id/generate",
    rateLimit({ windowMs: 60000, max: 10 }),
    async (req, res) => {
      try {
        const template = await storage.getContractTemplate(req.params.id);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }

        const { contract_data, work, translator } = req.body;

        const lockKey = `generate:${req.params.id}:${contract_data?.contract_number || "default"}`;
        const ok = acquireLock(lockKey, 60000);
        if (!ok) {
          return res
            .status(429)
            .json({ error: "A generation job is already running" });
        }
        if (template.type === "rich_text") {
          // Generate Word from HTML content
          const { mergeTemplateContent } =
            await import("../lib/contractTemplateMerge");
          const mergedContent = mergeTemplateContent(
            template.content || "",
            contract_data,
            work,
            translator,
          );

          // TODO: Convert HTML to Word document using html-docx-js or similar
          // For now, return HTML content
          res.setHeader("Content-Type", "text/html");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="Hop-dong-${contract_data.contract_number || "dich-thuat"}.html"`,
          );
          res.send(mergedContent);
          releaseLock(lockKey);
        } else if (template.type === "word_file" && template.fileUrl) {
          // Merge data into Word template using docxtemplater
          try {
            const filePath = path.join(
              process.cwd(),
              template.fileUrl.replace(/^\//, ""),
            );

            // Check if file exists
            try {
              await fs.access(filePath);
            } catch {
              releaseLock(lockKey);
              return res.status(404).json({ error: "Template file not found" });
            }

            const { mergeWordTemplate } =
              await import("../lib/wordTemplateMerge");
            const mergedBuffer = await mergeWordTemplate(
              filePath,
              contract_data,
              work,
              translator,
            );

            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            );
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="Hop-dong-${contract_data.contract_number || "dich-thuat"}.docx"`,
            );
            res.send(mergedBuffer);
            releaseLock(lockKey);
          } catch (fileError: any) {
            console.error("Error merging Word template:", fileError);
            releaseLock(lockKey);
            res
              .status(500)
              .json({ error: fileError.message || "Failed to merge template" });
          }
        } else {
          releaseLock(lockKey);
          res.status(400).json({ error: "Template has no content or file" });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },
  );

  // ============================================================================
  // AI ROUTES
  // ============================================================================

  registerAIRoutes(app);
  registerWorkflowRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
