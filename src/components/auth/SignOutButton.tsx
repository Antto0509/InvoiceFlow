"use client";

import { useTransition } from "react";
import { Button } from "@/ui/button";
import { signOut } from "./signout.action";

export default function SignOutButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => start(async () => await signOut())}
      disabled={pending}
    >
      {pending ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
}