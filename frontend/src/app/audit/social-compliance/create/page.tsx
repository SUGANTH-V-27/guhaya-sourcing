"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Save,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { saveOrUpdateSocialAudit, type SocialComplianceAudit } from "@/lib/audit/social-compliance-data";

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST DATA — all 11 sections with every item
// ─────────────────────────────────────────────────────────────────────────────
type ChecklistItem = {
  id: string;
  point: string;
  description: string;
  subCategory?: string;
};

type ChecklistSection = {
  no: number;
  name: string;
  maxScore: number;
  items: ChecklistItem[];
};

type Rating = "none" | "Red" | "Orange" | "Light-Green" | "Green" | "N/A";

const RATING_OPTIONS: Rating[] = ["none", "Red", "Orange", "Light-Green", "Green", "N/A"];

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    no: 1, name: "Employment Contracts", maxScore: 9,
    items: [
      { id: "1-1", point: "Worker Identification Details", description: "ID cards with Full Name, Address, DOB, Employee Code" },
      { id: "1-2", point: "Job Position & Work Location", description: "Designation, Department, Duties" },
      { id: "1-3", point: "Wages & Benefits", description: "Basic Salary, allowance, overtime, payment method, bonus, leave benefits." },
      { id: "1-4", point: "Working Hours", description: "Normal working Hours, Shift timing, weekly off day." },
      { id: "1-5", point: "Employment Terms", description: "Appointment Letter" },
      { id: "1-6", point: "Signature & Legal Acceptance", description: "Signed by Management & workers. Should be in local language of worker as well." },
    ],
  },
  {
    no: 2, name: "Child Labour / Young Worker", maxScore: 10.5,
    items: [
      { id: "2-1", point: "Age Verification Documents", description: "Valid Age proof for all workers" },
      { id: "2-2", point: "No Child Labour Employed", description: "Below 15 Years" },
      { id: "2-3", point: "Young Worker Identification", description: "Between 15 to 18 Years" },
      { id: "2-4", point: "Restricted Work for Young Workers", description: "Not assigned Hazardous jobs, heavy lifting, chemicals, night work." },
      { id: "2-5", point: "Working Hours Compliance", description: "Follow young worker working time and break time." },
      { id: "2-6", point: "Remediation Procedures", description: "Child Labour Policy" },
      { id: "2-7", point: "Policy, Training & Awareness", description: "Child Labour Policy" },
    ],
  },
  {
    no: 3, name: "Freedom of Association", maxScore: 9,
    items: [
      { id: "3-1", point: "Worker Welfare Committee", description: "Worker representatives discuss canteen, toilets, transport, welfare, facilities." },
      { id: "3-2", point: "Worker Representative Committee", description: "Elected worker reps raise concerns on wages, treatment, working conditions." },
      { id: "3-3", point: "Grievance Committee", description: "Handles worker complaints confidentially." },
      { id: "3-4", point: "Health & Safety Committee", description: "Worker participation in safety issues, accidents, PPE, emergency matters." },
      { id: "3-5", point: "POSH / Internal Complaints Committee", description: "For sexual harassment complaints under workplace law." },
      { id: "3-6", point: "Trade Union / Union Representatives", description: "Formal worker association recognized by law." },
    ],
  },
  {
    no: 4, name: "Health & Safety", maxScore: 43.5,
    items: [
      { id: "4-1", point: "Health & safety policy displayed", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-2", point: "Responsible safety committee / officer appointed", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-3", point: "Regular safety meetings conducted", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-4", point: "Risk assessment completed and updated", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-5", point: "Incident / accident reporting system", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-6", point: "First aiders trained and available", description: "", subCategory: "GENERAL MANAGEMENT" },
      { id: "4-7", point: "Valid fire license / approvals", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-8", point: "Fire detection / alarm system working", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-9", point: "Fire extinguishers available and serviced", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-10", point: "Emergency exits unlocked during work hours", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-11", point: "Exit routes clear and marked", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-12", point: "Evacuation maps displayed", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-13", point: "Fire drills conducted regularly", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-14", point: "Workers trained on fire emergency response", description: "", subCategory: "FIRE SAFETY" },
      { id: "4-15", point: "Building structurally safe", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-16", point: "Good housekeeping / clean workplace", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-17", point: "Safe walkways and aisles", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-18", point: "Adequate lighting", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-19", point: "Adequate ventilation / temperature control", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-20", point: "Drinking water available and hygienic", description: "", subCategory: "BUILDING & WORKPLACE SAFETY" },
      { id: "4-21", point: "Machine guards installed and used", description: "", subCategory: "MACHINERY & ELECTRICAL SAFETY" },
      { id: "4-22", point: "Lockout / repair safety controls", description: "", subCategory: "MACHINERY & ELECTRICAL SAFETY" },
      { id: "4-23", point: "Electrical panels covered and labelled", description: "", subCategory: "MACHINERY & ELECTRICAL SAFETY" },
      { id: "4-24", point: "No exposed wires / overloaded sockets", description: "", subCategory: "MACHINERY & ELECTRICAL SAFETY" },
      { id: "4-25", point: "Generators / compressors safely maintained", description: "", subCategory: "MACHINERY & ELECTRICAL SAFETY" },
      { id: "4-26", point: "Required PPE provided and used", description: "", subCategory: "PPE & CHEMICAL SAFETY" },
      { id: "4-27", point: "Chemicals labelled and stored safely", description: "", subCategory: "PPE & CHEMICAL SAFETY" },
      { id: "4-28", point: "MSDS / SDS available and training given", description: "", subCategory: "PPE & CHEMICAL SAFETY" },
      { id: "4-29", point: "Toilets clean, enough, and accessible / medical room if required", description: "", subCategory: "WELFARE & MEDICAL" },
    ],
  },
  {
    no: 5, name: "Working Hours", maxScore: 6,
    items: [
      { id: "5-1", point: "Regular Working Hours Compliance", description: "Daily and weekly working hours follow legal limits and contract terms." },
      { id: "5-2", point: "Overtime Control", description: "Overtime is voluntary, within legal limits, properly recorded, and paid at the correct premium rate." },
      { id: "5-3", point: "Rest Days & Breaks", description: "Workers receive weekly rest day(s), meal breaks, and legally required rest intervals." },
      { id: "5-4", point: "Time Record Accuracy", description: "Attendance records, swipe data, manual registers, and payroll match actual hours worked." },
    ],
  },
  {
    no: 6, name: "Wages and Compensation", maxScore: 16.5,
    items: [
      { id: "6-1", point: "Minimum Wage Compliance", description: "Workers receive at least the legal minimum wage or agreed industry wage." },
      { id: "6-2", point: "Timely Payment of Wages", description: "Salaries are paid within the legal deadline each wage period." },
      { id: "6-3", point: "Correct Overtime Premium", description: "Overtime is paid at the required higher rate under law." },
      { id: "6-4", point: "Accurate Wage Calculation", description: "Basic wage, allowances, incentives, leave pay, and net wages are correctly calculated." },
      { id: "6-5", point: "Attendance vs Payroll Consistency", description: "Attendance records match payroll hours and days paid." },
      { id: "6-6", point: "No Illegal Deductions", description: "No unauthorized fines, deposits, or unlawful deductions." },
      { id: "6-7", point: "Statutory Benefits Provided", description: "Required benefits such as PF, FSI, insurance, paid leave, bonus, gratuity (as applicable in India)." },
      { id: "6-8", point: "Payslips Issued Clearly", description: "Workers receive understandable payslips showing earnings and deductions." },
      { id: "6-9", point: "Leave Wages / Holiday Pay", description: "Paid leave, national holiday wages, maternity or other legal leave benefits are properly paid." },
      { id: "6-10", point: "Equal Pay for Equal Work", description: "No discrimination in wages based on gender or other protected status." },
      { id: "6-11", point: "Final Settlement / Exit Payments", description: "Resigned or terminated workers receive dues on time and correctly." },
    ],
  },
  {
    no: 7, name: "Discrimination & Harassment", maxScore: 12,
    items: [
      { id: "7-1", point: "Equal Employment Opportunity", description: "Hiring, promotion, training, and benefits are based on skills/performance, not personal characteristics." },
      { id: "7-2", point: "No Discrimination", description: "No unfair treatment based on gender, age, religion, caste, ethnicity, nationality, disability, marital status, pregnancy, etc." },
      { id: "7-3", point: "No Sexual Harassment", description: "Workplace has zero tolerance for sexual harassment, unwanted behavior, or inappropriate comments." },
      { id: "7-4", point: "No Physical or Verbal Abuse", description: "No shouting, insults, threats, humiliation, corporal punishment, or intimidation by supervisors or others." },
      { id: "7-5", point: "Anti-Harassment Policy", description: "Clear policy displayed and communicated to workers in understandable language." },
      { id: "7-6", point: "Complaint / Grievance Mechanism", description: "Workers can report issues confidentially without fear of retaliation." },
      { id: "7-7", point: "Training & Awareness", description: "Managers, supervisors, and workers receive training on respectful behavior and complaint procedures." },
      { id: "7-8", point: "Investigation & Corrective Action", description: "Complaints are documented, investigated fairly, and corrective action is taken." },
    ],
  },
  {
    no: 8, name: "Disciplinary Practices", maxScore: 7.5,
    items: [
      { id: "8-1", point: "No Physical Punishment or Abuse", description: "Workers must not face corporal punishment, threats, intimidation, verbal abuse, or humiliation." },
      { id: "8-2", point: "Fair and Written Disciplinary Procedure", description: "Factory has a clear disciplinary policy explaining misconduct, warning steps, investigation process, and actions." },
      { id: "8-3", point: "Progressive Discipline System", description: "Corrective steps such as verbal warning, written warning, and final warning are applied fairly and consistently." },
      { id: "8-4", point: "No Illegal Fines or Wage Deductions", description: "Penalties must not include unauthorized salary deductions, forced deposits, or unlawful fines." },
      { id: "8-5", point: "Right to Explain / Appeal", description: "Worker gets a chance to explain, sign records, and appeal decisions without retaliation." },
    ],
  },
  {
    no: 9, name: "Forced Labour", maxScore: 9,
    items: [
      { id: "9-1", point: "Voluntary Employment", description: "All workers join and continue employment voluntarily, with freedom to resign according to legal notice terms." },
      { id: "9-2", point: "No Retention of Original Documents", description: "Factory does not keep workers' passports, IDs, bank cards, certificates, or personal documents." },
      { id: "9-3", point: "No Deposits / Recruitment Fees", description: "Workers are not charged hiring fees, security deposits, or unlawful recruitment costs." },
      { id: "9-4", point: "Freedom of Movement", description: "Workers can move freely during breaks and after shifts; exits are not locked to prevent leaving." },
      { id: "9-5", point: "No Coercion or Threats", description: "No threats, violence, debt bondage, intimidation, withholding wages, or punishment to force work." },
      { id: "9-6", point: "Fair Contracts & Wage Payment", description: "Contracts are clear and understood by workers; wages are paid on time without unlawful withholding." },
    ],
  },
  {
    no: 10, name: "Environment", maxScore: 19.5,
    items: [
      { id: "10-1", point: "Environmental Policy", description: "Written commitment to pollution prevention and legal compliance." },
      { id: "10-2", point: "Legal Register & Compliance Monitoring", description: "System to identify and track applicable environmental laws." },
      { id: "10-3", point: "Valid Licenses / Permits", description: "Required environmental consents, registrations, and approvals are current." },
      { id: "10-4", point: "Waste Segregation at Source", description: "Different waste types separated properly in all areas." },
      { id: "10-5", point: "Solid Waste Disposal", description: "General and recyclable waste disposed through approved channels." },
      { id: "10-6", point: "Hazardous Waste Management", description: "Used oil, chemical waste, sludge, batteries, bulbs, contaminated containers handled legally." },
      { id: "10-7", point: "Wastewater / Sewage Control", description: "Effluent or sewage treated and discharged as per standards." },
      { id: "10-8", point: "Air Emission Control", description: "Boiler, generator, chimney emissions monitored and controlled." },
      { id: "10-9", point: "Chemical Storage & Secondary Containment", description: "Chemicals labeled, stored safely, with spit trays/bunding." },
      { id: "10-10", point: "Spill Response Preparedness", description: "Spill kits available and emergency procedures in place." },
      { id: "10-11", point: "Water Conservation", description: "Water consumption monitored with reduction initiatives." },
      { id: "10-12", point: "Energy Management", description: "Electricity/fuel tracked with energy-saving programs." },
      { id: "10-13", point: "Training & Awareness", description: "Employees trained on waste handling and environmental practices." },
      { id: "10-14", point: "Records, Targets & Continuous Improvement", description: "Disposal records, test reports, utility trends, improvement actions maintained." },
    ],
  },
  {
    no: 11, name: "Management System", maxScore: 13.5,
    items: [
      { id: "11-1", point: "Policies & Commitment", description: "Management has written policies on labor rights, ethics, health & safety, environment, and legal compliance." },
      { id: "11-2", point: "Roles & Responsibilities", description: "Clear responsibility assigned to HR, compliance, safety, production, and department heads." },
      { id: "11-3", point: "Legal Compliance Process", description: "System to identify, track, and update applicable laws, licenses, and statutory requirements." },
      { id: "11-4", point: "Risk Assessment & Planning", description: "Factory identifies risks (labor, safety, environment, operations) and prepares action plans." },
      { id: "11-5", point: "Training & Communication", description: "Management, supervisors, and workers receive training on policies and procedures." },
      { id: "11-6", point: "Internal Monitoring / Audits", description: "Regular internal audits, inspections, and management reviews are conducted." },
      { id: "11-7", point: "Corrective Action System", description: "Non-compliances are recorded, root causes identified, actions assigned, and closure verified." },
      { id: "11-8", point: "Worker Participation & Grievance Mechanism", description: "Worker committees, suggestion channels, complaint handling, and communication meetings exist." },
      { id: "11-9", point: "Records & Continuous Improvement", description: "Accurate records maintained and targets set for ongoing improvement." },
    ],
  },
];

// Points per rating
const RATING_POINTS: Record<Rating, number> = {
  "Green": 1.5,
  "Light-Green": 1.0,
  "Orange": 0.5,
  "Red": 0,
  "N/A": 0,
  "none": 0,
};

const RATING_CIRCLE: Record<Rating, string> = {
  "none": "border-2 border-gray-600 bg-transparent",
  "Red": "bg-red-500 border-2 border-red-500",
  "Orange": "bg-orange-500 border-2 border-orange-500",
  "Light-Green": "bg-emerald-400 border-2 border-emerald-400",
  "Green": "bg-emerald-600 border-2 border-emerald-600",
  "N/A": "bg-gray-600 border-2 border-gray-600",
};

const BRANDS = ["Sinsay", "Reserved", "Mohito", "Cropp", "House", "SOXO"];

type TabId = "info" | "checklist" | "rating" | "sir" | "images" | "critical";

const CRITICAL_POINTS = [
  "Un-Authorized Sub-Contracting",
  "Locked or Blocked Exits and Emergency Exits",
  "Undocumented Workers",
  "Metal Free Zone Regulations",
  "Sharp Tools Procedure",
  "Needle Control Procedure",
  "No evidence identified that child Labour was employed at the factory?",
  "No evidence identified that young workers were engaged in hazardous work?",
  "Does the facility have policy regarding underage visitors to the factory and prohibit them from entering the factory premises?",
  "Check the maximum working hours of individual worker per day/week/month. Does it meet international and local legal requirements?",
  "Are workers allowed adequate meal breaks and personal breaks?",
  "Are the employees allowed one day off in seven and do they have at least one day (24 consecutive hours) in seven days? Mention the maximum consecutive days that employees work.",
  "Do all workers\u2019 wages meet local minimum wages? (including trainees / apprentices / workers in probation period).",
  "Are fair and legal rates paid for overtime?",
  "No workers\u2019 wages deductions for any reason other than tax, social security fair, reasonable and legal?",
  "No evidence is identified on discrimination in hiring, promotion, compensation, welfare, dismissal, retirement, etc. based on gender, age, pregnancy, marital status, race, religion, disability, union membership, political affiliation, etc.",
  "No evidence identified on the use of forced Labour / prison Labour? No use of force observed, including forced overtime work, termination?",
];

type CpStatus = "compliant" | "non-compliant" | "na";


type SIRFinding = {
  id: string;
  no: string;
  section: string;
  issue: string;
  severity: "Critical" | "Major" | "Minor";
  action: string;
  responsible: string;
  timeline: string;
  status: "Open" | "In Progress" | "Resolved";
};

type FactoryImage = {
  label: string;
  dataUrl: string | null;
};

export default function CreateSocialCompliancePage() {
  const router = useRouter();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("info");

  // ── Audit Info form ────────────────────────────────────────────────────────
  const [brand, setBrand] = useState("Sinsay");
  const [factoryName, setFactoryName] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ── SIR Findings ──────────────────────────────────────────────────────────
  const [sirFindings, setSirFindings] = useState<SIRFinding[]>([]);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [fSection, setFSection] = useState("");
  const [fIssue, setFIssue] = useState("");
  const [fSeverity, setFSeverity] = useState<SIRFinding["severity"]>("Major");
  const [fAction, setFAction] = useState("");
  const [fResponsible, setFResponsible] = useState("");
  const [fTimeline, setFTimeline] = useState("");
  const [execSummary, setExecSummary] = useState("");
  const [goodPractices, setGoodPractices] = useState("");
  const [criticalIssues, setCriticalIssues] = useState("");

  // ── Critical Points ratings ──────────────────────────────────────────────────
  const [cpRatings, setCpRatings] = useState<Record<number, CpStatus>>(() => {
    const init: Record<number, CpStatus> = {};
    CRITICAL_POINTS.forEach((_, i) => { init[i] = "compliant"; });
    return init;
  });
  const [overallRemarks, setOverallRemarks] = useState("");


  // ── Factory Images ────────────────────────────────────────────────────────
  const IMAGE_SLOTS = [
    "Factory Name Board", "Factory Front View", "Fabric Storage Section", "Cutting Section",
    "Sewing Section", "Checking Section", "Ironing Section", "Packing Section",
    "Metal Detector", "Metal Free Zone", "Compressor", "Sample",
  ];
  const [factoryImages, setFactoryImages] = useState<FactoryImage[]>(
    IMAGE_SLOTS.map((label) => ({ label, dataUrl: null }))
  );
  const [criticalNcImages, setCriticalNcImages] = useState<string[]>([]);
  const [majorNcImages, setMajorNcImages] = useState<string[]>([]);

  function handleImageUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFactoryImages((prev) =>
        prev.map((img, i) => (i === idx ? { ...img, dataUrl: reader.result as string } : img))
      );
    };
    reader.readAsDataURL(file);
  }

  function handleNcImageUpload(type: "critical" | "major", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (type === "critical") setCriticalNcImages((prev) => [...prev, url]);
      else setMajorNcImages((prev) => [...prev, url]);
    };
    reader.readAsDataURL(file);
  }

  function addFinding() {
    if (!fIssue.trim()) return;
    const finding: SIRFinding = {
      id: `sir-${Date.now()}`,
      no: String(sirFindings.length + 1),
      section: fSection,
      issue: fIssue,
      severity: fSeverity,
      action: fAction,
      responsible: fResponsible,
      timeline: fTimeline,
      status: "Open",
    };
    setSirFindings((prev) => [...prev, finding]);
    setShowFindingForm(false);
    setFSection(""); setFIssue(""); setFAction(""); setFResponsible(""); setFTimeline("");
  }

  // ── Checklist ratings: itemId → Rating ────────────────────────────────────
  const [ratings, setRatings] = useState<Record<string, Rating>>(() => {
    const initial: Record<string, Rating> = {};
    CHECKLIST_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        initial[item.id] = "Green";
      });
    });
    return initial;
  });

  // ── Collapsed sections ─────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  function toggleCollapse(no: number) {
    setCollapsed((prev) => ({ ...prev, [no]: !prev[no] }));
  }

  function setRating(itemId: string, r: Rating) {
    setRatings((prev) => ({ ...prev, [itemId]: r }));
  }

  // ── Computed scores ────────────────────────────────────────────────────────
  const sectionScores = useMemo(() => {
    return CHECKLIST_SECTIONS.map((sec) => {
      let achieved = 0;
      let possible = 0;
      let red = 0, orange = 0, lightGreen = 0, green = 0, na = 0;

      sec.items.forEach((item) => {
        const r = ratings[item.id] ?? "none";
        if (r !== "N/A") possible += 1.5;
        if (r === "Green") { achieved += 1.5; green++; }
        else if (r === "Light-Green") { achieved += 1.0; lightGreen++; }
        else if (r === "Orange") { achieved += 0.5; orange++; }
        else if (r === "Red") { red++; }
        else if (r === "N/A") { na++; }
      });

      const pct = possible > 0 ? (achieved / possible) * 100 : 100;
      return {
        sectionNo: sec.no,
        sectionName: sec.name,
        possible: Math.round(possible * 10) / 10,
        achieved: Math.round(achieved * 10) / 10,
        pct: Math.round(pct * 10) / 10,
        green, lightGreen, orange, red, na,
        itemCount: sec.items.length,
        greenCompliant: green + lightGreen,
      };
    });
  }, [ratings]);

  const totalPossible = useMemo(() => sectionScores.reduce((s, r) => s + r.possible, 0), [sectionScores]);
  const totalAchieved = useMemo(() => sectionScores.reduce((s, r) => s + r.achieved, 0), [sectionScores]);
  const overallPct = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 1000) / 10 : 0;

  const hasRed = useMemo(() => sectionScores.some((s) => s.red > 0), [sectionScores]);
  const totalRed = useMemo(() => sectionScores.reduce((s, r) => s + r.red, 0), [sectionScores]);
  const totalOrange = useMemo(() => sectionScores.reduce((s, r) => s + r.orange, 0), [sectionScores]);

  function calcGrade(pct: number, redCount: number): { grade: string; color: string; label: string } {
    if (redCount > 0) return { grade: "E", color: "bg-red-600", label: "Failed" };
    if (pct >= 95) return { grade: "A", color: "bg-emerald-600", label: "Excellent" };
    if (pct >= 80) return { grade: "B", color: "bg-emerald-500", label: "Good" };
    if (pct >= 55) return { grade: "C", color: "bg-amber-500", label: "Accepted" };
    if (pct >= 0) return { grade: "D", color: "bg-orange-600", label: "Failed" };
    return { grade: "E", color: "bg-red-700", label: "Failed" };
  }

  function calcColorRating(pct: number, redCount: number): { label: string; color: string } {
    if (redCount > 0) return { label: "Red", color: "bg-red-600" };
    if (pct >= 95) return { label: "Green", color: "bg-emerald-600" };
    if (pct >= 80) return { label: "Light Green", color: "bg-emerald-400" };
    if (pct >= 55) return { label: "Orange", color: "bg-orange-500" };
    return { label: "Red", color: "bg-red-600" };
  }

  const grade = calcGrade(overallPct, totalRed);
  const colorRating = calcColorRating(overallPct, totalRed);

  function sectionRatingLabel(pct: number, red: number): { label: string; color: string } {
    if (red > 0) return { label: "Red", color: "bg-red-500 text-white" };
    if (pct >= 95) return { label: "Green", color: "bg-emerald-600 text-white" };
    if (pct >= 80) return { label: "Light Green", color: "bg-emerald-400 text-white" };
    if (pct >= 55) return { label: "Orange", color: "bg-orange-500 text-white" };
    return { label: "Red", color: "bg-red-500 text-white" };
  }

  function handleSave() {
    const audit: SocialComplianceAudit = {
      id: `sca-${Date.now()}`,
      factoryName,
      auditDate: assessmentDate,
      auditorName: contactPerson || "Lead Quality Auditor",
      auditType: "Initial Audit",
      factoryAddress,
      contactPerson,
      contactEmail,
      overallScorePercent: overallPct,
      grade: grade.grade as any,
      status: grade.grade === "A" || grade.grade === "B" ? "Passed" : "Failed",
      sections: sectionScores.map((s) => ({
        sectionNo: s.sectionNo,
        sectionName: s.sectionName,
        scorePossible: s.possible,
        scoreAchieved: s.achieved,
        greenCount: s.green,
        lightGreenCount: s.lightGreen,
        orangeCount: s.orange,
        redCount: s.red,
        blackCount: 0,
        notApplicableCount: s.na,
      })),
      findings: [],
      auditorRemarks: "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      // extra fields expected by list
      brand,
      address: factoryAddress,
    } as any;

    saveOrUpdateSocialAudit(audit);
    router.push("/audit/social-compliance");
  }

  const TABS: { id: TabId; label: string }[] = [
    { id: "info", label: "Audit Info" },
    { id: "checklist", label: "Audit Checklist" },
    { id: "rating", label: "Assessment Rating" },
    { id: "sir", label: "SIR Findings" },
    { id: "images", label: "Image" },
    { id: "critical", label: "Critical Points" },
  ];

  return (
    <SourcingShell>
      <div className="max-w-6xl mx-auto pb-24 text-gray-200">
        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-5">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-white">New Social Compliance Audit</h1>
            <p className="text-xs text-teal-400/80">Factory Assessment Report with scoring &amp; SIR findings</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-black/60 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition"
            >
              <Download size={13} /> Export PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
            >
              <Save size={13} /> Save
            </button>
          </div>
        </div>

        {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-gray-800 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-teal-400 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: AUDIT INFO
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "info" && (
          <div className="space-y-5">
            {/* Basic Information */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white">Basic Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Brand Name</label>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    >
                      {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Factory Name</label>
                  <input
                    type="text"
                    value={factoryName}
                    placeholder="Factory name"
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Factory Address</label>
                  <input
                    type="text"
                    value={factoryAddress}
                    placeholder="Auto-filled"
                    onChange={(e) => setFactoryAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-gray-400 placeholder-gray-600 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="max-w-xs">
                <label className="text-xs text-gray-400 font-semibold block mb-1">Assessment Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* Factory Contact Details */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white">Factory Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    placeholder="Name"
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    placeholder="example@factory.com"
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: AUDIT CHECKLIST
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "checklist" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-1">Audit Checklist</h2>
              <p className="text-[11px] text-gray-400">
                All points are marked <span className="text-emerald-400 font-semibold">Green</span> by default. Change the rating if non-compliance is found.
              </p>
            </div>

            {CHECKLIST_SECTIONS.map((sec) => {
              const scores = sectionScores.find((s) => s.sectionNo === sec.no);
              const isCollapsed = collapsed[sec.no];
              const compliant = scores ? scores.green + scores.lightGreen : 0;
              const total = sec.items.length;

              // Sub-categories tracking
              let lastSubCat: string | undefined = undefined;

              return (
                <div key={sec.no} className="rounded-2xl border border-gray-800 bg-[#0d1414] shadow-xl overflow-hidden">
                  {/* Section Header */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(sec.no)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition text-left"
                  >
                    <span className="text-gray-400 text-xs">{isCollapsed ? "›" : "∨"}</span>
                    <span className="text-xs font-bold text-gray-400 w-4">{sec.no}</span>
                    <span className="text-sm font-bold text-white flex-1">{sec.name}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-700/40 rounded-full px-2.5 py-0.5">
                      {compliant}/{total}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        {/* Column headers */}
                        <thead>
                          <tr className="border-t border-b border-gray-800 bg-black/40">
                            <th className="py-2 px-4 text-[11px] font-bold text-gray-400 w-8">#</th>
                            <th className="py-2 px-4 text-[11px] font-bold text-gray-400 min-w-[200px]">Assessment Point</th>
                            <th className="py-2 px-4 text-[11px] font-bold text-gray-400">Description</th>
                            {/* Rating circles header */}
                            <th className="py-2 px-2 w-8">
                              <span className="w-5 h-5 rounded-full bg-gray-600 inline-block" />
                            </th>
                            <th className="py-2 px-2 w-8">
                              <span className="w-5 h-5 rounded-full bg-red-500 inline-block" />
                            </th>
                            <th className="py-2 px-2 w-8">
                              <span className="w-5 h-5 rounded-full bg-orange-500 inline-block" />
                            </th>
                            <th className="py-2 px-2 w-8">
                              <span className="w-5 h-5 rounded-full bg-emerald-400 inline-block" />
                            </th>
                            <th className="py-2 px-2 w-8">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 inline-block" />
                            </th>
                            <th className="py-2 px-3 text-[11px] font-bold text-gray-400 w-10">N/A</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {sec.items.map((item, idx) => {
                            const showSubCat = item.subCategory && item.subCategory !== lastSubCat;
                            if (item.subCategory) lastSubCat = item.subCategory;
                            const r = ratings[item.id] ?? "Green";

                            return (
                              <React.Fragment key={item.id}>
                                {showSubCat && (
                                  <tr>
                                    <td colSpan={9} className="py-1.5 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/30">
                                      {item.subCategory}
                                    </td>
                                  </tr>
                                )}
                                <tr className="hover:bg-gray-800/20 transition">
                                  <td className="py-2.5 px-4 text-gray-500 font-mono">{idx + 1}</td>
                                  <td className="py-2.5 px-4 font-semibold text-white">{item.point}</td>
                                  <td className="py-2.5 px-4 text-gray-400 text-[11px]">{item.description}</td>

                                  {/* none / no-rating circle */}
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, "none")}
                                      className={`w-5 h-5 rounded-full mx-auto block transition ${
                                        r === "none" ? "border-2 border-gray-400 bg-gray-400" : "border-2 border-gray-700 bg-transparent"
                                      }`}
                                    />
                                  </td>
                                  {/* Red */}
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, "Red")}
                                      className={`w-5 h-5 rounded-full mx-auto block transition ${
                                        r === "Red" ? "bg-red-500 border-2 border-red-500" : "border-2 border-gray-700 bg-transparent"
                                      }`}
                                    />
                                  </td>
                                  {/* Orange */}
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, "Orange")}
                                      className={`w-5 h-5 rounded-full mx-auto block transition ${
                                        r === "Orange" ? "bg-orange-500 border-2 border-orange-500" : "border-2 border-gray-700 bg-transparent"
                                      }`}
                                    />
                                  </td>
                                  {/* Light Green */}
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, "Light-Green")}
                                      className={`w-5 h-5 rounded-full mx-auto block transition ${
                                        r === "Light-Green" ? "bg-emerald-400 border-2 border-emerald-400" : "border-2 border-gray-700 bg-transparent"
                                      }`}
                                    />
                                  </td>
                                  {/* Green */}
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, "Green")}
                                      className={`w-5 h-5 rounded-full mx-auto block transition ${
                                        r === "Green" ? "bg-emerald-600 border-2 border-emerald-600" : "border-2 border-gray-700 bg-transparent"
                                      }`}
                                    />
                                  </td>
                                  {/* N/A */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setRating(item.id, r === "N/A" ? "Green" : "N/A")}
                                      className={`w-5 h-5 rounded mx-auto block transition text-[9px] font-bold ${
                                        r === "N/A" ? "bg-gray-500 text-white" : "border border-gray-700 text-gray-600"
                                      }`}
                                    />
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: ASSESSMENT RATING
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "rating" && (
          <div className="space-y-5">
            {/* Overall Rating */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white">Overall Rating</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-800 bg-black/50 p-4 text-center space-y-1">
                  <span className="text-[11px] text-gray-400 block">Score</span>
                  <span className="text-2xl font-black font-mono text-white block">
                    {Math.round(totalAchieved * 10) / 10}/{Math.round(totalPossible * 10) / 10}
                  </span>
                  <span className="text-xs text-gray-400 block">{overallPct}%</span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/50 p-4 text-center space-y-2">
                  <span className="text-[11px] text-gray-400 block">Color Rating</span>
                  <span className={`inline-block rounded-full px-5 py-1.5 text-xs font-bold text-white ${colorRating.color}`}>
                    {colorRating.label}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/50 p-4 text-center space-y-1">
                  <span className="text-[11px] text-gray-400 block">Score Rating</span>
                  <span className="text-3xl font-black font-mono text-white block">{grade.grade}</span>
                  <span className="text-xs text-gray-400 block">{grade.label}</span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/50 p-4 text-center space-y-1">
                  <span className="text-[11px] text-gray-400 block">Critical Issues</span>
                  <span className="text-3xl font-black font-mono text-red-400 block">{totalRed}</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-400">
                Non-Compliance: <span className="text-white font-bold">{totalRed}</span> &nbsp;·&nbsp;
                Partial Compliance: <span className="text-white font-bold">{totalOrange}</span>
              </div>
              <p className="text-[10px] text-gray-500 italic">Values are auto-calculated from the Audit Checklist ratings.</p>
            </div>

            {/* Assessment Rating by Section */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white">Assessment Rating by Section</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-800/80 bg-black/40">
                <table className="w-full text-left text-xs text-gray-300 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/80 text-[11px] font-bold text-gray-400">
                      <th className="py-3 px-4 w-8">#</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4 text-center">Possible</th>
                      <th className="py-3 px-4 text-center">Achieved</th>
                      <th className="py-3 px-4 text-center">%</th>
                      <th className="py-3 px-3 text-center"><span className="w-4 h-4 rounded-full bg-gray-600 inline-block" /></th>
                      <th className="py-3 px-3 text-center"><span className="w-4 h-4 rounded-full bg-red-500 inline-block" /></th>
                      <th className="py-3 px-3 text-center"><span className="w-4 h-4 rounded-full bg-orange-500 inline-block" /></th>
                      <th className="py-3 px-3 text-center"><span className="w-4 h-4 rounded-full bg-emerald-400 inline-block" /></th>
                      <th className="py-3 px-3 text-center"><span className="w-4 h-4 rounded-full bg-emerald-600 inline-block" /></th>
                      <th className="py-3 px-3 text-center text-[11px]">N/A</th>
                      <th className="py-3 px-4 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {sectionScores.map((s) => {
                      const rat = sectionRatingLabel(s.pct, s.red);
                      return (
                        <tr key={s.sectionNo} className="hover:bg-gray-800/20 transition">
                          <td className="py-2.5 px-4 font-mono text-gray-500">{s.sectionNo}</td>
                          <td className="py-2.5 px-4 text-white font-semibold">{s.sectionName}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-gray-300">{s.possible}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-white font-bold">{s.achieved}</td>
                          <td className="py-2.5 px-4 text-center font-mono text-gray-300">{s.pct}%</td>
                          <td className="py-2.5 px-3 text-center font-mono text-gray-500">—</td>
                          <td className="py-2.5 px-3 text-center font-mono text-red-400">{s.red > 0 ? s.red : "—"}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-orange-400">{s.orange > 0 ? s.orange : "—"}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-400">{s.lightGreen > 0 ? s.lightGreen : "—"}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-600">{s.green > 0 ? s.green : "—"}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-gray-500">{s.na > 0 ? s.na : "—"}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${rat.color}`}>
                              {rat.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="border-t border-gray-800 bg-black/60 font-bold">
                      <td colSpan={2} className="py-3 px-4 text-white">Total</td>
                      <td className="py-3 px-4 text-center font-mono text-white">{Math.round(totalPossible * 10) / 10}</td>
                      <td className="py-3 px-4 text-center font-mono text-white">{Math.round(totalAchieved * 10) / 10}</td>
                      <td className="py-3 px-4 text-center font-mono text-white">{overallPct}%</td>
                      <td colSpan={6} className="py-3 px-3 text-center text-gray-500">—</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colorRating.color} text-white`}>
                          {colorRating.label}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rating Criteria */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white">Rating Criteria</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                <div className="space-y-2">
                  <h3 className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Score Based</h3>
                  {[
                    { grade: "A", rule: "≥ 95% & No Critical", color: "text-emerald-400" },
                    { grade: "B", rule: "≥ 80% & No Critical", color: "text-emerald-400" },
                    { grade: "C", rule: "≥ 55% & No Critical", color: "text-amber-400" },
                    { grade: "D", rule: "< 55% & No Critical", color: "text-orange-400" },
                    { grade: "E", rule: "If any Critical", color: "text-red-400" },
                  ].map((g) => (
                    <div key={g.grade} className="flex items-center gap-3">
                      <span className="font-bold text-white w-4">{g.grade}</span>
                      <span className={`font-semibold ${g.color}`}>{g.rule}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Color Code</h3>
                  {[
                    { label: "Green – Excellent", dot: "bg-emerald-600" },
                    { label: "Light Green – Good", dot: "bg-emerald-400" },
                    { label: "Orange – Accepted", dot: "bg-orange-500" },
                    { label: "Red – Failed", dot: "bg-red-500" },
                    { label: "Black – Rejected", dot: "bg-gray-900 border border-gray-600" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${c.dot} shrink-0`} />
                      <span className="text-gray-300">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: SIR FINDINGS
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "sir" && (
          <div className="space-y-5">
            {/* Scopes of Improvement */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white">Scopes of Improvement (SIR)</h2>

              {!showFindingForm && (
                <button
                  type="button"
                  onClick={() => setShowFindingForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
                >
                  + Add Finding
                </button>
              )}

              {showFindingForm && (
                <div className="rounded-xl border border-gray-700 bg-black/40 p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 font-semibold block mb-1">Section</label>
                      <select
                        value={fSection}
                        onChange={(e) => setFSection(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                      >
                        <option value="">Select section</option>
                        {CHECKLIST_SECTIONS.map((s) => (
                          <option key={s.no} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 font-semibold block mb-1">Severity</label>
                      <select
                        value={fSeverity}
                        onChange={(e) => setFSeverity(e.target.value as SIRFinding["severity"])}
                        className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                      >
                        <option value="Critical">Critical</option>
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">Issue Description</label>
                    <textarea
                      rows={2}
                      value={fIssue}
                      onChange={(e) => setFIssue(e.target.value)}
                      placeholder="Describe the non-compliance finding..."
                      className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">Corrective Action</label>
                    <input
                      type="text"
                      value={fAction}
                      onChange={(e) => setFAction(e.target.value)}
                      placeholder="Required corrective action"
                      className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 font-semibold block mb-1">Responsible Person</label>
                      <input
                        type="text"
                        value={fResponsible}
                        onChange={(e) => setFResponsible(e.target.value)}
                        placeholder="Name / role"
                        className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 font-semibold block mb-1">Agreed Timeline</label>
                      <input
                        type="date"
                        value={fTimeline}
                        onChange={(e) => setFTimeline(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFindingForm(false)}
                      className="rounded-lg border border-gray-700 px-4 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addFinding}
                      className="rounded-lg bg-[#00BFA5] px-5 py-1.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition"
                    >
                      Add Finding
                    </button>
                  </div>
                </div>
              )}

              {/* Findings list */}
              {sirFindings.length > 0 ? (
                <div className="space-y-2">
                  {sirFindings.map((f, idx) => {
                    const sevColor = f.severity === "Critical" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      f.severity === "Major" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                        "bg-amber-500/20 text-amber-400 border-amber-500/30";
                    return (
                      <div key={f.id} className="rounded-xl border border-gray-700 bg-black/30 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-gray-500 text-xs">#{idx + 1}</span>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${sevColor}`}>
                                {f.severity}
                              </span>
                              {f.section && (
                                <span className="text-[11px] text-teal-400 font-semibold">{f.section}</span>
                              )}
                            </div>
                            <p className="text-xs text-white font-semibold">{f.issue}</p>
                            {f.action && <p className="text-[11px] text-gray-400">Action: {f.action}</p>}
                            <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 pt-1">
                              {f.responsible && <span>By: {f.responsible}</span>}
                              {f.timeline && <span>Due: {f.timeline}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSirFindings((prev) => prev.filter((x) => x.id !== f.id))}
                            className="text-gray-600 hover:text-red-400 text-xs transition"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-gray-500 py-6">
                  No findings yet. Click "Add Finding" to add SIR items.
                </p>
              )}
            </div>

            {/* Executive Summary */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white">Executive Summary</h2>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Executive Summary</label>
                <textarea
                  rows={4}
                  value={execSummary}
                  onChange={(e) => setExecSummary(e.target.value)}
                  placeholder="Assessment findings based upon on-site observation, interviews, and document review..."
                  className="w-full rounded-lg border border-gray-800 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Good Practices</label>
                <textarea
                  rows={3}
                  value={goodPractices}
                  onChange={(e) => setGoodPractices(e.target.value)}
                  placeholder="Good practices observed during the audit.."
                  className="w-full rounded-lg border border-gray-800 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Critical Issues</label>
                <textarea
                  rows={3}
                  value={criticalIssues}
                  onChange={(e) => setCriticalIssues(e.target.value)}
                  placeholder="e.g. [9.3][6.4]"
                  className="w-full rounded-lg border border-gray-800 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: IMAGES
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "images" && (
          <div className="space-y-5">
            {/* Factory Images Grid */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white">Factory Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {factoryImages.map((img, idx) => (
                  <div key={img.label} className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-semibold">{img.label}</p>
                    <label className="block cursor-pointer">
                      <div className="relative rounded-xl border border-gray-800 bg-black/50 overflow-hidden" style={{ paddingTop: "75%" }}>
                        {img.dataUrl ? (
                          <img
                            src={img.dataUrl}
                            alt={img.label}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-teal-400 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
                              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.5} />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15l-5-5L5 21" />
                            </svg>
                            <span className="text-[10px]">Upload</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleImageUpload(idx, e)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical NC Images */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white">Critical NC Images</h2>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-300 hover:text-teal-400 transition">
                <span className="text-lg leading-none">+</span> Add
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleNcImageUpload("critical", e)}
                />
              </label>
              {criticalNcImages.length === 0 ? (
                <p className="text-xs text-gray-500">No critical NC images added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {criticalNcImages.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                      <img src={url} alt="nc" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCriticalNcImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-600"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Major NC Images */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white">Major NC Images</h2>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-300 hover:text-teal-400 transition">
                <span className="text-lg leading-none">+</span> Add
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleNcImageUpload("major", e)}
                />
              </label>
              {majorNcImages.length === 0 ? (
                <p className="text-xs text-gray-500">No major NC images added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {majorNcImages.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                      <img src={url} alt="nc" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMajorNcImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-600"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: CRITICAL POINTS
           ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "critical" && (
          <div className="space-y-5">
            {/* Critical Points Table */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-sm font-bold text-white">Critical Points</h2>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-black/60">
                    <th className="py-3 px-5 w-10 text-[11px] font-bold text-gray-400">#</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-gray-400">Critical Point</th>
                    <th className="py-3 px-5 text-right text-[11px] font-bold text-gray-400">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {CRITICAL_POINTS.map((pt, idx) => {
                    const status = cpRatings[idx] ?? "compliant";
                    return (
                      <tr key={idx} className="hover:bg-gray-800/20 transition">
                        <td className="py-3 px-5 font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4 text-gray-200 leading-relaxed max-w-3xl">{pt}</td>
                        <td className="py-3 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Compliant ✔ */}
                            <button
                              type="button"
                              title="Compliant"
                              onClick={() => setCpRatings(prev => ({ ...prev, [idx]: "compliant" }))}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                                status === "compliant"
                                  ? "border-emerald-500 text-emerald-400 bg-emerald-900/30"
                                  : "border-gray-700 text-gray-600 hover:border-emerald-500 hover:text-emerald-400"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            </button>
                            {/* Non-Compliant ✖ */}
                            <button
                              type="button"
                              title="Non-Compliant"
                              onClick={() => setCpRatings(prev => ({ ...prev, [idx]: "non-compliant" }))}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                                status === "non-compliant"
                                  ? "border-red-500 text-red-400 bg-red-900/30"
                                  : "border-gray-700 text-gray-600 hover:border-red-500 hover:text-red-400"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2.5}>
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            </button>
                            {/* N/A — */}
                            <button
                              type="button"
                              title="Not Applicable"
                              onClick={() => setCpRatings(prev => ({ ...prev, [idx]: "na" }))}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                                status === "na"
                                  ? "border-gray-400 text-gray-300 bg-gray-700/40"
                                  : "border-gray-700 text-gray-600 hover:border-gray-500 hover:text-gray-300"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth={2.5}>
                                <line x1="8" y1="12" x2="16" y2="12" />
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Overall Remarks */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-white">Overall Remarks</h2>
              <textarea
                rows={5}
                value={overallRemarks}
                onChange={(e) => setOverallRemarks(e.target.value)}
                placeholder="Enter overall audit remarks, observations, and recommendations..."
                className="w-full rounded-lg border border-gray-800 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
              >
                <Save size={13} /> Save Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}
