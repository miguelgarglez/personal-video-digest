export type HostPlatform = "darwin" | "linux";

export function resolveHostPlatform(platform: NodeJS.Platform = process.platform): HostPlatform {
  return platform === "darwin" ? "darwin" : "linux";
}

export function isDarwin(platform: NodeJS.Platform = process.platform): boolean {
  return resolveHostPlatform(platform) === "darwin";
}
