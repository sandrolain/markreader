import frontMatter from "front-matter";
import showdown from "showdown";
import highlightJs from "highlight.js";
import { html, render, TemplateResult } from 'lit-html';
import { classMap } from "lit-html/directives/class-map";
import mainStyle from "./style.css";
import markdownStyle from "github-markdown-css/github-markdown.css";
import highlightStyle from "highlight.js/styles/atom-one-light.css";
import YAML from "yaml";
import SweetScroll from "sweet-scroll";
import logo from "./logo.svg";


const APP_NAME    = "MarkReader";
const APP_VERSION = __VERSION__;
const APP_COMMIT  = __COMMIT__;


interface Config {
  title?: string;
  styleUrl?: string;
  logoUrl?: string;
  hideLogo?: boolean;
  navigationUrl?: string;
}

const defaultConfig: Config = {
  title: "MarkReader",
  styleUrl: null,
  navigationUrl: "./navigation.yaml",
  logoUrl: logo,
  hideLogo: false
};


const config: Config = Object.assign({}, defaultConfig);



const decodeHtml = (html: string): string =>  {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

showdown.extension('highlight', function () {
  return [{
    type: "output",
    filter: function (text ) {
      const left        = "<pre><code\\b[^>]*>";
      const right       = "</code></pre>";
      const flags       = "g";
      const replacement = (wholeMatch: string, match: string, left: string, right: string) => {
        match = decodeHtml(match);
      	const lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
        left = left.slice(0, 18) + 'hljs ' + left.slice(18);
        if (lang && highlightJs.getLanguage(lang)) {
          return left + highlightJs.highlight(lang, match).value + right;
        } else {
          return left + highlightJs.highlightAuto(match).value + right;
        }
      };
      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
  }];
});

// Prepare markdown converter
const converter = new showdown.Converter({
  simpleLineBreaks: true,
  extensions: [
    "highlight",
    {
      type: 'output',
      regex: new RegExp(`((?:src|href)=")([^"]+)(")`, 'g'),
      replace: (...args: any[]) => {
        const fileURL = new URL(args[2], getCurrentMarkdownFileUrl());
        return args[1] + fileURL.href + args[3];
      }
    }
  ]
});


const getConfigFileUrl = (): string => {
  const url = new URL("config.yaml", window.location.href);
  return url.href;
};

const loadConfig = async (): Promise<Config> => {
  const url = getConfigFileUrl();
  const source = await getFileSource(url);
  const customConfig = YAML.parse(source) as Config;
  if(customConfig) {
    Object.assign(config, customConfig);
  }
  return config;
};


interface NavigationItem {
  label: string;
  file: string;
  children: NavigationItem[];
}

const getNavigationFileUrl = (): string => {
  const url = new URL(config.navigationUrl, window.location.href);
  return url.href;
};

let navigationItems: NavigationItem[];

const getNavigationItems = async (): Promise<NavigationItem[]> => {
  if(!navigationItems) {
    const url = getNavigationFileUrl();
    const source = await getFileSource(url);
    navigationItems = YAML.parse(source) as NavigationItem[];
  }
  return navigationItems;
}

const renderNavigation = async (): Promise<TemplateResult> => {
  try {
    const items = await getNavigationItems();
    return renderNavigationMenu(items);
  } catch(e) {

  }
  return null;
};

const renderNavigationMenu = (items: NavigationItem[]): TemplateResult => {
  const actMdUrl = getCurrentMarkdownFileUrl();
  return html`<ul>${items.map((item) => {
    const itemUrl = getFileUrl(item.file);
    const current = (itemUrl === actMdUrl);
    let submenu = item.children ? renderNavigationMenu(item.children) : null;
    return html`<li class=${current ? "active": null}><a href="${item.file}">${item.label}</a>${submenu}</li>`;
  })}</ul>`;
}

const getCurrentMarkdownFilePath = (): string => {
  let path = window.location.hash.split("!").slice(1).join("!");
  if(!path) {
    // TODO: default path configurable
    path = "index.md";
  }
  return path;
}

const getFileUrl = (path: string): string => {
  const url = new URL(path, window.location.href);
  return url.href;
};

const getCurrentMarkdownFileUrl = (): string => {
  const path = getCurrentMarkdownFilePath();
  return getFileUrl(path);
};

const renderCurrentMarkdownFile = () => {
  const url = getCurrentMarkdownFileUrl();
  renderMarkdownFile(url);
};

const markdownFilesCache: Map<string, string> = new Map();

const getFileSource = async (url: string) => {
  if(markdownFilesCache.has(url)) {
    return markdownFilesCache.get(url);
  }
  const response = await fetch(url);
  if(response.ok) {
    const source = await response.text();
    markdownFilesCache.set(url, source);
    return source;
  }
  throw new Error("file response not ok");
}


interface RenderResult {
  attributes: Record<string, any>;
  markdown: string;
  html: string;
}

const renderMarkdownFile = async (url: string): Promise<void> => {
  // TODO: renderizzo messaggio di caricamento


  const fileSource = await getFileSource(url);
  // TODO: catturo l'errore e mostro eventuale messaggio


  const fileInfo   = frontMatter<Record<string, any>>(fileSource);
  const attributes = fileInfo.attributes;
  const markdown   = fileInfo.body;
  const html       = markdownToHTML(markdown);

  document.title   = attributes.title || getCurrentMarkdownFilePath();

  renderPage(html);
};


const markdownToHTML = (markdownSource: string): string => {
  const pageContentHTML = converter.makeHtml(markdownSource);
  return pageContentHTML;
};


interface PageHeadItem {
  type: string;
  id: string;
  label: string;
}

const generatePageHeadsMenu = (contentHTML: string): TemplateResult => {
  const div = document.createElement("div");
  div.innerHTML = contentHTML;
  const headsNodes = div.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const items: PageHeadItem[] = [];
  if(headsNodes.length > 0) {
    headsNodes.forEach((node) => {
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
    return html`<li data-id=${item.id} data-type=${item.type}><a href="#" @click=${(event: MouseEvent) => scrollToHead(event, item)}>${item.label}</a></li>`;
  })}</ul>`;
};

const scroller = new SweetScroll();

const scrollToHead = (event: MouseEvent, item: PageHeadItem): void => {
console.log("🚀 ~ file: index.ts ~ line 237 ~ scrollToHead ~ item", item)
  event.preventDefault();
  scroller.to(`#${item.id}`);
};

// const throttle = (fn: () => any, interval: number) => {
//   let lastCall: number;
//   let timeoutId: number;
//   return function () {
//     const now = new Date().getTime();
//     if (lastCall && now < lastCall + interval) {
//       // if we are inside the interval we wait
//       window.clearTimeout(timeoutId);
//       timeoutId = window.setTimeout(function () {
//         lastCall = now;
//         fn();
//       }, interval - (now - lastCall));
//     } else {
//       lastCall = now;
//       fn();
//     }
//   };
// };


const throttle = (fn: () => any) => {
  let ticking = false;
  return (): void => {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        fn();
        ticking = false;
      });
      ticking = true;
    }
  };
};

