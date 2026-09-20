import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  setLessonPublished: vi.fn(),
  setModuleLessonOrder: vi.fn(),
  loadContentOverridesSnapshot: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/features/admin/admin.repository", () => ({
  setLessonPublished: mocks.setLessonPublished,
  setModuleLessonOrder: mocks.setModuleLessonOrder,
}));
vi.mock("@/features/catalog/content-publication.repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/catalog/content-publication.repository")>()),
  loadContentOverridesSnapshot: mocks.loadContentOverridesSnapshot,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { moveLessonAction, setLessonPublishedAction } from "./actions";

beforeEach(() => {
  mocks.requireStaff.mockReset();
  mocks.setLessonPublished.mockReset();
  mocks.setModuleLessonOrder.mockReset();
  mocks.loadContentOverridesSnapshot.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.requireStaff.mockResolvedValue({ viewer: { id: "staff" }, role: "super_admin" });
  mocks.loadContentOverridesSnapshot.mockResolvedValue({ publications: {}, orders: {} });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("set lesson published action", () => {
  it("rejects a lesson id outside the naming convention without calling the database", async () => {
    const result = await setLessonPublishedAction(form({ lessonId: "how-networks-communicate", published: "true" }));
    expect(result.ok).toBe(false);
    expect(mocks.setLessonPublished).not.toHaveBeenCalled();
  });

  it("rejects a lesson that no longer exists in the catalogue", async () => {
    const result = await setLessonPublishedAction(form({ lessonId: "lesson_does_not_exist", published: "true" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no longer exists/);
    expect(mocks.setLessonPublished).not.toHaveBeenCalled();
  });

  it("reauthorizes, updates the lesson, and revalidates every affected route", async () => {
    mocks.setLessonPublished.mockResolvedValue({ lessonId: "lesson_how_networks_communicate", published: false });
    const result = await setLessonPublishedAction(form({ lessonId: "lesson_how_networks_communicate", published: "false" }));
    expect(result.ok).toBe(true);
    expect(mocks.requireStaff).toHaveBeenCalledWith("courses");
    expect(mocks.setLessonPublished).toHaveBeenCalledWith("lesson_how_networks_communicate", false);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/courses");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/paths/networking-foundations");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/learn/networking-foundations/how-networks-communicate");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.setLessonPublished.mockRejectedValue(new Error("offline"));
    const result = await setLessonPublishedAction(form({ lessonId: "lesson_how_networks_communicate", published: "true" }));
    expect(result.ok).toBe(false);
  });
});

describe("move lesson action", () => {
  it("rejects an unrecognized direction without calling the database", async () => {
    const result = await moveLessonAction(form({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_how_networks_communicate",
      direction: "sideways",
    }));
    expect(result.ok).toBe(false);
    expect(mocks.setModuleLessonOrder).not.toHaveBeenCalled();
  });

  it("rejects a module that no longer exists in the catalogue", async () => {
    const result = await moveLessonAction(form({ moduleId: "module_does_not_exist", lessonId: "lesson_how_networks_communicate", direction: "up" }));
    expect(result.ok).toBe(false);
    expect(mocks.setModuleLessonOrder).not.toHaveBeenCalled();
  });

  it("computes a swap from the catalog's default order and persists it", async () => {
    mocks.setModuleLessonOrder.mockResolvedValue({ moduleId: "module_network_and_device_essentials", lessonOrder: [] });
    const result = await moveLessonAction(form({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_hosts_and_network_devices",
      direction: "up",
    }));
    expect(result.ok).toBe(true);
    const [moduleId, order] = mocks.setModuleLessonOrder.mock.calls[0];
    expect(moduleId).toBe("module_network_and_device_essentials");
    expect(order.slice(0, 2)).toEqual(["lesson_hosts_and_network_devices", "lesson_how_networks_communicate"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/paths/networking-foundations");
  });

  it("computes a swap on top of a live database override instead of the static catalog order", async () => {
    mocks.loadContentOverridesSnapshot.mockResolvedValue({
      publications: {},
      orders: { module_network_and_device_essentials: [
        "lesson_hosts_and_network_devices",
        "lesson_how_networks_communicate",
        "lesson_hubs",
        "lesson_bridges",
        "lesson_switches",
        "lesson_routers_default_gateways_and_network_boundaries",
        "lesson_physical_and_logical_addressing",
        "lesson_osi_and_tcp_ip_models",
        "lesson_computer_network_basics_final_quiz",
      ] },
    });
    mocks.setModuleLessonOrder.mockResolvedValue({ moduleId: "module_network_and_device_essentials", lessonOrder: [] });
    await moveLessonAction(form({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_how_networks_communicate",
      direction: "up",
    }));
    const [, order] = mocks.setModuleLessonOrder.mock.calls[0];
    expect(order.slice(0, 2)).toEqual(["lesson_how_networks_communicate", "lesson_hosts_and_network_devices"]);
  });

  it("declines to reorder past the start of a module without calling the database", async () => {
    const result = await moveLessonAction(form({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_how_networks_communicate",
      direction: "up",
    }));
    expect(result.ok).toBe(true);
    expect(mocks.setModuleLessonOrder).not.toHaveBeenCalled();
  });

  it("surfaces a database failure without a false success", async () => {
    mocks.setModuleLessonOrder.mockRejectedValue(new Error("offline"));
    const result = await moveLessonAction(form({
      moduleId: "module_network_and_device_essentials",
      lessonId: "lesson_hosts_and_network_devices",
      direction: "up",
    }));
    expect(result.ok).toBe(false);
  });
});
