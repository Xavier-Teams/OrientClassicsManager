import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  boolean,
  jsonb,
  pgEnum,
  index,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "chu_nhiem",              // Chủ nhiệm
  "pho_chu_nhiem",          // Phó Chủ nhiệm
  "truong_ban_thu_ky",      // Trưởng ban Thư ký
  "thu_ky_hop_phan",        // Thư ký hợp phần
  "van_phong",              // Văn phòng
  "ke_toan",                // Kế toán
  "van_thu",                // Văn thư
  "bien_tap_vien",          // Biên tập viên (BTV)
  "ky_thuat_vien",          // Kỹ thuật viên (KTV)
  "dich_gia",               // Dịch giả
  "chuyen_gia",             // Chuyên gia
]);

export const translationStatusEnum = pgEnum("translation_status", [
  "draft",                  // Dự kiến
  "approved",               // Đã duyệt
  "translator_assigned",    // Đã gán dịch giả
  "trial_translation",      // Dịch thử
  "trial_reviewed",         // Đã thẩm định dịch thử
  "in_progress",            // Đang dịch
  "progress_checked",       // Đã kiểm tra tiến độ (KTTĐ)
  "completed",              // Hoàn thành dịch
  "cancelled",              // Đã hủy
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "draft",                  // Dự thảo
  "pending_approval",       // Chờ phê duyệt
  "signed",                 // Đã ký
  "active",                 // Đang thực hiện
  "completed",              // Hoàn thành
  "terminated",             // Chấm dứt
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",                // Chờ thẩm định
  "in_progress",            // Đang thẩm định
  "completed",              // Đã hoàn thành
  "approved",               // Đã phê duyệt
  "rejected",               // Từ chối
]);

export const editingStatusEnum = pgEnum("editing_status", [
  "pending",                // Chờ biên tập
  "proofreading",           // Hiệu đính
  "editing_draft",          // Biên tập thô
  "proof_1",                // Bông 1
  "proof_2",                // Bông 2
  "proof_3",                // Bông 3
  "proof_4",                // Bông 4
  "final_approval",         // Duyệt cuối
  "completed",              // Hoàn thành
]);

export const publishingStatusEnum = pgEnum("publishing_status", [
  "pending",                // Chờ xuất bản
  "license_pending",        // Chờ giấy phép
  "licensed",               // Đã có giấy phép
  "in_production",          // Đang in
  "published",              // Đã xuất bản
]);

export const priorityEnum = pgEnum("priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",                // Chờ thanh toán
  "processing",             // Đang xử lý
  "paid",                   // Đã thanh toán
  "rejected",               // Từ chối
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "advance_1",              // Tạm ứng lần 1
  "advance_2",              // Tạm ứng lần 2
  "final_settlement",       // Quyết toán
  "bonus",                  // Thưởng
  "other",                  // Khác
]);

export const reviewTypeEnum = pgEnum("review_type", [
  "trial_review",           // Thẩm định dịch thử
  "progress_check",         // Kiểm tra tiến độ (KTTĐ)
  "expert_review",          // Thẩm định chuyên gia (TĐCCG)
  "project_acceptance",     // Nghiệm thu Dự án (NTCDA)
  "proofreading_review",    // Đánh giá hiệu đính
]);

export const documentTypeEnum = pgEnum("document_type", [
  "source",                 // Bản nền
  "translation",            // Bản dịch
  "trial_translation",      // Bản dịch thử
  "review",                 // Phiếu thẩm định
  "contract",               // Hợp đồng
  "payment",                // Chứng từ thanh toán
  "editing",                // File biên tập
  "proof",                  // Bông (proof)
  "form",                   // Biểu mẫu
  "other",                  // Khác
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",                // Chờ xử lý
  "in_progress",            // Đang xử lý
  "completed",              // Hoàn thành
  "cancelled",              // Đã hủy
]);

// ============================================================================
// USERS & ROLES
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("thu_ky_hop_phan"),
  avatar: text("avatar"),
  phone: text("phone"),
  bio: text("bio"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username),
  roleIdx: index("role_idx").on(table.role),
}));

// ============================================================================
// TRANSLATION WORKS (Tác phẩm dịch thuật)
// ============================================================================

