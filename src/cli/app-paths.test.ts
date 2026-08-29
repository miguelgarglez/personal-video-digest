import { describe, expect, test } from "bun:test";
import { resolveAppPaths } from "./app-paths";

describe("resolveAppPaths", () => {
  test("resolves the exact macOS application paths beneath the supplied home", () => {
    expect(resolveAppPaths("/Users/example", { platform: "darwin" })).toEqual({
      configPath: "/Users/example/Library/Application Support/video-digest/config.json",
      defaultArtifactLibrary: "/Users/example/Documents/Video Digest",
      runtimeDir: "/Users/example/Library/Application Support/video-digest/runtime/python",
    });
  });

  test("resolves XDG application paths on Linux and keeps the Documents library default", () => {
    expect(resolveAppPaths("/home/example", {
      env: {},
      platform: "linux",
    })).toEqual({
      configPath: "/home/example/.config/video-digest/config.json",
      defaultArtifactLibrary: "/home/example/Documents/Video Digest",
      runtimeDir: "/home/example/.local/share/video-digest/runtime/python",
    });
  });

  test("honors XDG_CONFIG_HOME and XDG_DATA_HOME on Linux", () => {
    expect(resolveAppPaths("/home/example", {
      env: {
        XDG_CONFIG_HOME: "/custom/config",
        XDG_DATA_HOME: "/custom/data",
      },
      platform: "linux",
    })).toEqual({
      configPath: "/custom/config/video-digest/config.json",
      defaultArtifactLibrary: "/home/example/Documents/Video Digest",
      runtimeDir: "/custom/data/video-digest/runtime/python",
    });
  });
});
