# Overview

MarkReader is a simple, dependency-light way to publish documentation or small sites as Markdown files. It runs entirely in the browser, loads content dynamically, and turns a folder of Markdown files into a readable, navigable site.

## Why it exists

Static site generators are powerful, but they add build steps, templating languages, and deployment complexity. MarkReader keeps things minimal:

- no static site generator required
- content stays in plain Markdown
- navigation and presentation remain lightweight
- the same app can power a docs site and a landing page

## How it works

1. The browser loads a single `index.html` file that bootstraps MarkReader.
2. MarkReader reads `config.yaml` to learn the site title, logo, theme, and navigation.
3. The requested Markdown file is fetched, parsed, and rendered as HTML.
4. Internal links to other `.md` files are intercepted and rendered without a full page reload.

## Use cases

- internal documentation
- project guides and README-driven sites
- simple product or portfolio pages
- knowledge bases and wikis
- quick prototypes that may later grow into a full static site

## Design goals

- **Lightweight** — small bundle, fast first paint
- **Configurable** — YAML-driven navigation and appearance
- **Readable** — clean typography, light/dark themes, code highlighting
- **Extensible** — modern Markdown extensions for math, diagrams, emoji, and alerts
