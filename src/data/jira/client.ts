import { fetch } from "@tauri-apps/plugin-http";
import type { SourceConfig } from "../../domain/entities";
import type { JiraIssueRaw, JiraWorklogRaw } from "./types";

function authHeader(email: string, token: string): string {
  return "Basic " + btoa(`${email}:${token}`);
}

function jsonHeaders(email: string, token: string): Record<string, string> {
  return {
    Authorization: authHeader(email, token),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function getYesterdayIssues(
  config: SourceConfig
): Promise<JiraIssueRaw[]> {
  const { baseUrl, email, token } = config;
  const jql =
    'assignee = currentUser() AND updated >= "-1d" ORDER BY updated DESC';
  const fields =
    "summary,description,status,assignee,issuetype,priority,updated,comment,project,attachment";
  const url = `${baseUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&fields=${encodeURIComponent(fields)}&expand=changelog&maxResults=50`;

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders(email, token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Jira API error ${res.status}: ${res.statusText}${body ? ` - ${body.slice(0, 200)}` : ""}`
    );
  }

  const data = (await res.json()) as { issues?: JiraIssueRaw[] };
  return data.issues ?? [];
}

export async function getWorklogs(
  config: SourceConfig,
  issueKey: string
): Promise<JiraWorklogRaw[]> {
  const { baseUrl, email, token } = config;
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}/worklog`;

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders(email, token),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { worklogs?: JiraWorklogRaw[] };
  return data.worklogs ?? [];
}

export async function getAttachmentBlob(
  config: SourceConfig,
  contentUrl: string,
  mimeType: string
): Promise<string> {
  const { email, token } = config;
  const res = await fetch(contentUrl, {
    method: "GET",
    headers: { Authorization: authHeader(email, token) },
  });
  if (!res.ok) throw new Error(`Failed to fetch attachment: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}
