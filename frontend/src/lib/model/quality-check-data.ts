// ── Quality Check Mock Data ───────────────────────────────────────────────────

export interface PPMRecord {
  id: string;
  modelId: string;
  meetingDate: string;
  attendees: string[];
  criticalPoints: { area: string; detail: string; risk: "High" | "Medium" | "Low" }[];
  trimCardReview: { trim: string; status: "Approved" | "Pending" | "Rejected"; note: string }[];
  measurementConfirmed: boolean;
  constructionNotes: string[];
  overallStatus: "Completed" | "Pending Action";
}

export interface SampleEvaluation {
  id: string;
  modelId: string;
  sampleType: "Proto" | "Fit Sample" | "Size Set" | "Gold Seal" | "Sales Sample" | "TOP";
  sampleRound: number;
  evaluationDate: string;
  evaluatedBy: string;
  size: string;
  overallResult: "Approved" | "Approved with Comments" | "Rejected" | "Pending";
  fitComments: string;
  constructionComments: string;
  washTestResult: string;
  measurements: { point: string; spec: number; actual: number; tolerance: string; pass: boolean }[];
}

export interface InspectionReport {
  id: string;
  modelId: string;
  inspectionType: "Fabric 4-Point" | "Inline" | "Midline" | "Final AQL" | "First Garment";
  inspectionDate: string;
  inspector: string;
  lotSize: number;
  sampleSize: number;
  defectsFound: { category: string; count: number; severity: "Critical" | "Major" | "Minor" }[];
  totalDefects: number;
  aqlLevel: string;
  result: "Pass" | "Fail" | "Conditional Pass";
  remarks: string;
}

export interface LabTestReport {
  id: string;
  modelId: string;
  labName: string;
  reportNumber: string;
  testDate: string;
  sampleDescription: string;
  tests: { id?: string; parameter: string; method: string; requirement: string; result: string; pass: boolean }[];
  overallResult: "Pass" | "Fail" | "Conditional";
}

// ── PPM Data ──────────────────────────────────────────────────────────────────

export const INITIAL_PPM: PPMRecord = {
  id: "ppm-default",
  modelId: "",
  meetingDate: new Date().toISOString().slice(0, 10),
  attendees: [],
  criticalPoints: [],
  trimCardReview: [],
  measurementConfirmed: false,
  constructionNotes: [],
  overallStatus: "Pending Action",
};

// ── Sample Evaluations Data ───────────────────────────────────────────────────

export const INITIAL_SAMPLE_EVALUATIONS: SampleEvaluation[] = [];

// ── Inspection Reports Data ───────────────────────────────────────────────────

export const INITIAL_INSPECTIONS: InspectionReport[] = [];

// ── Lab Test Reports Data ─────────────────────────────────────────────────────

export const INITIAL_LAB_TESTS: LabTestReport[] = [];

