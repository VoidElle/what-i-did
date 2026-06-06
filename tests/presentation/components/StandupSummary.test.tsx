import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../src/i18n";
import { StandupSummary } from "../../../src/presentation/components/StandupSummary";
import { makeIssue } from "../../helpers/factories";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

const DAY = 86_400_000;
const BASE = new Date("2024-03-15T00:00:00").getTime();

function renderSummary(issues = [makeIssue()]) {
  return render(
    <I18nextProvider i18n={i18n}>
      <StandupSummary issues={issues} windowStart={BASE} windowEnd={BASE + DAY} />
    </I18nextProvider>
  );
}

describe("StandupSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the copy button", () => {
    renderSummary();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("is disabled when there are no issues", () => {
    renderSummary([]);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is enabled when there are issues", () => {
    renderSummary([makeIssue()]);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("calls writeText when clicked", async () => {
    renderSummary();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  });

  it("shows copied state after clicking", async () => {
    renderSummary();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent(/copiato|copied/i));
  });
});