export const works = pgTable("works", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  author: text("author"),
  sourceLanguage: text("source_language").notNull().default("Hán văn"),
  targetLanguage: text("target_language").notNull().default("Tiếng Việt"),
  pageCount: integer("page_count").notNull().default(0),
  wordCount: integer("word_count").notNull().default(0),
  description: text("description"),
  translationPartId: varchar("translation_part_id"),
  translatorId: varchar("translator_id").references(() => users.id),
  
  // Status tracking per phase
  translationStatus: translationStatusEnum("translation_status").notNull().default("draft"),
  reviewStatus: reviewStatusEnum("review_status"),
  editingStatus: editingStatusEnum("editing_status"),
  publishingStatus: publishingStatusEnum("publishing_status"),
  
  priority: priorityEnum("priority").notNull().default("normal"),
  translationProgress: integer("translation_progress").notNull().default(0),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  active: boolean("active").notNull().default(true),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  translatorIdx: index("work_translator_idx").on(table.translatorId),
  translationStatusIdx: index("work_translation_status_idx").on(table.translationStatus),
  createdAtIdx: index("work_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// CONTRACTS (Hợp đồng)
// ============================================================================

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: text("contract_number").notNull().unique(),
  workId: varchar("work_id").notNull().references(() => works.id),
  translatorId: varchar("translator_id").notNull().references(() => users.id),
  totalAmount: integer("total_amount").notNull(),
  signedDate: timestamp("signed_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: contractStatusEnum("status").notNull().default("draft"),
  terms: text("terms"),
  notes: text("notes"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  workIdx: index("contract_work_idx").on(table.workId),
  statusIdx: index("contract_status_idx").on(table.status),
}));

// ============================================================================
// PAYMENT MILESTONES (Mốc thanh toán)
// ============================================================================

export const paymentMilestones = pgTable("payment_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  sequenceNumber: integer("sequence_number").notNull(),
  type: paymentTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  percentage: integer("percentage"),
  dueDate: timestamp("due_date"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  contractIdx: index("milestone_contract_idx").on(table.contractId),
}));

// ============================================================================
// PAYMENTS (Thanh toán)
// ============================================================================

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  milestoneId: varchar("milestone_id").references(() => paymentMilestones.id),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  type: paymentTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  approvedDate: timestamp("approved_date"),
  approvedById: varchar("approved_by_id").references(() => users.id),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  contractIdx: index("payment_contract_idx").on(table.contractId),
  statusIdx: index("payment_status_idx").on(table.status),
}));

// ============================================================================
// REVIEW COUNCILS (Hội đồng/Tổ thẩm định)
// ============================================================================

export const reviewCouncils = pgTable("review_councils", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: reviewTypeEnum("type").notNull(),
  description: text("description"),
  establishedDate: timestamp("established_date").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// COUNCIL MEMBERSHIPS (Thành viên hội đồng)
// ============================================================================

export const councilMemberships = pgTable("council_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  councilId: varchar("council_id").notNull().references(() => reviewCouncils.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  joinedDate: timestamp("joined_date").notNull().defaultNow(),
  leftDate: timestamp("left_date"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  councilIdx: index("membership_council_idx").on(table.councilId),
  userIdx: index("membership_user_idx").on(table.userId),
}));

// ============================================================================
// REVIEWS & EVALUATIONS (Thẩm định & Đánh giá)
// ============================================================================

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workId: varchar("work_id").notNull().references(() => works.id),
  councilId: varchar("council_id").references(() => reviewCouncils.id),
  type: reviewTypeEnum("type").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  overallRating: integer("overall_rating"),
  decision: text("decision"),
  recommendations: text("recommendations"),
  meetingMinutes: text("meeting_minutes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  workIdx: index("review_work_idx").on(table.workId),
  statusIdx: index("review_status_idx").on(table.status),
}));

// ============================================================================
// REVIEW EVALUATIONS (Đánh giá từ từng thành viên)
// ============================================================================

export const reviewEvaluations = pgTable("review_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => reviews.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  rating: integer("rating"),
  comments: text("comments"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  recommendations: text("recommendations"),
  submittedDate: timestamp("submitted_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  reviewIdx: index("evaluation_review_idx").on(table.reviewId),
}));

// ============================================================================
// EDITING TASKS (Nhiệm vụ biên tập)
// ============================================================================

