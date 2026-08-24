import { supabase, isSupabaseConfigured } from "./supabase-client";

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
 * - Uses live Supabase when configured
 * - Uses LocalStorage / In-Memory persistence when in development / offline
 */
export class HybridDbTable<T extends { id: string | number }> implements IDbTable<T> {
  private tableName: string;
  private storageKey: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.storageKey = `guhaya_db_${tableName}`;
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from(this.tableName).select("*");
        if (!error && data) return data as T[];
      } catch (err) {
        console.warn(`Supabase query fallback for ${this.tableName}:`, err);
      }
    }
    return this.getLocalData();
  }

  async getById(id: string | number): Promise<T | null> {
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

    if (isSupabaseConfigured) {
      try {
        const { data: inserted, error } = await supabase
          .from(this.tableName)
          .insert(record as any)
          .select()
          .single();
        if (!error && inserted) return inserted as T;
      } catch (err) {
        console.warn(`Supabase insert fallback for ${this.tableName}:`, err);
      }
    }

    const items = this.getLocalData();
    const updated = [record, ...items];
    this.setLocalData(updated);
    return record;
  }

  async update(id: string | number, updates: Partial<T>): Promise<T | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: updated, error } = await supabase
          .from(this.tableName)
          .update(updates as any)
          .eq("id", id)
          .select()
          .single();
        if (!error && updated) return updated as T;
      } catch (err) {
        console.warn(`Supabase update fallback for ${this.tableName}:`, err);
      }
    }

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
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from(this.tableName).delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.warn(`Supabase delete fallback for ${this.tableName}:`, err);
      }
    }

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
