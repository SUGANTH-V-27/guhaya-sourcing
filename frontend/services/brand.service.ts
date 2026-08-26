import { api } from "./api";
import { Brand } from "../types/brand";

export const brandService = {
  async getBrands(): Promise<Brand[]> {
    return await api.get<Brand[]>("/brands");
  },

  async getBrandById(id: string): Promise<Brand | null> {
    return await api.get<Brand>(`/brands/${id}`);
  },

  async createBrand(brand: Partial<Brand>): Promise<Brand> {
    return await api.post<Brand>("/brands", brand);
  },

  async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    return await api.put<Brand>(`/brands/${id}`, updates);
  },

  async deleteBrand(id: string): Promise<boolean> {
    const res = await api.delete<{ deleted: boolean }>(`/brands/${id}`);
    return res?.deleted ?? true;
  },

  async getSubpageData(brandId: string, subpage: string) {
    return await api.get(`/brands/${brandId}/${subpage}`);
  },

  async saveSubpageData(brandId: string, subpage: string, data: any) {
    return await api.post(`/brands/${brandId}/${subpage}`, data);
  },
};

export default brandService;
