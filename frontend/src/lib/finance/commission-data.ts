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

export const COMMISSION_BRANDS: { id: string; name: string }[] = [];

export const DEFAULT_FACTORY_RATES: FactoryRate[] = [];

export const FACTORY_DETAILS: Record<string, FactoryDetail> = {};

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
