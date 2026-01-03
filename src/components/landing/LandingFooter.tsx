import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingFooter() {
  return (
    <footer className={cn("border-t border-border bg-background")}>
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs",
          "text-muted-foreground md:flex-row md:items-center md:justify-between"
        )}
      >
        <span>
          © {new Date().getFullYear()} InvoiceFlow. Tous droits réservés.
        </span>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/legal"
            className="transition hover:text-foreground"
          >
            Mentions légales
          </Link>
          <Link
            href="/privacy"
            className="transition hover:text-foreground"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
