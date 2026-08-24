import { db } from "../db/db-client";

export interface BrandEntity {
  id: string;
  name: string;
  code?: string;
  country?: string;
  primaryContact?: string;
  email?: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
  totalModels?: number;
  activeOrders?: number;
}

export const BrandsApi = {
  async getAll(): Promise<BrandEntity[]> {
    return await db.brands.getAll();
  },

  async getById(id: string): Promise<BrandEntity | null> {
    return await db.brands.getById(id);
  },

  async create(brand: Omit<BrandEntity, "id"> & { id: string }): Promise<BrandEntity> {
    return await db.brands.insert(brand);
  },

  async update(id: string, updates: Partial<BrandEntity>): Promise<BrandEntity | null> {
    return await db.brands.update(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    return await db.brands.delete(id);
  },

  // Subpages
  async getSummary(brandId: string) {
    return await db.brandSummaries.query((s) => s.brandId === brandId);
  },

  async getTestingStandards(brandId: string) {
    return await db.testingStandards.query((t) => t.brandId === brandId);
  },

  async getBookingTrackers(brandId: string) {
    return await db.bookingTrackers.query((b) => b.brandId === brandId);
  },

  async getFactoryCapacities(brandId?: string) {
    return await db.factoryCapacities.getAll();
  },

  async getCourierShipments(brandId: string) {
    return await db.courierShipments.query((c) => c.brandId === brandId);
  },

  async getCaprIssues(brandId: string) {
    return await db.caprIssues.query((c) => c.brandId === brandId);
  },
};
