import type { Metadata } from "next";

import { CoursesIndex } from "@/features/catalog/courses-index";
import { listPathways } from "@/features/catalog/catalog.repository";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse every Packetsecrets learning path.",
};

export default function CoursesPage() {
  return <CoursesIndex pathways={listPathways()} />;
}
