// Allows importing .html files as strings.
// esbuild bundles them via --loader:.html=text (see build:frontend).
declare module "*.html" {
  const content: string;
  export default content;
}
