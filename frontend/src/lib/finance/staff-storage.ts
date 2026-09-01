import financeService from "@/services/finance.service";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  fixedSalary: number;
  vehicleMileage: number;
  fuelAllowance: boolean;
};

export const DEFAULT_STAFF: StaffMember[] = [];

export function loadStaff(): StaffMember[] {
  throw new Error("Staff records must be loaded asynchronously from the database.");
}

export async function loadStaffAsync(): Promise<StaffMember[]> {
  const apiData = await financeService.getStaff();
  return apiData.map((item: any) => ({
    id: item.id,
    name: item.fullName || item.name || "Staff",
    role: item.designation || item.role || "Staff",
    fixedSalary: Number(item.baseSalary || item.fixedSalary) || 0,
    vehicleMileage: Number(item.vehicleMileage) || 15,
    fuelAllowance: Boolean(item.fuelAllowance),
  }));
}

export async function deleteStaff(id: string): Promise<boolean> {
  await financeService.deleteStaff(id);
  return true;
}

export function getMonthlySalaryTotal(): number {
  throw new Error("Staff records must be loaded asynchronously from the database.");
}
