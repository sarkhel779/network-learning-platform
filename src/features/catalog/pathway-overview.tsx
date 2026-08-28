import type { Pathway } from "./catalog.types";
import { ModuleList } from "./module-list";

type PathwayOverviewProps = { pathway: Pathway };

export function PathwayOverview({ pathway }: PathwayOverviewProps) {
  const estimatedMinutes = pathway.modules
    .flatMap((module) => module.lessons)
    .reduce((total, lesson) => total + lesson.estimatedMinutes, 0);

  return (
    <main id="main-content">
      <section aria-labelledby="pathway-title" className="pathway-hero">
        <p className="eyebrow">Learning path</p>
        <h1 id="pathway-title">{pathway.title}</h1>
        <p className="pathway-audience">{pathway.audience}</p>
        <p className="summary">{pathway.description}</p>
        <p className="pathway-duration">Estimated total: {estimatedMinutes} minutes</p>
      </section>
      <section aria-labelledby="modules-heading" className="pathway-content">
        <h2 id="modules-heading">Modules and lessons</h2>
        <ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />
      </section>
    </main>
  );
}
