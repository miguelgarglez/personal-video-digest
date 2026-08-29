import { join } from "node:path";
import { resolveHostPlatform } from "./platform";

export type AppPaths = {
  configPath: string;
  defaultArtifactLibrary: string;
  runtimeDir: string;
};

export type AppPathOptions = {
  env?: Record<string, string | undefined>;
  platform?: NodeJS.Platform;
};

export function resolveAppPaths(home: string, options: AppPathOptions = {}): AppPaths {
  const platform = resolveHostPlatform(options.platform ?? process.platform);
  const defaultArtifactLibrary = join(home, "Documents", "Video Digest");

  if (platform === "linux") {
    const configHome = xdgDirectory(options.env?.XDG_CONFIG_HOME, home, ".config");
    const dataHome = xdgDirectory(options.env?.XDG_DATA_HOME, home, join(".local", "share"));
    const applicationData = join(dataHome, "video-digest");

    return {
      configPath: join(configHome, "video-digest", "config.json"),
      defaultArtifactLibrary,
      runtimeDir: join(applicationData, "runtime", "python"),
    };
  }

  const applicationSupport = join(home, "Library", "Application Support", "video-digest");

  return {
    configPath: join(applicationSupport, "config.json"),
    defaultArtifactLibrary,
    runtimeDir: join(applicationSupport, "runtime", "python"),
  };
}

function xdgDirectory(configured: string | undefined, home: string, fallback: string): string {
  const trimmed = configured?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : join(home, fallback);
}
