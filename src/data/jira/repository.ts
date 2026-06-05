import type { ActivityIssue, JiraConnection, Worklog } from "../../domain/entities";
import type { IActivityRepository } from "../../domain/ports";
import { getAttachmentBlob, getWorklogs, getYesterdayIssues } from "./client";
import { mapIssue, mapWorklog } from "./mapper";

export class JiraActivityRepository implements IActivityRepository {
  async fetchYesterdayIssues(
    connection: JiraConnection,
    date: Date
  ): Promise<ActivityIssue[]> {
    const raw = await getYesterdayIssues(connection, date);
    return raw.map((r) => ({
      ...mapIssue(r),
      sourceConnectionId: connection.id,
      sourceConnectionName: connection.name,
    }));
  }

  async fetchWorklogs(
    connection: JiraConnection,
    issueKey: string
  ): Promise<Worklog[]> {
    const raw = await getWorklogs(connection, issueKey);
    return raw.map(mapWorklog);
  }

  async fetchAttachmentUrl(
    connection: JiraConnection,
    contentUrl: string,
    mimeType: string
  ): Promise<string> {
    return getAttachmentBlob(connection, contentUrl, mimeType);
  }
}
