import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { FilesApi } from "@/data/class/files";

describe("FilesApi", () => {
  it("applies user scope when userId is provided", async () => {
    const api = new FilesApi("user-1");

    await api.list({ page: 1, pageSize: 10 });

    expect(supabaseMock.__calls).toContainEqual({
      fn: "eq",
      args: ["user_id", "user-1"],
    });
  });

  it("does not apply user scope when userId is undefined", async () => {
    const api = new FilesApi();

    await api.list({ page: 1, pageSize: 10 });

    expect(
      supabaseMock.__calls.find(
        c => c.fn === "eq" && c.args[0] === "user_id"
      )
    ).toBeUndefined();
  });

  it("orders by created_at desc on search()", async () => {
    const api = new FilesApi();

    await api.search({ q: "pdf" });

    expect(supabaseMock.__calls).toContainEqual({
      fn: "order",
      args: ["created_at", { ascending: false }],
    });
  });

  it("removes protected columns on create()", async () => {
    const api = new FilesApi();

    type CreatePayload = Parameters<FilesApi["create"]>[0];

    await api.create({
      user_id: "hacker",
      bucket: "docs",
      path: "file.pdf",
    } as unknown as CreatePayload);

    const insert = supabaseMock.__calls.find(c => c.fn === "insert");

    expect(insert?.args[0]).not.toHaveProperty("user_id");
  });
});
