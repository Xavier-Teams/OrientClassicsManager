import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertWorkSchema,
  insertContractSchema,
  insertPaymentSchema,
  insertReviewSchema,
  insertReviewCouncilSchema,
  insertEditingTaskSchema,
  insertAdministrativeTaskSchema,
  updateUserSchema,
  updateWorkSchema,
  updateContractSchema,
  updatePaymentSchema,
  updateReviewSchema,
  updateReviewCouncilSchema,
  updateEditingTaskSchema,
  updateAdministrativeTaskSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const contract = await storage.updateContract(req.params.id, validatedData);
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
      const council = await storage.updateReviewCouncil(req.params.id, validatedData);
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
      const task = await storage.updateEditingTask(req.params.id, validatedData);
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

  const httpServer = createServer(app);

  return httpServer;
}
