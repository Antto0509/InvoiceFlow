import { getUser } from "@/lib/auth/getUser";
import Link from "next/link";
import SignOutButton from "@/components/auth/signout-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="fr">
      <head />
      <body>
        <div className="min-h-dvh">
          <header className="border-b p-4 flex items-center justify-between">
            <Link href="/app" className="font-semibold">InvoiceFlow</Link>
            <div className="flex items-center gap-3">
              {user && <span className="text-sm text-muted-foreground">{user.email}</span>}
              {user ? <SignOutButton /> : <Link href="/login">Se connecter</Link>}
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
