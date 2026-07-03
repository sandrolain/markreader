# MarkReader

MarkReader is a lightweight browser-based Markdown viewer for documentation and simple websites. It loads Markdown files dynamically, renders them as HTML, and supports navigation via a config-driven menu and hash-based routing.

## Features

- dynamic Markdown rendering in the browser with [marked](https://marked.js.org)
- navigation between Markdown documents with collapsible menu sections
- YAML-based configuration
- optional logo, credits, and menu toggles
- light/dark/auto themes
- syntax highlighting with highlight.js
- math expressions with KaTeX
- diagrams with Mermaid
- emoji shortcodes, GitHub-style alerts, and footnotes
- Vite-based build pipeline
- Vitest unit tests

## Development

```bash
bun install
bun run dev
bun run build
bun run test
```

## Documentation

The project documentation lives in the `docs` tree and can be browsed with the app itself.

## Roadmap

- improve mobile experience
- expand automated test coverage
- add more Markdown plugin integrations
