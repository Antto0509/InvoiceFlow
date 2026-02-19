"use client";

import {Plus} from "lucide-react";
import {Button} from "@/ui/button";
import * as React from "react";

export default function GeneralSettingsPage() {
  return (
      <div>
          <h1>Paramètres généraux</h1>
          <p>Manage your application settings here.</p>
          <br/>
          <h1>Accéder à mon journal d&apos;activité</h1>
          <Button className="gap-2" onClick={() => window.open("/dashboard/settings/general/logs", "_blank")}>
              <Plus className="h-4 w-4" /> Ouvrir le journal
          </Button>
      </div>

  );
}