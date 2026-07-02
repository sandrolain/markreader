import { afterEach, describe, expect, it, vi } from "vitest";
import { getFileSource, getFileUrl } from "./fileUtils";
import { renderMarkdown } from "./markdownUtils";

describe("getFileUrl", () => {
  it("resolves relative paths against the current browser location", () => {
    window.history.replaceState({}, "", "/docs/");

    expect(getFileUrl("./guide.md")).toBe(
      "http://localhost:3000/docs/guide.md",
    );
    expect(getFileUrl("../README.md")).toBe("http://localhost:3000/README.md");
  });
});

describe("renderMarkdown", () => {
  it("renders Markdown headings and preserves front matter attributes", () => {
    const result = renderMarkdown("---\ntitle: Demo\n---\n\n# Hello\n");

    expect(result.attributes.title).toBe("Demo");
    expect(result.html).toContain('<h1 id="hello">Hello</h1>');
  });
});

describe("getFileSource", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns cached content for repeated requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# Hello",
    });

    vi.stubGlobal("fetch", fetchMock);

    const first = await getFileSource("https://example.test/hello.md");
    const second = await getFileSource("https://example.test/hello.md");

    expect(first).toBe("# Hello");
    expect(second).toBe("# Hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
