import { db } from "../db/db-client";

export const AuditApi = {
  // Social Compliance
  async getSocialAudits() {
    return await db.socialComplianceAudits.getAll();
  },

  async getSocialAuditById(id: string) {
    return await db.socialComplianceAudits.getById(id);
  },

  async saveSocialAudit(audit: any) {
    if (audit.id) {
      return await db.socialComplianceAudits.update(audit.id, audit);
    }
    return await db.socialComplianceAudits.insert(audit);
  },

  async deleteSocialAudit(id: string) {
    return await db.socialComplianceAudits.delete(id);
  },

  // Technical Audit
  async getTechnicalAudits() {
    return await db.technicalAudits.getAll();
  },

  async getTechnicalAuditById(id: string) {
    return await db.technicalAudits.getById(id);
  },

  async saveTechnicalAudit(audit: any) {
    if (audit.id) {
      return await db.technicalAudits.update(audit.id, audit);
    }
    return await db.technicalAudits.insert(audit);
  },

  async deleteTechnicalAudit(id: string) {
    return await db.technicalAudits.delete(id);
  },

  // Certifications
  async getCertifications(factoryFilter?: string) {
    if (factoryFilter && factoryFilter !== "all") {
      return await db.certifications.query(
        (c) => c.factoryName?.toLowerCase() === factoryFilter.toLowerCase()
      );
    }
    return await db.certifications.getAll();
  },

  async saveCertification(cert: any) {
    if (cert.id) {
      return await db.certifications.update(cert.id, cert);
    }
    return await db.certifications.insert(cert);
  },

  async deleteCertification(id: string) {
    return await db.certifications.delete(id);
  },
};
