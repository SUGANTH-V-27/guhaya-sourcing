import { db } from "../db/db-client";

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

export function getMonthlySalaryTotal(): number {
  return loadStaff().reduce((sum, member) => sum + member.fixedSalary, 0);
}
