import frontMatter from "front-matter";
import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import { markedEmoji } from "marked-emoji";
import markedFootnote from "marked-footnote";
import markedAlert from "marked-alert";
import highlightJs from "highlight.js";
import emojilib from "emojilib";
import mermaid from "mermaid";
import { config } from "./configUtils";
import { getFileUrl } from "./fileUtils";

export const getCurrentMarkdownFilePath = (): string => {
  let path = window.location.hash.split("!").slice(1).join("!");
  if (!path && config.mainUrl) {
    path = config.mainUrl;
  }
  return path;
};

export const getCurrentMarkdownFileUrl = (): string => {
  const path = getCurrentMarkdownFilePath();
  return getFileUrl(path);
};

const resolveMarkdownUrl = (href: string): string => {
  if (!href) {
    return href;
  }
  try {
    const parsed = new URL(href, getCurrentMarkdownFileUrl());
    return parsed.href;
  } catch {
    return href;
  }
};

const emoji: Record<string, string> = {};
for (const [char, keywords] of Object.entries(emojilib)) {
  for (const keyword of keywords) {
    if (/^[a-z0-9_+-]+$/.test(keyword)) {
      emoji[keyword] = char;
    }
  }
}

const marked = new Marked();

marked.use(gfmHeadingId());
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code: string, lang: string): string {
      const trimmedLang = lang?.trim();
      if (trimmedLang === "mermaid") {
        return `<pre class="mermaid">${code}</pre>`;
      }
      if (trimmedLang && highlightJs.getLanguage(trimmedLang)) {
        return highlightJs.highlight(code, { language: trimmedLang }).value;
      }
      return highlightJs.highlightAuto(code).value;
    },
  }),
);

marked.use(markedKatex({ throwOnError: false }));
marked.use(markedEmoji({ emojis: emoji, renderer: (token) => token.emoji }));
marked.use(markedFootnote());
marked.use(markedAlert());
marked.use({
  tokenizer: {
    codespan(
      src: string,
    ): { type: "codespan"; raw: string; text: string; lang?: string } | false {
      const match = /^`([^`\n]+)`\(([\w+-]+)\)/.exec(src);
      if (match) {
        return {
          type: "codespan",
          raw: match[0],
          text: match[1],
          lang: match[2],
        };
      }
      return false;
    },
  },
  renderer: {
    link({ href, title, text }): string {
      const resolved = resolveMarkdownUrl(href);
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${resolved}"${titleAttr}>${text}</a>`;
    },
    image({ href, title, text }): string {
      const resolved = resolveMarkdownUrl(href);
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${resolved}" alt="${text}"${titleAttr}>`;
    },
    codespan({ text, lang }: { text: string; lang?: string }): string {
      if (lang) {
        const trimmedLang = lang.trim();
        if (trimmedLang && highlightJs.getLanguage(trimmedLang)) {
          const highlighted = highlightJs.highlight(text, {
            language: trimmedLang,
          }).value;
          return `<code class="hljs language-${trimmedLang}">${highlighted}</code>`;
        }
        return `<code>${escapeHtml(text)} <span class="lang-hint">(${trimmedLang})</span></code>`;
      }
      return `<code>${escapeHtml(text)}</code>`;
    },
  },
});

mermaid.initialize({ startOnLoad: false });

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inlineLangPattern = /\(([\w+-]+)\)$/;

interface RenderResult {
  attributes: Record<string, any>;
  markdown: string;
  html: string;
}

export const renderMarkdown = (markdownSource: string): RenderResult => {
  const fileInfo = frontMatter<Record<string, any>>(markdownSource);
  const attributes = fileInfo.attributes;
  const markdown = fileInfo.body;
  const html = marked.parse(markdown) as string;
  return {
    attributes,
    markdown,
    html,
  };
};

export const renderMermaidDiagrams = async (): Promise<void> => {
  try {
    await mermaid.run({ querySelector: ".mermaid" });
  } catch {
    // ignore mermaid rendering errors
  }
};
