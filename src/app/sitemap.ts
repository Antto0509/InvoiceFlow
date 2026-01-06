import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";

    const now = new Date();

    // Routes publiques (marketing)
    const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
        { path: "/", priority: 1.0, changeFrequency: "weekly" },
        { path: "/legal/legal-notices", priority: 0.3, changeFrequency: "yearly" },
        { path: "/legal/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    ];

    return routes.map((r) => ({
        url: `${base}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));
}
