declare module "*.html" {
  const value: string;
  export default value;
}
declare module "*.css" {
  // const content: {[className: string]: string};
  // export default content;
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}

declare const __VERSION__: string;
declare const __COMMIT__: string;
