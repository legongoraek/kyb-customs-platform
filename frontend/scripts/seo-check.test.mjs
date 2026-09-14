import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateSeoFiles } from "./seo-check.mjs";

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "kyb-seo-"));
  await mkdir(join(root, "public"), { recursive: true });
  await mkdir(join(root, "src", "components"), { recursive: true });
  await mkdir(join(root, "src"), { recursive: true });

  await writeFile(
    join(root, "index.html"),
    '<!doctype html><html lang="es-MX"><head><title>KYB Customs Platform</title><meta name="description" content="Prueba técnica KYB"><link rel="canonical" href="https://kyb-customs-platform.vercel.app/" /></head></html>',
  );
  await writeFile(
    join(root, "public", "robots.txt"),
    "User-agent: *\nAllow: /\nDisallow: /app/\n",
  );
  await writeFile(
    join(root, "src", "components", "Seo.tsx"),
    'const robots = noIndex ? "noindex, nofollow" : "index, follow";',
  );
  await writeFile(
    join(root, "src", "App.tsx"),
    'import { LandingPage } from "./pages/LandingPage"; const routes = ["/app", "/cases/new", "/cases/:id", "/sat/imports"];',
  );

  return root;
}

test("reports missing llms.txt and private routes in sitemap", async () => {
  const root = await createFixture();
  await writeFile(
    join(root, "public", "sitemap.xml"),
    "<urlset><url><loc>https://kyb-customs-platform.vercel.app/app</loc></url></urlset>",
  );

  const failures = await validateSeoFiles(root);

  assert.ok(failures.some((message) => message.includes("llms.txt")));
  assert.ok(failures.some((message) => message.includes("/app")));
});

test("accepts a valid public-only SEO/GEO fixture", async () => {
  const root = await createFixture();
  await writeFile(
    join(root, "public", "sitemap.xml"),
    "<urlset><url><loc>https://kyb-customs-platform.vercel.app/</loc></url></urlset>",
  );
  await writeFile(
    join(root, "public", "llms.txt"),
    "# KYB Customs Platform\nAuthor: Luis Enrique Góngora Ek\nTechnical demonstration only.",
  );

  const failures = await validateSeoFiles(root);

  assert.deepEqual(failures, []);
});
