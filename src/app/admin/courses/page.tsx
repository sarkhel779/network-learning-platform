import { requireStaff } from "@/features/admin/admin-access";
import { CourseContentManager } from "@/features/admin/course-content-manager";
import { listPathways } from "@/features/catalog/catalog.repository";
import {
  applyContentOverrides,
  loadContentOverridesSnapshot,
} from "@/features/catalog/content-publication.repository";

export default async function CoursesPage() {
  await requireStaff("courses");
  const overrides = await loadContentOverridesSnapshot();
  const pathways = listPathways().map((pathway) => applyContentOverrides(pathway, overrides));
  const lessonCount = pathways.reduce((total, pathway) => total + pathway.modules.reduce((moduleTotal, courseModule) => moduleTotal + courseModule.lessons.length, 0), 0);

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Content</p><h1>Courses and labs</h1></div><span>{lessonCount.toLocaleString("en-IN")} lessons</span></header>
    <CourseContentManager pathways={pathways} />
  </main>;
}
