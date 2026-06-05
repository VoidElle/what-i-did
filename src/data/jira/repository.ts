import type { ActivityIssue, SourceConfig, Worklog } from "../../domain/entities";
import type { IActivityRepository } from "../../domain/ports";
import { getAttachmentBlob, getWorklogs, getYesterdayIssues } from "./client";
import { mapIssue, mapWorklog } from "./mapper";

export class JiraActivityRepository implements IActivityRepository {
  async fetchYesterdayIssues(
    config: SourceConfig,
    date: Date
  ): Promise<ActivityIssue[]> {
    const raw = await getYesterdayIssues(config, date);
    return raw.map(mapIssue);
  }

  async fetchWorklogs(
    config: SourceConfig,
    issueKey: string
  ): Promise<Worklog[]> {
    const raw = await getWorklogs(config, issueKey);
    return raw.map(mapWorklog);
  }

  async fetchAttachmentUrl(
    config: SourceConfig,
    contentUrl: string,
    mimeType: string
  ): Promise<string> {
    return getAttachmentBlob(config, contentUrl, mimeType);
  }
}
