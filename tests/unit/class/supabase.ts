import { beforeEach, vi } from "vitest";
import { createSupabaseMock } from "../../mocks/supabaseMock";

const supabaseMock = createSupabaseMock();

vi.mock("@/data/supabase/client", () => ({
  createClient: () => supabaseMock,
}));

beforeEach(() => {
  supabaseMock.__resetCalls();
});

export { supabaseMock };