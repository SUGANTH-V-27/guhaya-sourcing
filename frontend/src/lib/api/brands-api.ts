import { db } from "../db/db-client";
import { brandService } from "../../../services/brand.service";

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
    return await brandService.getSubpageData(brandId, "summary");
  },

  async getTestingStandards(brandId: string) {
    return await brandService.getSubpageData(brandId, "standards");
  },

  async getBookingTrackers(brandId: string) {
    return await brandService.getSubpageData(brandId, "booking");
  },

  async getBookings(brandId: string) {
    return await brandService.getSubpageData(brandId, "booking");
  },

  async getFactoryCapacities(brandId?: string) {
    return brandId ? await brandService.getSubpageData(brandId, "capacity") : [];
  },

  async getCourierShipments(brandId: string) {
    return await brandService.getSubpageData(brandId, "courier");
  },

  async getCaprIssues(brandId: string) {
    return await brandService.getSubpageData(brandId, "capr");
  },

  async getCaprRecords(brandId: string) {
    return await brandService.getSubpageData(brandId, "capr");
  },
};
