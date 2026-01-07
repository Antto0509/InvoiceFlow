import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export type TocItem = { id: string; label: string };

export function LegalPage({
  title,
  description,
  badge,
  updatedAt = "à compléter",
  toc = [],
  children,
}: {
  title: string;
  description: string;
  badge: string;
  updatedAt?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <main className="relative">
      {/* background doux */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.20),transparent_70%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        {/* breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Accueil
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        {/* header */}
        <header className="mb-8 md:mb-10">
          <Badge variant="secondary" className="gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {badge}
          </Badge>

          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {description}
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour :{" "}
            <span className="text-foreground">{updatedAt}</span>
          </p>
        </header>

        {/* grid */}
        <div className="grid gap-6 md:grid-cols-[1fr_300px] md:gap-8">
          {/* content */}
          <div className="space-y-6">
            <Card className="bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/50">
              <CardContent className="p-5 md:p-6">
                {/* contenu */}
                <div className="space-y-8">{children}</div>
              </CardContent>
            </Card>
          </div>

          {/* aside (desktop) */}
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-4">
              {toc.length > 0 && (
                <Card className="bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/50">
                  <CardHeader className="pb-3">
                    <p className="text-sm font-medium">Sommaire</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {toc.map((s) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="hover:text-foreground hover:underline hover:underline-offset-4"
                          >
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/50">
                <CardHeader className="pb-3">
                  <p className="text-sm font-medium">Contact</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Une question ? On répond proprement.
                  </p>
                  <Separator className="my-3" />
                  <Button asChild className="w-full">
                    <a href="mailto:coutreelantoine@gmail.com">Envoyer un email</a>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    (adresse à adapter)
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
