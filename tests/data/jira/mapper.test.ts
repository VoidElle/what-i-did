import { describe, it, expect } from "vitest";
import { extractAdfText } from "../../../src/data/jira/mapper";
import type { JiraAdfNode } from "../../../src/data/jira/types";

describe("extractAdfText", () => {
  it("returns empty string for null/undefined", () => {
    expect(extractAdfText(null)).toBe("");
    expect(extractAdfText(undefined)).toBe("");
  });

  it("returns string as-is", () => {
    expect(extractAdfText("plain text")).toBe("plain text");
  });

  it("extracts text from a simple paragraph", () => {
    const node: JiraAdfNode = {
      type: "paragraph",
      content: [{ type: "text", text: "Hello world" }],
    };
    expect(extractAdfText(node)).toBe("Hello world\n");
  });

  it("extracts nested text nodes", () => {
    const node: JiraAdfNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "First" },
            { type: "text", text: " Second" },
          ],
        },
      ],
    };
    expect(extractAdfText(node)).toContain("First Second");
  });

  it("formats bullet list items with bullet prefix", () => {
    const node: JiraAdfNode = {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Item one" }] },
          ],
        },
      ],
    };
    const result = extractAdfText(node);
    expect(result).toContain("• Item one");
  });

  it("formats code blocks with triple backticks", () => {
    const node: JiraAdfNode = {
      type: "codeBlock",
      content: [{ type: "text", text: "const x = 1;" }],
    };
    const result = extractAdfText(node);
    expect(result).toContain("```");
    expect(result).toContain("const x = 1;");
  });

  it("formats inline code with backticks", () => {
    const node: JiraAdfNode = {
      type: "inlineCode",
      text: "myFunc()",
    };
    expect(extractAdfText(node)).toBe("`myFunc()`");
  });

  it("formats mention with @ prefix", () => {
    const node: JiraAdfNode = {
      type: "mention",
      attrs: { text: "John Doe" },
    };
    expect(extractAdfText(node)).toBe("@John Doe");
  });

  it("handles hardBreak as newline", () => {
    const node: JiraAdfNode = { type: "hardBreak" };
    expect(extractAdfText(node)).toBe("\n");
  });
});
