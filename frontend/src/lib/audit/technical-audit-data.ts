import { db } from "../db/db-client";

export type TechnicalModule = {
  id: string;
  name: string;
  maxScore: number;
  scoreAchieved: number;
  description: string;
  checkpoints: Array<{
    id: string;
    label: string;
    rating: "Pass" | "Minor Gap" | "Major Gap" | "N/A";
    remarks?: string;
  }>;
};

export type TechnicalFinding = {
  id: string;
  moduleName: string;
  issue: string;
  recommendation: string;
  priority: "High" | "Medium" | "Low";
  targetDate: string;
  status: "Open" | "In Progress" | "Closed";
};

export type TechnicalAudit = {
  id: string;
  factoryName: string;
  brand?: string;
  auditDate: string;
  auditorName: string;
  location: string;
  contactPerson?: string;
  contact?: string;
  workforceCount?: number;
  workforce?: number;
  dailyCapacityPcs?: number;
  capacity?: number;
  productCategories?: string[];
  categories?: string;
  overallScorePercent?: number;
  grade?: string;
  status?: "Approved" | "Conditional" | "Rejected" | string;
  modules: TechnicalModule[];
  findings?: TechnicalFinding[];
  summaryConclusion?: string;
  conclusion?: string;
  available?: number;
  missing?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_TECHNICAL_MODULES: TechnicalModule[] = [
  {
    id: "mod-1",
    name: "1. Sampling & Pattern Making",
    maxScore: 15,
    scoreAchieved: 14,
    description: "CAD grading, pattern digitizing, sample approval & turnaround",
    checkpoints: [
      { id: "cp-1-1", label: "CAD system for pattern making & automated marker planning", rating: "Pass" },
      { id: "cp-1-2", label: "Sample tracking log & technical pack verification", rating: "Pass" },
      { id: "cp-1-3", label: "Fit sample measurement verification against approved specs", rating: "Pass" },
    ],
  },
  {
    id: "mod-2",
    name: "2. Fabric Inspection & Storage",
    maxScore: 20,
    scoreAchieved: 18,
    description: "4-Point inspection, GSM/width checks, shade sorting & relaxing",
    checkpoints: [
      { id: "cp-2-1", label: "Standard 4-point fabric inspection machine with calibrated lighting", rating: "Pass" },
      { id: "cp-2-2", label: "Fabric relaxation protocol (minimum 24 hours for knits)", rating: "Pass" },
      { id: "cp-2-3", label: "Shade sorting under D65 light box & roll tagging", rating: "Pass" },
    ],
  },
  {
    id: "mod-3",
    name: "3. Cutting Room & Preparation",
    maxScore: 15,
    scoreAchieved: 13,
    description: "Spreading tension, cutting precision, bundle numbering & fusing",
    checkpoints: [
      { id: "cp-3-1", label: "Tension-free fabric spreading and ply height control", rating: "Pass" },
      { id: "cp-3-2", label: "Top-to-bottom ply check and notch accuracy", rating: "Pass" },
      { id: "cp-3-3", label: "Continuous fusing machine with daily temperature/pressure test", rating: "Minor Gap", remarks: "Temperature strips recorded every 4 hours instead of every 2 hours" },
    ],
  },
  {
    id: "mod-4",
    name: "4. Sewing & Production Lines",
    maxScore: 25,
    scoreAchieved: 22,
    description: "Line balancing, inline QC stations, machine maintenance & needle control",
    checkpoints: [
      { id: "cp-4-1", label: "Inline QC checkpoints with traffic-light defect logging", rating: "Pass" },
      { id: "cp-4-2", label: "Strict broken needle policy with locked replacement register", rating: "Pass" },
      { id: "cp-4-3", label: "Preventive machine maintenance schedule & oil-leak guards", rating: "Pass" },
    ],
  },
  {
    id: "mod-5",
    name: "5. Finishing, Ironing & Packing",
    maxScore: 15,
    scoreAchieved: 14,
    description: "Metal detector calibration, steam pressing, barcode & carton checks",
    checkpoints: [
      { id: "cp-5-1", label: "Conveyor metal detector with 9-point calibration logged every 2 hours (1.0mm/1.2mm sphere)", rating: "Pass" },
      { id: "cp-5-2", label: "Steam press temperature regulation and shine-prevention covers", rating: "Pass" },
      { id: "cp-5-3", label: "Barcode scanning verification and carton drop test protocol", rating: "Pass" },
    ],
  },
  {
    id: "mod-6",
    name: "6. Quality Assurance & Lab Testing",
    maxScore: 10,
    scoreAchieved: 9,
    description: "Button pull test, crocking test, wash fastness & calibration",
    checkpoints: [
      { id: "cp-6-1", label: "Calibrated digital pull tester (minimum 90N for 10 seconds on trims/snaps)", rating: "Pass" },
      { id: "cp-6-2", label: "In-house crockmeter & wash tester for preliminary fastness", rating: "Pass" },
      { id: "cp-6-3", label: "Non-conformance quarantine area and CAP root-cause tracking", rating: "Pass" },
    ],
  },
];

const STORAGE_KEY = "guhaya-technical-audits";

export const INITIAL_TECHNICAL_AUDITS: TechnicalAudit[] = [];

export function loadTechnicalAudits(): TechnicalAudit[] {
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

export function saveTechnicalAudits(audits: TechnicalAudit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
}

export function getTechnicalAuditById(id: string): TechnicalAudit | undefined {
  return loadTechnicalAudits().find((a) => a.id === id);
}

export async function saveOrUpdateTechnicalAudit(audit: TechnicalAudit) {
  const list = loadTechnicalAudits();
  const idx = list.findIndex((a) => a.id === audit.id);
  if (idx >= 0) {
    list[idx] = { ...audit, updatedAt: new Date().toISOString() };
    await db.technicalAudits.update(audit.id, audit);
  } else {
    list.unshift({
      ...audit,
      createdAt: audit.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await db.technicalAudits.insert(audit);
  }
  saveTechnicalAudits(list);
}

export async function deleteTechnicalAudit(id: string) {
  await db.technicalAudits.delete(id);
  const list = loadTechnicalAudits().filter((a) => a.id !== id);
  saveTechnicalAudits(list);
}
