import { db } from "../config/db.js";
import { Brand } from "../types/index.js";

export class BrandService {
  async getAll(): Promise<Brand[]> {
    const brands = await db.brands.select();
    return brands as Brand[];
  }

  async getById(id: string): Promise<Brand | null> {
    const brand = await db.brands.selectById(id);
    return brand as Brand | null;
  }

  async create(data: Partial<Brand> & Record<string, any>): Promise<Brand> {
    const id = data.id || data.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || `brand_${Date.now()}`;
    const brandData = {
      id,
      name: data.name || "New Brand",
      code: data.code || null,
      country: data.country || "United Kingdom",
      primaryContact: data.primaryContact || null,
      email: data.email || null,
      phone: data.phone || null,
      description: data.description || null,
      logoUrl: data.logoUrl || data.image || null,
      totalModels: Number(data.totalModels ?? data.modelCount ?? 0),
      activeOrders: Number(data.activeOrders ?? 0),
    };
    const newBrand = await db.brands.insert(brandData);
    return newBrand as Brand;
  }

  async update(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    const updated = await db.brands.update(id, updates);
    return updated as Brand | null;
  }

  async delete(id: string): Promise<boolean> {
    return await db.brands.delete(id);
  }

  // Subpages
  async getSubpageData(brandId: string, subpage: string) {
    switch (subpage) {
      case "summary":
        return await db.brandSummaries.select({ brandId });
      case "booking":
        return await db.bookingTrackers.select({ brandId });
      case "capacity":
        return await db.factoryCapacities.select({ brandId });
      case "courier":
        return await db.courierShipments.select({ brandId });
      case "capr":
        return await db.caprIssues.select({ brandId });
      case "standards":
        return await db.testingStandards.select({ brandId });
      default:
        return [];
    }
  }

  async saveSubpageData(brandId: string, subpage: string, data: any) {
    const record = { ...data, brandId };
    switch (subpage) {
      case "summary":
        return await db.brandSummaries.insert(record);
      case "booking":
        return await db.bookingTrackers.insert(record);
      case "capacity":
        return await db.factoryCapacities.insert(record);
      case "courier":
        return await db.courierShipments.insert(record);
      case "capr":
        return await db.caprIssues.insert(record);
      case "standards":
        return await db.testingStandards.insert(record);
      default:
        throw new Error(`Unknown brand subpage: ${subpage}`);
    }
  }
}

export const brandService = new BrandService();
