export type CommissionStatus = "unpaid" | "paid";

export type CommissionPo = {
  id: string;
  brandId: string;
  brandName: string;
  styleNo: string;
  poNo: string;
  factory: string;
  season: string;
  intake: string;
  shipmentDate: string;
  poValueUsd: number;
  quantity: number;
  commissionPct: number;
  rateInrUsd: number;
  status: CommissionStatus;
  invoice: string | null;
};

export type FactoryDetail = {
  name: string;
  address: string;
  gstin: string;
  state: string;
  code: string;
};

export type FactoryRate = {
  id: string;
  factory: string;
  commissionPct: number;
};

export const COMMISSION_BRANDS = [
  { id: "soxo", name: "SOXO" },
  { id: "sinsay", name: "Sinsay" },
] as const;

export const DEFAULT_FACTORY_RATES: FactoryRate[] = [
  { id: "fr1", factory: "M.R.S. Garments", commissionPct: 2 },
  { id: "fr2", factory: "Goodwill Exports", commissionPct: 2 },
  { id: "fr3", factory: "KRK Creationss", commissionPct: 2 },
  { id: "fr4", factory: "Sunrise Apparels", commissionPct: 2.5 },
];

export const FACTORY_DETAILS: Record<string, FactoryDetail> = {
  "Goodwill Exports": {
    name: "Goodwill Exports",
    address:
      "8/1390 L1-L6, SIDCO Industrial Estate, Thirumullaivoyal, Chennai - 600062, Tamil Nadu",
    gstin: "33ADRFS1757N1ZD",
    state: "TAMILNADU",
    code: "33",
  },
  "M.R.S. Garments": {
    name: "M.R.S. Garments",
    address: "12/45, Avinashi Road, Tiruppur - 641602, Tamil Nadu",
    gstin: "33AABCM1234A1Z5",
    state: "TAMILNADU",
    code: "33",
  },
  "KRK Creationss": {
    name: "KRK Creationss",
    address: "Plot 22, Erode Textile Park, Erode - 638001, Tamil Nadu",
    gstin: "33AAICK5678B2Z6",
    state: "TAMILNADU",
    code: "33",
  },
  "Sunrise Apparels": {
    name: "Sunrise Apparels",
    address: "SF No. 88, Karur Main Road, Namakkal - 637001, Tamil Nadu",
    gstin: "33AAFSU9012C3Z7",
    state: "TAMILNADU",
    code: "33",
  },
};

export function getFactoryDetail(factoryName: string): FactoryDetail {
  return (
    FACTORY_DETAILS[factoryName] ?? {
      name: factoryName,
      address: "",
      gstin: "",
      state: "",
      code: "",
    }
  );
}

export function buildMockCommissionPos(): CommissionPo[] {
  return [];
}

export function calcCommissionInr(poValueUsd: number, commissionPct: number, rateInrUsd: number) {
  return poValueUsd * (commissionPct / 100) * rateInrUsd;
}

export function formatInr(value: number) {
  return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsd(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
