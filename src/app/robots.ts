import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    if (process.env.VERCEL_ENV !== "production") return { rules: [{ userAgent:"*", disallow:"/" }] }
    
    const base =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";

    return {
        rules: [
        {
            userAgent: "*",
            allow: "/",
            // On évite l’indexation des trucs “app”
            disallow: ["/dashboard", "/login", "/api", "/_next", "/static"],
        },
        ],
        sitemap: `${base}/sitemap.xml`,
    };
}
