# Web interface status

Status: Paused
Date: 2026-06-30

The code under `src/web/` is retained as an experimental adapter, but it is not an
active product surface. YouTube commonly blocks Transcript retrieval from
cloud-provider IPs. The upstream retrieval approach suggests proxy-based mitigation,
which would add recurring proxy cost and operational complexity.

The project is not accepting that cost and maintenance trade-off now. Do not present
the web interface as supported, deploy it as part of routine releases, or invest in
feature parity with the TUI while this status remains in effect.

Local `bun run web` remains available for in-repo experiments. Remote hosting is
not a product surface. The CLI is not designed to run on remote hosts.

## Remote Fly hosting (retired)

A leftover Fly.io path used to deploy this experimental web adapter on every
relevant push to `main` (`fly.toml`, `Dockerfile`, `.github/workflows/fly-deploy.yml`,
and `docs/deployment/fly.md`). That remote deploy is retired. Do not restore it
or invent a replacement host. Video Digest is a local CLI for macOS Apple Silicon
and Linux x64.

## Reevaluation conditions

Reevaluate the web interface when at least one condition holds:

- a reliable no-cost or acceptably priced Transcript retrieval path is available;
- a local or user-operated execution design avoids cloud-IP blocking; or
- demonstrated demand justifies a maintained proxy strategy.

When work resumes, validate Transcript retrieval from the intended deployment
environment before investing in UI features.
