import * as React from "react";
import { ThemeWipeContext } from "@/components/ThemeWipeProvider";

export function useThemeWipe() {
  const ctx = React.useContext(ThemeWipeContext);
  if (!ctx) throw new Error("useThemeWipe must be used within ThemeWipeProvider");
  return ctx;
}