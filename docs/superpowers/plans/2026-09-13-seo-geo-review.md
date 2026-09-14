# SEO + GEO final review checklist

The branch is reviewed against `docs/superpowers/specs/2026-09-13-seo-geo-design.md` before integration.

- [x] Project is framed as a technical test / case study.
- [x] Author attribution is explicit.
- [x] `/` is the public case-study route.
- [x] `/app` hosts the existing operational dashboard.
- [x] Legacy operational routes redirect to `/app/**`.
- [x] Operational layout applies `noindex, nofollow`.
- [x] Public static metadata uses `es-MX`, corrected KYB naming and canonical URL.
- [x] Open Graph and Twitter metadata are present.
- [x] JSON-LD covers visible project, author and FAQ information without fabricated claims.
- [x] Sitemap contains only the public root route.
- [x] Robots rules discourage crawling `/app`.
- [x] `llms.txt` describes the project and limitations factually.
- [x] Vercel rewrite excludes SEO/GEO static assets.
- [x] SEO validator and Node tests are included.
- [x] Root and frontend documentation are updated.
- [ ] Repository CI / deployment integration checks confirmed.
