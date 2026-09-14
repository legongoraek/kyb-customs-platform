# SEO + GEO Design — KYB Customs Platform

Date: 2026-09-13
Status: Approved design
Branch: `feature/seo-geo`

## 1. Context

`kyb-customs-platform` is a technical test / demonstrative project that showcases implementation work around KYB workflows for Mexican foreign trade. It is not a production SaaS offering and must not be presented as one.

The public web experience should make the engineering work discoverable through traditional search engines and generative engines while preserving the existing operational demo.

## 2. Goals

1. Make the project indexable and understandable as a technical case study.
2. Surface the author explicitly and connect the project with the author's professional profile and GitHub presence.
3. Preserve the functional KYB demo while separating it from public marketing / case-study content.
4. Improve SEO through semantic HTML, metadata, canonical URLs, crawl controls, sitemap, Open Graph and structured data.
5. Improve GEO through factual, answer-first copy, JSON-LD, FAQ content and `llms.txt`.
6. Prevent operational and dynamic application pages from being indexed.
7. Avoid unsupported claims, fabricated metrics, customers, certifications or production-readiness language.

## 3. Non-goals

- Migrating the application from React/Vite to Next.js, Astro or another framework.
- Rewriting the backend or KYB business logic.
- Presenting the project as a live commercial product.
- Adding invented performance, adoption or compliance statistics.
- Claiming legal, regulatory or certification coverage that is not verifiable in the repository.

## 4. Positioning

The site will present the repository as a technical case study with explicit authorship.

Primary framing:

> Prueba técnica: Plataforma KYB para comercio exterior

Supporting framing should explain that the project demonstrates a workflow for evaluating Mexican legal entities through KYB case files, document checks, SAT-related validation and explainable risk scoring.

Primary CTAs:

- Ver demo
- Ver código en GitHub

The author should be visible in the public page and connected to the project as its developer.

## 5. Routing Architecture

The application will use a clear separation between public/indexable content and the operational demo.

### Public route

- `/` — SEO/GEO landing page / technical case study.

### Operational routes

- `/app` — current dashboard.
- `/app/cases/new` — create KYB case.
- `/app/cases/:id` — KYB case detail.
- `/app/sat/imports` — SAT import logs.

All `/app/**` routes must use `noindex, nofollow`.

### Backward compatibility

Legacy routes should redirect to their new `/app` equivalents where practical:

- `/cases/new` → `/app/cases/new`
- `/cases/:id` → `/app/cases/:id`
- `/sat/imports` → `/app/sat/imports`

This preserves old links while keeping the new information architecture clear.

## 6. Landing Page Content Architecture

The landing page should be structured as a technical case study rather than a commercial SaaS page.

Recommended sections:

1. **Hero**
   - Technical-test label.
   - Project title.
   - Clear explanation of what was built.
   - CTA to demo.
   - CTA to GitHub.

2. **Project overview**
   - Problem the technical test addresses.
   - Scope and limitations.
   - Explicit note that this is a demonstrative implementation.

3. **What was implemented**
   - KYB case creation.
   - Document metadata handling.
   - Missing / expired document validation.
   - RFC checks against SAT-related fiscal lists.
   - Deterministic / explainable risk scoring.
   - `safe`, `review_required`, `high_risk` classifications.
   - Approval blocking unless the case is safe.
   - Audit log.

4. **How the flow works**
   - Create case.
   - Gather and validate evidence.
   - Evaluate SAT / document signals.
   - Calculate risk score.
   - Review the final classification and audit trail.

5. **Architecture / technical decisions**
   - Frontend: React + Vite + TypeScript.
   - Backend: Node.js + Express + TypeScript.
   - Public frontend deployment on Vercel.
   - Backend deployment on Render.
   - Explainability and traceability as key design principles.

6. **Risk scoring and SAT validation**
   - Explain only what can be demonstrated in the codebase.
   - Avoid implying official SAT affiliation or certification.

7. **Technical implementation highlights**
   - Routing.
   - API interaction.
   - Validation logic.
   - Auditability.
   - Error and state handling where verifiable.

8. **FAQ**
   - Is this a production product?
   - What problem does the project demonstrate?
   - What information is evaluated?
   - How is the risk classification determined?
   - Does the project represent an official SAT service?

9. **About the author**
   - Luis Enrique Góngora Ek.
   - Developer attribution.
   - Links to portfolio and GitHub when available in the repository/configuration.

10. **Final CTA**
    - Open the demo.
    - Review source code.

## 7. SEO Design

### Base document

- Set `<html lang="es-MX">`.
- Correct the current `KYC` typo to `KYB`.
- Remove `Camtom Technical Test` from the page title unless explicitly needed as historical context.
- Add a concise, factual meta description.
- Set viewport and theme metadata.

### Canonical URL

Use a configurable site origin through `VITE_SITE_URL`.

Default when no custom domain is configured:

`https://kyb-customs-platform.vercel.app`

The canonical URL for the landing page should resolve to `/` on this origin.

### Social metadata

Add:

- Open Graph title.
- Open Graph description.
- Open Graph URL.
- Open Graph type.
- Twitter card metadata.

A dedicated social image is optional and should only be used when a real asset exists in the repository. Do not block the SEO implementation on creating one.

### Crawl assets

Add:

- `/robots.txt`
- `/sitemap.xml`

