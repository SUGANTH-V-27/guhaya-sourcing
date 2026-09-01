import { api } from "./api";

export const costingService = {
  async getAll() {
    return await api.get<any[]>("/costing");
  },
  async getById(id: string) {
    return await api.get<any>(`/costing/${id}`);
  },
  async create(data: any) {
    return await api.post<any>("/costing", data);
  },
  async update(id: string, data: any) {
    return await api.put<any>(`/costing/${id}`, data);
  },
  async delete(id: string) {
    return await api.delete(`/costing/${id}`);
  },
};

export default costingService;
