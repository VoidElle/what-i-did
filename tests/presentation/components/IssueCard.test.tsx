import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../src/i18n";
import { IssueCard } from "../../../src/presentation/components/IssueCard";
import { makeIssue, makeComment, makeStatusChange } from "../../helpers/factories";

const DAY = 86_400_000;
const BASE = new Date("2024-03-15T00:00:00").getTime();
const inWindow = () => new Date(BASE + DAY / 2).toISOString();

function renderCard(overrides = {}) {
  const issue = makeIssue(overrides);
  return render(
    <I18nextProvider i18n={i18n}>
      <IssueCard
        issue={issue}
        staggerIndex={0}
        windowStart={BASE}
        windowEnd={BASE + DAY}
        currentUserEmail="dev@example.com"
        onLoadWorklogs={vi.fn().mockResolvedValue([])}
        onFetchAttachmentUrl={vi.fn().mockResolvedValue("")}
      />
    </I18nextProvider>
  );
}

describe("IssueCard", () => {
  it("renders the issue key and summary", () => {
    renderCard({ key: "PROJ-99", summary: "My test issue" });
    expect(screen.getByText("PROJ-99")).toBeInTheDocument();
    expect(screen.getByText("My test issue")).toBeInTheDocument();
  });

  it("renders the issue status chip", () => {
    renderCard({ status: { name: "In Review", colorName: "blue" } });
    expect(screen.getByText("In Review")).toBeInTheDocument();
  });

  it("renders the issue type icon (svg present)", () => {
    const { container } = renderCard({ issueType: { name: "Bug" } });
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("expands to show detail section on click", () => {
    renderCard({ comments: [makeComment(inWindow())] });
    act(() => { fireEvent.click(screen.getByText("Test issue")); });
    expect(screen.queryAllByText(/comment/i).length).toBeGreaterThan(0);
  });

  it("shows status changes section header when changes exist", () => {
    renderCard({
      statusChanges: [makeStatusChange("To Do", "In Progress", inWindow())],
    });
    act(() => { fireEvent.click(screen.getByText("Test issue")); });
    expect(screen.queryAllByText(/status change|cambi di stato/i).length).toBeGreaterThan(0);
  });

  it("shows priority badge in meta chips", () => {
    renderCard({ priority: { name: "High" } });
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});
