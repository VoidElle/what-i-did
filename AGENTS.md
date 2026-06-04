# AGENTS.md

## Agents

| Agent | Use for |
|---|---|
| `whatdidido-architecture` | Layer rules, dependency direction, where to add code, adding data sources |
| `whatdidido-context` | UI component patterns, Jira-specific display logic, standup format |
| `jira-api` | Jira REST API v3, JQL, changelog, ADF, `data/jira/` changes |
| `tauri-v2` | Tauri plugins, capabilities, IPC, CSP, `src-tauri/` changes |

## Stack

Tauri v2 · React 18 · TypeScript · Vite · Clean Architecture

## CSS

All styles in `src/App.css`. BEM-ish: `issue-card`, `issue-card--expanded`, `meta-chip`, `meta-chip.muted`, `detail-section`. Inline styles only for dynamic values.