The sitemap should contain only public/indexable URLs. At the initial scope this means `/` only.

`robots.txt` should allow the public landing and discourage crawling of `/app/` routes.

### Operational route metadata

All operational routes under `/app/**` must use:

`noindex, nofollow`

Dynamic case IDs must never be exposed in the sitemap or public structured data.

## 8. GEO Design

GEO is implemented as factual machine-readable and answer-first content, not keyword stuffing.

### `llms.txt`

Add `/llms.txt` containing:

- Project name.
- Author.
- Purpose.
- Technical-test / demonstrative status.
- Primary capabilities.
- Technology stack.
- Public demo URL.
- Repository URL.
- Important limitations.

An optional `llms-full.txt` is not required for the first implementation unless the content clearly benefits from it.

### Structured data

Use JSON-LD where the page visibly supports the same information.

Recommended schemas:

- `SoftwareApplication`
- `Person` for the author
- `FAQPage` for the visible FAQ
- `WebSite` when useful for page identity

Structured data must not claim:

- Paying customers.
- Official SAT affiliation.
- Compliance certification.
- Production-grade guarantees.
- Fabricated usage metrics.

### Copy principles

Public copy should:

- Define KYB in the context of the project.
- State that the implementation focuses on Mexican foreign-trade scenarios.
- Explain SAT-related checks precisely.
- Describe deterministic and explainable risk scoring.
- Explicitly distinguish demo functionality from production readiness.
- Use headings that answer concrete questions search and generative systems may ask.

## 9. Metadata Architecture

Create a small reusable SEO metadata layer instead of hard-coding metadata in each page.

Responsibilities:

- Page title.
- Description.
- Canonical URL.
- Robots directive.
- Open Graph metadata.
- Twitter metadata.
- JSON-LD injection.

The public landing uses indexable defaults. Operational pages override robots to `noindex, nofollow`.

The implementation should follow existing React/Vite patterns and avoid adding a large dependency solely for metadata management unless necessary.

## 10. SPA / Crawlability Strategy

The project remains React + Vite.

Recommended approach: keep the application SPA but ensure the public entry page has strong static metadata and semantic content. Add build-time validation of required SEO/GEO assets.

If practical without introducing unnecessary complexity, prerendering `/` can be added. It is an optimization, not a requirement for the first implementation if it substantially complicates the existing stack.

A framework migration is explicitly out of scope.

## 11. Vercel Behavior

`frontend/vercel.json` must continue supporting SPA navigation while allowing static public assets such as the following to be served directly:

- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- favicon and other public assets

Catch-all rewrites must not make these assets inaccessible.

## 12. Security and Privacy

- Do not expose KYB case data in JSON-LD.
- Do not include dynamic case URLs in sitemap files.
- Mark operational routes as `noindex, nofollow`.
- Do not publish secrets or environment values.
- `VITE_SITE_URL` contains only a public site origin.

## 13. Validation Strategy

The implementation should include an automated SEO/GEO validation script using existing Node tooling where possible.

Minimum checks:

- `index.html` uses `es-MX`.
- Correct KYB title exists.
- Meta description exists.
- Canonical metadata exists or is reliably generated.
- `robots.txt` exists.
- `sitemap.xml` exists.
- `llms.txt` exists.
- Sitemap excludes `/app/**`.
- Internal application routes are configured as `noindex`.
- Build completes successfully.
- ESLint completes successfully.

Recommended commands after implementation:

```bash
npm run lint
npm run build
npm run seo:check
```

If the project has no test framework for these assets, prefer a lightweight Node validation script rather than adding a full testing dependency only for SEO.

## 14. Error Handling

- Missing `VITE_SITE_URL`: fall back to the known Vercel demo origin.
- Invalid site origin: validation script should fail with an actionable message.
- Metadata layer should have safe default title/description values.
- JSON-LD generation must not fail page rendering if optional author/social URLs are unavailable.

## 15. Definition of Done

The SEO/GEO implementation is complete when:

1. `/` is a public technical case-study landing page.
2. Existing dashboard functionality is available under `/app`.
3. Legacy operational URLs redirect appropriately.
4. Public metadata accurately identifies the project and author.
5. `robots.txt`, `sitemap.xml` and `llms.txt` are available.
6. Relevant JSON-LD is present and matches visible page content.
7. `/app/**` pages are not indexable.
8. No unsupported commercial or compliance claims are introduced.
9. Frontend lint and build pass.
10. Automated SEO/GEO validation passes.

## 16. Chosen Approach and Alternatives

### Chosen: React/Vite hybrid public landing + operational app

Advantages:

- Minimal disruption to the existing codebase.
- Preserves the current demo.
- Provides a clear SEO/GEO surface.
- Avoids an unnecessary framework migration.
- Easy to maintain as a portfolio case study.

### Alternative: metadata-only changes

Rejected because it would leave the root route as an operational dashboard and would not provide enough semantic public content for the project's portfolio objective.

### Alternative: migrate public surface to Next.js / Astro

Rejected for the current scope because the project is a technical demo and the migration cost is not justified by the SEO requirements.

## 17. Implementation Boundaries

This design intentionally keeps the work focused on:

- Public case-study landing page.
- Routing separation.
- SEO metadata and crawl controls.
- GEO machine-readable assets and structured data.
- Author attribution.
- Automated verification.

No unrelated backend, business-logic or broad frontend refactors are included.