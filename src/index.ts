import { getFileSource, getFileUrl } from "./fileUtils";
import {
  getCurrentMarkdownFilePath,
  getCurrentMarkdownFileUrl,
  renderMarkdown,
} from "./markdownUtils";
import {
  config,
  getLogoUrl,
  getNavigationItems,
  loadConfig,
  NavigationItem,
} from "./configUtils";
import mainStyle from "./style.css?inline";
import markdownLightStyle from "github-markdown-css/github-markdown-light.css?inline";
import markdownDarkStyle from "github-markdown-css/github-markdown-dark.css?inline";
import hljsLightStyle from "highlight.js/styles/atom-one-light.css?inline";
import hljsDarkStyle from "highlight.js/styles/atom-one-dark.css?inline";
import { h, htmlToNodes, clear } from "./domUtils";
import SweetScroll from "sweet-scroll";
import { addExternalStyle, addStyle, throttle } from "./htmlUtils";
import { APP_COMMIT, APP_NAME, APP_VERSION } from "./constants";

type Theme = "auto" | "light" | "dark";

const THEME_STORAGE_KEY = "mkrdr-theme";

let currentTheme: Theme = "auto";
let themeToggleEl: HTMLElement | null = null;

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
  return theme === "auto" ? getSystemTheme() : theme;
};

const getThemeIcon = (theme: Theme): string => {
  if (theme === "auto") {
    return getSystemTheme() === "dark" ? "☾" : "☀";
  }
  return theme === "dark" ? "☾" : "☀";
};

const getThemeLabel = (theme: Theme): string => {
  if (theme === "auto") return "System";
  return theme.charAt(0).toUpperCase() + theme.slice(1);
};

const updateToggleButton = (): void => {
  if (!themeToggleEl) return;
  themeToggleEl.textContent = `${getThemeIcon(currentTheme)} ${getThemeLabel(currentTheme)}`;
};

const applyTheme = (): void => {
  const effective = getEffectiveTheme(currentTheme);
  document.documentElement.setAttribute("data-theme", effective);

  addStyle("mdwn-style", effective === "dark" ? markdownDarkStyle : markdownLightStyle);
  addStyle("hljs-style", effective === "dark" ? hljsDarkStyle : hljsLightStyle);

  updateToggleButton();
};

const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const loadTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }
  if (config.defaultTheme === "light" || config.defaultTheme === "dark" || config.defaultTheme === "auto") {
    return config.defaultTheme;
  }
  return "auto";
};

const cycleTheme = (): void => {
  const order: Theme[] = ["auto", "light", "dark"];
  const idx = order.indexOf(currentTheme);
  currentTheme = order[(idx + 1) % order.length];
  saveTheme(currentTheme);
  applyTheme();
};

const renderNavigationMenu = (items: NavigationItem[]): HTMLUListElement => {
  const actMdUrl = getCurrentMarkdownFileUrl();
  return h(
    "ul",
    null,
    items.map((item) => {
      const itemUrl = getFileUrl(item.file);
      const current = itemUrl === actMdUrl;
      const submenu = item.children
        ? renderNavigationMenu(item.children)
        : null;
      return h("li", { class: current ? "active" : null }, [
        h("a", { href: item.file ?? "#" }, [item.label]),
        submenu,
      ]);
    }),
  ) as HTMLUListElement;
};

const renderNavigation = async (): Promise<HTMLUListElement | null> => {
  try {
    const items = await getNavigationItems(config);
    return renderNavigationMenu(items);
  } catch (e) {
    //
  }
  return null;
};

interface PageHeadItem {
  type: string;
  id: string;
  label: string;
}

const scroller = new SweetScroll();

const scrollToHead = (event: MouseEvent, item: PageHeadItem): void => {
  event.preventDefault();
  scroller.to(`#${item.id}`);
};

const generatePageHeadersMenu = (
  contentHTML: string,
): HTMLUListElement | null => {
  const div = document.createElement("div");
  div.innerHTML = contentHTML;
  const headersNodes = div.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const items: PageHeadItem[] = [];
  if (headersNodes.length > 0) {
    headersNodes.forEach((node) => {
      if (node.id) {
        const type = node.tagName.toLowerCase();
        const id = node.id;
        const label = node.textContent;
        items.push({
          type,
          id,
          label,
        });
      }
    });
  }

  if (items.length === 0) {
    return null;
  }

  return h(
    "ul",
    null,
    items.map((item) =>
      h("li", { "data-id": item.id, "data-type": item.type }, [
        h(
          "a",
          {
            href: "#",
            onclick: (event: Event): void =>
              scrollToHead(event as MouseEvent, item),
          },
          [item.label],
        ),
      ]),
    ),
  ) as HTMLUListElement;
};

const getPageHeaders = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
};

const getPageHeadersMenuAnchors = (): Record<string, HTMLLIElement> => {
  const anchors = Array.from(
    document.querySelectorAll<HTMLLIElement>("#mkrdr-headers-menu li[data-id]"),
  );
  const result: Record<string, HTMLLIElement> = {};
  for (const node of anchors) {
    const id = node.getAttribute("data-id");
    if (id) {
      result[id] = node;
    }
  }
  return result;
};

