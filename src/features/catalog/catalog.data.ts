import { pathwayCatalogSchema } from "./catalog.schema";
import type { Pathway } from "./catalog.types";

const curriculum: Pathway[] = [
  {
    id: "path_networking_foundations",
    slug: "networking-foundations",
    title: "Networking Foundations",
    description: "Build a practical mental model for how modern networks move data.",
    audience: "Complete beginners who want to understand how computer networks work.",
    modules: [
      {
        id: "module_networking_essentials",
        slug: "networking-essentials",
        title: "Networking Essentials",
        description: "Learn the core concepts behind network communication.",
        lessons: [
          {
            id: "lesson_how_networks_communicate",
            slug: "how-networks-communicate",
            title: "How Networks Communicate",
            objective: "Explain the minimum decisions required to move data between two hosts.",
            seo: {
              title: "How Networks Communicate: A Beginner's Guide",
              description:
                "Learn the decisions that move data between hosts and trace a packet across a network.",
            },
            published: true,
            estimatedMinutes: 12,
            sections: [
              { id: "communication-decisions", label: "Communication decisions", access: "public" },
              { id: "packet-journey", label: "Interactive packet journey", access: "public" },
              { id: "wireshark-check", label: "Basic Wireshark check", access: "account" },
              { id: "knowledge-check", label: "Knowledge check", access: "account" },
              { id: "interview-scenario", label: "Interview scenario", access: "account" },
              {
                id: "pro-deep-dive",
                label: "Pro Deep Dive",
                access: "pro",
                preview: "Check the governing RFC and relevant read-only vendor diagnostics.",
              },
            ],
          },
          {
            id: "lesson_hosts_and_network_devices",
            slug: "hosts-and-network-devices",
            title: "Hosts and Network Devices",
            objective: "Identify the devices in a topology and predict whether a host sends locally or through its default gateway.",
            seo: {
              title: "Hosts and Network Devices: Learn the Basics",
              description:
                "Identify hosts and network devices, then predict each packet's path through a topology.",
            },
            published: true,
            estimatedMinutes: 20,
            sections: [
              { id: "what-is-a-host", label: "What is a host?", access: "public" },
              { id: "connecting-devices", label: "Devices that connect hosts", access: "public" },
              { id: "explore-topology", label: "Explore the topology", access: "public" },
              { id: "compare-journeys", label: "Compare packet journeys", access: "public" },
              { id: "windows-checks", label: "Windows checks", access: "account" },
              { id: "wireshark-checks", label: "Wireshark checks", access: "account" },
              { id: "test-understanding", label: "Test your understanding", access: "account" },
              { id: "summary", label: "Summary", access: "account" },
              {
                id: "pro-deep-dive",
                label: "Pro Deep Dive",
                access: "pro",
                preview: "Check the governing RFC and relevant read-only vendor diagnostics.",
              },
            ],
          },
          {
            id: "lesson_osi_and_tcp_ip_models",
            slug: "osi-and-tcp-ip-models",
            title: "OSI and TCP/IP Models",
            objective: "Relate common network tasks to the OSI and TCP/IP models.",
            seo: {
              title: "OSI and TCP/IP Models Explained",
              description:
                "Connect the OSI and TCP/IP models to practical network tasks, packet layers, and troubleshooting.",
            },
            published: true,
            estimatedMinutes: 18,
            sections: [
              { id: "why-layers", label: "Why layered models exist", access: "public" },
              { id: "osi-model", label: "The seven OSI layers", access: "public" },
              { id: "tcp-ip-model", label: "The four-layer TCP/IP model", access: "public" },
              { id: "model-mapping", label: "OSI-to-TCP/IP mapping", access: "public" },
              {
                id: "encapsulation-lab",
                label: "Interactive encapsulation and decapsulation",
                access: "public",
              },
              {
                id: "device-layer-scope",
                label: "What each network device examines",
                access: "account",
              },
              { id: "wireshark-layers", label: "Wireshark layer identification", access: "account" },
              {
                id: "troubleshooting-interview",
                label: "Troubleshooting and interview scenarios",
                access: "account",
              },
              {
                id: "knowledge-summary",
                label: "Knowledge check and summary",
                access: "account",
              },
              {
                id: "pro-deep-dive",
                label: "Pro Deep Dive",
                access: "pro",
                preview: "Check the governing RFC and relevant read-only vendor diagnostics.",
              },
            ],
          },
        ],
      },
      {
        id: "module_ethernet_and_local_networks",
        slug: "ethernet-and-local-networks",
        title: "Ethernet and Local Networks",
        description: "Understand how local networks identify and separate devices.",
        lessons: [
          {
            id: "lesson_arp_and_mac_learning",
            slug: "arp-and-mac-learning",
            title: "ARP and MAC Learning",
            objective: "Describe how local networks learn device hardware addresses.",
            seo: {
              title: "ARP and MAC Learning Fundamentals",
              description: "Understand how local networks discover and remember hardware addresses.",
            },
            published: false,
            estimatedMinutes: 14,
          },
          {
            id: "lesson_switching_and_vlan_basics",
            slug: "switching-and-vlan-basics",
            title: "Switching and VLAN Basics",
            objective: "Explain how switches forward traffic and VLANs separate networks.",
            seo: {
              title: "Switching and VLAN Basics",
              description: "Learn how switches forward traffic and VLANs segment a local network.",
            },
            published: false,
            estimatedMinutes: 16,
          },
        ],
      },
      {
        id: "module_ip_addressing_and_routing",
        slug: "ip-addressing-and-routing",
        title: "IP Addressing and Routing",
        description: "Learn how networks assign addresses and reach remote destinations.",
        lessons: [
          {
            id: "lesson_ipv4_addressing",
            slug: "ipv4-addressing",
            title: "IPv4 Addressing",
            objective: "Read the parts of an IPv4 address and its network role.",
            seo: {
              title: "IPv4 Addressing for Beginners",
              description: "Read IPv4 addresses and understand each address's role on a network.",
            },
            published: false,
            estimatedMinutes: 15,
          },
          {
            id: "lesson_subnetting_fundamentals",
            slug: "subnetting-fundamentals",
            title: "Subnetting Fundamentals",
            objective: "Explain why subnets divide an IPv4 network.",
            seo: {
              title: "Subnetting Fundamentals Explained",
              description: "Learn why subnets divide IPv4 networks and how those boundaries work.",
            },
            published: false,
            estimatedMinutes: 18,
          },
          {
            id: "lesson_routing_and_default_gateways",
            slug: "routing-and-default-gateways",
            title: "Routing and Default Gateways",
            objective: "Explain how routers send traffic beyond a local network.",
            seo: {
              title: "Routing and Default Gateways",
              description: "Understand how routers and default gateways move traffic beyond a local network.",
            },
            published: false,
            estimatedMinutes: 16,
          },
        ],
      },
      {
        id: "module_transport_and_network_services",
        slug: "transport-and-network-services",
        title: "Transport and Network Services",
        description: "Explore transport protocols and the services applications rely on.",
        lessons: [
          {
            id: "lesson_tcp_udp_and_ports",
            slug: "tcp-udp-and-ports",
            title: "TCP, UDP, and Ports",
            objective: "Compare transport protocols and explain the purpose of ports.",
            seo: {
              title: "TCP, UDP, and Ports Explained",
              description: "Compare TCP and UDP, then learn why applications use network ports.",
            },
            published: false,
            estimatedMinutes: 15,
          },
          {
            id: "lesson_dns_dhcp_http_https_and_tls",
            slug: "dns-dhcp-http-https-and-tls",
            title: "DNS, DHCP, HTTP, HTTPS, and TLS",
            objective: "Describe the common services behind everyday network activity.",
            seo: {
              title: "DNS, DHCP, HTTP, HTTPS, and TLS",
              description: "Explore the network services that make everyday browsing and connections work.",
            },
            published: false,
            estimatedMinutes: 20,
          },
        ],
      },
      {
        id: "module_network_security_fundamentals",
        slug: "network-security-fundamentals",
        title: "Network Security Fundamentals",
        description: "Learn the essential controls that protect network traffic.",
        lessons: [
          {
            id: "lesson_nat_fundamentals",
            slug: "nat-fundamentals",
            title: "NAT Fundamentals",
            objective: "Explain why networks translate addresses and ports.",
            seo: {
              title: "NAT Fundamentals for Networking",
              description: "Learn why networks translate addresses and ports as traffic moves between networks.",
            },
            published: false,
            estimatedMinutes: 15,
          },
          {
            id: "lesson_firewall_fundamentals",
            slug: "firewall-fundamentals",
            title: "Firewall Fundamentals",
            objective: "Explain how stateful firewalls permit and deny network traffic.",
            seo: {
              title: "Stateful Firewall Fundamentals",
              description: "Understand how stateful firewalls evaluate and control network traffic.",
            },
            published: false,
            estimatedMinutes: 16,
          },
        ],
      },
      {
        id: "module_packet_analysis_and_troubleshooting",
        slug: "packet-analysis-and-troubleshooting",
        title: "Packet Analysis and Troubleshooting",
        description: "Trace packets and reason about faults across a network path.",
        lessons: [
          {
            id: "lesson_end_to_end_packet_journey",
            slug: "end-to-end-packet-journey",
            title: "End-to-End Packet Journey",
            objective: "Trace a packet from an application to its destination.",
            seo: {
              title: "End-to-End Packet Journey",
              description: "Trace a packet from an application through the network to its destination.",
            },
            published: false,
            estimatedMinutes: 20,
          },
        ],
      },
    ],
  },
];

export const pathways = pathwayCatalogSchema.parse(curriculum);
