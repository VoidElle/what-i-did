---
name: WhatDidIDo App Context
description: Full architecture and business logic context for the what-i-did app. Use for tasks involving UI components, data flow, filtering logic, standup generation, or adding new features.
---

You are an expert on the **what-i-did** Tauri desktop app — a standup helper that shows a developer's Jira activity from yesterday and lets them copy a standup summary to the clipboard.

## Purpose & UX flow

1. User opens app → `useJiraConfig` loads saved `JiraConfig` from store.
2. If no config → `SettingsScreen` (configure Jira URL, email, API token).
3. If config exists → `MainScreen` fetches yesterday's issues and renders them.
4. User reviews issues, expands cards for details, clicks "Copy standup summary".

## Component tree

```
App.tsx
├── SettingsScreen   (src/components/Settings.tsx)
└── MainScreen       (src/components/MainScreen.tsx)
    ├── StandupSummary  (copy-to-clipboard button)
    └── [per project group]
        └── IssueCard   (src/components/IssueCard.tsx)
            └── AttachmentList (src/components/AttachmentList.tsx)
```

## Data flow

1. `MainScreen` calls `fetchYesterdayIssues(config)` on mount (and on config change).
2. Issues are filtered to only those where the user acted yesterday (see Filtering below).
3. `groupByProject(issues)` splits issues into `Map<projectKey, JiraIssue[]>` (project key = text before `-` in issue key).
4. Each `IssueCard` is collapsed by default. On expand, it lazy-fetches worklogs via `fetchWorklog(config, key)`.
5. `StandupSummary` builds text from all visible issues: `- [KEY] Summary → Status`.

## Activity filtering (user acted yesterday)

An issue is shown only if the **current user** (matched by `config.email`) performed at least one of:
- Authored a **comment** with `created` or `updated` within the last 24 h.
- Authored a **changelog entry** (status change, field update, etc.) within the last 24 h.

Match logic: `author.emailAddress?.toLowerCase() === config.email.toLowerCase()`, fall back to `displayName` if email absent.

Window: `Date.now() - 24 * 60 * 60 * 1000` (last 24 h rolling). This aligns with the JQL `-1d` query. Worklogs are excluded from initial filtering because they are lazy-loaded.

## Status changes display

Status transitions come from `issue.changelog.histories` (available because the API uses `expand=changelog`).

A "status change" history entry: `history.items.some(i => i.field === "status")`.  
Display format: `fromString → toString` (e.g., `In Progress → Done`).

In **collapsed** card view: show a `🔄` chip in the meta row when any status change happened yesterday.  
In **expanded** card view: show each transition with timestamp, author, and `from → to`.

Only show status changes that fall within the activity window (same 24-h filter used for filtering).

## IssueCard — collapsed state

Always visible:
- Type emoji + issue key + assignee chip (header row left)
- Status badge (colored) + expand chevron (header row right)
- Summary text
- Meta chips: priority, last-updated date, comment count `💬 N`, `🔄` if status changed yesterday

## IssueCard — expanded state (sections in order)

1. **Description** (ADF → plain text via `extractAdfText`)
2. **Attachments** (via `AttachmentList`)
3. **Yesterday's Status Changes** — status transitions from changelog within activity window
4. **Comments** — all comments on the issue
5. **Worklogs** — lazy-loaded on expand

## Types (src/types/jira.ts)

Key types:
- `JiraIssue` — full issue with `fields` + optional `changelog`
- `JiraComment` — `{ id, author: {displayName, emailAddress?}, body, created, updated }`
- `ChangelogHistory` — `{ id, author, created, items: ChangelogItem[] }`
- `ChangelogItem` — `{ field, fromString, toString, ... }`
- `WorklogEntry` — `{ id, author, comment?, timeSpent, started }`
- `JiraConfig` — `{ baseUrl, email, token }`
- `AdfNode` / `AdfMark` — Atlassian Document Format tree nodes

## ADF rendering

`extractAdfText(node)` in `IssueCard.tsx` converts ADF → plain text string. It handles all common node types. Extend its `switch` for new node types. Always guard: `if (typeof node === "string") return node`.

## Standup text format

```
Yesterday:
- [KEY-123] Fix login button → Done
- [KEY-456] Update API docs → In Progress
```

Built by `buildStandup(issues)` in `StandupSummary.tsx`. Copied via `@tauri-apps/plugin-clipboard-manager` `writeText`.

## Status color mapping

```ts
const STATUS_COLOR: Record<string, string> = {
  "blue-grey": "#5e6c84",
  yellow:      "#ff991f",
  green:       "#00875a",
  red:         "#de350b",
};
```
Keyed by `fields.status.statusCategory.colorName`.

## Issue type emoji mapping

```ts
const TYPE_EMOJI: Record<string, string> = {
  Bug:     "🐛",
  Story:   "📖",
  Task:    "✅",
  Epic:    "⚡",
  Subtask: "↳",
};
```
Default fallback: `"📌"`.

## Styling

All styles in `src/App.css`. CSS class naming: BEM-ish with `issue-card`, `issue-header`, `meta-chip`, `detail-section`, `detail-label`, `detail-body`, `comment-entry`, `worklog-entry`, etc. Avoid adding inline styles except for dynamic values (e.g., `style={{ backgroundColor: color }}`).

## State management

No global state (no Redux/Zustand). Each component manages its own local state with `useState`. Config is the only persisted state (via Tauri plugin-store, accessed through `useJiraConfig` hook). Issue data is re-fetched on each app open / config change — no caching.

## Common extension patterns

**Add a new section to IssueCard expanded view:**
1. Add data to the relevant type in `src/types/jira.ts` if needed.
2. Fetch data in `fetchYesterdayIssues` (via extra field) or lazy-load in the `toggle` handler.
3. Render section inside `{expanded && (<div className="issue-details">...)}` following existing section structure.

**Add a new Jira field to the overview:**
1. Add field name to the `fields` param in `fetchYesterdayIssues`.
2. Extend `JiraIssue.fields` type.
3. Render in `IssueCard` (collapsed = meta chip, expanded = detail section).

**Add a new filter:**
Filtering happens in `MainScreen` after fetch, before `groupByProject`. Add a `.filter(issue => ...)` call in the `then` callback of `fetchYesterdayIssues`.
