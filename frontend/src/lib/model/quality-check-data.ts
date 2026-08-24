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
  tests: { parameter: string; method: string; requirement: string; result: string; pass: boolean }[];
  overallResult: "Pass" | "Fail" | "Conditional";
}

// ── PPM Data ──────────────────────────────────────────────────────────────────

export const INITIAL_PPM: PPMRecord = {
  id: "ppm-001",
  modelId: "m-1",
  meetingDate: "2026-08-16",
  attendees: [
    "K. Rajesh (Factory Manager)",
    "S. Murugan (Senior QC)",
    "P. Vignesh (Merch Lead)",
    "Buyer QA Rep (Virtual)",
  ],
  criticalPoints: [
    { area: "Hood Construction", detail: "Double-stitch reinforcement on hood seam junction. 3-needle coverstitch on hood lining attachment.", risk: "High" },
    { area: "Kangaroo Pocket", detail: "Single-piece pocket with reinforced bar-tack at entry points. Pocket opening: 18cm ±0.5cm.", risk: "Medium" },
    { area: "GSM Consistency", detail: "Target 380 GSM ±5%. Random GSM checks every 500 meters of fabric roll.", risk: "High" },
    { area: "Print Placement", detail: "Chest print centered, 8cm from HPS. Tolerance ±0.3cm. Print size 28cm x 22cm.", risk: "Medium" },
    { area: "Drawcord Safety", detail: "Max exposed drawcord length: 7.5cm each side. Heat-sealed tips mandatory.", risk: "Low" },
  ],
  trimCardReview: [
    { trim: "Main Label", status: "Approved", note: "Woven damask label approved." },
    { trim: "Care Label", status: "Approved", note: "5-language care content verified." },
    { trim: "Hang Tag", status: "Pending", note: "Awaiting FSC certification on kraft paper." },
    { trim: "YKK Zipper", status: "Approved", note: "YKK #5 matte black. Auto-lock puller." },
    { trim: "Drawcord", status: "Pending", note: "Tip finish (metal aglet vs heat seal) TBD." },
  ],
  measurementConfirmed: true,
  constructionNotes: [
    "All seams: 4-thread overlock with safety stitch where specified.",
    "Hem: 1\" turned & topstitched with twin-needle coverstitch.",
    "Collar rib: Cut & sewn, NOT tubular. Seam at CB neck.",
    "Shoulder tape: 12mm cotton twill tape on both shoulders.",
  ],
  overallStatus: "Completed",
};

// ── Sample Evaluations Data ───────────────────────────────────────────────────

