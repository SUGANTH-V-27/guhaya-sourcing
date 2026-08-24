export type ComplianceRating = "Green" | "Light-Green" | "Orange" | "Red" | "Black" | "N/A";
export type FindingSeverity = "Critical" | "Major" | "Minor" | "Observation";
export type AuditGrade = "A" | "B" | "C" | "D" | "E";

export type ComplianceSectionConfig = {
  no: number;
  name: string;
  maxScore: number;
  description: string;
};

export const SOCIAL_COMPLIANCE_SECTIONS: ComplianceSectionConfig[] = [
  { no: 1, name: "Employment Contracts", maxScore: 9, description: "Legal contracts, age proof, identity & personnel files" },
  { no: 2, name: "Child Labour / Young Labour", maxScore: 10.5, description: "Strict zero child labour policy, young worker protections" },
  { no: 3, name: "Freedom of Association", maxScore: 9, description: "Worker committee, collective bargaining & grievance mechanism" },
  { no: 4, name: "Health & Safety", maxScore: 43.5, description: "Fire safety, PPE, chemical handling, first aid & machine guards" },
  { no: 5, name: "Working hours", maxScore: 6, description: "Standard hours, overtime limits & weekly rest days" },
  { no: 6, name: "Wages and compensation", maxScore: 16.5, description: "Minimum wages, statutory benefits (PF/ESI), payslips & bonuses" },
  { no: 7, name: "Discrimination & Harassment", maxScore: 12, description: "Anti-harassment committee, non-discrimination in hiring & wages" },
  { no: 8, name: "Disciplinary practice", maxScore: 7.5, description: "Fair disciplinary procedures, zero physical/verbal abuse" },
  { no: 9, name: "Forced Labour", maxScore: 9, description: "Voluntary employment, freedom of movement, zero bond/deposits" },
  { no: 10, name: "Environment", maxScore: 19.5, description: "Effluent treatment (ETP), waste disposal & environmental permits" },
  { no: 11, name: "Management System", maxScore: 13.5, description: "Internal policies, audits, supplier management & training records" },
];

export type SectionScore = {
  sectionNo: number;
  sectionName: string;
  scorePossible: number;
  scoreAchieved: number;
  greenCount: number;
  lightGreenCount: number;
  orangeCount: number;
  redCount: number;
  blackCount: number;
  notApplicableCount: number;
};

export type CapFinding = {
  id: string;
  findingNo: string;
  severity: FindingSeverity;
  sectionName: string;
  issueDescription: string;
  correctiveAction: string;
  responsiblePerson: string;
  agreedTimeline: string;
  status: "Open" | "In Progress" | "Resolved" | "Verified";
};

export type SocialComplianceAudit = {
  id: string;
  factoryName: string;
  brand?: string;
  auditDate: string;
  auditorName: string;
  auditType: "Initial Audit" | "Periodic Audit" | "Follow-up Audit" | "Unannounced Audit";
  factoryAddress?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  overallScorePercent: number;
  grade: AuditGrade;
  status: "Passed" | "Conditional" | "Failed" | "Action Required";
  sections: SectionScore[];
  findings: CapFinding[];
  capFindings?: CapFinding[];
  auditorRemarks?: string;
  createdAt: string;
  updatedAt: string;
};

export function calcComplianceGrade(scorePercent: number, hasBlack: boolean, hasRed: boolean): {
  grade: AuditGrade;
  status: "Passed" | "Conditional" | "Failed" | "Action Required";
  gradeLabel: string;
} {
  if (hasBlack) {
    return { grade: "E", status: "Failed", gradeLabel: "Critical Failure (Black Finding)" };
  }
  if (scorePercent >= 95) {
    return { grade: "A", status: "Passed", gradeLabel: "Excellent Compliance" };
  }
  if (scorePercent >= 80) {
    return { grade: "B", status: "Passed", gradeLabel: "Good Compliance" };
  }
  if (scorePercent >= 60) {
    return { grade: "C", status: "Conditional", gradeLabel: "Accepted with CAP" };
  }
  return { grade: "D", status: "Failed", gradeLabel: "Failed (Needs Re-audit)" };
}

export function buildDefaultSectionScores(): SectionScore[] {
  return SOCIAL_COMPLIANCE_SECTIONS.map((s) => ({
    sectionNo: s.no,
    sectionName: s.name,
    scorePossible: s.maxScore,
    scoreAchieved: s.maxScore,
    greenCount: 4,
    lightGreenCount: 0,
    orangeCount: 0,
    redCount: 0,
    blackCount: 0,
    notApplicableCount: 0,
  }));
}

const STORAGE_KEY = "guhaya-social-audits";

export const INITIAL_SOCIAL_AUDITS: SocialComplianceAudit[] = [];

export function loadSocialAudits(): SocialComplianceAudit[] {
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

export function saveSocialAudits(audits: SocialComplianceAudit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
}

export function getSocialAuditById(id: string): SocialComplianceAudit | undefined {
  return loadSocialAudits().find((a) => a.id === id);
}

export function saveOrUpdateSocialAudit(audit: SocialComplianceAudit) {
  const list = loadSocialAudits();
  const idx = list.findIndex((a) => a.id === audit.id);
  if (idx >= 0) {
    list[idx] = { ...audit, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({
      ...audit,
      createdAt: audit.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveSocialAudits(list);
}

export function deleteSocialAudit(id: string) {
  const list = loadSocialAudits().filter((a) => a.id !== id);
  saveSocialAudits(list);
}
