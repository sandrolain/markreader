import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const docsMimeTypes: Record<string, string> = {
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".md": "text/markdown",
};

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const packageJson = JSON.parse(
  readFileSync(resolve(rootDir, "package.json"), "utf8"),
);

function copyDocsToDist() {
  const docsRoot = resolve(rootDir, "docs");
  const targets = ["config.yaml", "md"];

  return {
    name: "copy-docs-to-dist",
    apply: "build",
    closeBundle() {
      const distRoot = resolve(rootDir, "dist");

      for (const target of targets) {
        const src = resolve(docsRoot, target);
        const dest = resolve(distRoot, target);
        if (existsSync(src)) {
          mkdirSync(dirname(dest), { recursive: true });
          cpSync(src, dest, { recursive: true, force: true });
        }
      }

      writeFileSync(resolve(distRoot, ".nojekyll"), "");
    },
  };
}

function serveDocsInDev() {
  const docsRoot = resolve(rootDir, "docs");

  return {
    name: "serve-docs-in-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        const isConfig =
          url === "/config.yaml" || url.startsWith("/config.yaml?");
        const isMd = url.startsWith("/md/");
        if (!isConfig && !isMd) {
          next();
          return;
        }

        const relativePath = url.split("?")[0].replace(/^\//, "");
        const filePath = resolve(docsRoot, relativePath);

        if (
          !filePath.startsWith(docsRoot) ||
          !existsSync(filePath) ||
          !statSync(filePath).isFile()
        ) {
          next();
          return;
        }

        const mimeType = docsMimeTypes[extname(filePath)] ?? "text/plain";
        res.setHeader("Content-Type", `${mimeType}; charset=utf-8`);
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __COMMIT__: JSON.stringify(process.env.GITHUB_SHA || "dev"),
  },
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  plugins: [copyDocsToDist(), serveDocsInDev(), viteSingleFile()],
  server: {
    open: true,
    host: "0.0.0.0",
  },
  preview: {
    open: true,
    host: "0.0.0.0",
  },
});
