import { Card, CardContent } from "@/components/ui/card";

export function LegalBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-background/60">
      <CardContent className="p-4 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}