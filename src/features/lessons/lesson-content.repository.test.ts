import { describe, expect, it, vi } from "vitest";

import type {
  LessonContentModule,
  LessonContentRegistry,
} from "./lesson-content.types";

vi.mock("server-only", () => ({}));
vi.mock("@/content/networking-foundations/how-networks-communicate.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/hosts-and-network-devices.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/hubs-bridges-and-switches.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/hubs-bridges-and-switches.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/hubs.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/bridges.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/switches.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/physical-and-logical-addressing.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/osi-and-tcp-ip-models.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/computer-network-basics-final-quiz.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/computer-network-basics-final-quiz.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/access-points-modems-onts-and-firewalls.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/access-points-modems-onts-and-firewalls.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/osi-and-tcp-ip-models.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/first-packet-journey-through-a-small-network.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/first-packet-journey-through-a-small-network.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/ethernet-frames-and-mac-addresses.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/ethernet-frames-and-mac-addresses.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/how-switches-learn-and-forward.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/how-switches-learn-and-forward.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/arp-and-local-delivery.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/arp-and-local-delivery.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx", () => ({
  default: () => null,
}));
vi.mock("@/content/networking-foundations/subnetting-fundamentals.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/subnetting-fundamentals.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/routing-tables-and-default-routes.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/routing-tables-and-default-routes.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/icmp-ping-and-path-discovery.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/icmp-ping-and-path-discovery.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/tcp-reliable-transport.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/tcp-reliable-transport.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/udp-datagrams-and-ports.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/udp-datagrams-and-ports.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dhcp-and-automatic-address-configuration.pro.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dns-and-name-resolution.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dns-and-name-resolution.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/dns-and-name-resolution.pro.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/http-https-tls-and-essential-network-services.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/http-https-tls-and-essential-network-services.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/http-https-tls-and-essential-network-services.pro.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.pro.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.public.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.account.mdx", () => ({ default: () => null }));
vi.mock("@/content/networking-foundations/systematic-network-troubleshooting-capstone.pro.mdx", () => ({ default: () => null }));

import {
  createAuthorizedLessonContentLoader,
  loadAuthorizedLessonContent,
} from "./lesson-content.repository";

const ACCOUNT_SENTINEL = "ACCOUNT_ONLY_SENTINEL";
const PRO_SENTINEL = "PRO_ONLY_SENTINEL";

function contentModule(extra: Record<string, unknown> = {}): LessonContentModule {
  return { default: () => null, ...extra };
}

function serializedValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [value.toString()];
  if (!value || typeof value !== "object") return [];

  return Object.values(value).flatMap(serializedValues);
}

function createFixture() {
  const publicLoader = vi.fn(async () => contentModule({ visibility: "public" }));
  const accountLoader = vi.fn(async () =>
    contentModule({ protectedFixture: ACCOUNT_SENTINEL }),
  );
  const proLoader = vi.fn(async () => contentModule({ protectedFixture: PRO_SENTINEL }));
  const registry = {
    "fixtures/with-pro": {
      public: publicLoader,
      account: accountLoader,
      pro: proLoader,
    },
    "fixtures/without-pro": {
      public: publicLoader,
      account: accountLoader,
    },
    "fixtures/account-only": {
      account: accountLoader,
      pro: proLoader,
    },
  } satisfies LessonContentRegistry;

  return {
    accountLoader,
    load: createAuthorizedLessonContentLoader(registry),
    proLoader,
    publicLoader,
  };
}

