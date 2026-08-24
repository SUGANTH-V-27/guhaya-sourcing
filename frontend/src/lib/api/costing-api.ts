import { db } from "../db/db-client";

export const CostingApi = {
  async getAll() {
    return await db.costingSheets.getAll();
  },

  async getById(id: string) {
    return await db.costingSheets.getById(id);
  },

  async save(sheet: any) {
    if (sheet.id) {
      return await db.costingSheets.update(sheet.id, sheet);
    }
    return await db.costingSheets.insert(sheet);
  },

  async delete(id: string) {
    return await db.costingSheets.delete(id);
  },
};
