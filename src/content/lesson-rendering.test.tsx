import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import { within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useMDXComponents as getMDXComponents } from "../../mdx-components";
import { getLesson, getPathway } from "@/features/catalog/catalog.repository";
import { LessonShell } from "@/features/lessons/lesson-shell";

// Exercise the compiler already used by the declared MDX loader; no new dependency.
const require = createRequire(import.meta.url);
const loaderRequire = createRequire(require.resolve("@mdx-js/loader"));
const compilerUrl = pathToFileURL(loaderRequire.resolve("@mdx-js/mdx")).href;

afterEach(() => document.body.replaceChildren());

async function lessonComponent(file: string) {
  const { evaluate } = await import(/* @vite-ignore */ compilerUrl);
  const source = readFileSync(join(process.cwd(), "src/content/networking-foundations", file), "utf8");
  const compiled = await evaluate(source, jsxRuntime);
  return compiled.default as ComponentType<{ components: MDXComponents }>;
}

describe("compiled lesson markup", () => {
  it.each([
    ["hosts-and-network-devices.public.mdx", "Network device roles", 4, 6],
    ["hosts-and-network-devices.account.mdx", "Hosts Wireshark display filters", 3, 6],
    ["hosts-and-network-devices.account.mdx", "Hosts and network devices summary", 2, 7],
    ["osi-and-tcp-ip-models.account.mdx", "The seven OSI layers", 3, 8],
    ["osi-and-tcp-ip-models.account.mdx", "Wireshark layer identification filters", 2, 8],
  ] as const)("renders %s / %s as an accessible table", async (file, caption, columns, rows) => {
    const Content = await lessonComponent(file);
    // ID-based accessible names need a Document root, not a detached element.
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToStaticMarkup(<Content components={getMDXComponents({})} />);
    const table = within(container).getByRole("table", { name: caption });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(columns);
    expect(within(table).getAllByRole("row")).toHaveLength(rows);
    for (const header of within(table).getAllByRole("columnheader")) expect(header).toHaveAttribute("scope", "col");
    expect(within(table).getAllByRole("rowheader")).toHaveLength(rows - 1);
    const scrollRegion = within(container).getByRole("region", { name: `${caption} table` });
    expect(scrollRegion).toHaveAttribute("tabindex", "0");
    expect(scrollRegion.contains(table)).toBe(true);
    expect(container.textContent).not.toMatch(/\|\s*---/);
  });

  it.each(["how-networks-communicate", "hosts-and-network-devices", "osi-and-tcp-ip-models"])("integrates %s with exactly one lesson H1", async (slug) => {
    const Content = await lessonComponent(`${slug}.${slug === "osi-and-tcp-ip-models" ? "account" : "public"}.mdx`);
    const pathway = getPathway("networking-foundations");
    const lesson = getLesson(pathway.slug, slug);
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToStaticMarkup(
      <LessonShell pathway={pathway} lesson={lesson}>
        <Content components={getMDXComponents({})} />
      </LessonShell>,
    );
    expect(within(container).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(container).getByRole("heading", { level: 1 }).textContent).toBe(lesson.title);
  });
});
