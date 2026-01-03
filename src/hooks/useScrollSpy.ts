"use client";

import * as React from "react";

type SpyItem = { href: `#${string}` };

/**
 * Hook to track which section is currently in view based on scroll position.
 * @param items Array of items with hrefs corresponding to section IDs.
 * @param options IntersectionObserver options.
 * @returns The href of the currently active section.
 */
export function useScrollSpy<T extends SpyItem[]>(
  items: T,
  options?: { rootMargin?: string; threshold?: number | number[] }
) {
  const [active, setActive] = React.useState<string>(items[0]?.href ?? "");

  React.useEffect(() => {
    const ids = items
      .map((i) => i.href.replace("#", ""))
      .filter(Boolean);

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // on prend l’entry la plus “visible”
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) {
          setActive(`#${visible.target.id}`);
        }
      },
      {
        root: null,
        // laisse de la place pour le header fixed
        rootMargin: options?.rootMargin ?? "-30% 0px -60% 0px",
        threshold: options?.threshold ?? [0.1, 0.25, 0.4, 0.6],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, options?.rootMargin, options?.threshold]);

  return active;
}
