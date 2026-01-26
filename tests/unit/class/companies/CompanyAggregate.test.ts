import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { CompanyAggregate } from "@/data/class/companies";

describe("CompanyAggregate", () => {
  it("loads company with related resources", async () => {
    const companyAggregate = new CompanyAggregate();
    
    await companyAggregate.getCompanyFull("company-1");

    expect(supabaseMock.__calls).toEqual(
      expect.arrayContaining([
        { fn: "from", args: ["companies"] },
        { fn: "from", args: ["company_addresses"] },
        { fn: "from", args: ["company_bank_accounts"] },
      ])
    );
  });
});
