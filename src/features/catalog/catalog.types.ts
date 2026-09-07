export type ContentAccess = "public" | "account" | "pro";

export type LessonSection = {
  id: string;
  label: string;
  access: ContentAccess;
  preview?: string;
};

export type LessonSeo = {
  title: string;
  description: string;
};

type LessonSummaryBase = {
  id: string;
  slug: string;
  title: string;
  objective: string;
  seo: LessonSeo;
  estimatedMinutes: number;
};

export type LessonSummary =
  | (LessonSummaryBase & {
      published: true;
      sections: [LessonSection, ...LessonSection[]];
    })
  | (LessonSummaryBase & {
      published: false;
      sections?: LessonSection[];
    });

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
