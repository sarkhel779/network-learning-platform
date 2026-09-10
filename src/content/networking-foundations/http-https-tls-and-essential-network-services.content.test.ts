import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (tier: string) => readFileSync(join(process.cwd(), "src/content/networking-foundations", `http-https-tls-and-essential-network-services.${tier}.mdx`), "utf8");

describe("HTTP and essential network services content", () => {
  it("covers every essential service and canonical port at equal public depth", () => {
    const lesson = read("public");
    for (const anchor of ["web-services", "remote-access-services", "email-services", "file-transfer-services", "time-services", "monitoring-services"]) {
      expect(lesson).toContain(`id="${anchor}"`);
    }
    for (const port of ["80", "443", "8080", "22", "23", "25", "465", "587", "143", "993", "110", "995", "20", "21", "990", "123", "161", "162"]) {
      expect(lesson).toContain(port);
    }
    expect(lesson).toMatch(/SSL[\s\S]*obsolete[\s\S]*TLS/i);
    expect(lesson).not.toMatch(/key derivation|cipher-suite negotiation lab/i);
  });
});
