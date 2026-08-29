import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

describe("user-readiness documentation", () => {
  test("states support before installation and keeps future work non-committal", async () => {
    const readme = await readFile("README.md", "utf8");
    const support = readme.indexOf("macOS on Apple Silicon");
    const linux = readme.indexOf("Linux x64");
    const install = readme.indexOf("## Install");

    expect(support).toBeGreaterThan(-1);
    expect(linux).toBeGreaterThan(-1);
    expect(support).toBeLessThan(install);
    expect(linux).toBeLessThan(install);
    expect(readme).toContain("## Future possibilities");
    expect(readme).toContain("web interface");
    expect(readme).toContain("Windows");
    expect(readme).not.toContain("proxy");
    expect(readme).not.toContain("cloud-provider IPs");
  });

  test("keeps the web constraint internal and defines reevaluation conditions", async () => {
    const note = await readFile("docs/internal/web-interface-status.md", "utf8");

    expect(note).toContain("Status: Paused");
    expect(note).toContain("cloud-provider IPs");
    expect(note).toContain("recurring proxy cost");
    expect(note).toContain("## Reevaluation conditions");
    expect(note).toContain("Remote Fly hosting (retired)");
  });

  test("does not deploy a remote Fly web host from CI", async () => {
    const workflows = await readdir(".github/workflows");
    expect(workflows).not.toContain("fly-deploy.yml");

    for (const name of workflows) {
      const text = await readFile(join(".github/workflows", name), "utf8");
      expect(text, name).not.toMatch(/flyctl|FLY_API_TOKEN|fly\.toml/i);
    }

    const readme = await readFile("README.md", "utf8");
    expect(readme).not.toMatch(/fly\.io|flyctl|fly\.toml/i);
  });

  test("asks for actionable bug reports without soliciting private data", async () => {
    const template = await readFile(".github/ISSUE_TEMPLATE/bug_report.md", "utf8");

    for (const heading of ["Steps to reproduce", "Expected behavior", "Actual behavior", "Technical context"]) {
      expect(template).toContain(`## ${heading}`);
    }
    expect(template).toContain("Do not include API keys");
    expect(template).toContain("Video Digest version");
    expect(template).toContain("OS");
    expect(template).toContain("Architecture");
  });
});
