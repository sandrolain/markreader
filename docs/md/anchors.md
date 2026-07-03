# Anchors and link handling

MarkReader intercepts clicks on links inside rendered Markdown and handles them according to the URL type. This keeps navigation inside the app fast and predictable.

## Same-origin `.md` links

Links that point to another Markdown file on the same origin are loaded dynamically and rendered without a full page reload. The browser URL is updated with a hash route such as `#!path/to/file.md`.

Example:

```markdown
[Configuration](./configuration.md)
```

## Same-origin anchors

Links that point to an anchor within the current page scroll smoothly to the target heading.

Example:

```markdown
[Jump to configuration](#configuration-file)
```

## External links

Links to a different origin are opened in a new browser tab.

Example:

```markdown
[Marked parser](https://marked.js.org)
```

## Automatic heading IDs

Every heading in a Markdown file receives a stable `id` attribute based on its text. This makes it easy to link to specific sections from other pages or from the in-page table of contents.

Example:

```markdown
## Configuration file
```

The heading above gets an `id` like `configuration-file` and can be referenced as `#configuration-file`.
