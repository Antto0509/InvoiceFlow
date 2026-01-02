import { vi } from "vitest";

type SupabaseResult = { data?: unknown; count?: number | null; error?: unknown };

type Call =
  | { fn: "from"; args: unknown[] }
  | { fn: "select"; args: unknown[] }
  | { fn: "range"; args: unknown[] }
  | { fn: "abortSignal"; args: unknown[] }
  | { fn: "or"; args: unknown[] }
  | { fn: "order"; args: unknown[] }
  | { fn: "eq"; args: unknown[] }
  | { fn: "neq"; args: unknown[] }
  | { fn: "gt"; args: unknown[] }
  | { fn: "gte"; args: unknown[] }
  | { fn: "lt"; args: unknown[] }
  | { fn: "lte"; args: unknown[] }
  | { fn: "ilike"; args: unknown[] }
  | { fn: "in"; args: unknown[] }
  | { fn: "limit"; args: unknown[] }
  | { fn: "insert"; args: unknown[] }
  | { fn: "update"; args: unknown[] }
  | { fn: "upsert"; args: unknown[] }
  | { fn: "delete"; args: unknown[] }
  | { fn: "single"; args: unknown[] };

function makeThenable(calls: Call[], result: SupabaseResult) {
  // thenable = awaitable
  return {
    then: (resolve: (v: unknown) => unknown) => resolve(result),
    calls,
  };
}

export function createSupabaseMock() {
  let next: SupabaseResult = { data: [], count: 0, error: null };
  let nextSingle: SupabaseResult = { data: null, error: null };

  const calls: Call[] = [];

  const builder = () => {
    const api: Record<string, unknown> = makeThenable(calls, next);

    const chain = (fn: Call["fn"]) =>
      (...args: unknown[]) => {
        calls.push({ fn, args } as Call);
        return api;
      };

    // Query chain
    api.select = chain("select");
    api.range = chain("range");
    api.abortSignal = chain("abortSignal");
    api.or = chain("or");
    api.order = chain("order");
    api.eq = chain("eq");
    api.neq = chain("neq");
    api.gt = chain("gt");
    api.gte = chain("gte");
    api.lt = chain("lt");
    api.lte = chain("lte");
    api.ilike = chain("ilike");
    api.in = chain("in");
    api.limit = chain("limit");

    // Mutations
    api.insert = chain("insert");
    api.update = chain("update");
    api.upsert = chain("upsert");
    api.delete = chain("delete");

    // single() -> returns thenable with nextSingle
    api.single = () => {
      calls.push({ fn: "single", args: [] });
      return makeThenable(calls, nextSingle);
    };

    return api;
  };

  const supabase = {
    from: vi.fn((table: string) => {
      calls.push({ fn: "from", args: [table] });
      return builder();
    }),
    __calls: calls,
    __setNextResult(r: SupabaseResult) {
      next = r;
    },
    __setNextSingleResult(r: SupabaseResult) {
      nextSingle = r;
    },
    __resetCalls() {
      calls.length = 0;
    },
  };

  return supabase;
}
