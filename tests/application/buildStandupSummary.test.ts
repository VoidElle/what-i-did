import { describe, it, expect } from "vitest";
import { buildStandupSummary } from "../../src/application/buildStandupSummary";
import { makeIssue, makeStatusChange, makeComment } from "../helpers/factories";

const DAY = 86_400_000;
const BASE = new Date("2024-03-15T00:00:00").getTime();
const windowStart = BASE;
const windowEnd = BASE + DAY;

const inWindow = (offsetMs = DAY / 2) => new Date(BASE + offsetMs).toISOString();
const outOfWindow = () => new Date(BASE - DAY).toISOString();

describe("buildStandupSummary", () => {
  it("returns empty string when no issues", () => {
    expect(buildStandupSummary([], windowStart, windowEnd)).toBe("");
  });

  it("includes project name and issue key", () => {
    const issue = makeIssue({ key: "CORE-42", summary: "Fix auth bug" });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("[My Project]");
    expect(result).toContain("[CORE-42]");
    expect(result).toContain("Fix auth bug");
  });

  it("shows current status when no in-window status changes", () => {
    const issue = makeIssue({ status: { name: "In Review", colorName: "blue" } });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("In Review");
  });

  it("shows status transition when change is in window", () => {
    const issue = makeIssue({
      statusChanges: [
        makeStatusChange("To Do", "In Progress", inWindow()),
      ],
    });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("To Do");
    expect(result).toContain("In Progress");
  });

  it("ignores status changes outside window", () => {
    const issue = makeIssue({
      status: { name: "Done", colorName: "green" },
      statusChanges: [
        makeStatusChange("To Do", "Done", outOfWindow()),
      ],
    });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("Done");
    expect(result).not.toContain("To Do");
  });

  it("includes comment count when comments are in window", () => {
    const issue = makeIssue({
      comments: [makeComment(inWindow()), makeComment(inWindow(DAY / 3))],
    });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("2 comments added");
  });

  it("uses singular for one comment", () => {
    const issue = makeIssue({
      comments: [makeComment(inWindow())],
    });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("1 comment added");
  });

  it("ignores comments outside the window", () => {
    const issue = makeIssue({
      comments: [makeComment(outOfWindow())],
    });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).not.toContain("comment");
  });

  it("notes description updated when in window", () => {
    const issue = makeIssue({ descriptionLastChangedAt: inWindow() });
    const result = buildStandupSummary([issue], windowStart, windowEnd);
    expect(result).toContain("description updated");
  });

  it("groups multiple issues by project", () => {
    const issues = [
      makeIssue({ key: "PROJ-1", project: { key: "PROJ", name: "Project A" } }),
      makeIssue({ key: "PROJ-2", project: { key: "PROJ", name: "Project A" } }),
      makeIssue({ key: "OTHER-1", project: { key: "OTHER", name: "Project B" } }),
    ];
    const result = buildStandupSummary(issues, windowStart, windowEnd);
    expect(result).toContain("[Project A]");
    expect(result).toContain("[Project B]");
    expect(result).toContain("PROJ-1");
    expect(result).toContain("PROJ-2");
    expect(result).toContain("OTHER-1");
  });
});
