import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

const LEGAL_LINKS = [
  {
    href: "/legal/legal-notices",
    label: "Mentions légales",
    icon: Scale,
  },
  {
    href: "/legal/privacy-policy",
    label: "Politique de confidentialité",
    icon: ShieldCheck,
  },
];

export function LegalFooterLinks() {
  return (
    <nav className="flex flex-wrap gap-4">
      {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group inline-flex items-center gap-1.5 transition hover:text-foreground"
        >
          <Icon
            className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground"
            aria-hidden
          />
          <span className="underline-offset-4 group-hover:underline">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
