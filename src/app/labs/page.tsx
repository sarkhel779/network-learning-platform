import type { Metadata } from "next";

import { LabsTopicsIndex } from "@/features/labs/topics-index";
import { listLabTopics } from "@/features/labs/labs.repository";

export const metadata: Metadata = {
  title: "Labs",
  description: "Independent, hands-on networking scenarios to practice outside of any course.",
};

export default function LabsPage() {
  return <LabsTopicsIndex topics={listLabTopics()} />;
}
