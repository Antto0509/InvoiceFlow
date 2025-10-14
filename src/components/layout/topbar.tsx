import Link from "next/link";
import Sidebar from "./sidebar";
import { getUser } from "@/lib/auth/getUser";
import SignOutButton from "@/components/auth/signout-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Menu } from "lucide-react";

export default async function Topbar() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-2 md:px-4">
      {/* Mobile: burger + drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb simple / logo mobile */}
      <Link href="/app" className="font-semibold md:hidden">
        InvoiceFlow
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">Se connecter</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
