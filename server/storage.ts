import { eq, and, desc, asc, ilike, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "./db";
import type {
  User,
  InsertUser,
  Work,
  InsertWork,
  Contract,
  InsertContract,
  Payment,
  InsertPayment,
  Review,
  InsertReview,
  ReviewCouncil,
  InsertReviewCouncil,
  EditingTask,
  InsertEditingTask,
  AdministrativeTask,
  InsertAdministrativeTask,
} from "@shared/schema";

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getWorks(filters?: {
    status?: string;
    priority?: string;
    translatorId?: string;
    search?: string;
  }): Promise<Work[]>;
  getWork(id: string): Promise<Work | undefined>;
  createWork(work: InsertWork): Promise<Work>;
  updateWork(id: string, work: Partial<InsertWork>): Promise<Work | undefined>;
  deleteWork(id: string): Promise<boolean>;

  getContracts(filters?: { status?: string; workId?: string }): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;

  getPayments(filters?: { status?: string; contractId?: string }): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  getReviews(filters?: { status?: string; workId?: string }): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;

  getReviewCouncils(): Promise<ReviewCouncil[]>;
  getReviewCouncil(id: string): Promise<ReviewCouncil | undefined>;
  createReviewCouncil(council: InsertReviewCouncil): Promise<ReviewCouncil>;
  updateReviewCouncil(id: string, council: Partial<InsertReviewCouncil>): Promise<ReviewCouncil | undefined>;
  deleteReviewCouncil(id: string): Promise<boolean>;

  getEditingTasks(filters?: { status?: string; workId?: string }): Promise<EditingTask[]>;
  getEditingTask(id: string): Promise<EditingTask | undefined>;
  createEditingTask(task: InsertEditingTask): Promise<EditingTask>;
  updateEditingTask(id: string, task: Partial<InsertEditingTask>): Promise<EditingTask | undefined>;
  deleteEditingTask(id: string): Promise<boolean>;

  getAdminTasks(filters?: { status?: string }): Promise<AdministrativeTask[]>;
  getAdminTask(id: string): Promise<AdministrativeTask | undefined>;
  createAdminTask(task: InsertAdministrativeTask): Promise<AdministrativeTask>;
  updateAdminTask(id: string, task: Partial<InsertAdministrativeTask>): Promise<AdministrativeTask | undefined>;
  deleteAdminTask(id: string): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getWorks(filters?: {
    status?: string;
    priority?: string;
    translatorId?: string;
    search?: string;
  }): Promise<Work[]> {
    let query = db.select().from(schema.works).$dynamic();

    const conditions: any[] = [];

    if (filters?.status) {
      conditions.push(eq(schema.works.translationStatus, filters.status as any));
    }
    if (filters?.priority) {
      conditions.push(eq(schema.works.priority, filters.priority as any));
    }
    if (filters?.translatorId) {
      conditions.push(eq(schema.works.translatorId, filters.translatorId));
    }
    if (filters?.search) {
      conditions.push(
        sql`(${schema.works.name} ILIKE ${`%${filters.search}%`} OR ${schema.works.author} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.works.createdAt));
  }

  async getWork(id: string): Promise<Work | undefined> {
    const [work] = await db.select().from(schema.works).where(eq(schema.works.id, id));
    return work;
  }

  async createWork(insertWork: InsertWork): Promise<Work> {
    const [work] = await db.insert(schema.works).values(insertWork).returning();
    return work;
  }

  async updateWork(id: string, workData: Partial<InsertWork>): Promise<Work | undefined> {
    const [work] = await db
      .update(schema.works)
      .set({ ...workData, updatedAt: new Date() })
      .where(eq(schema.works.id, id))
      .returning();
    return work;
  }

  async deleteWork(id: string): Promise<boolean> {
    const result = await db.delete(schema.works).where(eq(schema.works.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getContracts(filters?: { status?: string; workId?: string }): Promise<Contract[]> {
    let query = db.select().from(schema.contracts).$dynamic();

    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(schema.contracts.status, filters.status as any));
    }
    if (filters?.workId) {
      conditions.push(eq(schema.contracts.workId, filters.workId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.contracts.createdAt));
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(schema.contracts).where(eq(schema.contracts.id, id));
    return contract;
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(schema.contracts).values(insertContract).returning();
    return contract;
  }

  async updateContract(id: string, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const [contract] = await db
      .update(schema.contracts)
      .set({ ...contractData, updatedAt: new Date() })
      .where(eq(schema.contracts.id, id))
      .returning();
    return contract;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await db.delete(schema.contracts).where(eq(schema.contracts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPayments(filters?: { status?: string; contractId?: string }): Promise<Payment[]> {
    let query = db.select().from(schema.payments).$dynamic();

    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(schema.payments.status, filters.status as any));
    }
    if (filters?.contractId) {
      conditions.push(eq(schema.payments.contractId, filters.contractId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(schema.payments).where(eq(schema.payments.id, id));
    return payment;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(schema.payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(schema.payments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(schema.payments.id, id))
      .returning();
    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await db.delete(schema.payments).where(eq(schema.payments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getReviews(filters?: { status?: string; workId?: string }): Promise<Review[]> {
    let query = db.select().from(schema.reviews).$dynamic();

    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(schema.reviews.status, filters.status as any));
    }
    if (filters?.workId) {
      conditions.push(eq(schema.reviews.workId, filters.workId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.reviews.createdAt));
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(schema.reviews).where(eq(schema.reviews.id, id));
    return review;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(schema.reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: string, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(schema.reviews)
      .set({ ...reviewData, updatedAt: new Date() })
      .where(eq(schema.reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getReviewCouncils(): Promise<ReviewCouncil[]> {
    return db.select().from(schema.reviewCouncils).orderBy(desc(schema.reviewCouncils.createdAt));
  }

  async getReviewCouncil(id: string): Promise<ReviewCouncil | undefined> {
    const [council] = await db.select().from(schema.reviewCouncils).where(eq(schema.reviewCouncils.id, id));
    return council;
  }

  async createReviewCouncil(insertCouncil: InsertReviewCouncil): Promise<ReviewCouncil> {
    const [council] = await db.insert(schema.reviewCouncils).values(insertCouncil).returning();
    return council;
  }

  async updateReviewCouncil(id: string, councilData: Partial<InsertReviewCouncil>): Promise<ReviewCouncil | undefined> {
    const [council] = await db
      .update(schema.reviewCouncils)
      .set({ ...councilData, updatedAt: new Date() })
      .where(eq(schema.reviewCouncils.id, id))
      .returning();
    return council;
  }

  async deleteReviewCouncil(id: string): Promise<boolean> {
    const result = await db.delete(schema.reviewCouncils).where(eq(schema.reviewCouncils.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getEditingTasks(filters?: { status?: string; workId?: string }): Promise<EditingTask[]> {
    let query = db.select().from(schema.editingTasks).$dynamic();

    const conditions: any[] = [];
    if (filters?.status) {
      conditions.push(eq(schema.editingTasks.status, filters.status as any));
    }
    if (filters?.workId) {
      conditions.push(eq(schema.editingTasks.workId, filters.workId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(schema.editingTasks.createdAt));
  }

  async getEditingTask(id: string): Promise<EditingTask | undefined> {
    const [task] = await db.select().from(schema.editingTasks).where(eq(schema.editingTasks.id, id));
    return task;
  }

  async createEditingTask(insertTask: InsertEditingTask): Promise<EditingTask> {
    const [task] = await db.insert(schema.editingTasks).values(insertTask).returning();
    return task;
  }

  async updateEditingTask(id: string, taskData: Partial<InsertEditingTask>): Promise<EditingTask | undefined> {
    const [task] = await db
      .update(schema.editingTasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(schema.editingTasks.id, id))
      .returning();
    return task;
  }

  async deleteEditingTask(id: string): Promise<boolean> {
    const result = await db.delete(schema.editingTasks).where(eq(schema.editingTasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAdminTasks(filters?: { status?: string }): Promise<AdministrativeTask[]> {
    let query = db.select().from(schema.administrativeTasks).$dynamic();

    if (filters?.status) {
      query = query.where(eq(schema.administrativeTasks.status, filters.status as any));
    }

    return query.orderBy(desc(schema.administrativeTasks.createdAt));
  }

  async getAdminTask(id: string): Promise<AdministrativeTask | undefined> {
    const [task] = await db.select().from(schema.administrativeTasks).where(eq(schema.administrativeTasks.id, id));
    return task;
  }

  async createAdminTask(insertTask: InsertAdministrativeTask): Promise<AdministrativeTask> {
    const [task] = await db.insert(schema.administrativeTasks).values(insertTask).returning();
    return task;
  }

  async updateAdminTask(id: string, taskData: Partial<InsertAdministrativeTask>): Promise<AdministrativeTask | undefined> {
    const [task] = await db
      .update(schema.administrativeTasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(schema.administrativeTasks.id, id))
      .returning();
    return task;
  }

  async deleteAdminTask(id: string): Promise<boolean> {
    const result = await db.delete(schema.administrativeTasks).where(eq(schema.administrativeTasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new PostgresStorage();
