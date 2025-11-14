import type {
  Work,
  User,
  Contract,
  Payment,
  PaymentMilestone,
  Review,
  ReviewCouncil,
  CouncilMembership,
  ReviewEvaluation,
  EditingTask,
  AdministrativeTask,
  FormTemplate,
  Document,
  WorkflowAuditLog,
  AIInteraction,
} from "@shared/schema";

// Extended types with relations
export interface WorkWithRelations extends Work {
  translator?: User;
  creator?: User;
  contract?: Contract;
  documents?: Document[];
  reviews?: Review[];
  editingTasks?: EditingTask[];
}

export interface ContractWithRelations extends Contract {
  work?: Work;
  translator?: User;
  creator?: User;
  paymentMilestones?: PaymentMilestone[];
  payments?: Payment[];
}

export interface ReviewWithRelations extends Review {
  work?: Work;
  council?: ReviewCouncil;
  evaluations?: ReviewEvaluation[];
}

export interface ReviewCouncilWithRelations extends ReviewCouncil {
  memberships?: CouncilMembershipWithRelations[];
  reviews?: Review[];
}

export interface CouncilMembershipWithRelations extends CouncilMembership {
  council?: ReviewCouncil;
  user?: User;
}

export interface UserWithRelations extends User {
  worksAsTranslator?: Work[];
  worksCreated?: Work[];
}

// Dashboard stats
export interface DashboardStats {
  totalWorks: number;
  inProgressWorks: number;
  completedWorks: number;
  activeContracts: number;
  pendingReviews: number;
  totalPayments: number;
  translators: number;
  editingTasks: number;
}

// Board view
export interface BoardColumn {
  id: string;
  title: string;
  status: string;
  works: WorkWithRelations[];
  count: number;
}

// Filter options
export interface WorkFilters {
  status?: string;
  priority?: string;
  translatorId?: string;
  search?: string;
}

// View mode
export type ViewMode = "board" | "list" | "timeline" | "calendar";
