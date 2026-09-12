export type LeaseState = "INIT" | "SELECTING" | "REQUESTING" | "BOUND" | "RENEWING" | "REBINDING";
export type LeaseSignalRoute = "init-selecting" | "selecting-offer" | "selecting-requesting" | "requesting-bound" | "requesting-loop" | "requesting-init" | "bound-renewing" | "renewing-bound" | "renewing-rebinding" | "rebinding-bound" | "bound-init";
export type LeaseFlowStep = {
  state: LeaseState;
  title: string;
  message?: string;
  signalRoute?: LeaseSignalRoute;
  direction?: "client-to-server" | "server-to-client";
  viaRelay?: boolean;
  delivery: string;
  leaseValid: boolean;
  explanation: string;
};

type LeaseScenario = { id: string; title: string; steps: readonly LeaseFlowStep[] };

const bound: LeaseFlowStep = { state: "BOUND", title: "Lease active", delivery: "No packet yet", leaseValid: true, explanation: "The client may use its assigned address until the lease expires. The clock starts with DHCPACK." };
const request: LeaseFlowStep = { state: "RENEWING", title: "T1 · 50% of lease", message: "DHCPREQUEST", signalRoute: "bound-renewing", direction: "client-to-server", delivery: "Unicast to original server", leaseValid: true, explanation: "At T1 the client asks its original server to renew. The current address remains usable while the lease is valid." };
const rebind: LeaseFlowStep = { state: "REBINDING", title: "T2 · 87.5% of lease", message: "DHCPREQUEST", signalRoute: "renewing-rebinding", direction: "client-to-server", delivery: "Broadcast to any server", leaseValid: true, explanation: "With no renewal ACK by T2, the client broadcasts a request so another server may extend the still-valid lease." };
const ack: LeaseFlowStep = { state: "BOUND", title: "Renewed by ACK", message: "DHCPACK", signalRoute: "renewing-bound", direction: "server-to-client", delivery: "Server reply", leaseValid: true, explanation: "A DHCPACK confirms the address and supplies lease values. The client returns to BOUND and resets its timers." };

export const leaseStateScenarios: readonly LeaseScenario[] = [
  { id: "allocation", title: "Initial DORA", steps: [
    { state: "INIT", title: "Boot · INIT", delivery: "No packet yet", leaseValid: false, explanation: "The client has no leased address and starts discovery." },
    { state: "SELECTING", title: "Discover", message: "DHCPDISCOVER", signalRoute: "init-selecting", direction: "client-to-server", delivery: "Broadcast · UDP 68 → 67", leaseValid: false, explanation: "The client broadcasts to find DHCP servers; it cannot use an address yet." },
    { state: "SELECTING", title: "Offer", message: "DHCPOFFER", signalRoute: "selecting-offer", direction: "server-to-client", delivery: "Server offer · UDP 67 → 68", leaseValid: false, explanation: "A server offers an address and configuration. An offer alone does not grant a usable lease." },
    { state: "REQUESTING", title: "Request", message: "DHCPREQUEST", signalRoute: "selecting-requesting", direction: "client-to-server", delivery: "Broadcast · UDP 68 → 67", leaseValid: false, explanation: "The client selects an offer and requests that address; other servers can see which offer was chosen." },
    { state: "BOUND", title: "Acknowledged · BOUND", message: "DHCPACK", signalRoute: "requesting-bound", direction: "server-to-client", delivery: "Server reply · UDP 67 → 68", leaseValid: true, explanation: "The ACK grants the lease. The client configures the address, checks for conflicts, and starts its lease timers." },
  ] },
  { id: "normal", title: "Normal renewal", steps: [bound, request, ack] },
  { id: "delayed", title: "Delayed response", steps: [bound, request,
    { state: "RENEWING", title: "No reply yet", delivery: "Silence · no packet arrived", leaseValid: true, explanation: "The server has not answered. The client keeps the address while its lease remains valid and retries." },
    rebind, { ...ack, signalRoute: "rebinding-bound" }] },
  { id: "relay", title: "Relay-path delay", steps: [bound, request,
    { ...rebind, viaRelay: true, delivery: "Broadcast, then relay-forwarded", explanation: "The client broadcasts at T2. The local relay forwards the request toward a server with the client subnet in giaddr." },
    { ...ack, signalRoute: "rebinding-bound", viaRelay: true, delivery: "Server → relay → client", explanation: "The server ACK returns through the relay before expiry; the client stays BOUND with renewed timers." }] },
  { id: "release", title: "Release", steps: [bound,
    { state: "INIT", title: "Lease released", message: "DHCPRELEASE", signalRoute: "bound-init", direction: "client-to-server", delivery: "Unicast to server", leaseValid: false, explanation: "The client voluntarily gives up the address and stops using it. DHCPRELEASE does not receive a DHCPACK." }] },
  { id: "expiry", title: "Expiry after silence", steps: [bound, request, rebind,
    { state: "INIT", title: "Expired", delivery: "No ACK · no packet arrived", leaseValid: false, explanation: "The lease reached 100% without an ACK. The client must stop using the address and return to INIT." }] },
  { id: "nak", title: "NAK", steps: [
    { state: "REQUESTING", title: "Address requested", message: "DHCPREQUEST", signalRoute: "requesting-loop", direction: "client-to-server", delivery: "Client request", leaseValid: false, explanation: "The client requests an address that the server will not accept." },
    { state: "INIT", title: "Rejected · INIT", message: "DHCPNAK", signalRoute: "requesting-init", direction: "server-to-client", delivery: "Server rejection", leaseValid: false, explanation: "The NAK rejects the requested address. The client must stop using it and restart discovery." }] },
  { id: "decline", title: "Decline", steps: [
    { state: "REQUESTING", title: "Request offered address", message: "DHCPREQUEST", signalRoute: "requesting-loop", direction: "client-to-server", delivery: "Client request", leaseValid: false, explanation: "The client requests an offered address." },
    { state: "BOUND", title: "ACK received; conflict check", message: "DHCPACK", signalRoute: "requesting-bound", direction: "server-to-client", delivery: "Server reply", leaseValid: false, explanation: "The server ACKs, but the client detects a conflict before using the address." },
    { state: "INIT", title: "Conflict reported · INIT", message: "DHCPDECLINE", signalRoute: "bound-init", direction: "client-to-server", delivery: "Client reports conflict", leaseValid: false, explanation: "The client tells the server the address is already in use, does not use it, and returns to discovery." }] },
];
