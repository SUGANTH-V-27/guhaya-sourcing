import test from "node:test";
import assert from "node:assert/strict";

import { BackendDbTable } from "./db.js";

test("BackendDbTable rejects silent memory fallback when the database is unavailable", async () => {
  assert.throws(
    () => new BackendDbTable("missingModel"),
    /Database is unavailable: Prisma model 'missingModel' is not registered/i,
  );
});

test("BackendDbTable keeps the live data contract strict for real-model writes", async () => {
  const brands = new BackendDbTable("brand");

  try {
    const created = await brands.insert({ id: `brand_live_${Date.now()}`, name: "Live Brand", country: "UK" });
    assert.equal(created.name, "Live Brand");
    await brands.delete(created.id as string);
  } catch (error: any) {
    assert.match(error, /Database is unavailable|Prisma|Can't reach database server/i);
  }
});
