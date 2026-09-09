function toNumber(address: string) {
  return address.split(".").reduce((value, octet) => (value << 8) + Number(octet), 0) >>> 0;
}

function inRange(value: number, base: string, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) >>> 0 === (toNumber(base) & mask) >>> 0;
}

export function classifyIpv4Address(address: string) {
  const value = toNumber(address);
  if (inRange(value, "10.0.0.0", 8) || inRange(value, "172.16.0.0", 12) || inRange(value, "192.168.0.0", 16)) return "private";
  if (inRange(value, "127.0.0.0", 8)) return "loopback";
  if (inRange(value, "169.254.0.0", 16)) return "link-local";
  if (inRange(value, "192.0.2.0", 24) || inRange(value, "198.51.100.0", 24) || inRange(value, "203.0.113.0", 24)) return "documentation";
  return "public";
}

function format(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function describePrefix(address: string, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (toNumber(address) & mask) >>> 0;
  return { networkAddress: format(network), broadcastAddress: format((network | (~mask >>> 0)) >>> 0), networkBits: prefix, hostBits: 32 - prefix };
}
