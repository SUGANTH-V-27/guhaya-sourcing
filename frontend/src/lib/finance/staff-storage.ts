export type StaffMember = {
  id: string;
  name: string;
  role: string;
  fixedSalary: number;
  vehicleMileage: number;
  fuelAllowance: boolean;
};

const STORAGE_KEY = "guhaya-staff";

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "e1",
    name: "Hariharan",
    role: "Merchandiser",
    fixedSalary: 30000,
    vehicleMileage: 15,
    fuelAllowance: true,
  },
  {
    id: "e2",
    name: "Santhosh",
    role: "Quality Controller",
    fixedSalary: 28000,
    vehicleMileage: 18,
    fuelAllowance: true,
  },
  {
    id: "e3",
    name: "Karthickraja",
    role: "Quality Controller",
    fixedSalary: 26000,
    vehicleMileage: 16,
    fuelAllowance: false,
  },
];

export function loadStaff(): StaffMember[] {
  if (typeof window === "undefined") return DEFAULT_STAFF;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StaffMember[]) : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStaff(staff: StaffMember[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
}

export function getMonthlySalaryTotal(): number {
  return loadStaff().reduce((sum, member) => sum + member.fixedSalary, 0);
}
