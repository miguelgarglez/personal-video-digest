import { describe, expect, test } from "bun:test";
import { isDarwin, resolveHostPlatform } from "./platform";

describe("resolveHostPlatform", () => {
  test("treats only darwin as macOS and every other host as Linux path/secret policy", () => {
    expect(resolveHostPlatform("darwin")).toBe("darwin");
    expect(resolveHostPlatform("linux")).toBe("linux");
    expect(resolveHostPlatform("win32")).toBe("linux");
    expect(isDarwin("darwin")).toBe(true);
    expect(isDarwin("linux")).toBe(false);
  });
});