const getPageHeadsMenuAnchors = (): Record<string, HTMLLIElement> => {
  const anchors = Array.from(document.querySelectorAll<HTMLLIElement>("#heads-menu li[data-id]"));
  const result: Record<string, HTMLLIElement>  = {};
  for(const node of anchors) {
    result[node.getAttribute("data-id")] = node;
  }
  return result;
};

const getPageHeads = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
};

const highlightNavigation = (): boolean => {
  const sections = getPageHeads();
  const anchors  = getPageHeadsMenuAnchors();
  for(const node of sections) {
    if (node.hasAttribute("id") && node.getBoundingClientRect().top >= 0) {
      const id     = node.getAttribute("id");
      const anchor = anchors[id];
      // if the link is not active
      if (!anchor.classList.contains("active")) {
        Object.values(anchors).find((item) => item.classList.contains("active"))?.classList.remove("active");
        anchor.classList.add("active");
      }
      return true;
    }
  }
  return false;
}

const updateWindowTitle = (): void => {
  const mainTitle = config.title;
  const titleNode = document.querySelector("#content h1");
  document.title = titleNode ? `${titleNode.textContent} - ${mainTitle}` : mainTitle;
};

const getLogoUrl = (): string => {
  const logoPath = config.logoUrl;
  if(logoPath.match(/^data:/)) {
    return logoPath;
  }
  return getFileUrl(logoPath);
};

const renderPage = async (contentHTML: string) => {
  const logoUrl = getLogoUrl();
  const navigation = await renderNavigation();
  const heads = generatePageHeadsMenu(contentHTML);
  const content = html([contentHTML] as unknown as TemplateStringsArray);
  const result =  html`<div id="root" class=${classMap({
    "with-navigation": !!navigation,
    "with-heads": !!heads
  })}>
    <div id="wrp">
      <nav id="navigation">
        ${logoUrl && !config.hideLogo ? html`<div id="logo"><img src=${logoUrl} alt=${config.title} /></div>` : null}
        <div id="navigation-cnt">
          <div id="navigation-menu">${navigation}</div>
        </div>
      </nav>
      <main id="content">
        <div id="content-wrp" class="markdown-body">${content}</div>
      </main>
      <nav id="heads">
        <div id="heads-cnt">
          <div id="heads-menu">${heads}</div>
        </div>
      </nav>
    </div>
    <div id="credits">Created with ${APP_NAME} ${APP_VERSION} (${APP_COMMIT})</div>
  </div>`
  render(result, document.body);
  highlightNavigation();
  updateWindowTitle();
};

const addStyle = (id: string, style: string) => {
  let styleNode = document.getElementById(id);
  if(!styleNode) {
    styleNode = document.createElement("style");
    styleNode.setAttribute("type", "text/css");
    styleNode.setAttribute("id", id);
    document.getElementsByTagName("head")[0].appendChild(styleNode);
  }
  styleNode.innerHTML = style;
};

const addExternalStyle = (id: string, url: string) => {
  const css = `@import url("${url}");`;
  addStyle(id, css);
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadConfig()
  } catch(e) {

  }

  addStyle("main-style", mainStyle);
  addStyle("mdwn-style", markdownStyle);
  addStyle("hljs-style", highlightStyle);

  if(config.styleUrl) {
    addExternalStyle("cust-style", config.styleUrl);
  }

  window.addEventListener("hashchange", function() {
    renderCurrentMarkdownFile();
  });

  document.body.addEventListener("click", (event) => {
    if(event.target instanceof HTMLAnchorElement) {
      if(event.target.href.match(/\.md$/)) {
        const url = new URL(event.target.href, window.location.href);
        if(url.origin === window.location.origin) {
          event.preventDefault();
          window.location.hash = `#!${url.pathname}`;
        }
      }
    }
    event.preventDefault();
  });

  window.addEventListener("scroll", throttle(highlightNavigation));

  renderCurrentMarkdownFile();
});




// https://markdowncss.github.io/
// https://github.com/ttscoff/MarkedCustomStyles
