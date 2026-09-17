export type SupportTicketStatus = "open" | "in_progress" | "resolved";

export type SupportTicketMessage = {
  id: number;
  isStaff: boolean;
  body: string;
  createdAt: string;
};

export type SupportTicketSummary = {
  id: number;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketDetail = SupportTicketSummary & {
  messages: SupportTicketMessage[];
};
