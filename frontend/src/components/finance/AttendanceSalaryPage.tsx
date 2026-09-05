"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileDown,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { loadStaffAsync, deleteStaff } from "@/lib/finance/staff-storage";
import financeService from "@/../services/finance.service";

type AttendanceCode = "P" | "A" | "U" | "H" | "N";
type SalaryTab = "attendance" | "staff" | "advance";

type Employee = {
  id: string;
  name: string;
  role: string;
  fixedSalary: number;
  advance: number;
  vehicleMileage: number;
  fuelAllowance: boolean;
};

const INITIAL_EMPLOYEES: Employee[] = [];

type SalaryEntry = {
  km: number;
  salaryDate: string;
  fuelRate?: number;
  fuelCharge?: number;
};

type DeductionRecord = {
  id: string;
  date: string;
  amount: number;
};

type AdvancePayment = {
  id: string;
  employeeId: string;
  totalAmount: number;
  monthlyDeduction: number;
  balanceRemaining: number;
  date: string;
  description: string;
  deductHistory: DeductionRecord[];
};

const ATTENDANCE_CODES: AttendanceCode[] = ["P", "A", "U", "H", "N"];
const CODE_LABELS: Record<AttendanceCode, string> = {
  P: "Present",
  A: "Absent",
  U: "Unpaid Leave",
  H: "Half Day",
  N: "Non-Working / Public Holiday",
};
const CODE_COLORS: Record<AttendanceCode, string> = {
  P: "text-emerald-400 border-emerald-500/50",
  A: "text-red-400 border-red-500/50",
  U: "text-amber-400 border-amber-500/50",
  H: "text-sky-400 border-sky-500/50",
  N: "text-gray-400 border-gray-500/50",
};

const inputClass =
  "w-full rounded-lg border border-gray-800 bg-black px-2 py-1.5 text-xs text-white outline-none focus:border-teal-400/60";

const formFieldClass =
  "w-full rounded-lg border border-gray-800 bg-black px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400/60";

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isSunday(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).getDay() === 0;
}

