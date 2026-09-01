import { api } from "./api";
import { Model } from "../types/model";

export const modelService = {
  async getModels(brandId?: string): Promise<Model[]> {
    const params = brandId ? { brandId } : undefined;
    return await api.get<Model[]>("/models", params);
  },

  async getModelById(id: string): Promise<Model | null> {
    return await api.get<Model>(`/models/${id}`);
  },

  async createModel(model: Partial<Model>): Promise<Model> {
    return await api.post<Model>("/models", model);
  },

  async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
    return await api.put<Model>(`/models/${id}`, updates);
  },

  async deleteModel(id: string): Promise<boolean> {
    const res = await api.delete<{ deleted: boolean }>(`/models/${id}`);
    return res?.deleted ?? true;
  },

  async getSubpageData(modelId: string, subpage: string) {
    return await api.get(`/models/${modelId}/${subpage}`);
  },

  async saveSubpageData(modelId: string, subpage: string, data: any) {
    return await api.post(`/models/${modelId}/${subpage}`, data);
  },

  async deleteSubpageData(modelId: string, subpage: string, recordId: string) {
    return await api.delete(`/models/${modelId}/${subpage}/${recordId}`);
  },
};

export default modelService;
