import type { LessonSection } from "@/features/catalog/catalog.types";

type LessonSectionNavigationProps = {
  sections?: LessonSection[];
};

export function LessonSectionNavigation({ sections }: LessonSectionNavigationProps) {
  if (!sections?.length) return null;

  return (
    <nav aria-label="On this page" className="lesson-section-navigation">
      <h2>On this page</h2>
      <ol>
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
