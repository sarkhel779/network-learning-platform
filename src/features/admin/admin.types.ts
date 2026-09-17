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

export type AuditRow = {
  id: number;
  actorId: string;
  targetId: string | null;
  action: string;
  beforeValue: unknown;
  afterValue: unknown;
  createdAt: string;
};
