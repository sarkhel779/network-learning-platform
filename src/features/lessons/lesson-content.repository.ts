import "server-only";

import type {
  AuthorizedLessonContent,
  LessonContentKey,
  LessonContentRegistry,
  ViewerAccess,
} from "./lesson-content.types";

export type { LessonContentModule } from "./lesson-content.types";

const lessonImports = {
  "networking-foundations/how-networks-communicate": {
    public: () =>
      import("@/content/networking-foundations/how-networks-communicate.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/how-networks-communicate.account.mdx"),
  },
  "networking-foundations/hosts-and-network-devices": {
    public: () =>
      import("@/content/networking-foundations/hosts-and-network-devices.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/hosts-and-network-devices.account.mdx"),
  },
  "networking-foundations/cables-fibre-wireless-and-network-connections": {
    public: () =>
      import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/cables-fibre-wireless-and-network-connections.account.mdx"),
  },
  "networking-foundations/hubs-bridges-and-switches": {
    public: () =>
      import("@/content/networking-foundations/hubs-bridges-and-switches.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/hubs-bridges-and-switches.account.mdx"),
  },
  "networking-foundations/unicast-broadcast-and-multicast-communication": {
    public: () =>
      import("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx"),
  },
  "networking-foundations/routers-default-gateways-and-network-boundaries": {
    public: () =>
      import("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx"),
  },
  "networking-foundations/access-points-modems-onts-and-firewalls": {
    public: () =>
      import("@/content/networking-foundations/access-points-modems-onts-and-firewalls.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/access-points-modems-onts-and-firewalls.account.mdx"),
  },
  "networking-foundations/first-packet-journey-through-a-small-network": {
    public: () =>
      import("@/content/networking-foundations/first-packet-journey-through-a-small-network.public.mdx"),
    account: () =>
      import("@/content/networking-foundations/first-packet-journey-through-a-small-network.account.mdx"),
  },
  "networking-foundations/ethernet-frames-and-mac-addresses": {
    public: () => import("@/content/networking-foundations/ethernet-frames-and-mac-addresses.public.mdx"),
    account: () => import("@/content/networking-foundations/ethernet-frames-and-mac-addresses.account.mdx"),
  },
  "networking-foundations/how-switches-learn-and-forward": {
    public: () => import("@/content/networking-foundations/how-switches-learn-and-forward.public.mdx"),
    account: () => import("@/content/networking-foundations/how-switches-learn-and-forward.account.mdx"),
  },
  "networking-foundations/arp-and-local-delivery": {
    public: () => import("@/content/networking-foundations/arp-and-local-delivery.public.mdx"),
    account: () => import("@/content/networking-foundations/arp-and-local-delivery.account.mdx"),
  },
  "networking-foundations/vlans-access-ports-and-trunks": {
    public: () => import("@/content/networking-foundations/vlans-access-ports-and-trunks.public.mdx"),
    account: () => import("@/content/networking-foundations/vlans-access-ports-and-trunks.account.mdx"),
  },
  "networking-foundations/ipv4-addressing": {
    public: () => import("@/content/networking-foundations/ipv4-addressing.public.mdx"),
    account: () => import("@/content/networking-foundations/ipv4-addressing.account.mdx"),
  },
  "networking-foundations/subnetting-fundamentals": {
    public: () => import("@/content/networking-foundations/subnetting-fundamentals.public.mdx"),
    account: () => import("@/content/networking-foundations/subnetting-fundamentals.account.mdx"),
  },
  "networking-foundations/ipv6-fundamentals": {
    public: () => import("@/content/networking-foundations/ipv6-fundamentals.public.mdx"),
    account: () => import("@/content/networking-foundations/ipv6-fundamentals.account.mdx"),
  },
  "networking-foundations/routing-tables-and-default-routes": {
    public: () => import("@/content/networking-foundations/routing-tables-and-default-routes.public.mdx"),
    account: () => import("@/content/networking-foundations/routing-tables-and-default-routes.account.mdx"),
  },
  "networking-foundations/icmp-ping-and-path-discovery": {
    public: () => import("@/content/networking-foundations/icmp-ping-and-path-discovery.public.mdx"),
    account: () => import("@/content/networking-foundations/icmp-ping-and-path-discovery.account.mdx"),
  },
  "networking-foundations/tcp-udp-and-ports": {
    public: () => import("@/content/networking-foundations/tcp-udp-and-ports.public.mdx"),
    account: () => import("@/content/networking-foundations/tcp-udp-and-ports.account.mdx"),
  },
  "networking-foundations/dhcp-and-automatic-address-configuration": {
    public: () => import("@/content/networking-foundations/dhcp-and-automatic-address-configuration.public.mdx"),
    account: () => import("@/content/networking-foundations/dhcp-and-automatic-address-configuration.account.mdx"),
    pro: () => import("@/content/networking-foundations/dhcp-and-automatic-address-configuration.pro.mdx"),
  },
  "networking-foundations/dns-and-name-resolution": {
    public: () => import("@/content/networking-foundations/dns-and-name-resolution.public.mdx"),
    account: () => import("@/content/networking-foundations/dns-and-name-resolution.account.mdx"),
    pro: () => import("@/content/networking-foundations/dns-and-name-resolution.pro.mdx"),
  },
  "networking-foundations/http-https-tls-and-essential-network-services": {
    public: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.public.mdx"),
    account: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.account.mdx"),
    pro: () => import("@/content/networking-foundations/http-https-tls-and-essential-network-services.pro.mdx"),
  },
  "networking-foundations/nat-pat-and-the-complete-internet-packet-journey": {
    public: () => import("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.public.mdx"),
    account: () => import("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.account.mdx"),
    pro: () => import("@/content/networking-foundations/nat-pat-and-the-complete-internet-packet-journey.pro.mdx"),
  },
  "networking-foundations/systematic-network-troubleshooting-capstone": {
    public: () => import("@/content/networking-foundations/systematic-network-troubleshooting-capstone.public.mdx"),
    account: () => import("@/content/networking-foundations/systematic-network-troubleshooting-capstone.account.mdx"),
    pro: () => import("@/content/networking-foundations/systematic-network-troubleshooting-capstone.pro.mdx"),
  },
  "networking-foundations/osi-and-tcp-ip-models": {
    account: () =>
      import("@/content/networking-foundations/osi-and-tcp-ip-models.account.mdx"),
  },
} satisfies LessonContentRegistry;

async function loadFromRegistry(
  registry: LessonContentRegistry,
  key: LessonContentKey,
  access: ViewerAccess,
): Promise<AuthorizedLessonContent> {
  const blocks = registry[key];

  if (!blocks) throw new Error("LESSON_CONTENT_NOT_FOUND");

  return {
    public: blocks.public ? await blocks.public() : undefined,
    account:
      access !== "anonymous" && blocks.account ? await blocks.account() : undefined,
    pro: access === "pro" && blocks.pro ? await blocks.pro() : undefined,
  };
}

export function createAuthorizedLessonContentLoader(registry: LessonContentRegistry) {
  return (key: LessonContentKey, access: ViewerAccess) =>
    loadFromRegistry(registry, key, access);
}

export async function loadAuthorizedLessonContent(
  key: LessonContentKey,
  access: ViewerAccess,
): Promise<AuthorizedLessonContent> {
  return loadFromRegistry(lessonImports, key, access);
}
