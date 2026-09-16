import type { Pathway } from "./catalog.types";
import { ModuleList } from "./module-list";

type PathwayOverviewProps = { pathway: Pathway };

export function PathwayOverview({ pathway }: PathwayOverviewProps) {
  const lessons = pathway.modules.flatMap((module) => module.lessons);
  const estimatedMinutes = lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);
  const estimatedHours = Math.max(1, Math.round(estimatedMinutes / 60));

  return (
    <main id="main-content">
      <section aria-labelledby="pathway-title" className="pathway-hero">
        <p className="eyebrow">Learning path</p>
        <h1 id="pathway-title">{pathway.title}</h1>
        <p className="pathway-audience">{pathway.audience}</p>
        <p className="summary">{pathway.description}</p>
        <div className="pathway-scale">
          <span>{pathway.modules.length} {pathway.modules.length === 1 ? "module" : "modules"}</span>
          <span>{lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}</span>
          <span>~{estimatedHours} {estimatedHours === 1 ? "hour" : "hours"}</span>
        </div>
      </section>
      <nav aria-label="Jump to module" className="pathway-toc">
        {pathway.modules.map((module, index) => (
          <a href={`#${module.id}`} key={module.id}>
            <span aria-hidden="true">{index + 1}</span>
            {module.title}
          </a>
        ))}
      </nav>
      <section aria-labelledby="modules-heading" className="pathway-content">
        <h2 id="modules-heading">Modules and lessons</h2>
        <ModuleList modules={pathway.modules} pathwaySlug={pathway.slug} />
      </section>
    </main>
  );
}
