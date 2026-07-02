type Attrs = Record<
  string,
  string | boolean | ((event: Event) => void) | null | undefined
>;
type Child = Node | string | null | undefined | false;

export const h = (
  tag: string,
  attrs?: Attrs | null,
  children?: Child[],
): HTMLElement => {
  const el = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) {
        continue;
      }
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (typeof value === "string") {
        el.setAttribute(key, value);
      }
    }
  }

  if (children) {
    append(el, children);
  }

  return el;
};

export const append = (parent: Node, children: Child[]): void => {
  for (const child of children) {
    if (child == null || child === false) {
      continue;
    }
    parent.appendChild(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }
};

export const text = (value: string): Text => document.createTextNode(value);

export const htmlToNodes = (contentHTML: string): DocumentFragment => {
  const div = document.createElement("div");
  div.innerHTML = contentHTML;
  const fragment = document.createDocumentFragment();
  while (div.firstChild) {
    fragment.appendChild(div.firstChild);
  }
  return fragment;
};

export const clear = (node: Node): void => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};
