import { getFileSource, getFileUrl } from "./fileUtils";
import { getCurrentMarkdownFilePath, getCurrentMarkdownFileUrl, renderMarkdown } from "./markdownUtils";
import { config, getLogoUrl, getNavigationItems, loadConfig, NavigationItem } from "./configUtils";
import { html, render, TemplateResult } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import mainStyle from "./style.css";
import markdownStyle from "github-markdown-css/github-markdown.css";
import highlightStyle from "highlight.js/styles/atom-one-light.css";
import SweetScroll from "sweet-scroll";
import { addExternalStyle, addStyle, throttle } from "./htmlUtils";
import { APP_COMMIT, APP_NAME, APP_VERSION } from "./constants";

const renderNavigationMenu = (items: NavigationItem[]): TemplateResult => {
  const actMdUrl = getCurrentMarkdownFileUrl();
  return html`<ul>${items.map((item) => {
    const itemUrl = getFileUrl(item.file);
    const current = (itemUrl === actMdUrl);
    const submenu = item.children ? renderNavigationMenu(item.children) : null;
    return html`<li class=${current ? "active" : null}><a href="${item.file ?? "#"}">${item.label}</a>${submenu}</li>`;
  })}</ul>`;
};

const renderNavigation = async (): Promise<TemplateResult> => {
  try {
    const items = await getNavigationItems(config);
    return renderNavigationMenu(items);
  } catch(e) {
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

const generatePageHeadersMenu = (contentHTML: string): TemplateResult => {
  const div = document.createElement("div");
  div.innerHTML = contentHTML;
  const headersNodes = div.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const items: PageHeadItem[] = [];
  if(headersNodes.length > 0) {
    headersNodes.forEach((node) => {
      if(node.id) {
        const type = node.tagName.toLowerCase();
        const id = node.id;
        const label = node.textContent;
        items.push({
          type,
          id,
          label
        });
      }
    });
  }

  if(items.length === 0) {
    return null;
  }

  return html`<ul>${items.map((item) => {
    return html`<li data-id=${item.id} data-type=${item.type}><a href="#" @click=${(event: MouseEvent): any => scrollToHead(event, item)}>${item.label}</a></li>`;
  })}</ul>`;
};

const getPageHeaders = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
};

const getPageHeadersMenuAnchors = (): Record<string, HTMLLIElement> => {
  const anchors = Array.from(document.querySelectorAll<HTMLLIElement>("#mkrdr-headers-menu li[data-id]"));
  const result: Record<string, HTMLLIElement>  = {};
  for(const node of anchors) {
    result[node.getAttribute("data-id")] = node;
  }
  return result;
};

const highlightNavigation = (): boolean => {
  const sections = getPageHeaders();
  const anchors  = getPageHeadersMenuAnchors();
  for(const node of sections) {
    if(node.hasAttribute("id") && node.getBoundingClientRect().top >= 0) {
      const id     = node.getAttribute("id");
      const anchor = anchors[id];
      // if the link is not active
      if(!anchor.classList.contains("active")) {
        Object.values(anchors).find((item) => item.classList.contains("active"))?.classList.remove("active");
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
  document.title = titleNode ? `${titleNode.textContent} - ${mainTitle}` : mainTitle;
};

const renderPage = async (contentHTML: string): Promise<void> => {
  const logoUrl        = getLogoUrl();
  const navigation     = await renderNavigation();
  const headers        = generatePageHeadersMenu(contentHTML);
  const content        = html([contentHTML] as unknown as TemplateStringsArray);
  const withCredits    = !config.hideCredits;
  const withLogo       = !!(!config.hideLogo && logoUrl);
  const withNavigation = !!(!config.hideNavigationMenu && navigation);
  const withHeaders    = !!(!config.hideHeadersMenu && headers);
  const result         = html`<div id="mkrdr-root" class=${classMap({
    "with-logo": withLogo,
    "with-navigation": withNavigation,
    "with-headers": withHeaders
  })}>
    <div id="mkrdr-wrp">
      ${(withLogo || withNavigation) ? html`
      <nav id="mkrdr-navigation">
        ${withLogo ? html`<div id="mkrdr-logo"><img src=${logoUrl} alt=${config.title} /></div>` : null}
        ${withNavigation ? html`<div id="mkrdr-navigation-cnt"><div id="mkrdr-navigation-menu">${navigation}</div></div>` : null}
      </nav>` : null}
      <main id="mkrdr-content"><div id="mkrdr-content-wrp" class="markdown-body">${content}</div></main>
      ${withHeaders ? html`
      <nav id="mkrdr-headers">
        <div id="mkrdr-headers-cnt"><div id="mkrdr-headers-menu">${headers}</div></div>
      </nav>
      ` : null}
    </div>
    ${withCredits ? html`<div id="mkrdr-credits">Created with ${APP_NAME} ${APP_VERSION} (${APP_COMMIT})</div>` : null}
  </div>`;
  render(result, document.body);
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
  } catch(e) {
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
  } catch(e) {
    //
  }

  addStyle("main-style", mainStyle);
  addStyle("mdwn-style", markdownStyle);
  addStyle("hljs-style", highlightStyle);

  if(config.styleUrl) {
    addExternalStyle("cust-style", config.styleUrl);
  }

  window.addEventListener("hashchange", () => {
    renderCurrentMarkdownFile();
  });

  document.body.addEventListener("click", (event) => {
    if(event.target instanceof HTMLAnchorElement) {
      const url = new URL(event.target.href, window.location.href);
      const sameOrigin = (url.origin === window.location.origin);
      if(sameOrigin) {
        if(event.target.href.match(/\.md$/)) {
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


// https://markdowncss.github.io/
// https://github.com/ttscoff/MarkedCustomStyles
