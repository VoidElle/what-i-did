---
name: WhatDidIDo App Context
description: UI component patterns, Jira-specific display logic, and standup format for what-i-did. For architecture/layer rules use the whatdidido-architecture agent.
---

> Architecture → use `whatdidido-architecture` agent.

## UX flow

1. Open → `useSourceConfig` loads `SourceConfig` from Tauri store
2. No config → `SettingsScreen`
3. Config → `MainScreen` calls `fetchYesterdayActivity(repo, config)` → renders `IssueCard` per issue

## Component tree

```
App.tsx (composition root)
├── SettingsScreen
└── MainScreen
    ├── StandupSummary (clipboard button)
    └── [per project] IssueCard
            └── AttachmentList
```

## IssueCard - collapsed

- Type emoji + key + assignee chip | status badge (colored) + chevron
- Summary
- Meta chips: priority · updated date · `💬 N` · `🔄 Status changed` (amber, if changed yesterday)

## IssueCard - expanded (section order)

1. Description (plain text)
2. Yesterday's Status Changes - `from → to`, timestamp, author
3. Attachments (lazy blob load on click)
4. Comments (plain text body)
5. Worklogs (lazy on expand via `onLoadWorklogs` callback)

## Status color map

```ts
{ "blue-grey": "#5e6c84", yellow: "#ff991f", green: "#00875a", red: "#de350b" }
```
Keyed by `issue.status.colorName`.

## Type emoji map

```ts
{ Bug: "🐛", Story: "📖", Task: "✅", Epic: "⚡", Subtask: "↳" }  // fallback: "📌"
```

## Standup format

```
Yesterday:
- [KEY-123] Fix login button → Done
- [KEY-456] Update API docs → In Progress
```

Built by `buildStandupSummary(issues)` in `application/`. Copied via `@tauri-apps/plugin-clipboard-manager`.

## Activity window

Last 24 h rolling (`Date.now() - 24 * 60 * 60 * 1000`). Match by `author.email === config.email` (case-insensitive). Issue shown only if user authored a comment or changelog entry within window.

