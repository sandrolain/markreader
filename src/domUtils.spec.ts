import { describe, expect, it } from "vitest";
import { h, htmlToNodes } from "./domUtils";

describe("h", () => {
  it("builds element tree with attrs and children", () => {
    const el = h("li", { class: "active" }, [
      h("a", { href: "#test" }, ["Label"]),
    ]);

    expect(el.tagName).toBe("LI");
    expect(el.className).toBe("active");
    expect(el.querySelector("a")?.getAttribute("href")).toBe("#test");
    expect(el.textContent).toBe("Label");
  });

  it("skips null and false children/attrs", () => {
    const el = h("div", { class: null, hidden: false }, [null, "ok", false]);

    expect(el.hasAttribute("class")).toBe(false);
    expect(el.hasAttribute("hidden")).toBe(false);
    expect(el.textContent).toBe("ok");
  });
});

describe("htmlToNodes", () => {
  it("parses HTML markup into DOM nodes", () => {
    const fragment = htmlToNodes("<strong>Hello</strong>");
    const div = document.createElement("div");
    div.appendChild(fragment);

    expect(div.innerHTML).toBe("<strong>Hello</strong>");
  });
});
