import { api } from "./api";

export const auditService = {
  // Social Compliance
  async getSocialAudits() {
    return await api.get<any[]>("/audit/social");
  },
  async createSocialAudit(data: any) {
    return await api.post<any>("/audit/social", data);
  },
  async deleteSocialAudit(id: string) {
    return await api.delete(`/audit/social/${id}`);
  },

  // Technical Audits
  async getTechnicalAudits() {
    return await api.get<any[]>("/audit/technical");
  },
  async createTechnicalAudit(data: any) {
    return await api.post<any>("/audit/technical", data);
  },
  async deleteTechnicalAudit(id: string) {
    return await api.delete(`/audit/technical/${id}`);
  },

  // Certifications
  async getCertifications() {
    return await api.get<any[]>("/audit/certifications");
  },
  async createCertification(data: any) {
    return await api.post<any>("/audit/certifications", data);
  },
  async deleteCertification(id: string) {
    return await api.delete(`/audit/certifications/${id}`);
  },
};

export default auditService;
