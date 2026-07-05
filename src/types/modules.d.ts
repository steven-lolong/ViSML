/**
 * Ambient module declarations for non-code assets and untyped sub-paths that
 * are imported throughout the project. Without these, TypeScript cannot resolve
 * `import "./foo.css"` or `import logo from "./bar.png"` style imports.
 */

declare module "*.css";
declare module "*.scss";
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}
declare module "*.gif" {
  const content: string;
  export default content;
}
declare module "*.ico" {
  const content: string;
  export default content;
}

// highlight.js language sub-modules ship without bundled type declarations.
declare module "highlight.js/lib/languages/sml" {
  const lang: any;
  export default lang;
}

/**
 * Webpack exposes each entry bundle as a global of the same name
 * (see `output.library` in webpack.config.js). A few UI modules reference the
 * `assets` and `tarsius` bundles through these globals, so declare them here.
 */
declare const assets: any;
declare const tarsius: any;
