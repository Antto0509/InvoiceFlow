"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

type RouteLoadingContextValue = {
  isLoading: boolean;
  startLoading: () => void;
};

const RouteLoadingContext = React.createContext<RouteLoadingContextValue | undefined>(
  undefined
);

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastPath, setLastPath] = React.useState(pathname);

  // Quand l'URL change, on considère que la nouvelle page est chargée
  React.useEffect(() => {
    if (pathname !== lastPath) {
      setLastPath(pathname);
      setIsLoading(false);
    }
  }, [pathname, lastPath]);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  return (
    <RouteLoadingContext.Provider value={{ isLoading, startLoading }}>
      <div className="relative">
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">Chargement…</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const ctx = React.useContext(RouteLoadingContext);
  if (!ctx) {
    throw new Error("useRouteLoading must be used within RouteLoadingProvider");
  }
  return ctx;
}
