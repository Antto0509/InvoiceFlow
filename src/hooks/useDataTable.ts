"use client";
import * as React from "react";

export type Fetcher<T, P> = (params: P) => Promise<{ rows: T[]; total: number }>;

export function useDataTable<T, P extends Record<string, unknown>>(
  fetcher: Fetcher<T, P>,
  initialParams: P,
) {
  const [params, setParams] = React.useState<P>(initialParams);
  const [data, setData] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { rows, total } = await fetcher(params);
      setData(rows); setTotal(total);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("An unknown error occurred"));
      }
    } finally {
      setLoading(false);
    }
  }, [fetcher, params]);

  React.useEffect(() => { void refresh(); }, [refresh]);

  return {
    data,
    total,
    loading,
    error,
    params,
    setParams,
    refresh,
  } as const;
}
