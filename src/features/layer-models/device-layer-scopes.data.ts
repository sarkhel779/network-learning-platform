import { layerModelsLab } from "./layer-models.data";
import { parseDeviceLayerScopes } from "./layer-models.schema";

export const deviceLayerScopes = parseDeviceLayerScopes(
  [
    {
      id: "host",
      name: "Host or server",
      commonlyExamines: "All OSI and TCP/IP layers",
      osiLayers: [7, 6, 5, 4, 3, 2, 1],
      tcpIpLayers: ["application", "transport", "internet", "network-access"],
      explanation:
        "A host commonly creates or consumes application data, so it can participate across the full stack.",
    },
    {
      id: "switch",
      name: "Layer 2 switch",
      commonlyExamines: "Physical and Data Link / Network Access",
      osiLayers: [2, 1],
      tcpIpLayers: ["network-access"],
      explanation:
        "A Layer 2 switch commonly examines frame and signal information, although multilayer switches can do more.",
    },
    {
      id: "router",
      name: "Router",
      commonlyExamines: "Physical, Data Link, and Network / Internet",
      osiLayers: [3, 2, 1],
      tcpIpLayers: ["internet", "network-access"],
      explanation:
        "A router commonly examines IP addressing to forward packets and rebuilds link-layer framing for each hop.",
    },
    {
      id: "firewall",
      name: "Firewall",
      commonlyExamines: "Network, Transport, and sometimes Application information",
      osiLayers: [7, 4, 3],
      tcpIpLayers: ["application", "transport", "internet"],
      explanation:
        "A firewall may examine packet, port, session, and application information; its scope depends on its design and enabled features.",
    },
  ],
  layerModelsLab,
);
