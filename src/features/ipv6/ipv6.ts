export type ParsedIpv6 = Readonly<{
  hextets: readonly number[];
  expanded: string;
  compressed: string;
}>;

export type Ipv6Prefix = Readonly<{
  address: string;
  prefixLength: number;
  networkBits: number;
  interfaceBits: number;
}>;

export type Ipv6Classification = Readonly<{
  kind: "unspecified" | "loopback" | "link-local" | "unique-local" | "global-unicast" | "multicast";
  scope: string;
  explanation: string;
}>;

const INVALID_ADDRESS = "Invalid IPv6 address";

function parseSide(value: string): number[] {
  if (!value) return [];
  return value.split(":").map((part) => {
    if (!/^[0-9a-f]{1,4}$/i.test(part)) throw new Error(INVALID_ADDRESS);
    return Number.parseInt(part, 16);
  });
}

function formatExpanded(hextets: readonly number[]) {
  return hextets.map((part) => part.toString(16).padStart(4, "0")).join(":");
}

function formatCompressed(hextets: readonly number[]) {
  let bestStart = -1;
  let bestLength = 0;
  for (let start = 0; start < hextets.length;) {
    if (hextets[start] !== 0) { start += 1; continue; }
    let end = start;
    while (end < hextets.length && hextets[end] === 0) end += 1;
    const length = end - start;
    if (length >= 2 && length > bestLength) { bestStart = start; bestLength = length; }
    start = end;
  }
  const plain = hextets.map((part) => part.toString(16));
  if (bestStart < 0) return plain.join(":");
  const left = plain.slice(0, bestStart).join(":");
  const right = plain.slice(bestStart + bestLength).join(":");
  return `${left}::${right}`;
}

export function parseIpv6(input: string): ParsedIpv6 {
  const value = input.trim();
  if (!value || value.includes(".") || value.includes("/")) throw new Error(INVALID_ADDRESS);
  const markers = value.match(/::/g)?.length ?? 0;
  if (markers > 1) throw new Error(INVALID_ADDRESS);

  let hextets: number[];
  if (markers === 1) {
    const [leftText, rightText] = value.split("::");
    const left = parseSide(leftText);
    const right = parseSide(rightText);
    const missing = 8 - left.length - right.length;
    if (missing < 1) throw new Error(INVALID_ADDRESS);
    hextets = [...left, ...Array<number>(missing).fill(0), ...right];
  } else {
    hextets = parseSide(value);
    if (hextets.length !== 8) throw new Error(INVALID_ADDRESS);
  }

  if (hextets.length !== 8) throw new Error(INVALID_ADDRESS);
  return { hextets, expanded: formatExpanded(hextets), compressed: formatCompressed(hextets) };
}

export function expandIpv6(input: string) { return parseIpv6(input).expanded; }
export function compressIpv6(input: string) { return parseIpv6(input).compressed; }

export function splitIpv6Prefix(input: string): Ipv6Prefix {
  const separator = input.lastIndexOf("/");
  if (separator < 1) throw new Error("Invalid IPv6 prefix");
  const address = input.slice(0, separator);
  const prefixText = input.slice(separator + 1);
  if (!/^\d{1,3}$/.test(prefixText)) throw new Error("Invalid IPv6 prefix");
  const prefixLength = Number(prefixText);
  if (prefixLength < 0 || prefixLength > 128) throw new Error("Invalid IPv6 prefix");
  return { address: compressIpv6(address), prefixLength, networkBits: prefixLength, interfaceBits: 128 - prefixLength };
}

export function classifyIpv6(input: string): Ipv6Classification {
  const { hextets, compressed } = parseIpv6(input);
  if (hextets.every((part) => part === 0)) return { kind: "unspecified", scope: "none", explanation: "Used before a host has a usable source address." };
  if (hextets.slice(0, 7).every((part) => part === 0) && hextets[7] === 1) return { kind: "loopback", scope: "host", explanation: "Returns traffic to this host." };
  if ((hextets[0] & 0xffc0) === 0xfe80) return { kind: "link-local", scope: "local link", explanation: "Valid only on the local link." };
  if ((hextets[0] & 0xfe00) === 0xfc00) return { kind: "unique-local", scope: "private organization", explanation: "Used for privately routed IPv6 networks." };
  if ((hextets[0] & 0xff00) === 0xff00) return { kind: "multicast", scope: `multicast (${compressed.slice(3, 4) || "0"})`, explanation: "Targets members of an IPv6 multicast group." };
  return { kind: "global-unicast", scope: "global", explanation: "Identifies one interface in globally routed IPv6 space." };
}

export function deriveSolicitedNodeMulticast(input: string): string {
  const { hextets } = parseIpv6(input);
  const low24 = ((hextets[6] & 0xff) << 16) | hextets[7];
  const high = (low24 >>> 16).toString(16).padStart(2, "0");
  const low = (low24 & 0xffff).toString(16).padStart(4, "0");
  return `ff02::1:ff${high}:${low}`;
}
