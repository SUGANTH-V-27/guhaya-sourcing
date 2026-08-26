import { supabase, isSupabaseConfigured } from "./supabase-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const TABLE_ENDPOINT_MAP: Record<string, string> = {
  brands: "/brands",
  models: "/models",
  purchase_orders: "/orders",
  social_compliance_audits: "/audits/social",
  technical_audits: "/audits/technical",
  certifications: "/audits/certifications",
  costing_sheets: "/costings",
  invoices: "/finance/invoices",
  factory_ledger_transactions: "/finance/ledger",
  income_entries: "/finance/income-expenses",
  expense_entries: "/finance/income-expenses",
  commission_records: "/finance/commissions",
  attendance_records: "/finance/attendance",
  salary_slips: "/finance/salaries",
  company_settings: "/finance/company-settings",
};

/**
 * Universal Database Table Client Interface
 */
export interface IDbTable<T extends { id: string | number }> {
  getAll(): Promise<T[]>;
  getById(id: string | number): Promise<T | null>;
  query(filterFn: (item: T) => boolean): Promise<T[]>;
  insert(data: Omit<T, "id"> & { id?: string | number }): Promise<T>;
  update(id: string | number, updates: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

/**
 * Generic Hybrid DB Table Manager:
 * - Uses Express REST Backend API when available
 * - Uses live Supabase when configured
 * - Uses LocalStorage / In-Memory persistence when offline
 */
export class HybridDbTable<T extends { id: string | number }> implements IDbTable<T> {
  private tableName: string;
  private storageKey: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.storageKey = `guhaya_db_${tableName}`;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("guhaya_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private getLocalData(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private setLocalData(data: T[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to write local table: ${this.tableName}`, e);
    }
  }

  async getAll(): Promise<T[]> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const items = json?.data !== undefined ? json.data : json;
          if (Array.isArray(items)) {
            this.setLocalData(items as T[]);
            return items as T[];
          }
        }
      } catch (err) {
        // Fall through to Supabase/Local
      }
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from(this.tableName).select("*");
        if (!error && data && data.length > 0) {
          this.setLocalData(data as T[]);
          return data as T[];
        }
      } catch (err) {
        console.warn(`Supabase query fallback for ${this.tableName}:`, err);
      }
    }

    // 3. Fallback to LocalStorage
    return this.getLocalData();
  }

  async getById(id: string | number): Promise<T | null> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const item = json?.data !== undefined ? json.data : json;
          if (item) return item as T;
        }
      } catch {}
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(this.tableName)
          .select("*")
          .eq("id", id)
          .single();
        if (!error && data) return data as T;
      } catch (err) {
        console.warn(`Supabase getById fallback for ${this.tableName}:`, err);
      }
    }

    // 3. Fallback to LocalStorage
    const items = this.getLocalData();
    return items.find((item) => String(item.id) === String(id)) || null;
  }

  async query(filterFn: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll();
    return all.filter(filterFn);
  }

  async insert(data: Omit<T, "id"> & { id?: string | number }): Promise<T> {
    const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record = { ...data, id } as T;

    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(record),
        });
        if (res.ok) {
          const json = await res.json();
          const inserted = json?.data !== undefined ? json.data : json;
          if (inserted) {
            const items = this.getLocalData();
            this.setLocalData([inserted, ...items]);
            return inserted as T;
          }
        }
      } catch {}
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from(this.tableName)
          .insert(record as any)
          .select()
          .single();
        if (!error && inserted) {
          const items = this.getLocalData();
          this.setLocalData([inserted as T, ...items]);
          return inserted as T;
        }
      } catch (err) {
        console.warn(`Supabase insert fallback for ${this.tableName}:`, err);
      }
    }

    // 3. Fallback to LocalStorage
    const items = this.getLocalData();
    const updated = [record, ...items];
    this.setLocalData(updated);
    return record;
  }

  async update(id: string | number, updates: Partial<T>): Promise<T | null> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const json = await res.json();
          const updated = json?.data !== undefined ? json.data : json;
          if (updated) {
            const items = this.getLocalData();
            const nextItems = items.map((item) => (String(item.id) === String(id) ? updated : item));
            this.setLocalData(nextItems);
            return updated as T;
          }
        }
      } catch {}
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data: updated, error } = await supabase
          .from(this.tableName)
          .update(updates as any)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) {
          const items = this.getLocalData();
          const nextItems = items.map((item) => (String(item.id) === String(id) ? (updated as T) : item));
          this.setLocalData(nextItems);
          return updated as T;
        }
      } catch (err) {
        console.warn(`Supabase update fallback for ${this.tableName}:`, err);
      }
    }

    // 3. Fallback to LocalStorage
    const items = this.getLocalData();
    let found: T | null = null;
    const nextItems = items.map((item) => {
      if (String(item.id) === String(id)) {
        found = { ...item, ...updates };
        return found;
      }
      return item;
    });

    if (found) {
      this.setLocalData(nextItems);
    }
    return found;
  }

  async delete(id: string | number): Promise<boolean> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const items = this.getLocalData();
          const filtered = items.filter((item) => String(item.id) !== String(id));
          this.setLocalData(filtered);
          return true;
        }
      } catch {}
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from(this.tableName).delete().eq("id", id);
        if (!error) {
          const items = this.getLocalData();
          const filtered = items.filter((item) => String(item.id) !== String(id));
          this.setLocalData(filtered);
          return true;
        }
      } catch (err) {
        console.warn(`Supabase delete fallback for ${this.tableName}:`, err);
      }
    }

    // 3. Fallback to LocalStorage
    const items = this.getLocalData();
    const filtered = items.filter((item) => String(item.id) !== String(id));
    this.setLocalData(filtered);
    return true;
  }
}

