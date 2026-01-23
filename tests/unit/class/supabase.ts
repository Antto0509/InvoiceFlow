import { beforeEach, vi } from "vitest";
import { createSupabaseMock } from "../../mocks/supabaseMock";

const supabase = createSupabaseMock();

vi.mock("@/data/supabase/client", () => ({
  createClient: () => supabase,
}));

beforeEach(() => {
  supabase.__resetCalls();
});

export { supabase };
