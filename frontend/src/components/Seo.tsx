import { useEffect } from "react";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  jsonLd?: JsonLd;
};

const DEFAULT_ORIGIN = "https://kyb-customs-platform.vercel.app";

function getSiteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (!configured) return DEFAULT_ORIGIN;

  try {
    const url = new URL(configured);
    return url.origin;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", href);
}

export function Seo({ title, description, path = "/", noIndex = false, jsonLd }: SeoProps) {
  useEffect(() => {
    const siteOrigin = getSiteOrigin();
    const canonicalUrl = new URL(path, `${siteOrigin}/`).toString();
    const robots = noIndex ? "noindex, nofollow" : "index, follow";

    document.title = title;
    document.documentElement.lang = "es-MX";

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", robots);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertCanonical(canonicalUrl);

    const scriptId = "kyb-structured-data";
    document.getElementById(scriptId)?.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [description, jsonLd, noIndex, path, title]);

  return null;
}
