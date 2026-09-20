export type HostDeviceIconKind =
  | "desktop"
  | "laptop"
  | "mobile"
  | "printer"
  | "camera"
  | "iot"
  | "physical-server"
  | "cloud-server";

export function HostDeviceIcon({ kind }: { kind: HostDeviceIconKind }) {
  const common = { className: "host-device-icon", viewBox: "0 0 64 64", role: "img", "data-host-device-icon": kind } as const;

  if (kind === "desktop") return <svg {...common} aria-label="Desktop computer icon"><rect x="9" y="10" width="46" height="32" rx="3" /><path d="M24 54h16M32 42v12M16 47h32" /></svg>;
  if (kind === "laptop") return <svg {...common} aria-label="Laptop icon"><rect x="13" y="9" width="38" height="31" rx="3" /><path d="M7 49h50l-5 6H12zM25 49h14" /></svg>;
  if (kind === "mobile") return <svg {...common} aria-label="Phone and tablet icon"><rect x="10" y="12" width="25" height="40" rx="4" /><rect x="40" y="7" width="15" height="35" rx="3" /><path d="M19 46h7M45 36h5" /></svg>;
  if (kind === "printer") return <svg {...common} aria-label="Network printer icon"><path d="M18 24V8h28v16M17 48h30v9H17z" /><rect x="8" y="23" width="48" height="28" rx="5" /><path d="M17 38h30v19M45 31h3" /></svg>;
  if (kind === "camera") return <svg {...common} aria-label="IP camera icon"><path d="M8 19h35v25H8zM43 26l13-7v25l-13-7zM22 44v9h17" /><circle cx="25" cy="31.5" r="7" /></svg>;
  if (kind === "iot") return <svg {...common} aria-label="IoT sensor icon"><circle cx="32" cy="32" r="8" /><path d="M32 7v9M32 48v9M7 32h9M48 32h9M14 14l7 7M43 43l7 7M50 14l-7 7M21 43l-7 7" /></svg>;
  if (kind === "physical-server") return <svg {...common} aria-label="Physical server icon"><rect x="12" y="7" width="40" height="50" rx="3" /><path d="M12 23h40M12 40h40M21 15h18M21 31h18M21 48h18" /><circle cx="45" cy="15" r="2" /><circle cx="45" cy="31" r="2" /><circle cx="45" cy="48" r="2" /></svg>;
  return <svg {...common} aria-label="Cloud virtual server icon"><path d="M13 42c-7-1-8-12-2-16 0-8 9-13 16-9 5-10 20-7 21 4 10-1 14 13 5 18-2 2-5 3-8 3H13z" /><path d="M23 47h26M23 53h26M26 47v6M46 47v6" /></svg>;
}