export const editingTasks = pgTable("editing_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workId: varchar("work_id").notNull().references(() => works.id),
  stepName: text("step_name").notNull(),
  assignedRole: text("assigned_role"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  status: taskStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  workIdx: index("editing_task_work_idx").on(table.workId),
  assignedToIdx: index("editing_task_assigned_idx").on(table.assignedToId),
}));

// ============================================================================
// ADMINISTRATIVE TASKS (Nhiệm vụ hành chính)
// ============================================================================

export const administrativeTasks = pgTable("administrative_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: priorityEnum("priority").notNull().default("normal"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  assignedToIdx: index("admin_task_assigned_idx").on(table.assignedToId),
  statusIdx: index("admin_task_status_idx").on(table.status),
}));

// ============================================================================
// FORM TEMPLATES (Biểu mẫu)
// ============================================================================

export const formTemplates = pgTable("form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  templateFileUrl: text("template_file_url"),
  version: text("version").notNull().default("1.0"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// DOCUMENTS (Tài liệu)
// ============================================================================

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workId: varchar("work_id").references(() => works.id),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  version: integer("version").notNull().default(1),
  previousVersionId: varchar("previous_version_id").references((): any => documents.id),
  uploadedById: varchar("uploaded_by_id").references(() => users.id),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  workIdx: index("document_work_idx").on(table.workId),
  typeIdx: index("document_type_idx").on(table.type),
}));

// ============================================================================
// WORKFLOW AUDIT LOG (Lịch sử workflow)
// ============================================================================

export const workflowAuditLog = pgTable("workflow_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workId: varchar("work_id").notNull().references(() => works.id),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  performedById: varchar("performed_by_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  workIdx: index("audit_work_idx").on(table.workId),
  createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// AI INTERACTIONS (Tương tác AI)
// ============================================================================

export const aiInteractions = pgTable("ai_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  workId: varchar("work_id").references(() => works.id),
  interactionType: text("interaction_type").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  model: text("model"),
  tokensUsed: integer("tokens_used"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("ai_user_idx").on(table.userId),
  workIdx: index("ai_work_idx").on(table.workId),
  createdAtIdx: index("ai_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  worksAsTranslator: many(works, { relationName: "translator" }),
  worksCreated: many(works, { relationName: "creator" }),
  contractsAsTranslator: many(contracts, { relationName: "contractTranslator" }),
  contractsCreated: many(contracts, { relationName: "contractCreator" }),
  paymentsApproved: many(payments, { relationName: "paymentApprover" }),
  councilMemberships: many(councilMemberships, { relationName: "memberUser" }),
  reviewEvaluations: many(reviewEvaluations, { relationName: "evaluator" }),
  editingTasksAssigned: many(editingTasks, { relationName: "taskAssignee" }),
  adminTasksCreated: many(administrativeTasks, { relationName: "taskCreator" }),
  adminTasksAssigned: many(administrativeTasks, { relationName: "taskAssignee" }),
  documents: many(documents, { relationName: "documentUploader" }),
  workflowActions: many(workflowAuditLog, { relationName: "performer" }),
  aiInteractions: many(aiInteractions, { relationName: "aiUser" }),
}));

export const worksRelations = relations(works, ({ one, many }) => ({
  translator: one(users, {
    fields: [works.translatorId],
    references: [users.id],
    relationName: "translator",
  }),
  creator: one(users, {
    fields: [works.createdById],
    references: [users.id],
    relationName: "creator",
  }),
  contracts: many(contracts, { relationName: "workContracts" }),
  documents: many(documents, { relationName: "workDocuments" }),
  reviews: many(reviews, { relationName: "workReviews" }),
  editingTasks: many(editingTasks, { relationName: "workEditingTasks" }),
  workflowLogs: many(workflowAuditLog, { relationName: "workAudit" }),
  aiInteractions: many(aiInteractions, { relationName: "workAI" }),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  work: one(works, {
    fields: [contracts.workId],
    references: [works.id],
    relationName: "workContracts",
  }),
  translator: one(users, {
    fields: [contracts.translatorId],
    references: [users.id],
    relationName: "contractTranslator",
  }),
  creator: one(users, {
    fields: [contracts.createdById],
    references: [users.id],
    relationName: "contractCreator",
  }),
  paymentMilestones: many(paymentMilestones, { relationName: "contractMilestones" }),
  payments: many(payments, { relationName: "contractPayments" }),
}));

export const paymentMilestonesRelations = relations(paymentMilestones, ({ one, many }) => ({
  contract: one(contracts, {
    fields: [paymentMilestones.contractId],
    references: [contracts.id],
    relationName: "contractMilestones",
  }),
  payments: many(payments, { relationName: "milestonePayments" }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  milestone: one(paymentMilestones, {
    fields: [payments.milestoneId],
    references: [paymentMilestones.id],
    relationName: "milestonePayments",
  }),
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
    relationName: "contractPayments",
  }),
  approver: one(users, {
    fields: [payments.approvedById],
    references: [users.id],
    relationName: "paymentApprover",
  }),
}));

