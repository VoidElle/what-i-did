import type { ActivityIssue, JiraConnection, Worklog } from "./entities";

export interface IActivityRepository {
  fetchYesterdayIssues(connection: JiraConnection, date: Date): Promise<ActivityIssue[]>;
  fetchWorklogs(connection: JiraConnection, issueKey: string): Promise<Worklog[]>;
  fetchAttachmentUrl(
    connection: JiraConnection,
    contentUrl: string,
    mimeType: string
  ): Promise<string>;
}
