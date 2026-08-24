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

export const INITIAL_BRAND_STANDARDS: Record<string, BrandStandards> = {
  "1": {
    brandId: "1",
    fabricTests: [
      { parameter: "Dimensional Stability (Shrinkage)", testMethod: "ISO 6330 / AATCC 135", requirement: "Length: Max ±4.0%, Width: Max ±4.0%", tolerance: "±0.5%" },
      { parameter: "Spirality / Torquing", testMethod: "ISO 16322-2", requirement: "Max 3.0% after 3 home launderings", tolerance: "+0.5%" },
      { parameter: "Fabric Weight (GSM)", testMethod: "ASTM D3776 / ISO 3801", requirement: "As per approved tech pack (e.g. 180 GSM ±5%)", tolerance: "±5%" },
      { parameter: "Bursting Strength", testMethod: "ASTM D3786", requirement: "Min 250 kPa", tolerance: "-10 kPa" },
      { parameter: "Pilling Resistance", testMethod: "ISO 12945-2 (Martindale 2000 rev)", requirement: "Min Grade 3-4", tolerance: "-0.5 grade" },
    ],
    garmentTests: [
      { parameter: "Seam Strength & Slippage", testMethod: "ASTM D1683", requirement: "Min 120 N seam slippage resistance" },
      { parameter: "Pull Test (Snaps & Buttons)", testMethod: "ASTM F963 / 16 CFR 1500", requirement: "90 N hold for 10 seconds without detachment" },
      { parameter: "pH Value of Aqueous Extract", testMethod: "ISO 3071", requirement: "4.5 to 7.5 (Skin contact standards)" },
      { parameter: "Formaldehyde Content", testMethod: "ISO 14184-1", requirement: "< 16 ppm (Strict Eco standard)" },
    ],
    colorFastness: [
      { type: "Washing at 40°C (ISO 105-C06)", dryGrading: "Grade 4.0 Min", wetGrading: "Grade 3-4 Min" },
      { type: "Water Fastness (ISO 105-E01)", dryGrading: "Grade 4.0 Min", wetGrading: "Grade 4.0 Min" },
      { type: "Perspiration Acid & Alkaline (ISO 105-E04)", dryGrading: "Grade 4.0 Min", wetGrading: "Grade 3-4 Min" },
      { type: "Rubbing / Crocking (ISO 105-X12)", dryGrading: "Grade 4.0 Min", wetGrading: "Grade 3.0 Min" },
      { type: "Light Fastness (ISO 105-B02)", dryGrading: "Grade 4.0 Min (Blue Wool)", wetGrading: "-" },
    ]
  }
};

export const INITIAL_BOOKING_ITEMS: BrandBookingItem[] = [];
export const INITIAL_BRAND_BOOKINGS = INITIAL_BOOKING_ITEMS;

export const INITIAL_CAPACITY_ITEMS: BrandCapacityAllocation[] = [];
export const INITIAL_BRAND_CAPACITY = INITIAL_CAPACITY_ITEMS;

export const INITIAL_COURIER_ITEMS: CourierShipment[] = [];
export const INITIAL_COURIER_SHIPMENTS = INITIAL_COURIER_ITEMS;

export const INITIAL_CAPR_RECORDS: CAPRRecord[] = [];
