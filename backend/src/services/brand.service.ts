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

  async getFactories() {
    return await db.factories.select();
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

  async createWithDetails(data: Partial<Brand> & Record<string, any>): Promise<Brand> {
    const details = data.brandDetails || {};
    const buyerRows = Array.isArray(details.buyerRows) ? details.buyerRows : [];
    const description = data.description || `Buyer account for ${data.name || "New Brand"}`;
    const brand = await this.create({
      ...data,
      description: buyerRows.length
        ? `${description}\n\nBuyer details:\n${JSON.stringify(buyerRows)}`
        : description,
    });

    const optionGroups = details.options || {};
    for (const [group, values] of Object.entries(optionGroups)) {
      for (const value of values as string[]) {
        if (!value?.trim()) continue;
        await db.testingStandards.insert({
          id: `standard_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          brandId: brand.id,
          testCategory: "Brand setup",
          parameterName: group,
          requirementStandard: value.trim(),
          isMandatory: false,
        });
      }
    }

    const buyerFieldGroups: Record<string, string> = {
      department: "Department",
      subclass: "Subclass",
      buyer: "Buyer",
      assistant: "Buyer Assistant",
      manager: "Product Manager",
    };
    for (const row of buyerRows) {
      for (const [field, group] of Object.entries(buyerFieldGroups)) {
        const value = row?.[field]?.trim();
        if (!value) continue;
        await db.testingStandards.insert({
          id: `standard_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          brandId: brand.id,
          testCategory: "Brand setup",
          parameterName: group,
          requirementStandard: value,
          isMandatory: false,
        });
      }
    }

    for (const factory of Array.isArray(details.factories) ? details.factories : []) {
      if (!factory?.name?.trim()) continue;
      await db.factories.insert({
        id: factory.id || `factory_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        code: factory.code || null,
        name: factory.name.trim(),
        address: factory.address || null,
        gstin: factory.gstin || null,
        state: factory.state || null,
        stateCode: factory.stateCode || null,
        contactPerson: null,
        contactEmail: null,
        contactPhone: null,
        complianceGrade: "B",
        totalCapacityMonthly: 0,
      });
      await db.testingStandards.insert({
        id: `standard_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        brandId: brand.id,
        testCategory: "Brand setup",
        parameterName: "Factory",
        requirementStandard: factory.name.trim(),
        isMandatory: false,
      });
    }

    return brand;
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

  async closeCaprIssue(brandId: string, recordId: string) {
    const record = await db.caprIssues.selectById(recordId);
    if (!record || record.brandId !== brandId) return null;

    return await db.caprIssues.update(recordId, {
      status: "Closed",
      closureDate: new Date(),
    });
  }
}

export const brandService = new BrandService();
