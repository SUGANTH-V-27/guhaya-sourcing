import { db } from "../db/db-client";
import financeService from "@/services/finance.service";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  fixedSalary: number;
  vehicleMileage: number;
  fuelAllowance: boolean;
};

const STORAGE_KEY = "guhaya-staff";

export const DEFAULT_STAFF: StaffMember[] = [];

export function loadStaff(): StaffMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StaffMember[]) : [];
  } catch {
    return [];
  }
}

export async function loadStaffAsync(): Promise<StaffMember[]> {
  try {
    const apiData = await financeService.getStaff();
    if (apiData && apiData.length > 0) {
      const mapped: StaffMember[] = apiData.map((item: any) => ({
        id: item.id,
        name: item.fullName || item.name || "Staff",
        role: item.designation || item.role || "Staff",
        fixedSalary: Number(item.baseSalary || item.fixedSalary) || 0,
        vehicleMileage: Number(item.vehicleMileage) || 15,
        fuelAllowance: Boolean(item.fuelAllowance),
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch {
    // Fall back to db client
    try {
      const dbData = await db.staffMembers.getAll();
      if (dbData && dbData.length > 0) {
        const mapped: StaffMember[] = dbData.map((item: any) => ({
          id: item.id,
          name: item.fullName || item.name || "Staff",
          role: item.designation || item.role || "Staff",
          fixedSalary: Number(item.baseSalary || item.fixedSalary) || 0,
          vehicleMileage: Number(item.vehicleMileage) || 15,
          fuelAllowance: Boolean(item.fuelAllowance),
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        }
        return mapped;
      }
    } catch {}
  }
  return loadStaff();
}

export function saveStaff(staff: StaffMember[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  // Sync to database
  staff.forEach((member) => {
    db.staffMembers.insert({
      id: member.id,
      fullName: member.name,
      designation: member.role,
      baseSalary: member.fixedSalary,
    }).catch(() => {});
  });
}

export async function deleteStaff(id: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    const current = loadStaff().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  try {
    await financeService.deleteStaff(id);
  } catch {}
  try {
    await db.staffMembers.delete(id);
  } catch {}
  return true;
}

export function getMonthlySalaryTotal(): number {
  return loadStaff().reduce((sum, member) => sum + member.fixedSalary, 0);
}
