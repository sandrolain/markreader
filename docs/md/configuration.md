# Configuration file

To configure and customize a MarkReader instance, create a `config.yaml` file in the same directory as `index.html`. The file is loaded at startup and controls the site title, default page, navigation, logo, theme, and messages.

## Configuration parameters

| Parameter          | Description                                                                      | Type    | Default                                         |
|--------------------|----------------------------------------------------------------------------------|---------|-------------------------------------------------|
| title              | Window title and logo alt text                                                   | string  | `"MarkReader"`                                  |
| mainUrl            | URL of the Markdown file shown when no hash route is provided                    | string  | `"./index.md"`                                  |
| styleUrl           | URL to a custom CSS stylesheet                                                   | string  | `null`                                          |
| logoUrl            | URL to the logo image shown at the top of the main menu                          | string  | *Data-uri string with MarkReader logo*          |
| preloadMessage     | Message displayed while loading and rendering page content                       | string  | `"Please wait, loading the page …"`             |
| errorMessage       | Error message displayed if loading or rendering fails                            | string  | `"Error, please reload the page to try again."` |
| hideLogo           | Hide the logo image                                                              | boolean | `false`                                         |
| hideNavigationMenu | Hide the main navigation menu                                                    | boolean | `false`                                         |
| hideHeadersMenu    | Hide the in-page table of contents                                               | boolean | `false`                                         |
| hideCredits        | Hide the credits/version footer bar                                              | boolean | `false`                                         |
| defaultTheme       | Default theme mode: `"auto"`, `"light"`, or `"dark"`                             | string  | `"auto"`                                        |
| navigation         | List of navigation items                                                         | array   | `null`                                          |

## Navigation items

Each navigation item supports the following fields:

| Field      | Description                                              | Required |
|------------|----------------------------------------------------------|----------|
| label      | Text shown in the menu                                   | yes      |
| file       | Path to the Markdown file to open when clicked           | no       |
| children   | Nested navigation items                                  | no       |

Items without a `file` value are rendered as non-clickable section labels. Items with `children` display a toggle button that opens and closes the submenu.

## Example

```yaml
title: "MarkReader"
mainUrl: "./md/index.md"
styleUrl: "./custom-style.css"
logoUrl: "./logo.png"
preloadMessage: "Please wait, loading the page …"
errorMessage: "Error, please reload the page to try again."
defaultTheme: "auto"
navigation:
  - label: "Home"
    file: "./md/index.md"
  - label: "Overview"
    file: "./md/overview.md"
  - label: "Docs"
    children:
      - label: "Configuration"
        file: "./md/configuration.md"
      - label: "Markdown syntax"
        file: "./md/syntax.md"
      - label: "Anchors"
        file: "./md/anchors.md"
hideLogo: false
hideNavigationMenu: false
hideHeadersMenu: false
hideCredits: false
```

## Custom styling

Use `styleUrl` to load an additional CSS file. Custom styles can override CSS variables such as `--bg-default`, `--fg-default`, `--accent`, and `--border-color` to adapt the appearance to your brand.