export const reviewCouncilsRelations = relations(reviewCouncils, ({ many }) => ({
  memberships: many(councilMemberships, { relationName: "councilMembers" }),
  reviews: many(reviews, { relationName: "councilReviews" }),
}));

export const councilMembershipsRelations = relations(councilMemberships, ({ one }) => ({
  council: one(reviewCouncils, {
    fields: [councilMemberships.councilId],
    references: [reviewCouncils.id],
    relationName: "councilMembers",
  }),
  user: one(users, {
    fields: [councilMemberships.userId],
    references: [users.id],
    relationName: "memberUser",
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  work: one(works, {
    fields: [reviews.workId],
    references: [works.id],
    relationName: "workReviews",
  }),
  council: one(reviewCouncils, {
    fields: [reviews.councilId],
    references: [reviewCouncils.id],
    relationName: "councilReviews",
  }),
  evaluations: many(reviewEvaluations, { relationName: "reviewEvaluations" }),
}));

export const reviewEvaluationsRelations = relations(reviewEvaluations, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewEvaluations.reviewId],
    references: [reviews.id],
    relationName: "reviewEvaluations",
  }),
  reviewer: one(users, {
    fields: [reviewEvaluations.reviewerId],
    references: [users.id],
    relationName: "evaluator",
  }),
}));

export const editingTasksRelations = relations(editingTasks, ({ one }) => ({
  work: one(works, {
    fields: [editingTasks.workId],
    references: [works.id],
    relationName: "workEditingTasks",
  }),
  assignee: one(users, {
    fields: [editingTasks.assignedToId],
    references: [users.id],
    relationName: "taskAssignee",
  }),
}));

export const administrativeTasksRelations = relations(administrativeTasks, ({ one }) => ({
  assignee: one(users, {
    fields: [administrativeTasks.assignedToId],
    references: [users.id],
    relationName: "taskAssignee",
  }),
  creator: one(users, {
    fields: [administrativeTasks.createdById],
    references: [users.id],
    relationName: "taskCreator",
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  work: one(works, {
    fields: [documents.workId],
    references: [works.id],
    relationName: "workDocuments",
  }),
  uploader: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
    relationName: "documentUploader",
  }),
  previousVersion: one(documents, {
    fields: [documents.previousVersionId],
    references: [documents.id],
  }),
}));