/**
 * Universal Database Tables Registry
 */
export const db = {
  brands: new HybridDbTable<any>("brands"),
  factories: new HybridDbTable<any>("factories"),
  models: new HybridDbTable<any>("models"),
  purchaseOrders: new HybridDbTable<any>("purchase_orders"),
  poItems: new HybridDbTable<any>("po_items"),
  tnaPlans: new HybridDbTable<any>("tna_plans"),
  trimmingBoms: new HybridDbTable<any>("trimming_boms"),
  qcInspections: new HybridDbTable<any>("qc_inspections"),
  brandSummaries: new HybridDbTable<any>("brand_summaries"),
  testingStandards: new HybridDbTable<any>("testing_standards"),
  bookingTrackers: new HybridDbTable<any>("booking_trackers"),
  factoryCapacities: new HybridDbTable<any>("factory_capacities"),
  courierShipments: new HybridDbTable<any>("courier_shipments"),
  caprIssues: new HybridDbTable<any>("capr_issues"),
  socialComplianceAudits: new HybridDbTable<any>("social_compliance_audits"),
  technicalAudits: new HybridDbTable<any>("technical_audits"),
  certifications: new HybridDbTable<any>("certifications"),
  costingSheets: new HybridDbTable<any>("costing_sheets"),
  companySettings: new HybridDbTable<any>("company_settings"),
  invoices: new HybridDbTable<any>("invoices"),
  factoryLedgers: new HybridDbTable<any>("factory_ledger_transactions"),
  monthlyLedgers: new HybridDbTable<any>("monthly_ledgers"),
  incomeEntries: new HybridDbTable<any>("income_entries"),
  expenseEntries: new HybridDbTable<any>("expense_entries"),
  commissionRecords: new HybridDbTable<any>("commission_records"),
  staffMembers: new HybridDbTable<any>("staff_members"),
  attendanceRecords: new HybridDbTable<any>("attendance_records"),
  salarySlips: new HybridDbTable<any>("salary_slips"),
  advancePayments: new HybridDbTable<any>("advance_payments"),
};
