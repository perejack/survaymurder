import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoProps = {
  title: string;
  description?: string;
  noindex?: boolean;
};

const ensureMeta = (selector: string, create: () => HTMLElement): HTMLElement => {
  const existing = document.head.querySelector(selector);
  if (existing) return existing as HTMLElement;
  const el = create();
  document.head.appendChild(el);
  return el;
};

const ensureLink = (selector: string, create: () => HTMLLinkElement): HTMLLinkElement => {
  const existing = document.head.querySelector(selector);
  if (existing) return existing as HTMLLinkElement;
  const el = create();
  document.head.appendChild(el);
  return el;
};

const Seo = ({ title, description, noindex }: SeoProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const origin =
      (import.meta as any).env?.VITE_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const canonicalUrl = origin ? `${String(origin).replace(/\/$/, "")}${pathname}` : pathname;

    document.title = title;

    if (description) {
      const desc = ensureMeta('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        return m;
      }) as HTMLMetaElement;
      desc.setAttribute("content", description);
    }

    const canonical = ensureLink('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    canonical.setAttribute("href", canonicalUrl);

    const ogTitle = ensureMeta('meta[property="og:title"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:title");
      return m;
    }) as HTMLMetaElement;
    ogTitle.setAttribute("content", title);

    if (description) {
      const ogDesc = ensureMeta('meta[property="og:description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:description");
        return m;
      }) as HTMLMetaElement;
      ogDesc.setAttribute("content", description);
    }

    const ogUrl = ensureMeta('meta[property="og:url"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:url");
      return m;
    }) as HTMLMetaElement;
    ogUrl.setAttribute("content", canonicalUrl);

    const robots = ensureMeta('meta[name="robots"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "robots");
      return m;
    }) as HTMLMetaElement;
    robots.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, noindex, pathname]);

  return null;
};

export default Seo;
