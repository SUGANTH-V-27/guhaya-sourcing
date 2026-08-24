// ── Model Sub-Pages Mock Data ─────────────────────────────────────────────────

export interface PurchaseOrderLine {
  id: string;
  modelId: string;
  poNumber: string;
  buyerRef: string;
  color: string;
  sizeBreakdown: Record<string, number>;
  totalQty: number;
  unitPriceUSD: number;
  deliveryDate: string;
  status: "Draft" | "Confirmed" | "In Production" | "Shipped" | "Cancelled";
  remarks: string;
}

export interface FabricStatusRecord {
  id: string;
  modelId: string;
  fabricType: string;
  composition: string;
  gsmTarget: number;
  gsmActual: number | null;
  supplier: string;
  dyeingStatus: "Pending" | "In Process" | "Completed" | "Approved" | "Rejected";
  labDipStatus: "Submitted" | "Approved" | "Re-submit" | "Pending";
  shrinkageLength: string;
  shrinkageWidth: string;
  fabricInhouseDate: string | null;
  bulkFabricQty: string;
  remarks: string;
}

export interface MeasurementSpec {
  pointOfMeasure: string;
  tolerance: string;
  sizes: Record<string, { spec: number; actual: number | null }>;
}

export interface PatternFile {
  id: string;
  modelId: string;
  fileName: string;
  fileType: "Base Pattern" | "Graded Set" | "Marker Layout" | "Amended Pattern";
  version: string;
  uploadedBy: string;
  uploadDate: string;
  markerEfficiency: number | null;
  status: "Draft" | "Approved" | "Superseded";
  remarks: string;
}

export interface TrimmingItem {
  id: string;
  modelId: string;
  trimType: "Main Label" | "Care Label" | "Size Label" | "Hang Tag" | "Button" | "Zipper" | "Drawcord" | "Elastic" | "Snap Button" | "Rivet";
  description: string;
  supplier: string;
  approvedArtwork: boolean;
  inHouseDate: string | null;
  requiredQty: string;
  receivedQty: string;
  status: "Pending Artwork" | "Artwork Approved" | "Ordered" | "In-House" | "Short";
  remarks: string;
}

export interface TNAActivity {
  id: string;
  modelId: string;
  activity: string;
  department: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: "Not Started" | "In Progress" | "Completed" | "Delayed" | "On Hold";
  responsible: string;
  remarks: string;
}

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderLine[] = [];

export const INITIAL_FABRIC_STATUS: FabricStatusRecord[] = [];

export const INITIAL_MEASUREMENTS: MeasurementSpec[] = [];

export const INITIAL_PATTERN_FILES: PatternFile[] = [];

export const INITIAL_TRIMMING_ITEMS: TrimmingItem[] = [];

export const INITIAL_TNA_ACTIVITIES: TNAActivity[] = [];
