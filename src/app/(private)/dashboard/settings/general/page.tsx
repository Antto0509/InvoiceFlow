"use client";

import {Plus} from "lucide-react";
import {Button} from "@/ui/button";
import * as React from "react";
import { useRouter } from "next/navigation";

export default function GeneralSettingsPage() {
    const router = useRouter();
  return (
      <div>
          <h1>Paramètres généraux</h1>
          <p>Manage your application settings here.</p>
          <br/>
          <h1>Accéder à mon journal d&apos;activité</h1>
          <Button className="gap-2" onClick={() => router.push("/dashboard/settings/general/activityLogs")}>
              <Plus className="h-4 w-4" /> Ouvrir le journal
          </Button>
      </div>

  );
}
