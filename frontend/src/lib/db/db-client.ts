import { supabase, isSupabaseConfigured } from "./supabase-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const TABLE_ENDPOINT_MAP: Record<string, string> = {
  brands: "/brands",
  models: "/models",
  purchase_orders: "/orders",
  social_compliance_audits: "/audit/social",
  technical_audits: "/audit/technical",
  certifications: "/audit/certifications",
  costing_sheets: "/costing",
  invoices: "/finance/invoices",
  factory_ledger_transactions: "/finance/ledger",
  income_entries: "/finance/income",
  expense_entries: "/finance/expense",
  commission_records: "/finance/commissions",
  staff_members: "/finance/staff",
  attendance_records: "/finance/attendance",
  salary_slips: "/finance/salaries",
  advance_payments: "/finance/advances",
  company_settings: "/finance/settings",
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
 * Generic live database table manager. It uses the backend API first and a
 * configured Supabase database as an alternative live connection.
 */
export class HybridDbTable<T extends { id: string | number }> implements IDbTable<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private apiError(res: Response): Error & { apiError: true } {
    const error = new Error(`Backend request failed for ${this.tableName}: HTTP ${res.status}`) as Error & { apiError: true };
    error.apiError = true;
    return error;
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

  async getAll(): Promise<T[]> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const readEndpoint = this.tableName === "income_entries" || this.tableName === "expense_entries"
          ? "/finance/income-expenses"
          : endpoint;
        const res = await fetch(`${API_BASE_URL}${readEndpoint}`, {
          headers: this.getAuthHeaders(),
        });
        if (!res.ok) throw this.apiError(res);
        if (res.ok) {
          const json = await res.json();
          const combined = json?.data;
          const items = this.tableName === "income_entries"
            ? combined?.income
            : this.tableName === "expense_entries"
              ? combined?.expenses
              : this.tableName === "company_settings"
                ? combined ? [combined] : []
              : combined !== undefined ? combined : json;
          if (Array.isArray(items)) {
            return items as T[];
          }
        }
      } catch (err: any) {
        if (err?.apiError) throw err;
        // Try the configured live Supabase connection below.
      }
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from(this.tableName).select("*");
        if (error) throw error;
        if (data) {
          return data as T[];
        }
      } catch (err) {
        throw new Error(`Database read failed for ${this.tableName}: ${String((err as any)?.message || err)}`);
      }
    }

    throw new Error(`No live database connection is configured for ${this.tableName}.`);
  }

  async getById(id: string | number): Promise<T | null> {
    // 1. Try Backend REST API
    const endpoint = TABLE_ENDPOINT_MAP[this.tableName];
    if (endpoint) {
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
          headers: this.getAuthHeaders(),
        });
        if (!res.ok) throw this.apiError(res);
        if (res.ok) {
          const json = await res.json();
          const item = json?.data !== undefined ? json.data : json;
          if (item) return item as T;
        }
      } catch (err: any) {
        if (err?.apiError) throw err;
      }
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

    throw new Error(`No live database connection is configured for ${this.tableName}.`);
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
        if (!res.ok) throw this.apiError(res);
        if (res.ok) {
          const json = await res.json();
          const inserted = json?.data !== undefined ? json.data : json;
          if (inserted) {
            return inserted as T;
          }
        }
      } catch (err: any) {
        if (err?.apiError) throw err;
      }
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from(this.tableName)
          .insert(record as any)
          .select()
          .single();
        if (error) throw error;
        if (inserted) {
          return inserted as T;
        }
      } catch (err) {
        throw new Error(`Database insert failed for ${this.tableName}: ${String((err as any)?.message || err)}`);
      }
    }

    throw new Error(`No live database connection is configured for ${this.tableName}.`);
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
        if (!res.ok) throw this.apiError(res);
        if (res.ok) {
          const json = await res.json();
          const updated = json?.data !== undefined ? json.data : json;
          if (updated) {
            return updated as T;
          }
        }
      } catch (err: any) {
        if (err?.apiError) throw err;
      }
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
        if (error) throw error;
        if (updated) {
          return updated as T;
        }
      } catch (err) {
        throw new Error(`Database update failed for ${this.tableName}: ${String((err as any)?.message || err)}`);
      }
    }

    throw new Error(`No live database connection is configured for ${this.tableName}.`);
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
          return true;
        }
        throw this.apiError(res);
      } catch (err: any) {
        if (err?.apiError) throw err;
        throw new Error(`Database delete failed for ${this.tableName}: ${String(err?.message || err)}`);
      }
    }

    // 2. Try Supabase
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from(this.tableName).delete().eq("id", id);
        if (!error) {
          return true;
        }
        throw error;
      } catch (err) {
        throw new Error(`Database delete failed for ${this.tableName}: ${String((err as any)?.message || err)}`);
      }
    }

    throw new Error(`No live database connection is configured for ${this.tableName}.`);
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
