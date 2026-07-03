![MarkReader](logo.svg)

# MarkReader

MarkReader is a lightweight browser-based Markdown viewer for documentation and simple websites. It loads Markdown files dynamically, renders them as HTML, and supports navigation via a config-driven menu and hash-based routing.

## Highlights

- no static site generator required
- plain Markdown source files
- easy YAML-based configuration
- built with Vite and tested with Vitest
- modern Markdown extensions: math, diagrams, emoji :rocket:, alerts, footnotes, and syntax highlighting `hello("world")`(javascript)
- light and dark themes with system preference detection

## Start reading

- [Overview](./overview.md)
- [Configuration](./configuration.md)
- [Markdown syntax](./syntax.md)
- [Anchors and links](./anchors.md)

## Quick example

A simple Mermaid diagram rendered inline:

```mermaid
graph LR
  A["Write Markdown"] --> B["Configure YAML"]
  B --> C[Publish]
  C --> D[Enjoy docs]
```
