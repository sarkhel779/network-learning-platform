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
        {sections.map(({ id, label, access, preview }) => (
          <li key={id}>
            {access === "public" ? (
              <a href={`#${id}`}>{label}</a>
            ) : (
              <div className="lesson-section-navigation__locked">
                <span>{label}</span>
                <span className="access-label">{access === "pro" ? "Pro" : "Free account"}</span>
                <span className="lesson-section-navigation__status">Locked</span>
                {access === "pro" && preview ? <p>{preview}</p> : null}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
