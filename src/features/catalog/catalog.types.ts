export type AccessLevel = "free" | "premium";

export type LessonSection = {
  id: string;
  label: string;
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  objective: string;
  access: AccessLevel;
  published: boolean;
  estimatedMinutes: number;
  sections?: LessonSection[];
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: LessonSummary[];
};

export type Pathway = {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  modules: Module[];
};
