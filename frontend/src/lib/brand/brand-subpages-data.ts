export interface BrandStandards {
  brandId: string;
  fabricTests: {
    parameter: string;
    testMethod: string;
    requirement: string;
    tolerance: string;
  }[];
  garmentTests: {
    parameter: string;
    testMethod: string;
    requirement: string;
  }[];
  colorFastness: {
    type: string;
    dryGrading: string;
    wetGrading: string;
  }[];
}

export interface BrandBookingItem {
  id: string;
  brandId: string;
  season: string;
  styleNo: string;
  styleName: string;
  fabricType: string;
  projectedQty: number;
  confirmedQty: number;
  fobTargetUSD: number;
  targetDeliveryDate: string;
  factoryName: string;
  status: "Projected" | "Sample Stage" | "Confirmed" | "In Production" | "Delivered";
}

export interface BrandCapacityAllocation {
  id: string;
  brandId: string;
  factoryName: string;
  month: string;
  allocatedPcs: number;
  totalCapacityPcs: number;
  confirmedPcs: number;
  status: "Optimal" | "Near Limit" | "Available";
}

export interface CourierShipment {
  id: string;
  brandId: string;
  trackingNumber: string;
  courierPartner: "DHL Express" | "FedEx" | "UPS" | "Aramex" | "Bluedart";
  shipmentType: "Fit Samples" | "Lab Dips & Swatches" | "Bulk Trims" | "Sales Samples" | "Shipping Samples";
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  dispatchDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  status: "In Transit" | "Out for Delivery" | "Delivered" | "Delayed" | "Customs Hold";
  awbDocUrl?: string;
  remarks: string;
}

export interface CAPRRecord {
  id: string;
  brandId: string;
  reportNo: string;
  styleNo: string;
  factoryName: string;
  issueDate: string;
  department: "Knitting / Fabric" | "Cutting" | "Sewing" | "Dyeing / Printing" | "Finishing & Packing";
  defectTitle: string;
  defectDescription: string;
  severity: "Critical" | "Major" | "Minor";
  rootCause: string;
  preventiveAction: string;
  targetDate: string;
  closureDate?: string;
  status: "Open" | "Factory Responded" | "Verification Pending" | "Closed";
  assignedAuditor: string;
}

export const INITIAL_BRAND_STANDARDS: Record<string, BrandStandards> = {};

export const INITIAL_BOOKING_ITEMS: BrandBookingItem[] = [];
export const INITIAL_BRAND_BOOKINGS = INITIAL_BOOKING_ITEMS;

export const INITIAL_CAPACITY_ITEMS: BrandCapacityAllocation[] = [];
export const INITIAL_BRAND_CAPACITY = INITIAL_CAPACITY_ITEMS;

export const INITIAL_COURIER_ITEMS: CourierShipment[] = [];
export const INITIAL_COURIER_SHIPMENTS = INITIAL_COURIER_ITEMS;

export const INITIAL_CAPR_RECORDS: CAPRRecord[] = [];
