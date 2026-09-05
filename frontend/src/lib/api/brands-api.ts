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
  image?: string;
  modelCount?: number;
  brandDetails?: {
    options: Record<string, string[]>;
    buyerRows: Array<Record<string, string>>;
    factories: Array<Record<string, string>>;
  };
}

function normalizeBrand(brand: any): BrandEntity {
  return {
    ...brand,
    logoUrl: brand.logoUrl || brand.image || "",
    image: brand.image || brand.logoUrl || "",
    totalModels: Number(brand.totalModels ?? brand.modelCount ?? 0),
    modelCount: Number(brand.modelCount ?? brand.totalModels ?? 0),
  };
}

export const BrandsApi = {
  async getAll(): Promise<BrandEntity[]> {
    const brands = await db.brands.getAll();
    return brands.map(normalizeBrand);
  },

  async getById(id: string): Promise<BrandEntity | null> {
    const brand = await db.brands.getById(id);
    return brand ? normalizeBrand(brand) : null;
  },

  async getFactories() {
    return await brandService.getFactories();
  },

  async create(brand: Omit<BrandEntity, "id"> & { id: string }): Promise<BrandEntity> {
    return normalizeBrand(await brandService.createBrand(brand));
  },

  async update(id: string, updates: Partial<BrandEntity>): Promise<BrandEntity | null> {
    const updated = await db.brands.update(id, updates);
    return updated ? normalizeBrand(updated) : null;
  },

  async delete(id: string): Promise<boolean> {
    return await db.brands.delete(id);
  },

  async saveSubpageData(brandId: string, subpage: string, data: unknown) {
    return await brandService.saveSubpageData(brandId, subpage, data);
  },

  async closeCaprIssue(brandId: string, recordId: string) {
    return await brandService.closeCaprIssue(brandId, recordId);
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
