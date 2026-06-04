import type { ActivityIssue, SourceConfig, Worklog } from "./entities";

export interface IActivityRepository {
  fetchYesterdayIssues(config: SourceConfig): Promise<ActivityIssue[]>;
  fetchWorklogs(config: SourceConfig, issueKey: string): Promise<Worklog[]>;
  fetchAttachmentUrl(
    config: SourceConfig,
    contentUrl: string,
    mimeType: string
  ): Promise<string>;
}
