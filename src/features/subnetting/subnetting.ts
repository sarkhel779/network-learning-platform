export type SubnetSpecialCase = "traditional" | "point-to-point" | "single-address";

export type SubnetAnalysis = {
  address: string;
  prefix: number;
  mask: string;
  maskBinary: string;
  network: string;
  firstUsable: string;
  lastUsable: string;
  broadcast: string | null;
  totalAddresses: number;
  usableAddresses: number;
  hostBits: number;
  interestingOctet: number;
  blockSize: number;
  specialCase: SubnetSpecialCase;
};

function assertPrefix(prefix: number) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("IPv4 prefix must be an integer between 0 and 32");
  }
}

export function parseIpv4(value: string): number {
  const parts = value.split(".");
  if (
    parts.length !== 4 ||
    parts.some((part) => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)
  ) {
    throw new Error(`${value} is not a valid IPv4 address`);
  }

  return parts.reduce((result, part) => (result * 256 + Number(part)) >>> 0, 0);
}

export function formatIpv4(value: number): string {
  const unsigned = value >>> 0;
  return [24, 16, 8, 0].map((shift) => (unsigned >>> shift) & 255).join(".");
}

export function prefixToMask(prefix: number): number {
  assertPrefix(prefix);
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function maskAsBinary(mask: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((mask >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".");
}

export function analyzeSubnet(address: string, prefix: number): SubnetAnalysis {
  assertPrefix(prefix);
  const parsed = parseIpv4(address);
  const maskValue = prefixToMask(prefix);
  const networkValue = (parsed & maskValue) >>> 0;
  const hostBits = 32 - prefix;
  const totalAddresses = 2 ** hostBits;
  const lastAddressValue = networkValue + totalAddresses - 1;
  const specialCase: SubnetSpecialCase =
    prefix === 31 ? "point-to-point" : prefix === 32 ? "single-address" : "traditional";
  const interestingOctet = prefix === 32 ? 4 : Math.min(4, Math.floor(prefix / 8) + 1);
  const bitsInInterestingOctet = prefix - (interestingOctet - 1) * 8;
  const maskOctet = bitsInInterestingOctet <= 0 ? 0 : (256 - 2 ** (8 - bitsInInterestingOctet));

  const firstUsableValue = specialCase === "traditional" ? networkValue + 1 : networkValue;
  const lastUsableValue = specialCase === "traditional" ? lastAddressValue - 1 : lastAddressValue;

  return {
    address: formatIpv4(parsed),
    prefix,
    mask: formatIpv4(maskValue),
    maskBinary: maskAsBinary(maskValue),
    network: formatIpv4(networkValue),
    firstUsable: formatIpv4(firstUsableValue),
    lastUsable: formatIpv4(lastUsableValue),
    broadcast: specialCase === "traditional" ? formatIpv4(lastAddressValue) : null,
    totalAddresses,
    usableAddresses: specialCase === "traditional" ? Math.max(0, totalAddresses - 2) : totalAddresses,
    hostBits,
    interestingOctet,
    blockSize: prefix === 32 ? 1 : 256 - maskOctet,
    specialCase,
  };
}

export function sameSubnet(left: string, right: string, prefix: number): boolean {
  const mask = prefixToMask(prefix);
  return ((parseIpv4(left) & mask) >>> 0) === ((parseIpv4(right) & mask) >>> 0);
}
