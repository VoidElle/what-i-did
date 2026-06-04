---
name: WhatDidIDo Architecture
description: Clean Architecture reference for what-i-did. Use for any structural question layer rules, where to add code, dependency direction, adding data sources, feature cheat-sheet.
---

## Layer map

```
src/
├── domain/               zero deps - entities.ts, ports.ts
├── data/jira/            implements IActivityRepository - types.ts, mapper.ts, client.ts, repository.ts
├── application/          use cases - fetchYesterdayActivity.ts, buildStandupSummary.ts
├── presentation/         React - components/, hooks/useSourceConfig.ts
└── App.tsx               composition root (only file allowed to import data/)
```

## Dependency rule

`presentation → application → domain ← data`  
Never import `data/` from a component or use case.

## Key types

```ts
// domain/entities.ts
interface ActivityIssue {
  id, key, summary, description: string  // description = plain text
  status: { name, colorName }
  issueType: { name, iconUrl? }
  priority: { name, iconUrl? } | null
  assignee: { displayName, email } | null
  updatedAt: string
  attachments: Attachment[]
  comments: IssueComment[]      // body = plain text
  statusChanges: StatusChange[] // pre-mapped from changelog
  project: { key, name }
}
interface SourceConfig { baseUrl, email, token }

// domain/ports.ts
interface IActivityRepository {
  fetchYesterdayIssues(config): Promise<ActivityIssue[]>
  fetchWorklogs(config, issueKey): Promise<Worklog[]>
  fetchAttachmentUrl(config, contentUrl, mimeType): Promise<string>
}
```

## Layer rules

**domain/** - pure TS, no imports from project  
**data/jira/** - raw Jira types private to folder; mapper does ADF→text; client uses `@tauri-apps/plugin-http` (never `window.fetch`); repository is thin (calls client → mapper → return domain type)  
**application/** - one exported fn per file; no React/Tauri  
**presentation/** - components receive domain types + callback props for lazy ops; hooks only in `hooks/`  
**App.tsx** - instantiate `new JiraActivityRepository()` once at module scope

## Feature cheat-sheet

| Task | Where |
|---|---|
| New Jira field | `data/jira/types.ts` → `mapper.ts` → `domain/entities.ts` → component |
| New filter rule | `application/fetchYesterdayActivity.ts` |
| New issue card section | `presentation/components/IssueCard.tsx` |
| New standup format | `application/buildStandupSummary.ts` |
| New data source | `data/<source>/` implementing `IActivityRepository`; change nothing else |
| New setting | `domain/entities.ts` (SourceConfig) → `useSourceConfig.ts` → `Settings.tsx` |
| New Tauri plugin | see `tauri-v2` agent |
