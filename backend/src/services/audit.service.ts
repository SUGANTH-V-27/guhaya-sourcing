import { db } from "../config/db.js";
import { SocialComplianceAudit, TechnicalAudit, FactoryCertification } from "../types/index.js";

export class AuditService {
  // Social Compliance
  async getSocialAudits(): Promise<SocialComplianceAudit[]> {
    return (await db.socialAudits.select()) as SocialComplianceAudit[];
  }

  async createSocialAudit(data: Partial<SocialComplianceAudit>): Promise<SocialComplianceAudit> {
    const id = data.id || `audit_soc_${Date.now()}`;
    return (await db.socialAudits.insert({
      ...data,
      id,
      factoryName: data.factoryName || "Factory A",
      auditDate: data.auditDate || new Date().toISOString().split("T")[0],
      auditorName: data.auditorName || "Auditor",
      overallScore: data.overallScore ?? 85,
      grade: data.grade || "B",
      status: data.status || "Passed",
    })) as SocialComplianceAudit;
  }

  // Technical Audits
  async getTechnicalAudits(): Promise<TechnicalAudit[]> {
    return (await db.technicalAudits.select()) as TechnicalAudit[];
  }

  async createTechnicalAudit(data: Partial<TechnicalAudit>): Promise<TechnicalAudit> {
    const id = data.id || `audit_tech_${Date.now()}`;
    return (await db.technicalAudits.insert({
      ...data,
      id,
      factoryName: data.factoryName || "Factory A",
      auditDate: data.auditDate || new Date().toISOString().split("T")[0],
      auditorName: data.auditorName || "Auditor",
      status: data.status || "Approved",
    })) as TechnicalAudit;
  }

  // Certifications
  async getCertifications(): Promise<FactoryCertification[]> {
    return (await db.certifications.select()) as FactoryCertification[];
  }

  async createCertification(data: Partial<FactoryCertification>): Promise<FactoryCertification> {
    const id = data.id || `cert_${Date.now()}`;
    return (await db.certifications.insert({
      ...data,
      id,
      factoryName: data.factoryName || "Factory A",
      certificationName: data.certificationName || "ISO 9001",
      issuedDate: data.issuedDate || new Date().toISOString().split("T")[0],
      expiryDate: data.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      validityStatus: data.validityStatus || "Valid",
    })) as FactoryCertification;
  }
}

export const auditService = new AuditService();
