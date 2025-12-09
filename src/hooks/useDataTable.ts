"use client";
import * as React from "react";

export type Fetcher<T, P> = (params: P) => Promise<{ rows: T[]; total: number }>;

export function useDataTable<T, P extends Record<string, unknown>>(
  fetcher: Fetcher<T, P>,
  initialParams: P,
) {
  // 1) garder le fetcher à jour sans l'injecter dans les deps
  const fetcherRef = React.useRef(fetcher);
  React.useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

  const [params, setParams] = React.useState<P>(initialParams);
  const [data, setData] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // (optionnel) éviter que des réponses "anciennes" écrasent les nouvelles
  const lastReqId = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const reqId = ++lastReqId.current;
    setLoading(true);
    setError(null);
    try {
      const { rows, total } = await fetcherRef.current(params);
      // n’applique les résultats que s’ils sont les plus récents
      if (reqId === lastReqId.current) {
        setData(rows);
        setTotal(total);
      }
    } catch (e: unknown) {
      if (reqId === lastReqId.current) {
        setError(e instanceof Error ? e : new Error("An unknown error occurred"));
      }
    } finally {
      if (reqId === lastReqId.current) {
        setLoading(false);
      }
    }
  }, [params]);

  React.useEffect(() => { void refresh(); }, [refresh]);

  return { data, total, loading, error, params, setParams, refresh } as const;
}
