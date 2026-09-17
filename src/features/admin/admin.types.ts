export type StaffRole = "super_admin" | "content_editor" | "support_agent" | "finance";

export type AdminPermission =
  | "overview"
  | "users_read"
  | "users_write"
  | "courses"
  | "billing"
  | "support"
  | "roles"
  | "audit"
  | "settings";

export type LearnerRow = {
  id: string;
  email: string;
  displayName: string | null;
  learningLevel: string | null;
  createdAt: string;
  waitlistStatus: "joined" | "unsubscribed" | null;
};

export type LearnerDetail = LearnerRow & {
  notes: { id: number; body: string; createdAt: string; authorId: string }[];
};

export type AdminOverview = {
  accounts: number | null;
  joinedWaitlist: number | null;
  pageViews: number | null;
};

export type StaffMember = {
  userId: string;
  email: string;
  role: StaffRole;
  assignedBy: string | null;
  createdAt: string;
};

export type LessonPublicationUpdate = {
  lessonId: string;
  published: boolean;
};

export type ModuleLessonOrderUpdate = {
  moduleId: string;
  lessonOrder: string[];
};

export type SupportTicketStatus = "open" | "in_progress" | "resolved";

export type SupportTicketMessage = {
  id: number;
  isStaff: boolean;
  body: string;
  createdAt: string;
};

export type SupportTicketRow = {
  id: number;
  subject: string;
  status: SupportTicketStatus;
  learnerId: string;
  learnerEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketDetail = SupportTicketRow & {
  messages: SupportTicketMessage[];
};

export type BillingPlan = {
  id: string;
  name: string;
  billingInterval: "monthly" | "annual";
  priceCents: number | null;
  currency: string;
};

export type SubscriptionStatus = "active" | "canceled";

export type SubscriptionRow = {
  id: number;
  learnerId: string;
  learnerEmail: string;
  planId: string;
  status: SubscriptionStatus;
  source: "manual" | "gateway";
  currentPeriodEnd: string | null;
  createdAt: string;
  canceledAt: string | null;
};

export type AuditRow = {
  id: number;
  actorId: string;
  targetId: string | null;
  action: string;
  beforeValue: unknown;
  afterValue: unknown;
  createdAt: string;
};
