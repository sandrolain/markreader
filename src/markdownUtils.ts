import frontMatter from "front-matter";
import showdown from "showdown";
import highlightJs from "highlight.js";
import { decodeHtml } from "./htmlUtils";
import { config } from "./configUtils";
import { getFileUrl } from "./fileUtils";

export const getCurrentMarkdownFilePath = (): string => {
  let path = window.location.hash.split("!").slice(1).join("!");
  if(!path) {
    path = config.mainUrl;
  }
  return path;
};

export const getCurrentMarkdownFileUrl = (): string => {
  const path = getCurrentMarkdownFilePath();
  return getFileUrl(path);
};

showdown.extension("highlight", function () {
  return [{
    type: "output",
    filter: (text: string): string => {
      const left        = "<pre><code\\b[^>]*>";
      const right       = "</code></pre>";
      const flags       = "g";
      const replacement = (wholeMatch: string, match: string, left: string, right: string): string => {
        match = decodeHtml(match);
        const lang = (left.match(/class="([^ "]+)/) || [])[1];
        left = `${left.slice(0, 18)  }hljs ${  left.slice(18)}`;
        if(lang && highlightJs.getLanguage(lang)) {
          return left + highlightJs.highlight(lang, match).value + right;
        } else {
          return left + highlightJs.highlightAuto(match).value + right;
        }
      };
      return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
    }
  }];
});



const converter = new showdown.Converter({
  simpleLineBreaks: true,
  tables: true,
  extensions: [
    "highlight",
    {
      type: "output",
      regex: new RegExp(`((?:src|href)=")([^"]+)(")`, "g"),
      replace: (...args: any[]): string => {
        const fileURL = new URL(args[2], getCurrentMarkdownFileUrl());
        return args[1] + fileURL.href + args[3];
      }
    }
  ]
});

interface RenderResult {
  attributes: Record<string, any>;
  markdown: string;
  html: string;
}

export const renderMarkdown = (markdownSource: string): RenderResult => {
  const fileInfo   = frontMatter<Record<string, any>>(markdownSource);
  const attributes = fileInfo.attributes;
  const markdown   = fileInfo.body;
  const html       = converter.makeHtml(markdown);
  return {
    attributes,
    markdown,
    html
  };
};