function buildDefaultAttendance(year: number, month: number): Record<number, AttendanceCode> {
  const total = daysInMonth(year, month);
  const row: Record<number, AttendanceCode> = {};
  for (let day = 1; day <= total; day += 1) {
    row[day] = isSunday(year, month, day) ? "N" : "P";
  }
  return row;
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function monthShort(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("default", { month: "long" });
}

function formatDisplayDate(date: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function AttendanceSalaryPage() {
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6);
  const [tab, setTab] = useState<SalaryTab>("attendance");
  const [fuelRate, setFuelRate] = useState(105);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<number, AttendanceCode>>>({});
  const [salaryEntries, setSalaryEntries] = useState<Record<string, SalaryEntry>>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [printEmployeeId, setPrintEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    async function initStaff() {
      const staffList = await loadStaffAsync();
      const staff = staffList.map((s) => ({ ...s, advance: 0 }));
      setEmployees(staff);
      if (staff.length > 0) {
        setSelectedEmployeeId(staff[0].id);
        const baseAtt: Record<string, Record<number, AttendanceCode>> = {};
        const baseSal: Record<string, SalaryEntry> = {};
        staff.forEach((emp) => {
          baseAtt[emp.id] = buildDefaultAttendance(2026, 6);
          baseSal[emp.id] = { km: 0, salaryDate: "" };
        });
        setAttendance(baseAtt);
        setSalaryEntries(baseSal);
        Promise.all([
          financeService.getAttendance(2026, 6),
          financeService.getSalaries("2026-06"),
          financeService.getAdvances(),
        ]).then(([attendanceRecords, salaryRecords, advanceRecords]) => {
          const loadedAdvances: AdvancePayment[] = advanceRecords.map((record: any) => ({
            id: record.id,
            employeeId: record.staffId || record.employeeId,
            totalAmount: Number(record.amount || record.totalAmount) || 0,
            monthlyDeduction: Number(record.monthlyDeduction) || 0,
            balanceRemaining: Number(record.balanceAmount || record.balanceRemaining) || 0,
            date: record.advanceDate || record.disbursedDate || "",
            description: record.reason || record.purpose || "",
            deductHistory: Array.isArray(record.deductionHistory) ? record.deductionHistory : [],
          }));
          setAdvances(loadedAdvances);
          setEmployees((current) => current.map((employee) => ({
            ...employee,
            advance: loadedAdvances
              .filter((advance) => advance.employeeId === employee.id)
              .reduce((sum, advance) => sum + advance.balanceRemaining, 0),
          })));
          setSalaryEntries((current) => {
            const next = { ...current };
            salaryRecords.forEach((record: any) => {
              if (next[record.staffId]) {
                next[record.staffId] = {
                  km: Number(record.mileageKm) || 0,
                  fuelRate: Number(record.fuelRate) || undefined,
                  fuelCharge: Number(record.fuelCharge) || undefined,
                  salaryDate: record.paymentDate ? String(record.paymentDate).slice(0, 10) : "",
                };
              }
            });
            return next;
          });
          setAttendance((current) => {
            const next = { ...current };
            attendanceRecords.forEach((record: any) => {
              const date = new Date(record.attendanceDate);
              const employee = next[record.staffId];
              if (!employee || Number.isNaN(date.getTime())) return;
              const statusMap: Record<string, AttendanceCode> = {
                P: "P",
                Present: "P",
                A: "A",
                Absent: "A",
                U: "U",
                "Unpaid Leave": "U",
                H: "H",
                "Half Day": "H",
                N: "N",
                "Non-Working / Public Holiday": "N",
              };
              employee[date.getUTCDate()] = statusMap[record.status] || "P";
            });
            return next;
          });
        }).catch(() => {});
      }
    }
    initStaff();
  }, []);

  useEffect(() => {
    if (!mounted || employees.length === 0) return;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    setAttendance(() => {
      const next: Record<string, Record<number, AttendanceCode>> = {};
      employees.forEach((employee) => {
        next[employee.id] = buildDefaultAttendance(year, month);
      });
      return next;
    });
    setSalaryEntries(() => {
      const next: Record<string, SalaryEntry> = {};
      employees.forEach((employee) => {
        next[employee.id] = { km: 0, salaryDate: "" };
      });
      return next;
    });
    Promise.all([
      financeService.getAttendance(year, month),
      financeService.getSalaries(monthKey),
    ]).then(([attendanceRecords, salaryRecords]) => {
      setAttendance((current) => {
        const next = { ...current };
        attendanceRecords.forEach((record: any) => {
          const date = new Date(record.attendanceDate);
          const employee = next[record.staffId];
          if (!employee || Number.isNaN(date.getTime())) return;
          const statusMap: Record<string, AttendanceCode> = {
            P: "P", Present: "P", A: "A", Absent: "A", U: "U", "Unpaid Leave": "U",
            H: "H", "Half Day": "H", N: "N", "Non-Working / Public Holiday": "N",
          };
          employee[date.getUTCDate()] = statusMap[record.status] || "P";
        });
        return next;
      });
      setSalaryEntries((current) => {
        const next = { ...current };
        salaryRecords.forEach((record: any) => {
          if (next[record.staffId]) {
            next[record.staffId].salaryDate = record.paymentDate ? String(record.paymentDate).slice(0, 10) : "";
            next[record.staffId].km = Number(record.mileageKm) || next[record.staffId].km;
            next[record.staffId].fuelRate = Number(record.fuelRate) || next[record.staffId].fuelRate;
            next[record.staffId].fuelCharge = Number(record.fuelCharge) || next[record.staffId].fuelCharge;
          }
        });
        return next;
      });
    }).catch(() => {});
  }, [year, month, mounted, employees]);
  const [advances, setAdvances] = useState<AdvancePayment[]>([]);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [historyAdvanceId, setHistoryAdvanceId] = useState<string | null>(null);
  const [advanceDraft, setAdvanceDraft] = useState({
    employeeId: "",
    totalAmount: "",
    monthlyDeduction: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [staffDraft, setStaffDraft] = useState({
    name: "",
    role: "",
    fixedSalary: "",
    fuelAllowance: "No",
    vehicleMileage: "15",
  });

  const totalDays = daysInMonth(year, month);

  function resetAttendanceForPeriod(nextYear: number, nextMonth: number) {
    setAttendance((prev) => {
      const next = { ...prev };
      employees.forEach((emp) => {
        if (!next[emp.id]) next[emp.id] = buildDefaultAttendance(nextYear, nextMonth);
        else next[emp.id] = buildDefaultAttendance(nextYear, nextMonth);
      });
      return next;
    });
  }

  function shiftMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    resetAttendanceForPeriod(nextYear, nextMonth);
  }

  async function setDayCode(employeeId: string, day: number, code: AttendanceCode) {
    setAttendance((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [day]: code },
    }));
    try {
      await financeService.saveAttendance({
        id: `att-${employeeId}-${year}-${month}-${day}`,
        staffId: employeeId,
        attendanceDate: new Date(Date.UTC(year, month - 1, day)).toISOString(),
        status: code,
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save attendance.");
    }
  }

  function updateSalaryEntry(employeeId: string, patch: Partial<SalaryEntry>) {
    setSalaryEntries((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], ...patch },
    }));
  }

  const salaryRows = useMemo(() => {
    return employees.map((emp) => {
      const codes = attendance[emp.id] ?? {};
      const present = Object.values(codes).filter((c) => c === "P").length;
      const absent = Object.values(codes).filter((c) => c === "A").length;
      const unpaid = Object.values(codes).filter((c) => c === "U").length;
      const holidays = Object.values(codes).filter((c) => c === "N").length;
      const halfDay = Object.values(codes).filter((c) => c === "H").length;
      const attended = present + halfDay * 0.5;
      const pct = totalDays ? Math.round((attended / totalDays) * 100) : 0;

      const perDay = emp.fixedSalary / 30;
      const unpaidDeduction = unpaid * perDay;
      const entry = salaryEntries[emp.id] ?? { km: 0, salaryDate: "" };
      const calculatedFuelCharge =
        emp.fuelAllowance && emp.vehicleMileage > 0
          ? (entry.km / emp.vehicleMileage) * fuelRate
          : 0;
      const fuelCharge = entry.fuelCharge ?? calculatedFuelCharge;
      const total = emp.fixedSalary - unpaidDeduction + fuelCharge;
      const transferred = total - emp.advance;

      return {
        emp,
        present,
        absent,
        unpaid,
        holidays,
        halfDay,
        attended,
        pct,
        perDay,
        unpaidDeduction,
        fuelCharge,
        entry,
        total,
        transferred,
      };
    });
  }, [attendance, employees, fuelRate, salaryEntries, totalDays]);

  async function persistSalarySlip(employeeId: string) {
    const row = salaryRows.find((item) => item.emp.id === employeeId);
    if (!row) return;
    try {
      await financeService.createSalary({
        id: `slip-${employeeId}-${year}-${month}`,
        staffId: employeeId,
        salaryMonth: `${year}-${String(month).padStart(2, "0")}`,
        workingDays: totalDays,
        presentDays: row.attended,
        basicPay: row.emp.fixedSalary,
        mileageKm: row.entry.km,
        fuelRate,
        fuelCharge: row.fuelCharge,
        advanceRecovery: row.emp.advance,
        grossSalary: row.total,
        netSalary: row.transferred,
        paymentDate: row.entry.salaryDate || undefined,
        paymentStatus: row.entry.salaryDate ? "Paid" : "Pending",
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save salary slip.");
    }
  }

  const totals = useMemo(
    () =>
      salaryRows.reduce(
        (acc, row) => ({
          fixedSalary: acc.fixedSalary + row.emp.fixedSalary,
          unpaid: acc.unpaid + row.unpaidDeduction,
          fuel: acc.fuel + row.fuelCharge,
          total: acc.total + row.total,
          advance: acc.advance + row.emp.advance,
        }),
        { fixedSalary: 0, unpaid: 0, fuel: 0, total: 0, advance: 0 },
      ),
    [salaryRows],
  );

  const selectedRow = salaryRows.find((row) => row.emp.id === selectedEmployeeId) ?? salaryRows[0];

  const advanceStats = useMemo(() => {
    const totalAdvanceGiven = advances.reduce((sum, item) => sum + item.totalAmount, 0);
    const outstandingBalance = advances.reduce((sum, item) => sum + item.balanceRemaining, 0);
    const activeAdvances = advances.filter((item) => item.balanceRemaining > 0).length;
    return { totalAdvanceGiven, outstandingBalance, activeAdvances };
  }, [advances]);

  const staffWiseSummary = useMemo(() => {
    return employees.map((emp) => {
      const empAdvances = advances.filter((a) => a.employeeId === emp.id && a.balanceRemaining > 0);
      return {
        emp,
        activeCount: empAdvances.length,
        totalOutstanding: empAdvances.reduce((s, a) => s + a.balanceRemaining, 0),
        monthlyDeduction: empAdvances.reduce((s, a) => s + a.monthlyDeduction, 0),
      };
    }).filter((row) => row.activeCount > 0 || advances.some((a) => a.employeeId === row.emp.id));
  }, [advances, employees]);

  function syncEmployeeAdvances(nextAdvances: AdvancePayment[]) {
    setEmployees((prev) =>
      prev.map((emp) => {
        const balance = nextAdvances
          .filter((item) => item.employeeId === emp.id)
          .reduce((sum, item) => sum + item.balanceRemaining, 0);
        return { ...emp, advance: balance };
      }),
    );
  }

  function openAdvanceModal() {
    setAdvanceDraft({
      employeeId: "",
      totalAmount: "",
      monthlyDeduction: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
    });
    setShowAdvanceModal(true);
  }

  async function recordAdvance() {
    if (!advanceDraft.employeeId || !advanceDraft.totalAmount || !advanceDraft.monthlyDeduction) return;
    const totalAmount = Number(advanceDraft.totalAmount) || 0;
    const monthlyDeduction = Number(advanceDraft.monthlyDeduction) || 0;
    if (totalAmount <= 0 || monthlyDeduction <= 0) return;

    const advance = {
        id: `adv-${Date.now()}`,
        employeeId: advanceDraft.employeeId,
        totalAmount,
        monthlyDeduction,
        balanceRemaining: totalAmount,
        date: advanceDraft.date,
        description: advanceDraft.description.trim(),
        deductHistory: [],
    };
    try {
      await financeService.createAdvance({
        id: advance.id,
        staffId: advance.employeeId,
        amount: advance.totalAmount,
        monthlyDeduction: advance.monthlyDeduction,
        advanceDate: advance.date,
        reason: advance.description,
        balanceAmount: advance.balanceRemaining,
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save advance payment.");
      return;
    }
    const nextAdvances = [...advances, advance];
    setAdvances(nextAdvances);
    syncEmployeeAdvances(nextAdvances);
    setShowAdvanceModal(false);
  }

  async function deductAdvance(id: string) {
    const advance = advances.find((item) => item.id === id);
    if (!advance || advance.balanceRemaining <= 0) return;
    const amount = Math.min(advance.monthlyDeduction, advance.balanceRemaining);
    try {
      const updated = await financeService.updateAdvance(id, {
        amount: advance.totalAmount,
        repaidAmount: advance.totalAmount - advance.balanceRemaining + amount,
        deductionHistory: [
          ...advance.deductHistory,
          { id: `ded-${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount },
        ],
      });
      const nextAdvances = advances.map((item) => item.id === id
        ? {
            ...item,
            balanceRemaining: Number(updated.balanceAmount),
            deductHistory: Array.isArray(updated?.deductionHistory)
              ? updated.deductionHistory
              : item.deductHistory,
          }
        : item);
      setAdvances(nextAdvances);
      syncEmployeeAdvances(nextAdvances);
    } catch (error: any) {
      alert(error?.message || "Failed to save advance deduction.");
    }
  }

  async function deleteAdvance(id: string) {
    if (!window.confirm("Delete this advance record?")) return;
    try {
      await financeService.deleteAdvance(id);
    } catch (error: any) {
      alert(error?.message || "Failed to delete advance payment.");
      return;
    }
    const nextAdvances = advances.filter((a) => a.id !== id);
    setAdvances(nextAdvances);
    syncEmployeeAdvances(nextAdvances);
  }

  function openStaffModal(employee?: Employee) {
    if (employee) {
      setEditingStaffId(employee.id);
      setStaffDraft({
        name: employee.name,
        role: employee.role,
        fixedSalary: String(employee.fixedSalary),
        fuelAllowance: employee.fuelAllowance ? "Yes" : "No",
        vehicleMileage: String(employee.vehicleMileage),
      });
    } else {
      setEditingStaffId(null);
      setStaffDraft({ name: "", role: "", fixedSalary: "", fuelAllowance: "No", vehicleMileage: "15" });
    }
    setShowStaffModal(true);
  }

  async function saveStaffMember() {
    if (!staffDraft.name.trim()) return;
    const payload = {
      name: staffDraft.name.trim(),
      role: staffDraft.role.trim() || "Staff",
      fixedSalary: Number(staffDraft.fixedSalary) || 0,
      fuelAllowance: staffDraft.fuelAllowance === "Yes",
      vehicleMileage: Number(staffDraft.vehicleMileage) || 15,
    };

    if (editingStaffId) {
      try {
        await financeService.updateStaff(editingStaffId, payload);
      } catch (error: any) {
        alert(error?.message || "Failed to update staff member.");
        return;
      }
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingStaffId ? { ...emp, ...payload } : emp)),
      );
    } else {
      const id = `e${Date.now()}`;
      try {
        await financeService.createStaff({ id, ...payload });
      } catch (error: any) {
        alert(error?.message || "Failed to create staff member.");
        return;
      }
      setEmployees((prev) => [...prev, { id, advance: 0, ...payload }]);
      setAttendance((prev) => ({ ...prev, [id]: buildDefaultAttendance(year, month) }));
      setSalaryEntries((prev) => ({ ...prev, [id]: { km: 0, salaryDate: "" } }));
    }
    setShowStaffModal(false);
  }

  async function removeStaffMember(id: string) {
    if (!window.confirm("Remove this staff member?")) return;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (selectedEmployeeId === id) setSelectedEmployeeId(employees.find((e) => e.id !== id)?.id ?? "");
    await deleteStaff(id);
  }

  function exportPdf() {
    document.body.classList.remove("salary-print-single");
    document.body.classList.add("salary-print-all");
    setPrintEmployeeId(null);
    window.setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove("salary-print-all");
      }, 200);
    }, 0);
  }

  function exportEmployeeSlip(employeeId: string) {
    setPrintEmployeeId(employeeId);
    document.body.classList.remove("salary-print-all");
    document.body.classList.add("salary-print-single");
    window.setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintEmployeeId(null);
        document.body.classList.remove("salary-print-single");
      }, 200);
    }, 0);
  }

  const pillClass = (value: SalaryTab) =>
    value === tab
      ? "rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-white"
      : "rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200";

  const historyAdvance = advances.find((a) => a.id === historyAdvanceId);

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">Finance</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Attendance &amp; Salary</span>
        </>
      }
    >
      <div className={`mb-6 ${printEmployeeId ? "salary-print-single" : ""}`}>
        <div>
          <h1 className="text-3xl font-bold text-white">Salary</h1>
          <p className="mt-1 text-sm text-gray-400">Manage salaries, allowances &amp; pay slips.</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("attendance")} className={pillClass("attendance")}>
            Attendance &amp; Salary
          </button>
          <button type="button" onClick={() => setTab("staff")} className={pillClass("staff")}>
            Staff Members
          </button>
          <button type="button" onClick={() => setTab("advance")} className={pillClass("advance")}>
            Advance Payments
          </button>
        </div>
      </div>

      {tab === "attendance" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Calendar size={18} className="text-teal-400" />
                Monthly Attendance Sheet
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => shiftMonth(-1)} className="btn-outline px-2 py-1">
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[100px] text-center text-sm font-medium text-white">{monthShort(year, month)}</span>
                <button type="button" onClick={() => shiftMonth(1)} className="btn-outline px-2 py-1">
                  <ChevronRight size={16} />
                </button>
                <select
                  value={year}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setYear(y);
                    resetAttendanceForPeriod(y, month);
                  }}
                  className="rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400/60"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button type="button" onClick={exportPdf} className="btn gap-1">
                  <FileDown size={14} /> PDF
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-xs">
              {ATTENDANCE_CODES.map((code) => (
                <span key={code} className={`font-medium ${CODE_COLORS[code].split(" ")[0]}`}>
                  <strong>{code}</strong> — {CODE_LABELS[code]}
                </span>
              ))}
            </div>

            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed border-collapse text-[10px] text-gray-300">
                <colgroup>
                  <col className="w-[13%]" />
                  {Array.from({ length: totalDays }, (_, i) => <col key={i} className="w-[2.15%]" />)}
                  {Array.from({ length: 6 }, (_, i) => <col key={`summary-${i}`} className="w-[3.35%]" />)}
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-400">
                    <th className="sticky left-0 z-10 truncate bg-[#0d1414] px-1 py-2">
                      Report For: {monthShort(year, month)}
                    </th>
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
                      <th key={day} className="px-0 py-2 text-center">{day}</th>
                    ))}
                    <th className="truncate px-0 py-2 text-center" title="Attended">Att</th>
                    <th className="truncate px-0 py-2 text-center" title="Absent">Abs</th>
                    <th className="truncate px-0 py-2 text-center" title="Unpaid Leave">U</th>
                    <th className="truncate px-0 py-2 text-center" title="Holidays">Hol</th>
                    <th className="truncate px-0 py-2 text-center" title="Half Day">½</th>
                    <th className="px-0 py-2 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryRows.map((row) => (
                    <tr key={row.emp.id} className="border-b border-gray-800">
                      <td className="sticky left-0 z-10 truncate bg-[#0d1414] px-1 py-2 font-medium text-white" title={`${row.emp.name} - ${row.emp.role}`}>
                        <span className="block truncate">{row.emp.name}</span>
                        <span className="block truncate text-[8px] font-normal text-gray-500">{row.emp.role}</span>
                      </td>
                      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                        const code = attendance[row.emp.id]?.[day] ?? "P";
                        return (
                          <td key={day} className="px-0 py-1 text-center">
                            <select
                              value={code}
                              onChange={(e) => setDayCode(row.emp.id, day, e.target.value as AttendanceCode)}
                              className={`w-full min-w-0 rounded border bg-black px-0 py-1 text-[9px] font-semibold outline-none focus:border-teal-400/60 ${CODE_COLORS[code]}`}
                            >
                              {ATTENDANCE_CODES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                      <td className="truncate px-0 py-2 text-center">{row.attended}</td>
                      <td className="truncate px-0 py-2 text-center">{row.absent}</td>
                      <td className="truncate px-0 py-2 text-center">{row.unpaid}</td>
                      <td className="truncate px-0 py-2 text-center">{row.holidays}</td>
                      <td className="truncate px-0 py-2 text-center">{row.halfDay}</td>
                      <td className="truncate px-0 py-2 text-center">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Wallet size={18} className="text-teal-400" />
                Salary Details
              </h2>
              <label className="flex items-center gap-2 text-xs text-gray-400">
                Fuel rate (₹/L)
                <input
                  type="number"
                  value={fuelRate}
                  onChange={(e) => setFuelRate(Number(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-800 bg-black px-2 py-1 text-white outline-none focus:border-teal-400/60"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-400">
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Fixed Salary</th>
                    <th className="px-2 py-2">Unpaid Leave</th>
                    <th className="px-2 py-2">km</th>
                    <th className="px-2 py-2">Fuel Allowance</th>
                    <th className="px-2 py-2">Total Salary</th>
                    <th className="px-2 py-2">Salary Date</th>
                    <th className="px-2 py-2">Advance</th>
                    <th className="px-2 py-2">Per Day</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryRows.map((row) => (
                    <tr
                      key={row.emp.id}
                      onClick={() => setSelectedEmployeeId(row.emp.id)}
                      className={[
                        "cursor-pointer border-b border-gray-800 transition-colors",
                        selectedEmployeeId === row.emp.id ? "bg-teal-500/10" : "hover:bg-gray-800/40",
                      ].join(" ")}
                    >
                      <td className="px-2 py-2 font-medium text-white">{row.emp.name}</td>
                      <td className="px-2 py-2 text-gray-300">{row.emp.fixedSalary.toLocaleString()}</td>
                      <td className="px-2 py-2 text-amber-300">{row.unpaidDeduction.toFixed(0)}</td>
                      <td className="px-2 py-2">
                        {row.emp.fuelAllowance ? (
                          <input
                            type="number"
                            min={0}
                            value={row.entry.km}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateSalaryEntry(row.emp.id, { km: Number(e.target.value) || 0 })}
                            onBlur={() => persistSalarySlip(row.emp.id)}
                            className={inputClass}
                          />
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-300">{row.fuelCharge.toFixed(0)}</td>
                      <td className="px-2 py-2 font-medium text-teal-300">{row.total.toFixed(0)}</td>
                      <td className="px-2 py-2">
                        <input
                          type="date"
                          value={row.entry.salaryDate}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateSalaryEntry(row.emp.id, { salaryDate: e.target.value })}
                          onBlur={() => persistSalarySlip(row.emp.id)}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-2 py-2 text-gray-300">{row.emp.advance.toLocaleString()}</td>
                      <td className="px-2 py-2 text-gray-300">{row.perDay.toFixed(0)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-600 bg-gray-800/50 font-semibold text-white">
                    <td className="px-2 py-2">Total</td>
                    <td className="px-2 py-2">{totals.fixedSalary.toLocaleString()}</td>
                    <td className="px-2 py-2">{totals.unpaid.toFixed(0)}</td>
                    <td className="px-2 py-2">—</td>
                    <td className="px-2 py-2">{totals.fuel.toFixed(0)}</td>
                    <td className="px-2 py-2 text-teal-300">{totals.total.toFixed(0)}</td>
                    <td className="px-2 py-2">—</td>
                    <td className="px-2 py-2">{totals.advance.toLocaleString()}</td>
                    <td className="px-2 py-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {salaryRows.length > 0 ? (
            <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Banknote size={18} className="text-teal-400" />
                  Individual Salary Slips
                </h2>
                <button type="button" onClick={exportPdf} className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300">
                  <FileDown size={14} /> Download All PDF
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {salaryRows.map((row) => (
                  <div key={row.emp.id} className="rounded-xl border border-gray-800 bg-black/40 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex-1 text-center text-xl font-bold text-white">{row.emp.name}</p>
                      <button type="button" onClick={() => exportEmployeeSlip(row.emp.id)} className="no-print inline-flex shrink-0 items-center gap-1 text-xs text-teal-300 hover:text-teal-200">
                        <FileDown size={14} /> PDF
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500">{monthShort(year, month)} Salary</p>
                    <dl className="mt-6 space-y-4 text-sm">
                      <div className="flex items-center justify-between"><dt className="text-gray-400">Fixed Salary</dt><dd className="text-white">{row.emp.fixedSalary.toLocaleString()}</dd></div>
                      <div className="flex items-center justify-between"><dt className="text-gray-400">Unpaid Leave</dt><dd className="text-rose-300">-{row.unpaidDeduction.toFixed(0)}</dd></div>
                      <div className="flex items-center justify-between"><dt className="text-gray-400">Advance</dt><dd className="text-amber-300">{row.emp.advance.toLocaleString()}</dd></div>
                      <div className="flex items-center justify-between"><dt className="text-gray-400">Fuel Allowance</dt><dd className="text-emerald-300">+{row.fuelCharge.toFixed(0)}</dd></div>
                      <div className="flex items-center justify-between border-t border-gray-800 pt-4 font-bold"><dt className="text-white">Transferred Amount</dt><dd className="text-teal-400">{row.transferred.toFixed(0)}</dd></div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === "staff" ? (
        <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Staff Members</h2>
            <button type="button" onClick={() => openStaffModal()} className="btn gap-1">
              <Plus size={14} /> Add Staff
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-400">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Fuel Allowance</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-800 text-gray-300">
                    <td className="px-3 py-3 font-medium text-white">{emp.name}</td>
                    <td className="px-3 py-3">{emp.role}</td>
                    <td className="px-3 py-3">{emp.fuelAllowance ? "Yes" : "No"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openStaffModal(emp)} className="text-gray-400 hover:text-teal-400" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => removeStaffMember(emp.id)} className="text-gray-400 hover:text-red-400" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "advance" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
              <p className="text-sm text-gray-400">Total Advance Given</p>
              <p className="mt-2 text-3xl font-bold text-white">{advanceStats.totalAdvanceGiven.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
              <p className="text-sm text-gray-400">Outstanding Balance</p>
              <p className="mt-2 text-3xl font-bold text-amber-400">{advanceStats.outstandingBalance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
              <p className="text-sm text-gray-400">Active Advances</p>
              <p className="mt-2 text-3xl font-bold text-white">{advanceStats.activeAdvances}</p>
            </div>
          </div>

          <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Banknote size={18} className="text-teal-400" />
                Advance Payments
              </h2>
              <button type="button" onClick={openAdvanceModal} className="btn gap-1">
                <Plus size={14} /> New Advance
              </button>
            </div>

            {advances.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 py-16 text-center">
                <p className="text-lg font-medium text-gray-300">No advance payments</p>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Record advance payments given to staff members and track monthly deductions.
                </p>
                <button type="button" onClick={openAdvanceModal} className="btn mt-6 gap-1">
                  <Plus size={14} /> New Advance
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-400">
                      <th className="px-3 py-2">Staff Member</th>
                      <th className="px-3 py-2">Total Amount</th>
                      <th className="px-3 py-2">Monthly Deduction</th>
                      <th className="px-3 py-2">Remaining</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.map((item) => {
                      const emp = employees.find((e) => e.id === item.employeeId);
                      const isActive = item.balanceRemaining > 0;
                      const progress = item.totalAmount ? ((item.totalAmount - item.balanceRemaining) / item.totalAmount) * 100 : 100;
                      return (
                        <tr key={item.id} className="border-b border-gray-800 text-gray-300">
                          <td className="px-3 py-3 font-medium text-white">{emp?.name ?? "—"}</td>
                          <td className="px-3 py-3">{item.totalAmount.toLocaleString()}</td>
                          <td className="px-3 py-3">{item.monthlyDeduction.toLocaleString()}</td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-amber-300">{item.balanceRemaining.toLocaleString()}</div>
                            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-700">
                              <div className="h-full rounded-full bg-teal-500" style={{ width: `${progress}%` }} />
                            </div>
                          </td>
                          <td className="px-3 py-3">{formatDisplayDate(item.date)}</td>
                          <td className="px-3 py-3">{item.description || "—"}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                              <Clock size={12} />
                              {isActive ? "Active" : "Completed"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => deductAdvance(item.id)}
                                disabled={!isActive}
                                className="btn-outline px-2 py-1 text-xs disabled:opacity-40"
                              >
                                Deduct
                              </button>
                              <button
                                type="button"
                                onClick={() => setHistoryAdvanceId(item.id)}
                                className="text-gray-400 hover:text-teal-400"
                                title="Deduct history"
                              >
                                <Clock size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAdvance(item.id)}
                                className="text-gray-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-800 bg-[#0d1414] p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Staff-wise Outstanding Summary</h2>
            {staffWiseSummary.length === 0 ? (
              <p className="text-sm text-gray-500">No outstanding advances by staff.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-400">
                      <th className="px-3 py-2">Staff Member</th>
                      <th className="px-3 py-2">Active Advances</th>
                      <th className="px-3 py-2">Total Outstanding</th>
                      <th className="px-3 py-2">Monthly Deduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffWiseSummary.map((row) => (
                      <tr key={row.emp.id} className="border-b border-gray-800 text-gray-300">
                        <td className="px-3 py-3 font-medium text-white">{row.emp.name}</td>
                        <td className="px-3 py-3">{row.activeCount}</td>
                        <td className="px-3 py-3 font-medium text-amber-300">{row.totalOutstanding.toLocaleString()}</td>
                        <td className="px-3 py-3">{row.monthlyDeduction.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {showAdvanceModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowAdvanceModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Record New Advance Payment</h3>
              <button type="button" onClick={() => setShowAdvanceModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Staff Member</label>
                <select value={advanceDraft.employeeId} onChange={(e) => setAdvanceDraft((p) => ({ ...p, employeeId: e.target.value }))} className={formFieldClass}>
                  <option value="">Select staff member</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Total Advance Amount</label>
                <input type="number" min={0} placeholder="e.g. 10000" value={advanceDraft.totalAmount} onChange={(e) => setAdvanceDraft((p) => ({ ...p, totalAmount: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Monthly Deduction Amount</label>
                <input type="number" min={0} placeholder="e.g. 2000" value={advanceDraft.monthlyDeduction} onChange={(e) => setAdvanceDraft((p) => ({ ...p, monthlyDeduction: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Date</label>
                <input type="date" value={advanceDraft.date} onChange={(e) => setAdvanceDraft((p) => ({ ...p, date: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Description (optional)</label>
                <input type="text" placeholder="e.g. Emergency medical expense" value={advanceDraft.description} onChange={(e) => setAdvanceDraft((p) => ({ ...p, description: e.target.value }))} className={formFieldClass} />
              </div>
              <button type="button" onClick={recordAdvance} className="btn w-full py-2.5">Record Advance</button>
            </div>
          </div>
        </div>
      ) : null}

      {showStaffModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowStaffModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{editingStaffId ? "Edit Staff Member" : "Add Staff Member"}</h3>
              <button type="button" onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Name</label>
                <input type="text" placeholder="e.g. Hariharan" value={staffDraft.name} onChange={(e) => setStaffDraft((p) => ({ ...p, name: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Role / Department</label>
                <input type="text" placeholder="e.g. Merchandiser" value={staffDraft.role} onChange={(e) => setStaffDraft((p) => ({ ...p, role: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Fixed Salary</label>
                <input type="number" min={0} placeholder="e.g. 35000" value={staffDraft.fixedSalary} onChange={(e) => setStaffDraft((p) => ({ ...p, fixedSalary: e.target.value }))} className={formFieldClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-gray-400">Do you need to add Fuel Allowance?</label>
                <select value={staffDraft.fuelAllowance} onChange={(e) => setStaffDraft((p) => ({ ...p, fuelAllowance: e.target.value }))} className={formFieldClass}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {staffDraft.fuelAllowance === "Yes" ? (
                <div>
                  <label className="mb-1.5 block text-sm text-gray-400">Vehicle Mileage (km/L)</label>
                  <input type="number" min={1} value={staffDraft.vehicleMileage} onChange={(e) => setStaffDraft((p) => ({ ...p, vehicleMileage: e.target.value }))} className={formFieldClass} />
                </div>
              ) : null}
              <button type="button" onClick={saveStaffMember} className="btn w-full py-2.5">
                {editingStaffId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {historyAdvance ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setHistoryAdvanceId(null)}>
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Deduct History</h3>
              <button type="button" onClick={() => setHistoryAdvanceId(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {historyAdvance.deductHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No deductions recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {historyAdvance.deductHistory.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm">
                    <span className="text-gray-400">{formatDisplayDate(entry.date)}</span>
                    <span className="font-medium text-teal-300">₹{entry.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      <div className="salary-print-report" aria-hidden="true">
        <section className="salary-print-page">
          <h1>MONTHLY EMPLOYEE ATTENDANCE SHEET</h1>
          <p>Month: {monthLabel(year, month)}</p>
          <div className="salary-print-legend">
            <span>P - Present</span><span>A - Absent</span><span>U - Unpaid Leave</span><span>H - Half Day</span><span>N - Holiday</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                {Array.from({ length: totalDays }, (_, i) => <th key={i}>{i + 1}</th>)}
                <th>Attended</th>
                <th>Absent</th>
                <th>Unpaid</th>
                <th>Holiday</th>
                <th>Half</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {salaryRows.map((row) => (
                <tr key={row.emp.id}>
                  <td>{row.emp.name}</td>
                  <td>{row.emp.role}</td>
                  {Array.from({ length: totalDays }, (_, i) => <td key={i}>{attendance[row.emp.id]?.[i + 1] ?? "P"}</td>)}
                  <td>{row.attended}</td>
                  <td>{row.absent}</td>
                  <td>{row.unpaid}</td>
                  <td>{row.holidays}</td>
                  <td>{row.halfDay}</td>
                  <td>{row.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="salary-print-page">
          <h1>SALARY DETAILS</h1>
          <p>{monthLabel(year, month)}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Fixed Salary</th>
                <th>Unpaid Leave</th>
                <th>km</th>
                <th>Fuel Charge</th>
                <th>Total</th>
                <th>Salary Date</th>
                <th>Advance</th>
                <th>Per Day</th>
              </tr>
            </thead>
            <tbody>
              {salaryRows.map((row) => (
                <tr key={row.emp.id}>
                  <td>{row.emp.name}</td>
                  <td>{row.emp.fixedSalary.toLocaleString()}</td>
                  <td>{row.unpaidDeduction.toFixed(0)}</td>
                  <td>{row.entry.km}</td>
                  <td>{row.fuelCharge.toFixed(0)}</td>
                  <td><strong>{row.total.toFixed(0)}</strong></td>
                  <td>{row.entry.salaryDate || "-"}</td>
                  <td>{row.emp.advance.toLocaleString()}</td>
                  <td>{row.perDay.toFixed(0)}</td>
                </tr>
              ))}
              <tr>
                <th>TOTAL</th>
                <th>{totals.fixedSalary.toLocaleString()}</th>
                <th>{totals.unpaid.toFixed(0)}</th>
                <th>-</th>
                <th>{totals.fuel.toFixed(0)}</th>
                <th>{totals.total.toFixed(0)}</th>
                <th>-</th>
                <th>{totals.advance.toLocaleString()}</th>
                <th>-</th>
              </tr>
            </tbody>
          </table>
          <h2>MONTHLY STATISTICS</h2>
          <table className="salary-print-stats">
            <tbody>
              <tr><td>Total working days this month</td><td>{totalDays}</td></tr>
              <tr><td>Number of employees</td><td>{salaryRows.length}</td></tr>
              <tr><td>Total Attended days</td><td>{salaryRows.reduce((sum, row) => sum + row.attended, 0)}</td></tr>
              <tr><td>Absent</td><td>{salaryRows.reduce((sum, row) => sum + row.absent, 0)}</td></tr>
              <tr><td>Total Unpaid Leave days</td><td>{salaryRows.reduce((sum, row) => sum + row.unpaid, 0)}</td></tr>
              <tr><td>Total Holiday / Non-work days</td><td>{salaryRows.reduce((sum, row) => sum + row.holidays, 0)}</td></tr>
              <tr><td>Half Day</td><td>{salaryRows.reduce((sum, row) => sum + row.halfDay, 0)}</td></tr>
              <tr><td>Total Attendance Percentage</td><td>{totalDays && salaryRows.length ? Math.round((salaryRows.reduce((sum, row) => sum + row.attended, 0) / (totalDays * salaryRows.length)) * 100) : 0}%</td></tr>
            </tbody>
          </table>
        </section>

        {salaryRows.map((row) => (
          <section key={row.emp.id} className="salary-print-page salary-print-slip-page">
            <h1>INDIVIDUAL SALARY SLIP</h1>
            <p>{row.emp.name} - {monthLabel(year, month)}</p>
            <table className="salary-print-slip-table">
              <thead>
                <tr><th>Description</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Fixed Salary</td><td>{row.emp.fixedSalary.toLocaleString()}</td></tr>
                <tr><td>Unpaid Leave</td><td>-{row.unpaidDeduction.toFixed(0)}</td></tr>
                <tr><td>Advance</td><td>{row.emp.advance.toLocaleString()}</td></tr>
                <tr><td>Fuel Allowance</td><td>{row.fuelCharge.toFixed(0)}</td></tr>
                <tr><th>Transferred Amount</th><th>{row.transferred.toFixed(0)}</th></tr>
              </tbody>
            </table>
          </section>
        ))}
      </div>

      {printEmployeeId && (() => {
        const row = salaryRows.find((item) => item.emp.id === printEmployeeId);
        if (!row) return null;
        return (
          <div className="salary-print-individual" aria-hidden="true">
            <h1>INDIVIDUAL SALARY SLIP</h1>
            <p>{row.emp.name} - {monthLabel(year, month)}</p>
            <table>
              <thead>
                <tr><th>Description</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Fixed Salary</td><td>{row.emp.fixedSalary.toLocaleString()}</td></tr>
                <tr><td>Unpaid Leave</td><td>-{row.unpaidDeduction.toFixed(0)}</td></tr>
                <tr><td>Advance</td><td>{row.emp.advance.toLocaleString()}</td></tr>
                <tr><td>Fuel Allowance</td><td>{row.fuelCharge.toFixed(0)}</td></tr>
                <tr><th>Transferred Amount</th><th>{row.transferred.toFixed(0)}</th></tr>
              </tbody>
            </table>
          </div>
        );
      })()}
    </SourcingShell>
  );
}
