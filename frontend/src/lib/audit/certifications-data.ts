export type CertificationRecord = {
  id: string;
  factoryName: string;
  certificationType: string;
  certificateNumber: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  scope: string;
  auditGrade?: string;
  documentUrl?: string;
  pdfUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const STANDARD_CERTIFICATION_TYPES = [
  "SEDEX / SMETA 4-Pillar",
  "BSCI (Social Compliance)",
  "OEKO-TEX STANDARD 100",
  "GOTS (Global Organic Textile Standard)",
  "ISO 9001:2015 (Quality Management)",
  "ISO 14001:2015 (Environmental Management)",
  "WRAP (Gold / Platinum)",
  "HIGG Index (FEM / FSLM)",
  "SA8000 (Social Accountability)",
  "GRS (Global Recycled Standard)",
  "BCI (Better Cotton Initiative)",
  "OCS (Organic Content Standard)",
];

export const CERTIFICATION_BODIES = [
  "SGS India",
  "Intertek Testing Services",
  "TÜV SÜD South Asia",
  "Bureau Veritas",
  "Control Union Certifications",
  "UL Verification Services",
  "Hohenstein Institute",
  "DNV GL Business Assurance",
];

export function getDaysUntilExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDateStr: string): {
  status: "Valid" | "Expiring Soon" | "Expired";
  daysLeft: number;
  label: string;
  badgeClass: string;
} {
  const daysLeft = getDaysUntilExpiry(expiryDateStr);

  if (daysLeft < 0) {
    return {
      status: "Expired",
      daysLeft,
      label: `Expired (${Math.abs(daysLeft)}d ago)`,
      badgeClass: "bg-red-950/60 text-red-400 border border-red-800/80",
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "Expiring Soon",
      daysLeft,
      label: `${daysLeft}d left (Urgent)`,
      badgeClass: "bg-red-950/40 text-red-300 border border-red-700/60 animate-pulse",
    };
  }

  if (daysLeft <= 90) {
    return {
      status: "Expiring Soon",
      daysLeft,
      label: `${daysLeft}d left`,
      badgeClass: "bg-amber-950/40 text-amber-300 border border-amber-700/60",
    };
  }

  return {
    status: "Valid",
    daysLeft,
    label: `Valid (${daysLeft}d left)`,
    badgeClass: "bg-emerald-950/40 text-emerald-400 border border-emerald-700/50",
  };
}

const STORAGE_KEY = "guhaya-certifications";

export const INITIAL_CERTIFICATIONS: CertificationRecord[] = [];

export function loadCertifications(): CertificationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCertifications(certs: CertificationRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

export function addCertification(cert: Omit<CertificationRecord, "id" | "createdAt" | "updatedAt">): CertificationRecord {
  const list = loadCertifications();
  const newCert: CertificationRecord = {
    ...cert,
    id: `cert-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(newCert);
  saveCertifications(list);
  return newCert;
}

export function updateCertification(id: string, patch: Partial<CertificationRecord>) {
  const list = loadCertifications();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    saveCertifications(list);
  }
}

export function deleteCertification(id: string) {
  const list = loadCertifications().filter((c) => c.id !== id);
  saveCertifications(list);
}
