export type CompanySettings = {
  companyName: string;
  address: string;
  gstin: string;
  phone: string;
  state: string;
  code: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
};

const STORAGE_KEY = "guhaya-company-settings";

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: "GUHAYA SOURCE",
  address: "",
  gstin: "33ADRFS1757N1ZD",
  phone: "+91 9524085565",
  state: "TAMILNADU",
  code: "33",
  bankName: "State Bank of India",
  accountNumber: "1234567890",
  ifscCode: "SBIN0001234",
  branch: "Main Branch",
};

export function loadCompanySettings(): CompanySettings {
  if (typeof window === "undefined") return DEFAULT_COMPANY_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_COMPANY_SETTINGS, ...(JSON.parse(raw) as CompanySettings) } : DEFAULT_COMPANY_SETTINGS;
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: CompanySettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
