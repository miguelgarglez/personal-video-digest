# ADR 0002: Linux x64 as a supported Video Digest platform

Status: Accepted  
Date: 2026-08-29

## Context

Video Digest 1.1.0 is an npm-distributed CLI whose package metadata, local
paths, credential store, desktop actions, documentation, and CI all assume
macOS on Apple Silicon (`darwin`/`arm64`). `npx video-digest@1.1.0` fails on
Linux with `EBADPLATFORM`.

Miguel's daily Source Playlist digest (`transcript` / `ingest --email-preview`
with `--json`) needs to run on Linux, including Botty on a Linux host and this
repository's own Linux CI VMs. The agent JSON contracts
(`doctor-report.v1`, `cli-result.v1`, `config-status.v1`, and the other
documented schemas) must stay compatible. Secrets must not move into
`config.json` or JSON output. The Transcript runtime must remain an isolated
Python 3.12 environment managed by `uv`, never system Python.

macOS Apple Silicon must keep working.

## Decision

Support two official platforms:

- macOS Apple Silicon (`darwin`/`arm64`)
- Linux x64 (`linux`/`x64`)

Windows, macOS Intel, and other Linux architectures remain outside the
compatibility contract. They may install if npm's `os`/`cpu` arrays allow the
combination, but they are not verified.

### Package metadata

`package.json` declares `os: ["darwin", "linux"]` and `cpu: ["arm64", "x64"]`.
npm cannot express "darwin/arm64 OR linux/x64" as a single conjunction, so the
arrays are the union of supported values. Documentation states the official
combinations; CI verifies both official runners.

### Application paths

| Location | macOS | Linux |
| --- | --- | --- |
| Configuration | `~/Library/Application Support/video-digest/config.json` | `$XDG_CONFIG_HOME/video-digest/config.json` (default `~/.config`) |
| Managed Python runtime | `~/Library/Application Support/video-digest/runtime/python` | `$XDG_DATA_HOME/video-digest/runtime/python` (default `~/.local/share`) |
| Default Artifact Library | `~/Documents/Video Digest` | `~/Documents/Video Digest` |

The Artifact Library stays a user-visible Documents folder on both platforms
(the Linux equivalent of the macOS default). Application state uses XDG.
`--output-dir`, `VIDEO_DIGEST_OUTPUT_DIR`, and `config set output-dir` still
override the default.

### Credentials

Resolution order is unchanged: the selected provider's standard environment
variable, then the platform secret store, then missing.

- macOS keeps the Keychain-backed store (`service` `video-digest`).
- Linux has no persistent secret store. Digest credentials come from
  environment variables. `config set api-key` explains this and refuses to
  write secrets to files. `credential.source` remains `env`, `keychain`, or
  `missing`; Linux reports only `env` or `missing`.

This avoids a schema-version bump and matches the privacy rule that keys never
appear in config files or JSON contracts.

### Desktop actions

`--json` never copies, opens, or prompts.

Human `--copy` / `--open` / `open <target>` (non-JSON) use platform commands:

- macOS: `pbcopy` and `open`
- Linux: `xdg-open`; clipboard via `wl-copy` or `xclip` when present

Missing Linux desktop tools fail with the existing `copy-failed` /
`open-failed` codes and a remediation message. They do not block `doctor`,
`transcript --json`, or `ingest --json`.

The TUI remains available. Its native renderer is validated on macOS ARM; a
Linux launch failure restores the terminal and points at direct commands.

### Doctor and help

Doctor checks stay the same IDs and capabilities. Help and compatibility docs
describe Linux credentials and desktop-action limits. No new machine-facing
field is required.

### CI and release

The quality workflow runs the same gates on `macos-14` (arm64) and
`ubuntu-24.04` (x86_64). The Trusted Publishing workflow stays on macOS Apple
Silicon. Version numbers and release notes remain owned by Release Please.

## Consequences

- Linux hosts can install the published package and run agent workflows after
  installing Bun and `uv` and consenting to `video-digest setup`.
- macOS Keychain, Application Support paths, and `pbcopy`/`open` are unchanged.
- Adding a Linux persistent secret store later would need a new
  `credential.source` value or a schema bump; this decision deliberately
  defers that.
- Intel Mac and Linux ARM are not promised.