const highlightNavigation = (): boolean => {
  const sections = getPageHeaders();
  const anchors = getPageHeadersMenuAnchors();
  for (const node of sections) {
    if (node.hasAttribute("id") && node.getBoundingClientRect().top >= 0) {
      const id = node.getAttribute("id");
      const anchor = id ? anchors[id] : null;
      if (!anchor) {
        continue;
      }
      if (!anchor.classList.contains("active")) {
        Object.values(anchors)
          .find((item) => item.classList.contains("active"))
          ?.classList.remove("active");
        anchor.classList.add("active");
      }
      return true;
    }
  }
  return false;
};

const updateWindowTitle = (): void => {
  const mainTitle = config.title;
  const titleNode = document.querySelector("#mkrdr-content h1");
  document.title = titleNode
    ? `${titleNode.textContent} - ${mainTitle}`
    : (mainTitle ?? "");
};

const renderPage = async (contentHTML: string): Promise<void> => {
  const logoUrl = getLogoUrl();
  const navigation = await renderNavigation();
  const headers = generatePageHeadersMenu(contentHTML);
  const content = htmlToNodes(contentHTML);
  const withCredits = !config.hideCredits;
  const withLogo = !!(!config.hideLogo && logoUrl);
  const withNavigation = !!(!config.hideNavigationMenu && navigation);
  const withHeaders = !!(!config.hideHeadersMenu && headers);

  const rootClass = [
    withLogo ? "with-logo" : null,
    withNavigation ? "with-navigation" : null,
    withHeaders ? "with-headers" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const result = h("div", { id: "mkrdr-root", class: rootClass || null }, [
    h("div", { id: "mkrdr-wrp" }, [
      withLogo || withNavigation
        ? h("nav", { id: "mkrdr-navigation" }, [
            withLogo
              ? h("div", { id: "mkrdr-logo" }, [
                  h("img", { src: logoUrl, alt: config.title }),
                ])
              : null,
            withNavigation
              ? h("div", { id: "mkrdr-navigation-cnt" }, [
                  h("div", { id: "mkrdr-navigation-menu" }, [navigation]),
                  h("div", { id: "mkrdr-theme-toggle" }, [
                    h("button", {
                      class: "theme-toggle-btn",
                      onclick: cycleTheme,
                    }, [""]),
                  ]),
                ])
              : null,
          ])
        : null,
      h("main", { id: "mkrdr-content" }, [
        h("div", { id: "mkrdr-content-wrp", class: "markdown-body" }, [
          content,
        ]),
      ]),
      withHeaders
        ? h("nav", { id: "mkrdr-headers" }, [
            h("div", { id: "mkrdr-headers-cnt" }, [
              h("div", { id: "mkrdr-headers-menu" }, [headers]),
            ]),
          ])
        : null,
    ]),
    withCredits
      ? h("div", { id: "mkrdr-credits" }, [
          `Created with ${APP_NAME} ${APP_VERSION} (${APP_COMMIT})`,
        ])
      : null,
  ]);

  clear(document.body);
  document.body.appendChild(result);
  themeToggleEl = document.querySelector(".theme-toggle-btn");
  updateToggleButton();
  highlightNavigation();
  updateWindowTitle();
};

const renderMarkdownFile = async (url: string): Promise<void> => {
  renderPage(`<div id="mkrdr-preload">${config.preloadMessage}</div>`);

  try {
    const markdownSource = await getFileSource(url);
    const result = renderMarkdown(markdownSource);
    document.title = result.attributes.title || getCurrentMarkdownFilePath();
    renderPage(result.html);
  } catch (e) {
    renderPage(`<div id="mkrdr-error">${config.errorMessage}</div>`);
  }
};

const renderCurrentMarkdownFile = (): void => {
  const url = getCurrentMarkdownFileUrl();
  renderMarkdownFile(url);
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadConfig();
  } catch (e) {
    //
  }

  addStyle("main-style", mainStyle);
  addStyle("mdwn-style", markdownLightStyle);
  addStyle("hljs-style", hljsLightStyle);

  if (config.styleUrl) {
    addExternalStyle("cust-style", config.styleUrl);
  }

  currentTheme = loadTheme();
  applyTheme();

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (currentTheme === "auto") {
        applyTheme();
      }
    });

  window.addEventListener("hashchange", () => {
    renderCurrentMarkdownFile();
  });

  document.body.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      const url = new URL(event.target.href, window.location.href);
      const sameOrigin = url.origin === window.location.origin;
      if (sameOrigin) {
        if (event.target.href.match(/\.md$/)) {
          event.preventDefault();
          window.location.hash = `#!${url.pathname}`;
        }
      } else {
        event.preventDefault();
        window.open(url.href, "_blank");
      }
    }
  });

  window.addEventListener("scroll", throttle(highlightNavigation));

  renderCurrentMarkdownFile();
});
