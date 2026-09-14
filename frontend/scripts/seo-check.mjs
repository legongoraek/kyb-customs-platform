import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function readText(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

export async function validateSeoFiles(rootDir = process.cwd()) {
  const failures = [];
  const indexHtml = await readText(resolve(rootDir, "index.html"));
  const robots = await readText(resolve(rootDir, "public", "robots.txt"));
  const sitemap = await readText(resolve(rootDir, "public", "sitemap.xml"));
  const llms = await readText(resolve(rootDir, "public", "llms.txt"));
  const seoSource = await readText(resolve(rootDir, "src", "components", "Seo.tsx"));
  const appSource = await readText(resolve(rootDir, "src", "App.tsx"));

  if (!indexHtml) {
    failures.push("index.html is missing");
  } else {
    if (!indexHtml.includes('lang="es-MX"')) {
      failures.push('index.html must use lang="es-MX"');
    }
    if (!/<title>[^<]*KYB[^<]*<\/title>/i.test(indexHtml)) {
      failures.push("index.html must contain a KYB title");
    }
    if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(indexHtml)) {
      failures.push("index.html must contain a meta description");
    }
    if (!/<link\s+rel="canonical"\s+href="https:\/\/kyb-customs-platform\.vercel\.app\/"/i.test(indexHtml)) {
      failures.push("index.html must contain the default canonical URL");
    }
  }

  if (!robots) {
    failures.push("public/robots.txt is missing");
  } else if (!robots.includes("Disallow: /app/")) {
    failures.push("robots.txt must disallow /app/");
  }

  if (!sitemap) {
    failures.push("public/sitemap.xml is missing");
  } else if (sitemap.includes("/app")) {
    failures.push("sitemap.xml must not include /app routes");
  }

  if (!llms) {
    failures.push("public/llms.txt is missing");
  }

  if (!seoSource) {
    failures.push("src/components/Seo.tsx is missing");
  } else if (!seoSource.includes("noindex, nofollow")) {
    failures.push("Seo.tsx must support noindex, nofollow");
  }

  if (!appSource) {
    failures.push("src/App.tsx is missing");
  } else {
    if (!appSource.includes("LandingPage")) {
      failures.push("App.tsx must include LandingPage");
    }
    if (!appSource.includes('path: "/app"') && !appSource.includes('path="/app"')) {
      failures.push("App.tsx must define /app");
    }
    for (const route of ["/cases/new", "/cases/:id", "/sat/imports"]) {
      if (!appSource.includes(route)) {
        failures.push(`App.tsx must preserve legacy route ${route}`);
      }
    }
  }

  return failures;
}

async function main() {
  const failures = await validateSeoFiles(process.cwd());
  if (failures.length > 0) {
    console.error("SEO/GEO validation failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log("SEO/GEO validation passed.");
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedFile === currentFile) {
  await main();
}