export const workflowAuditLogRelations = relations(workflowAuditLog, ({ one }) => ({
  work: one(works, {
    fields: [workflowAuditLog.workId],
    references: [works.id],
    relationName: "workAudit",
  }),
  performer: one(users, {
    fields: [workflowAuditLog.performedById],
    references: [users.id],
    relationName: "performer",
  }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, {
    fields: [aiInteractions.userId],
    references: [users.id],
    relationName: "aiUser",
  }),
  work: one(works, {
    fields: [aiInteractions.workId],
    references: [works.id],
    relationName: "workAI",
  }),
}));

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// Users
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email().optional(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  fullName: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectUserSchema = createSelectSchema(users).omit({ password: true });

// Works
export const insertWorkSchema = createInsertSchema(works, {
  name: z.string().min(1),
  pageCount: z.number().int().min(0),
  wordCount: z.number().int().min(0),
  translationProgress: z.number().int().min(0).max(100),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectWorkSchema = createSelectSchema(works);

// Contracts
export const insertContractSchema = createInsertSchema(contracts, {
  contractNumber: z.string().min(1),
  totalAmount: z.number().int().min(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectContractSchema = createSelectSchema(contracts);

// Payment Milestones
export const insertPaymentMilestoneSchema = createInsertSchema(paymentMilestones, {
  amount: z.number().int().min(0),
  sequenceNumber: z.number().int().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPaymentMilestoneSchema = createSelectSchema(paymentMilestones);

// Payments
export const insertPaymentSchema = createInsertSchema(payments, {
  amount: z.number().int().min(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPaymentSchema = createSelectSchema(payments);

// Review Councils
export const insertReviewCouncilSchema = createInsertSchema(reviewCouncils, {
  name: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectReviewCouncilSchema = createSelectSchema(reviewCouncils);

// Council Memberships
export const insertCouncilMembershipSchema = createInsertSchema(councilMemberships).omit({ 
  id: true, 
  createdAt: true 
});

export const selectCouncilMembershipSchema = createSelectSchema(councilMemberships);

// Reviews
export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const selectReviewSchema = createSelectSchema(reviews);

// Review Evaluations
export const insertReviewEvaluationSchema = createInsertSchema(reviewEvaluations, {
  rating: z.number().int().min(1).max(5).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectReviewEvaluationSchema = createSelectSchema(reviewEvaluations);

// Editing Tasks
export const insertEditingTaskSchema = createInsertSchema(editingTasks).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const selectEditingTaskSchema = createSelectSchema(editingTasks);

// Administrative Tasks
export const insertAdministrativeTaskSchema = createInsertSchema(administrativeTasks, {
  title: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectAdministrativeTaskSchema = createSelectSchema(administrativeTasks);

// Form Templates
export const insertFormTemplateSchema = createInsertSchema(formTemplates, {
  name: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectFormTemplateSchema = createSelectSchema(formTemplates);

// Documents
export const insertDocumentSchema = createInsertSchema(documents, {
  name: z.string().min(1),
  fileUrl: z.string().url(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectDocumentSchema = createSelectSchema(documents);

// Workflow Audit Log
export const insertWorkflowAuditLogSchema = createInsertSchema(workflowAuditLog).omit({ 
  id: true, 
  createdAt: true 
});

export const selectWorkflowAuditLogSchema = createSelectSchema(workflowAuditLog);

// AI Interactions
export const insertAIInteractionSchema = createInsertSchema(aiInteractions).omit({ 
  id: true, 
  createdAt: true 
});

export const selectAIInteractionSchema = createSelectSchema(aiInteractions);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

export type Work = typeof works.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type PaymentMilestone = typeof paymentMilestones.$inferSelect;
export type InsertPaymentMilestone = z.infer<typeof insertPaymentMilestoneSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ReviewCouncil = typeof reviewCouncils.$inferSelect;
export type InsertReviewCouncil = z.infer<typeof insertReviewCouncilSchema>;

export type CouncilMembership = typeof councilMemberships.$inferSelect;
export type InsertCouncilMembership = z.infer<typeof insertCouncilMembershipSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ReviewEvaluation = typeof reviewEvaluations.$inferSelect;
export type InsertReviewEvaluation = z.infer<typeof insertReviewEvaluationSchema>;

export type EditingTask = typeof editingTasks.$inferSelect;
export type InsertEditingTask = z.infer<typeof insertEditingTaskSchema>;

export type AdministrativeTask = typeof administrativeTasks.$inferSelect;
export type InsertAdministrativeTask = z.infer<typeof insertAdministrativeTaskSchema>;

export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type WorkflowAuditLog = typeof workflowAuditLog.$inferSelect;
export type InsertWorkflowAuditLog = z.infer<typeof insertWorkflowAuditLogSchema>;

export type AIInteraction = typeof aiInteractions.$inferSelect;
export type InsertAIInteraction = z.infer<typeof insertAIInteractionSchema>;

// ============================================================================
// UPDATE/PATCH SCHEMAS (partial schemas for safe updates)
// ============================================================================

export const updateUserSchema = insertUserSchema.partial();
export const updateWorkSchema = insertWorkSchema.partial();
export const updateContractSchema = insertContractSchema.partial();
export const updatePaymentSchema = insertPaymentSchema.partial();
export const updateReviewSchema = insertReviewSchema.partial();
export const updateReviewCouncilSchema = insertReviewCouncilSchema.partial();
export const updateEditingTaskSchema = insertEditingTaskSchema.partial();
export const updateAdministrativeTaskSchema = insertAdministrativeTaskSchema.partial();
