import { cn } from "@/lib/utils";

export function LegalSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 space-y-3", className)}>
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="text-sm text-muted-foreground">{children}</div>
    </section>
  );
}