describe("loadAuthorizedLessonContent", () => {
  it.each(["how-networks-communicate", "hosts-and-network-devices"])("loads only the public block for an anonymous viewer of %s", async (slug) => {
    const result = await loadAuthorizedLessonContent(
      `networking-foundations/${slug}`,
      "anonymous",
    );

    expect(result.public).toBeDefined();
    expect(result.account).toBeUndefined();
    expect(result.pro).toBeUndefined();
  });

  it.each(["how-networks-communicate", "hosts-and-network-devices"])("does not append preserved legacy account content for %s", async (slug) => {
    const result = await loadAuthorizedLessonContent(
      `networking-foundations/${slug}`,
      "account",
    );

    expect(result.public).toBeDefined();
    expect(result.account).toBeUndefined();
  });

  it("loads the connection media public body anonymously and its account body only for an account", async () => {
    const key = "networking-foundations/cables-fibre-wireless-and-network-connections";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");

    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("loads switching public content anonymously and its account body only for a member", async () => {
    const key = "networking-foundations/hubs-bridges-and-switches";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it.each(["hubs", "bridges", "switches"])("loads the public %s lesson without protected blocks", async (slug) => {
    const result = await loadAuthorizedLessonContent(`networking-foundations/${slug}`, "account");
    expect(result.public).toBeDefined();
    expect(result.account).toBeUndefined();
    expect(result.pro).toBeUndefined();
  });

  it("keeps delivery-scope practice protected while serving its public lesson anonymously", async () => {
    const key = "networking-foundations/unicast-broadcast-and-multicast-communication";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("serves the introductory router lesson without the preserved account block", async () => {
    const key = "networking-foundations/routers-default-gateways-and-network-boundaries";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeUndefined();
    expect(account.pro).toBeUndefined();
  });

  it("serves introductory addressing publicly", async () => {
    const result = await loadAuthorizedLessonContent("networking-foundations/physical-and-logical-addressing", "account");
    expect(result.public).toBeDefined();
    expect(result.account).toBeUndefined();
  });

  it("keeps the final module quiz behind free account access", async () => {
    const key = "networking-foundations/computer-network-basics-final-quiz";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
  });

  it("keeps edge-device practice protected while serving its public lesson anonymously", async () => {
    const key = "networking-foundations/access-points-modems-onts-and-firewalls";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps packet-journey practice protected while serving its guided journey anonymously", async () => {
    const key = "networking-foundations/first-packet-journey-through-a-small-network";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps Ethernet analysis protected while serving frame fundamentals anonymously", async () => {
    const key = "networking-foundations/ethernet-frames-and-mac-addresses";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps ARP evidence practice protected while serving local-delivery fundamentals anonymously", async () => {
    const key = "networking-foundations/arp-and-local-delivery";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    expect(anonymous.pro).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps VLAN evidence practice protected while serving VLAN fundamentals anonymously", async () => {
    const key = "networking-foundations/vlans-access-ports-and-trunks";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();

    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps subnetting practice protected while serving fundamentals anonymously", async () => {
    const key = "networking-foundations/subnetting-fundamentals";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
  });

  it("keeps routing practice protected while serving route selection publicly", async () => {
    const key = "networking-foundations/routing-tables-and-default-routes";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
  });

  it("keeps ICMP practice protected while serving packet evidence publicly", async () => {
    const key = "networking-foundations/icmp-ping-and-path-discovery";
    const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
    expect(anonymous.public).toBeDefined();
    expect(anonymous.account).toBeUndefined();
    const account = await loadAuthorizedLessonContent(key, "account");
    expect(account.public).toBeDefined();
    expect(account.account).toBeDefined();
    expect(account.pro).toBeUndefined();
  });

  it("keeps TCP and UDP practice protected while serving their players publicly", async () => {
    for (const key of ["networking-foundations/tcp-reliable-transport", "networking-foundations/udp-datagrams-and-ports"] as const) {
      const anonymous = await loadAuthorizedLessonContent(key, "anonymous");
      expect(anonymous.public).toBeDefined();
      expect(anonymous.account).toBeUndefined();
      const account = await loadAuthorizedLessonContent(key, "account");
      expect(account.public).toBeDefined();
      expect(account.account).toBeDefined();
      expect(account.pro).toBeUndefined();
    }
  });

  it("loads DHCP content according to anonymous, account, and Pro access", async () => {
    const key = "networking-foundations/dhcp-and-automatic-address-configuration";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined, pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
  });

  it("loads DNS content according to anonymous, account, and Pro access", async () => {
    const key = "networking-foundations/dns-and-name-resolution";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined, pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
  });

  it("loads essential services content according to anonymous, account, and Pro access", async () => {
    const key = "networking-foundations/http-https-tls-and-essential-network-services";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined, pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
  });

  it("loads NAT content according to anonymous, account, and Pro access", async () => {
    const key = "networking-foundations/nat-pat-and-the-complete-internet-packet-journey";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined, pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
  });

  it("loads troubleshooting capstone content according to access", async () => {
    const key = "networking-foundations/systematic-network-troubleshooting-capstone";
    expect(await loadAuthorizedLessonContent(key, "anonymous")).toMatchObject({ public: expect.anything(), account: undefined, pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "account")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: undefined });
    expect(await loadAuthorizedLessonContent(key, "pro")).toMatchObject({ public: expect.anything(), account: expect.anything(), pro: expect.anything() });
  });

  it("serves OSI foundations to anonymous viewers", async () => {
    const result = await loadAuthorizedLessonContent(
      "networking-foundations/osi-and-tcp-ip-models", "anonymous",
    );
    expect(Boolean(result.public)).toBe(true);
    expect(Boolean(result.account)).toBe(false);
    expect(Boolean(result.pro)).toBe(false);
  });

  it.each(["account", "pro"] as const)("does not append preserved OSI account content for %s viewers", async (access) => {
    const result = await loadAuthorizedLessonContent("networking-foundations/osi-and-tcp-ip-models", access);
    expect(Boolean(result.public)).toBe(true);
    expect(result.account).toBeUndefined();
    expect(result.pro).toBeUndefined();
  });

  it("rejects a lesson absent from the explicit import map", async () => {
    await expect(
      loadAuthorizedLessonContent("unknown-pathway/unknown-lesson", "anonymous"),
    ).rejects.toThrow("LESSON_CONTENT_NOT_FOUND");
  });
});

describe("authorized lesson block loading", () => {
  it("does not invoke any content import for an anonymous account-only lesson", async () => {
    const { accountLoader, load, proLoader } = createFixture();
    const result = await load("fixtures/account-only", "anonymous");
    expect(accountLoader).not.toHaveBeenCalled();
    expect(proLoader).not.toHaveBeenCalled();
    expect(result).toEqual({ public: undefined, account: undefined, pro: undefined });
  });

  it("does not invoke or return protected loaders for an anonymous viewer", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "anonymous");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).not.toHaveBeenCalled();
    expect(proLoader).not.toHaveBeenCalled();
    expect(serializedValues(result)).not.toContain(ACCOUNT_SENTINEL);
    expect(serializedValues(result)).not.toContain(PRO_SENTINEL);
  });

  it("loads account content but does not invoke or return Pro content for an account viewer", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "account");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).toHaveBeenCalledOnce();
    expect(proLoader).not.toHaveBeenCalled();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeUndefined();
    expect(serializedValues(result)).not.toContain(PRO_SENTINEL);
  });

  it("loads public, account, and Pro content for a Pro viewer when all loaders exist", async () => {
    const { accountLoader, load, proLoader, publicLoader } = createFixture();

    const result = await load("fixtures/with-pro", "pro");

    expect(publicLoader).toHaveBeenCalledOnce();
    expect(accountLoader).toHaveBeenCalledOnce();
    expect(proLoader).toHaveBeenCalledOnce();
    expect(result.public).toBeDefined();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeDefined();
  });

  it("returns undefined Pro content when a Pro loader is absent", async () => {
    const { load } = createFixture();

    const result = await load("fixtures/without-pro", "pro");

    expect(result.public).toBeDefined();
    expect(result.account).toBeDefined();
    expect(result.pro).toBeUndefined();
  });
});
