function octets(ip: string): number[] {
  return ip.split(".").map(Number);
}

function toBinaryOctet(value: number): string {
  return value.toString(2).padStart(8, "0");
}

export function ipToBinary(ip: string): string {
  return octets(ip).map(toBinaryOctet).join(".");
}

export function andIp(ip: string, mask: string): string {
  const ipOctets = octets(ip);
  const maskOctets = octets(mask);
  return ipOctets.map((byte, index) => byte & maskOctets[index]).join(".");
}

export function sameSubnet(ipA: string, ipB: string, mask: string): boolean {
  return andIp(ipA, mask) === andIp(ipB, mask);
}
