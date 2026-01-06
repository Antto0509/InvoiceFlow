import { cn } from "@/lib/utils";
import { LegalFooterLinks } from "@/components/legal/";

export function LandingFooter() {
  return (
    <footer className={cn("border-t border-border bg-transparent cursor-default")}>
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs",
          "text-muted-foreground md:flex-row md:items-center md:justify-between"
        )}
      >
        <span>
          © {new Date().getFullYear()}{" "}
          <span className="text-foreground font-medium">InvoiceFlow</span>. Tous droits réservés.
        </span>

        <LegalFooterLinks />
      </div>
    </footer>
  );
}
