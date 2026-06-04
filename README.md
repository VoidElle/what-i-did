# what-i-did

Desktop app that fetches your Jira activity from the previous working day and displays it in a clean summary - so you can quickly recap during the daily standup.

Built with **Tauri 2 · React · TypeScript · Vite**.

---

## Features

- Fetches all Jira issues you worked on yesterday (updated by you in the last 24h)
- Groups issues by project
- Shows issue status, type, priority, comments, and attachments
- One-click **Copy standup summary** - pastes a ready-to-send bullet list to your clipboard
- Credentials stored locally via Tauri's secure store plugin (never leave your machine)

## Requirements

- [Node.js](https://nodejs.org/) ≥ 18
- [Rust](https://rustup.rs/) (stable toolchain)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

## Getting started

```bash
# Install JS dependencies
npm install

# Run in development mode
npm run tauri dev

# Build a production binary
npm run tauri build
```

## Configuration

On first launch the app opens the Settings screen. Fill in:

| Field | Example |
|-------|---------|
| Jira Base URL | `https://mycompany.atlassian.net` |
| Email | `you@company.com` |
| Personal Access Token | *(generate at Profile → Security → Create API Token)* |

Settings are persisted locally and can be updated at any time via the ⚙️ button.

## Tech stack

| Layer | Tech |
|-------|------|
| Desktop shell | Tauri 2 |
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| HTTP | `@tauri-apps/plugin-http` |
| Storage | `@tauri-apps/plugin-store` |
| Clipboard | `@tauri-apps/plugin-clipboard-manager` |

