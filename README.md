# What I did

![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1-fbf0df?style=flat-square&logo=bun&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)

> A lightweight desktop app that pulls your Jira activity from the previous working day and turns it into a clean standup summary, ready to paste, no copy-pasting from browser tabs.

<p align="center">
  <img src="assets/screenshot.png" alt="Activity feed" />
</p>

## Why

Every standup I'd blank on what I actually did the day before. And if it was a Friday? Forget it, Monday morning I couldn't remember a thing from the whole week. So I built this: open the app, see everything you touched yesterday, copy the summary, done.

## Features

**Activity feed**
- Fetches all Jira issues you touched yesterday (by you, within the configured time window)
- Groups issues by project with collapsible sections
- Inline rich-text descriptions rendered from Atlassian Document Format (ADF)
- Status changes, comments, attachments, and worklogs shown inside each card
- Image attachments previewed inline, no browser required

**Standup summary**
- One-click **Copy standup summary** generates a ready-to-send bullet list to your clipboard
- Smart window: skips weekends, so Monday shows Friday's activity

**Multiple Jira connections**
- Connect to multiple Jira instances simultaneously (e.g. personal + work)
- Each connection has its own credentials; issues show their source connection
- Partial failures handled gracefully, one broken connection won't hide the rest

**Customization**
- 5 accent color themes: Emerald, Indigo, Rose, Sky, Violet
- Theme applied instantly and persisted across restarts
- Mock mode for offline development / UI exploration

**Privacy & security**
- All credentials stored locally via Tauri's encrypted store, nothing leaves your machine
- No analytics, no telemetry, no cloud sync

## Requirements

- [Bun](https://bun.sh/) >= 1.0
- [Rust](https://rustup.rs/) (stable toolchain)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

## Getting started

```bash
# Install JS dependencies
bun install

# Run in development mode
bun tauri dev

# Build a production binary
bun tauri build
```

## Configuration

On first launch the app opens the **Settings** screen. You can add one or more Jira connections:

| Field | Example |
|-------|---------|
| Name | `Work` |
| Jira Base URL | `https://mycompany.atlassian.net` |
| Email | `you@company.com` |
| Personal Access Token | *(generate at Profile > Security > Create API Token)* |

Multiple connections can be added, edited, or deleted at any time via the settings button.

Accent color and mock mode live in the **Customization** screen (palette icon in the sidebar).

## Tech stack

| Layer | Tech |
|-------|------|
| Desktop shell | Tauri 2 |
| Frontend | React 18 + TypeScript |
| Build tool | Vite 8 |
| Package manager | Bun |
| Styling | Tailwind CSS v4 |
| Icons | Phosphor Icons |
| HTTP | `@tauri-apps/plugin-http` |
| Storage | `@tauri-apps/plugin-store` |
| Clipboard | `@tauri-apps/plugin-clipboard-manager` |

## Architecture

The project follows Clean Architecture with strict layer separation:

```
src/
├── domain/          # Entities and port interfaces (no dependencies)
├── application/     # Use cases (fetchYesterdayActivity, buildStandupSummary)
├── data/
│   ├── jira/        # Jira REST API client, mapper, repository
│   └── mock/        # Offline mock data for development
└── presentation/
    ├── components/  # React UI components
    └── hooks/       # useSourceConfig (config persistence + migration)
```

## License

MIT, see [LICENSE](./LICENSE).