export const INITIAL_SAMPLE_EVALUATIONS: SampleEvaluation[] = [
  {
    id: "eval-001",
    modelId: "m-1",
    sampleType: "Proto",
    sampleRound: 1,
    evaluationDate: "2026-07-15",
    evaluatedBy: "P. Vignesh (Merch Lead)",
    size: "M",
    overallResult: "Approved with Comments",
    fitComments: "Body length is 1cm short. Hood depth needs to increase by 1.5cm. Shoulder drop OK.",
    constructionComments: "Pocket bar-tack needs to be 15mm instead of 10mm. Coverstitch tension is too tight on hem.",
    washTestResult: "Shrinkage after 3 washes: Length -3.5%, Width -2.8% — within tolerance.",
    measurements: [
      { point: "Chest Width", spec: 57.0, actual: 56.8, tolerance: "±1.0 cm", pass: true },
      { point: "Body Length", spec: 70.0, actual: 69.0, tolerance: "±1.5 cm", pass: true },
      { point: "Sleeve Length", spec: 84.0, actual: 84.2, tolerance: "±1.0 cm", pass: true },
      { point: "Shoulder Width", spec: 50.0, actual: 50.3, tolerance: "±0.5 cm", pass: true },
    ],
  },
  {
    id: "eval-002",
    modelId: "m-1",
    sampleType: "Fit Sample",
    sampleRound: 2,
    evaluationDate: "2026-07-22",
    evaluatedBy: "Buyer QA (Remote Review)",
    size: "M",
    overallResult: "Approved",
    fitComments: "Hood depth corrected. Body length adjusted. Overall fit approved for bulk production.",
    constructionComments: "All construction points corrected per PPM minutes. Coverstitch tension resolved.",
    washTestResult: "Shrinkage after 3 washes: Length -3.2%, Width -2.8% — approved.",
    measurements: [
      { point: "Chest Width", spec: 57.0, actual: 57.1, tolerance: "±1.0 cm", pass: true },
      { point: "Body Length", spec: 70.0, actual: 70.0, tolerance: "±1.5 cm", pass: true },
      { point: "Sleeve Length", spec: 84.0, actual: 84.3, tolerance: "±1.0 cm", pass: true },
      { point: "Shoulder Width", spec: 50.0, actual: 50.2, tolerance: "±0.5 cm", pass: true },
    ],
  },
  {
    id: "eval-003",
    modelId: "m-1",
    sampleType: "Gold Seal",
    sampleRound: 3,
    evaluationDate: "2026-08-05",
    evaluatedBy: "S. Murugan (Senior QC)",
    size: "L",
    overallResult: "Approved",
    fitComments: "Gold seal sample with all approved trims & labels. Ready for bulk production reference.",
    constructionComments: "All specs within tolerance. Sealed as production reference sample.",
    washTestResult: "Dimensional stability confirmed after 5 home launderings.",
    measurements: [
      { point: "Chest Width", spec: 60.0, actual: 59.8, tolerance: "±1.0 cm", pass: true },
      { point: "Body Length", spec: 72.0, actual: 72.2, tolerance: "±1.5 cm", pass: true },
      { point: "Sleeve Length", spec: 86.0, actual: 85.9, tolerance: "±1.0 cm", pass: true },
      { point: "Shoulder Width", spec: 52.0, actual: 52.0, tolerance: "±0.5 cm", pass: true },
    ],
  },
];

// ── Inspection Reports Data ───────────────────────────────────────────────────

export const INITIAL_INSPECTIONS: InspectionReport[] = [
  {
    id: "insp-001",
    modelId: "m-1",
    inspectionType: "Fabric 4-Point",
    inspectionDate: "2026-08-14",
    inspector: "S. Murugan (Senior QC)",
    lotSize: 4200,
    sampleSize: 840,
    defectsFound: [
      { category: "Slub / Thick Yarn", count: 3, severity: "Minor" },
      { category: "Needle Line", count: 1, severity: "Major" },
      { category: "Oil Stain", count: 2, severity: "Minor" },
    ],
    totalDefects: 6,
    aqlLevel: "≤ 28 pts/100 sq yd",
    result: "Pass",
    remarks: "Total penalty points: 14 pts/100 sq yd. Within acceptance limit.",
  },
  {
    id: "insp-002",
    modelId: "m-1",
    inspectionType: "Inline",
    inspectionDate: "2026-08-20",
    inspector: "R. Kavitha (Floor QC)",
    lotSize: 1200,
    sampleSize: 80,
    defectsFound: [
      { category: "Skip Stitch", count: 2, severity: "Major" },
      { category: "Uneven Topstitch", count: 3, severity: "Minor" },
      { category: "Loose Thread", count: 4, severity: "Minor" },
    ],
    totalDefects: 9,
    aqlLevel: "AQL 2.5 Major / 4.0 Minor",
    result: "Pass",
    remarks: "Line #4 — all operators briefed on stitch tension adjustment.",
  },
  {
    id: "insp-003",
    modelId: "m-1",
    inspectionType: "Midline",
    inspectionDate: "2026-08-21",
    inspector: "S. Murugan (Senior QC)",
    lotSize: 2400,
    sampleSize: 125,
    defectsFound: [
      { category: "Measurement Variation (Chest)", count: 1, severity: "Major" },
      { category: "Pocket Misalignment", count: 1, severity: "Minor" },
    ],
    totalDefects: 2,
    aqlLevel: "AQL 2.5 Major",
    result: "Pass",
    remarks: "Minor pocket alignment issue corrected by adjusting folder guide.",
  },
  {
    id: "insp-004",
    modelId: "m-1",
    inspectionType: "First Garment",
    inspectionDate: "2026-08-18",
    inspector: "P. Vignesh (Merch Lead) + QC Team",
    lotSize: 1,
    sampleSize: 1,
    defectsFound: [],
    totalDefects: 0,
    aqlLevel: "N/A",
    result: "Pass",
    remarks: "First garment off Line #4 approved. All measurements within spec. Construction per Gold Seal.",
  },
];

