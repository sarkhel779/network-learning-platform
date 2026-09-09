import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import { within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { useMDXComponents as getMDXComponents } from "../../mdx-components";
import { getLesson, getPathway } from "@/features/catalog/catalog.repository";
import { LessonShell } from "@/features/lessons/lesson-shell";

// Exercise the compiler already used by the declared MDX loader; no new dependency.
const require = createRequire(import.meta.url);
const loaderRequire = createRequire(require.resolve("@mdx-js/loader"));
const compilerUrl = pathToFileURL(loaderRequire.resolve("@mdx-js/mdx")).href;

afterEach(() => document.body.replaceChildren());

async function lessonComponent(file: string) {
  const { compile, run } = await import(/* @vite-ignore */ compilerUrl);
  const source = readFileSync(join(process.cwd(), "src/content/networking-foundations", file), "utf8");
  const code = String(await compile(source, { outputFormat: "function-body" }));
  // MDX's runtime import uses native Node resolution. Route that import through
  // Vite so the actual account TSX module receives the project's alias/JSX transforms.
  const compiled = await run(code.replaceAll("await import(", "await arguments[0].importModule("), {
    ...jsxRuntime,
    baseUrl: import.meta.url,
    importModule: async (specifier: string) => {
      if (specifier === "@/features/connection-media/connection-media-experience") {
        return import("@/features/connection-media/connection-media-experience");
      }
      if (specifier === "@/features/connection-media/connection-media.account-loader") {
        return import("@/features/connection-media/connection-media.account-loader");
      }
      throw new Error(`Unexpected lesson import: ${specifier}`);
    },
  });
  return compiled.default as ComponentType<{ components: MDXComponents }>;
}

describe("compiled lesson markup", () => {
  it.each([
    ["hosts-and-network-devices.public.mdx", "Network device roles", 4, 6],
    ["hosts-and-network-devices.account.mdx", "Hosts Wireshark display filters", 3, 6],
    ["hosts-and-network-devices.account.mdx", "Hosts and network devices summary", 2, 7],
    ["osi-and-tcp-ip-models.account.mdx", "The seven OSI layers", 3, 8],
    ["osi-and-tcp-ip-models.account.mdx", "Wireshark layer identification filters", 2, 8],
    ["cables-fibre-wireless-and-network-connections.public.mdx", "Connection media at a glance", 5, 4],
    ["cables-fibre-wireless-and-network-connections.account.mdx", "Connection selection summary", 3, 4],
    ["first-packet-journey-through-a-small-network.account.mdx", "Packet journey evidence", 3, 5],
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

  it.each(["how-networks-communicate", "hosts-and-network-devices", "osi-and-tcp-ip-models", "cables-fibre-wireless-and-network-connections", "first-packet-journey-through-a-small-network"])("integrates %s with exactly one lesson H1", async (slug) => {
    const Content = await lessonComponent(`${slug}.${slug === "osi-and-tcp-ip-models" ? "account" : "public"}.mdx`);
    const pathway = getPathway("networking-foundations");
    const lesson = getLesson(pathway.slug, slug);
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToStaticMarkup(
      <LessonShell viewer={null} pathway={pathway} lesson={lesson}>
        <Content components={getMDXComponents({})} />
      </LessonShell>,
    );
    expect(within(container).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(container).getByRole("heading", { level: 1 }).textContent).toBe(lesson.title);
  });

  it("renders the account lesson with unique anchors, assessment controls, and the waitlist action", async () => {
    const Content = await lessonComponent("cables-fibre-wireless-and-network-connections.account.mdx");
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToStaticMarkup(<Content components={getMDXComponents({})} />);
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(within(container).getByRole("heading", { name: "Design a connection" })).toHaveAttribute("tabindex", "-1");
    expect(within(container).getByRole("radio", { name: "Desktop near a home router" })).toBeChecked();
    expect(within(container).getByRole("group", { name: "Choose a connection scenario" }).querySelectorAll('input[type="radio"]')).toHaveLength(6);
    expect(within(container).getAllByRole("group", { name: /^Knowledge check:/ })).toHaveLength(3);
    expect(within(container).getByRole("link", { name: "Join the Pro Member Waitlist" })).toHaveAttribute("href", "/contact");
    expect(container.querySelectorAll("details.interview-scenario, .interview-scenario details")).toHaveLength(2);
    expect(container.querySelector("p section, p aside, button button, a a")).toBeNull();
    const workflow = container.querySelector("#diagnose-link-symptoms + p + ol");
    expect(workflow?.children).toHaveLength(6);
  });
});
