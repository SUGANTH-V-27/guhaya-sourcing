import { db } from "../config/db.js";

export class AuditService {
  // ── Social Compliance Audits ─────────────────────────────────────────────
  async getSocialAudits() {
    return await db.socialAudits.findMany();
  }

  async getSocialAuditById(id: string) {
    return await db.socialAudits.findOne(id);
  }

  async createSocialAudit(data: any) {
    const id = data.id || `audit_soc_${Date.now()}`;
    return await db.socialAudits.create({
      id,
      factoryName: data.factoryName || "Factory",
      brand: data.brand || "SOXO",
      address: data.address || null,
      auditDate: data.auditDate ? new Date(data.auditDate) : new Date(),
      contactPerson: data.contactPerson || null,
      contactEmail: data.contactEmail || null,
      auditorName: data.auditorName || "Auditor",
      overallScore: Number(data.overallScore || data.overallScorePercent) || 85,
      grade: data.grade || "A",
      colorRating: data.colorRating || "Green",
      criticalCompliantCount: Number(data.criticalCompliantCount) || 17,
      criticalTotalCount: Number(data.criticalTotalCount) || 17,
      auditorRemarks: data.auditorRemarks || data.remarks || null,
      status: data.status || "Completed",
    });
  }

  async updateSocialAudit(id: string, data: any) {
    return await db.socialAudits.update(id, data);
  }

  async deleteSocialAudit(id: string) {
    return await db.socialAudits.delete(id);
  }

  // ── Technical Audits ─────────────────────────────────────────────────────
  async getTechnicalAudits() {
    return await db.technicalAudits.findMany();
  }

  async createTechnicalAudit(data: any) {
    const id = data.id || `audit_tech_${Date.now()}`;
    return await db.technicalAudits.create({
      id,
      factoryName: data.factoryName || "Factory",
      brand: data.brand || "SOXO",
      auditDate: data.auditDate ? new Date(data.auditDate) : new Date(),
      auditorName: data.auditorName || "Auditor",
      location: data.location || null,
      workforce: Number(data.workforce) || 0,
      monthlyCapacityPcs: Number(data.capacity || data.monthlyCapacityPcs) || 0,
      productCategories: data.categories || data.productCategories || null,
      overallScore: Number(data.overallScore || data.overallScorePercent) || 85,
      availableItems: Number(data.available || data.availableItems) || 40,
      missingItems: Number(data.missing || data.missingItems) || 0,
      totalItems: Number(data.total || data.totalItems) || 64,
      rating: data.grade || data.rating || "Good",
      conclusion: data.conclusion || null,
    });
  }

  async deleteTechnicalAudit(id: string) {
    return await db.technicalAudits.delete(id);
  }

  // ── Certifications ───────────────────────────────────────────────────────
  async getCertifications() {
    return await db.certifications.findMany();
  }

  async createCertification(data: any) {
    const id = data.id || `cert_${Date.now()}`;
    return await db.certifications.create({
      id,
      factoryName: data.factoryName || "Factory",
      certificationType: data.certificationType || data.certificationName || "SEDEX",
      certificateNumber: data.certificateNumber || data.certNumber || `CERT-${Date.now().toString().slice(-5)}`,
      issuingBody: data.issuingBody || data.body || "SEDEX",
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
      scope: data.scope || null,
      notes: data.notes || data.remarks || null,
      pdfUrl: data.pdfUrl || null,
      status: data.status || "Valid",
    });
  }

  async deleteCertification(id: string) {
    return await db.certifications.delete(id);
  }
}

export const auditService = new AuditService();
