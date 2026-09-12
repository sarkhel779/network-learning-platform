import { requireStaff } from "@/features/admin/admin-access";
import { IntegrationState } from "@/features/admin/integration-state";

export default async function CoursesPage() {
  await requireStaff("courses");
  return <main className="admin-page" id="main-content"><p className="eyebrow">Content</p><h1>Courses and labs</h1><IntegrationState area="Course editing" reason="Lessons are versioned MDX in the repository. A publish workflow and persisted draft store must be connected before staff can edit or reorder them here." /></main>;
}
