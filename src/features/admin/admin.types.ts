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

export type AdminOverview = {
  accounts: number | null;
  joinedWaitlist: number | null;
  pageViews: number | null;
};
