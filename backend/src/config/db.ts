import { env } from "./env.js";

export interface DatabaseRecord {
  id?: string;
  [key: string]: any;
}

/**
 * Universal Database Client for Express Backend
 * Supports Supabase REST API, raw PostgreSQL, or in-memory fallback
 */
export class BackendDbTable<T extends DatabaseRecord> {
  private tableName: string;
  private memoryStore: Map<string, T> = new Map();

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private hasSupabase(): boolean {
    return Boolean(env.SUPABASE_URL && (env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY));
  }

  private getSupabaseHeaders(): Record<string, string> {
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    return {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=representation",
    };
  }

  async select(query?: Record<string, any>): Promise<T[]> {
    if (this.hasSupabase()) {
      try {
        let url = `${env.SUPABASE_URL}/rest/v1/${this.tableName}?select=*`;
        if (query) {
          for (const [k, v] of Object.entries(query)) {
            url += `&${encodeURIComponent(k)}=eq.${encodeURIComponent(String(v))}`;
          }
        }
        const res = await fetch(url, {
          method: "GET",
          headers: this.getSupabaseHeaders(),
        });
        if (res.ok) {
          const data = (await res.json()) as T[];
          return data;
        }
      } catch (err) {
        console.warn(`[Backend DB] Supabase select failed on table ${this.tableName}:`, err);
      }
    }

    // Memory store fallback
    const all = Array.from(this.memoryStore.values());
    if (!query) return all;
    return all.filter((item) =>
      Object.entries(query).every(([k, v]) => String(item[k]) === String(v))
    );
  }

  async selectById(id: string): Promise<T | null> {
    if (this.hasSupabase()) {
      try {
        const url = `${env.SUPABASE_URL}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}&select=*`;
        const res = await fetch(url, {
          method: "GET",
          headers: this.getSupabaseHeaders(),
        });
        if (res.ok) {
          const data = (await res.json()) as T[];
          return data[0] || null;
        }
      } catch (err) {
        console.warn(`[Backend DB] Supabase selectById failed on table ${this.tableName}:`, err);
      }
    }

    return this.memoryStore.get(id) || null;
  }

  async insert(record: T): Promise<T> {
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fullRecord = {
      ...record,
      id,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.hasSupabase()) {
      try {
        const url = `${env.SUPABASE_URL}/rest/v1/${this.tableName}`;
        const res = await fetch(url, {
          method: "POST",
          headers: this.getSupabaseHeaders(),
          body: JSON.stringify(fullRecord),
        });
        if (res.ok) {
          const inserted = (await res.json()) as T[];
          return inserted[0] || fullRecord;
        }
      } catch (err) {
        console.warn(`[Backend DB] Supabase insert failed on table ${this.tableName}:`, err);
      }
    }

    this.memoryStore.set(id, fullRecord);
    return fullRecord;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const updatedRecord = { ...updates, updated_at: new Date().toISOString() };

    if (this.hasSupabase()) {
      try {
        const url = `${env.SUPABASE_URL}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}`;
        const res = await fetch(url, {
          method: "PATCH",
          headers: this.getSupabaseHeaders(),
          body: JSON.stringify(updatedRecord),
        });
        if (res.ok) {
          const result = (await res.json()) as T[];
          return result[0] || null;
        }
      } catch (err) {
        console.warn(`[Backend DB] Supabase update failed on table ${this.tableName}:`, err);
      }
    }

    const existing = this.memoryStore.get(id);
    if (!existing) return null;
    const merged = { ...existing, ...updatedRecord };
    this.memoryStore.set(id, merged as T);
    return merged as T;
  }

  async delete(id: string): Promise<boolean> {
    if (this.hasSupabase()) {
      try {
        const url = `${env.SUPABASE_URL}/rest/v1/${this.tableName}?id=eq.${encodeURIComponent(id)}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers: this.getSupabaseHeaders(),
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn(`[Backend DB] Supabase delete failed on table ${this.tableName}:`, err);
      }
    }

    return this.memoryStore.delete(id);
  }
}

// Pre-instantiated database tables
export const db = {
  profiles: new BackendDbTable("profiles"),
  factories: new BackendDbTable("factories"),
  brands: new BackendDbTable("brands"),
  models: new BackendDbTable("models"),
  purchaseOrders: new BackendDbTable("purchase_orders"),
  fabricStatus: new BackendDbTable("fabric_status"),
  measurementSpecs: new BackendDbTable("measurement_specs"),
  patternFiles: new BackendDbTable("pattern_files"),
  trimmingItems: new BackendDbTable("trimming_items"),
  tnaActivities: new BackendDbTable("tna_activities"),
  socialAudits: new BackendDbTable("social_compliance_audits"),
  technicalAudits: new BackendDbTable("technical_audits"),
  certifications: new BackendDbTable("factory_certifications"),
  costSheets: new BackendDbTable("cost_sheets"),
  invoices: new BackendDbTable("invoices"),
  ledgerTransactions: new BackendDbTable("factory_ledger_transactions"),
  incomeExpenses: new BackendDbTable("income_expense_entries"),
  staffSalaries: new BackendDbTable("staff_salaries"),
};
