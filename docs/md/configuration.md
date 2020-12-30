# Configuration file

To configure and customize the MarkReader instance you can create a **config.yaml** file in the same directory as the index.html file.

The following table lists the parameters available for configuration.

| Parameter          | Description                                                                      | Type    | Default                                |
| ------------------ | -------------------------------------------------------------------------------- | ------- | -------------------------------------- |
| title              | Window title                                                                     | string  | `"MarkReader"`                         |
| mainUrl            | Url to the main markdown file displayed if not specified as a hash url parameter | string  | `"./index.md"`                         |
| styleUrl           | Url to custom CSS stylesheet                                                     | string  | `null`                                 |
| logoUrl            | Url to the logo image showed at the top of the main menu                         | string  | *Data-uri string with MarkReader logo* |
| preloadMessage     | Message displayed while loading and rendering page content                       | string  | `"Loading…"`                           |
| hideLogo           | Specifies whether not to display the logo image                                  | boolean | `false`                                |
| hideNavigationMenu | Specifies whether not to display the main navigation menu                        | boolean | `false`                                |
| hideHeadersMenu    | Specifies whether not to display the page header menu                            | boolean | `false`                                |
| hideCredits        | Specifies whether not to display the credits/version footer bar                  | boolean | `false`                                |

## Example

Configuration file example:

```yaml
title: "MarkReader"
mainUrl: "./md/index.md"
styleUrl: "./custom-style.css"
logoUrl: "./logo.png"
preloadMessage: "Loading…"
navigation:
  - label: "Index"
    file: "./md/index.md"
  - label: "Docs"
    children:
    - label: "Configuration file"
      file: "./md/configuration.md"
hideLogo: false
hideNavigationMenu: false
hideHeadersMenu: false
hideCredits: false
```