// ── Lab Test Reports Data ─────────────────────────────────────────────────────

export const INITIAL_LAB_TESTS: LabTestReport[] = [
  {
    id: "lab-001",
    modelId: "m-1",
    labName: "SGS India Pvt Ltd (Tirupur Lab)",
    reportNumber: "SGS/TPR/2026/08-4891",
    testDate: "2026-08-10",
    sampleDescription: "380 GSM 100% Organic Cotton Fleece — Black (Lot DL-8821)",
    tests: [
      { parameter: "Dimensional Stability (Washing)", method: "ISO 6330", requirement: "Max ±4.0%", result: "Length: -3.2%, Width: -2.8%", pass: true },
      { parameter: "Color Fastness to Washing", method: "ISO 105-C06", requirement: "Min Grade 4.0", result: "Change: 4-5, Stain: 4.0", pass: true },
      { parameter: "Color Fastness to Rubbing (Dry)", method: "ISO 105-X12", requirement: "Min Grade 4.0", result: "Grade 4-5", pass: true },
      { parameter: "Color Fastness to Rubbing (Wet)", method: "ISO 105-X12", requirement: "Min Grade 3.0", result: "Grade 3-4", pass: true },
      { parameter: "pH Value", method: "ISO 3071", requirement: "4.5 - 7.5", result: "6.2", pass: true },
      { parameter: "Formaldehyde Content", method: "ISO 14184-1", requirement: "< 16 ppm", result: "Not Detected", pass: true },
      { parameter: "AZO Dyes (Banned Amines)", method: "ISO 14362-1", requirement: "< 30 mg/kg", result: "Not Detected", pass: true },
      { parameter: "Pilling Resistance (2000 rev)", method: "ISO 12945-2", requirement: "Min Grade 3-4", result: "Grade 4.0", pass: true },
      { parameter: "Spirality / Torque", method: "ISO 16322-2", requirement: "Max 3.0%", result: "1.8%", pass: true },
    ],
    overallResult: "Pass",
  },
  {
    id: "lab-002",
    modelId: "m-1",
    labName: "Bureau Veritas (Chennai Lab)",
    reportNumber: "BV/CHN/2026/QT-7203",
    testDate: "2026-08-15",
    sampleDescription: "380 GSM 100% Organic Cotton Fleece — Forest Green (Lot DL-8825)",
    tests: [
      { parameter: "Dimensional Stability (Washing)", method: "ISO 6330", requirement: "Max ±4.0%", result: "Length: -3.5%, Width: -3.0%", pass: true },
      { parameter: "Color Fastness to Washing", method: "ISO 105-C06", requirement: "Min Grade 4.0", result: "Change: 4.0, Stain: 3-4", pass: false },
      { parameter: "Color Fastness to Light", method: "ISO 105-B02", requirement: "Min Grade 4.0", result: "Grade 4.0", pass: true },
      { parameter: "pH Value", method: "ISO 3071", requirement: "4.5 - 7.5", result: "6.8", pass: true },
      { parameter: "Formaldehyde Content", method: "ISO 14184-1", requirement: "< 16 ppm", result: "Not Detected", pass: true },
    ],
    overallResult: "Conditional",
  },
];
