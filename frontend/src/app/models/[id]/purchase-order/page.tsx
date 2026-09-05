"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { BrandsApi } from "@/lib/api/brands-api";
import { uploadFile } from "@/lib/storage";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";
import { showGlobalToast } from "@/lib/ui/toast";

interface QuantityRow {
  id: string;
  poNo: string;
  dcType: string;
  dcPort: string;
  sizes: Record<string, number>;
  totalQty: number;
  price: number;
  exFactory: string;
  hod: string;
  sailing: string;
}

interface FabricRow {
  id: string;
  colourCode: string;
  fabricType: string;
  composition: string;
  gsm: string;
}

interface PODocument {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  comment?: string;
  fileUrl?: string;
}

interface TestingRequirement {
  id: string;
  category: string;
  parameter: string;
  product: string;
  requirement: string;
  testMethod: string;
  notes?: string;
}

const AVAILABLE_TESTS: TestingRequirement[] = [
  { id: "colour-rubbing-wet", category: "Colour Fastness", parameter: "CF to rubbing (wet)", product: "textile products", requirement: "- / 3-4 / -", testMethod: "ISO 105-X12" },
  { id: "pull-fasteners", category: "Pull Test", parameter: "Attachment of buttons, snap fasteners, eyelets, buckles, D-rings, and other fasteners", product: "Children's clothing and accessories", requirement: "90N 10s", testMethod: "EN 71:1 EN 17394-3" },
  { id: "composition-fibre", category: "Composition & GSM", parameter: "Composition (deviation of fiber content)", product: "all textile products", requirement: "single: 0% mixed: +/-3%", testMethod: "ISO 1833" },
  { id: "gsm-knitted", category: "Composition & GSM", parameter: "GSM", product: "knitted products, sweaters", requirement: "+/- 3%", testMethod: "EN 12127" },
  { id: "dimensional-knitted", category: "Dimensional Stability", parameter: "", product: "knitted", requirement: "+/- 4%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "twisting-general", category: "Twisting, Seam Slippage, Pilling & Other", parameter: "Twisting", product: "general", requirement: "no twist", testMethod: "ISO 16322-3" },
  { id: "pilling-knitted", category: "Twisting, Seam Slippage, Pilling & Other", parameter: "Pilling resistance (ICI)", product: "knitted", requirement: "14400 cycles: 4", testMethod: "ISO 12945-1" },
  { id: "stretch-recovery", category: "Stretch & Recovery (Knitted)", parameter: "", product: "<= 5% elastane", requirement: "3 N / 6 N / 12", testMethod: "EN ISO20932-1:2020", notes: "Loading /cm width Strip | Loop | Growth [%] (Max)" },
  { id: "shrinkage", category: "Dimensional Stability", parameter: "Shrinkage", product: "knitted products", requirement: "max 5%", testMethod: "ISO 6330" },
  { id: "colour-washing", category: "Colour Fastness", parameter: "CF to washing", product: "textile products", requirement: "Grade 4 minimum", testMethod: "ISO 105-C06" },
  { id: "colour-light", category: "Colour Fastness", parameter: "CF to light", product: "garment", requirement: "4", testMethod: "ISO 105-B02" },
  { id: "colour-water", category: "Colour Fastness", parameter: "CF to water", product: "all products", requirement: "4 / 4 / 4-5", testMethod: "ISO 105-E01" },
  { id: "colour-laundering-care", category: "Colour Fastness", parameter: "CF to household laundering", product: "care instruction: possible to wash in water", requirement: "4 neon colour: 3-4 / 4 / 4-5", testMethod: "ISO 105 C06" },
  { id: "colour-laundering-five", category: "Colour Fastness", parameter: "CF to household laundering", product: "after 5 times wash", requirement: "3-4 neon colour: 3 / 3-4 / 4", testMethod: "ISO 105 C06" },
  { id: "colour-perspiration", category: "Colour Fastness", parameter: "CF to perspiration", product: "textile product", requirement: "3-4 / 3-4 / 4-5", testMethod: "ISO 105-E04" },
  { id: "colour-solvent", category: "Colour Fastness", parameter: "CF to solvent", product: "all products", requirement: "3-4 / 3-4 / -", testMethod: "ISO 105-X05" },
  { id: "colour-seawater", category: "Colour Fastness", parameter: "CF to sea water", product: "-", requirement: "3-4 / 3-4 / 4-5", testMethod: "ISO 105-E02" },
  { id: "colour-chlorinated", category: "Colour Fastness", parameter: "CF to chlorinated water", product: "swimwear, beachwear", requirement: "4 white colour: 3-4 neon colour: 4-5 / 4-5 white colour: 3 neon colour: 4-5 / 4-5", testMethod: "ISO 105-E03" },
  { id: "colour-dry-cleaning", category: "Colour Fastness", parameter: "CF to dry cleaning", product: "labelled dry clean only or dry clean optimally", requirement: "4 / 4-5 / 4-5", testMethod: "ISO 105 D01" },
  { id: "colour-rubbing-dry", category: "Colour Fastness", parameter: "CF to rubbing (dry)", product: "textiles", requirement: "- / 4 / -", testMethod: "ISO 105-X12" },
  { id: "colour-saliva", category: "Colour Fastness", parameter: "CF to saliva", product: "only baby's item - users aged 0-3 years old", requirement: "4 / 4 / 4-5", testMethod: "GB/T 18886" },
  { id: "tear-strength", category: "Tear Strength", parameter: "Tear strength", product: "woven products", requirement: "minimum 15 N", testMethod: "ISO 13937-1" },
  { id: "tensile-strength", category: "Tensile Strength", parameter: "Tensile strength", product: "textile products", requirement: "minimum 300 N", testMethod: "ISO 13934-1" },
  { id: "abrasion", category: "Abrasion Resistance", parameter: "Abrasion resistance", product: "knitted products", requirement: "14400 cycles", testMethod: "ISO 12947-2" },
  { id: "stretch-woven", category: "Stretch & Recovery (Woven)", parameter: "Stretch and recovery", product: "woven elastane", requirement: "minimum 80% recovery", testMethod: "EN 14704-1" },
  { id: "zipper", category: "Zipper Testing Parameter", parameter: "Zipper durability", product: "garments with zipper", requirement: "500 cycles", testMethod: "BS 3084" },
  { id: "chemical-license", category: "Chemical Testing - License", parameter: "Restricted substances", product: "all textile products", requirement: "pass", testMethod: "Supplier RSL" },
  { id: "print-durability", category: "Print Durability", parameter: "Print adhesion", product: "printed garments", requirement: "no peeling", testMethod: "Internal method" },
  { id: "pull-cords", category: "Pull Test", parameter: "Functional and non-functional cords and drawstrings", product: "Children's clothing and accessories", requirement: "100% of the production complies with the standard", testMethod: "EN 14682" },
  { id: "pull-aglets", category: "Pull Test", parameter: "Attachment of aglets on drawstring ends", product: "Children's clothing and accessories", requirement: "90N 10s", testMethod: "EN 71:1" },
  { id: "pull-pompoms", category: "Pull Test", parameter: "Attachment of pompoms, fringes, and tassels", product: "Children's clothing and accessories", requirement: "90N 10s", testMethod: "EN 71:1" },
  { id: "pull-small-parts", category: "Pull Test", parameter: "Small parts/choking hazard test", product: "Children's clothing and accessories", requirement: "It must not fit within the test cylinder in any orientation", testMethod: "EN 71:1 EN 17394-3" },
  { id: "dimensional-reserved-men", category: "Dimensional Stability", parameter: "", product: "Reserved men - knitted", requirement: "+/- 2%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-chunky", category: "Dimensional Stability", parameter: "", product: "chunky knit", requirement: "+/- 6%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-sock", category: "Dimensional Stability", parameter: "", product: "sock and hosiery", requirement: "+/- 8%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-woven-cotton", category: "Dimensional Stability", parameter: "", product: "woven - cotton and cotton mix", requirement: "+/- 3%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-woven-wool", category: "Dimensional Stability", parameter: "", product: "woven - wool mix", requirement: "+/- 2%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-woven-synthetic", category: "Dimensional Stability", parameter: "", product: "woven - synthetic fibers", requirement: "+/- 2%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
  { id: "dimensional-viscose-linen", category: "Dimensional Stability", parameter: "", product: "viscose, linen", requirement: "+/- 5%", testMethod: "ISO 6330, ISO 3759, ISO 5077", notes: "After 3 times wash" },
];

export default function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const router = useRouter();
  const [currentModel, setCurrentModel] = useState<ModelEntity | null>(null);
  const [savedPurchaseOrderId, setSavedPurchaseOrderId] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadModel() {
      if (!modelId) return;
      try {
        const data = await ModelsApi.getById(modelId);
        if (data) {
          setCurrentModel(data);
          setModelNo(data.code || modelId);
          const savedOrders = await ModelsApi.getPurchaseOrders(modelId);
          const savedOrder = savedOrders[0];
          if (savedOrder) {
            setSavedPurchaseOrderId(savedOrder.id || null);
            let details: any = {};
            try {
              details = savedOrder.specialInstructions ? JSON.parse(savedOrder.specialInstructions) : {};
            } catch {
              details = {};
            }

            setFactory(details.factory || "");
            setSeason(savedOrder.season || "");
            setIntake(details.intake || "");
            setDepartment(savedOrder.department || "");
            setSubClass(details.subClass || "");
            setBuyer(savedOrder.buyer || "");
            setBuyerAssistant(details.buyerAssistant || "");
            setUnitPrice(details.unitPrice === undefined ? "" : String(details.unitPrice));
            setPaymentTerms(details.paymentTerms || "");
            setIncoTerms(details.incoTerms || "");
            setShipmentType(savedOrder.shipmentMode || "");
            setPoDate(savedOrder.orderDate ? String(savedOrder.orderDate).slice(0, 10) : "");
            setPackSize(details.packSize || "");
            setSizeLabels(Array.isArray(details.sizeLabels) ? details.sizeLabels : []);
            setQuantityRows(Array.isArray(details.quantityRows) ? details.quantityRows : []);
            setFabricRows(Array.isArray(details.fabricRows) ? details.fabricRows : []);
            const savedTests = Array.isArray(details.selectedTests) ? details.selectedTests : [];
            setSelectedTests(savedTests.map((test: string | TestingRequirement) =>
              typeof test === "string"
                ? AVAILABLE_TESTS.find((option) => option.parameter === test || option.id === test) || {
                    id: test,
                    category: "Other Tests",
                    parameter: test,
                    product: "",
                    requirement: "",
                    testMethod: "",
                  }
                : test,
            ));
            const savedRequirements = await ModelsApi.getTestingRequirements(savedOrder.id);
            if (savedRequirements.length) {
              setSelectedTests(savedRequirements.map((test: TestingRequirement) => ({
                id: test.id,
                category: test.category || "Other Tests",
                parameter: test.parameter || "",
                product: test.product || "",
                requirement: test.requirement || "",
                testMethod: test.testMethod || "",
                notes: test.notes || undefined,
              })));
            }
            setPoDocuments(Array.isArray(details.documents) ? details.documents : []);
          }
          const standards = await BrandsApi.getTestingStandards(data.brandId);
          const grouped = standards.reduce((options: Record<string, string[]>, standard: any) => {
            const key = String(standard.parameterName || "").trim().toLowerCase();
            const value = String(standard.requirementStandard || "").trim();
            if (!key || !value) return options;
            options[key] = options[key] || [];
            if (!options[key].includes(value)) options[key].push(value);
            return options;
          }, {});
          setBrandOptions(grouped);
        }
      } catch (err) {
        console.warn("Failed to load model in PO page:", err);
      }
    }
    loadModel();
  }, [modelId]);

  const getOptions = (key: string, fallback: string[] = []) => {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const matchingOptions = Object.entries(brandOptions).find(
      ([group]) => group.replace(/[^a-z0-9]/gi, "").toLowerCase() === normalizedKey,
    )?.[1];
    return matchingOptions?.length ? matchingOptions : fallback;
  };

  const factoryOptions = getOptions("factory", currentModel?.factoryName ? [currentModel.factoryName] : []);
  const seasonOptions = getOptions("seasons");
  const intakeOptions = getOptions("intake");
  const shipmentOptions = getOptions("shipment");
  const dcTypeOptions = getOptions("dc type");
  const dcPortOptions = getOptions("dc port");
  const departmentOptions = getOptions("department");
  const subclassOptions = getOptions("subclass");
  const buyerOptions = getOptions("buyer");
  const buyerAssistantOptions = getOptions("buyer assistant");

  // ── Top Level Form State ───────────────────────────────────────────────────
  const [modelNo, setModelNo] = useState("");
  const [factory, setFactory] = useState("");
  const [season, setSeason] = useState("");
  const [intake, setIntake] = useState("");
  const [department, setDepartment] = useState("");
  const [subClass, setSubClass] = useState("");
  const [buyer, setBuyer] = useState("");
  const [buyerAssistant, setBuyerAssistant] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [incoTerms, setIncoTerms] = useState("");
  const [shipmentType, setShipmentType] = useState("");
  const [poDate, setPoDate] = useState("");
  const [packSize, setPackSize] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  // ── Size Labels ────────────────────────────────────────────────────────────
  const [sizeLabels, setSizeLabels] = useState<string[]>([]);
  const [isAddSizeOpen, setIsAddSizeOpen] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");

  // ── Quantity Rows ──────────────────────────────────────────────────────────
  const [quantityRows, setQuantityRows] = useState<QuantityRow[]>([]);

  // ── Fabric Details ─────────────────────────────────────────────────────────
  const [fabricRows, setFabricRows] = useState<FabricRow[]>([]);

  // ── Testing Requirements ───────────────────────────────────────────────────
  const [selectedTests, setSelectedTests] = useState<TestingRequirement[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [pendingTestIds, setPendingTestIds] = useState<string[]>([]);
  const [expandedTestGroups, setExpandedTestGroups] = useState<string[]>(() =>
    Array.from(new Set(AVAILABLE_TESTS.map((test) => test.category))),
  );

  // ── PO Documents ───────────────────────────────────────────────────────────
  const [poDocuments, setPoDocuments] = useState<PODocument[]>([]);

  function calculateHod(sailing: string) {
    if (!sailing) return "";
    const date = new Date(`${sailing}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    date.setDate(date.getDate() - 7);
    return `${padDate(date.getDate())}-${padDate(date.getMonth() + 1)}-${date.getFullYear()}`;
  }

  function padDate(value: number) {
    return String(value).padStart(2, "0");
  }

  function addDaysToIsoDate(dateValue: string, days: number) {
    if (!dateValue) return "";
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
  }

  function deriveRowDatesFromExFactory(exFactory: string, currentSailing?: string) {
    if (!exFactory) return { hod: "", sailing: currentSailing || "" };
    const nextSailing = currentSailing && new Date(`${currentSailing}T00:00:00`) > new Date(`${exFactory}T00:00:00`)
      ? currentSailing
      : addDaysToIsoDate(exFactory, 21);
    return {
      sailing: nextSailing,
      hod: addDaysToIsoDate(nextSailing, -7),
    };
  }

  function handleSizeCountChange(value: number) {
    const count = Math.max(0, Math.min(15, value || 0));
    setSizeLabels((previous) => {
      const next = previous.slice(0, count);
      while (next.length < count) next.push(`S${next.length + 1}`);
      return next;
    });
  }

  // ── Calculations ───────────────────────────────────────────────────────────
  const totalOrderQty = useMemo(
    () => quantityRows.reduce((sum, r) => sum + (Number(r.totalQty) || 0), 0),
    [quantityRows]
  );

  const totalOrderValue = useMemo(
    () => totalOrderQty * (parseFloat(unitPrice) || 0),
    [totalOrderQty, unitPrice]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAddSize() {
    if (!newSizeName.trim()) return;
    const clean = newSizeName.trim().toUpperCase();
    if (!sizeLabels.includes(clean)) {
      setSizeLabels([...sizeLabels, clean]);
      setQuantityRows((prev) =>
        prev.map((r) => ({
          ...r,
          sizes: { ...r.sizes, [clean]: 0 },
        }))
      );
    }
    setNewSizeName("");
    setIsAddSizeOpen(false);
  }

  function handleAddOrderRow() {
    const defaultSizes: Record<string, number> = {};
    sizeLabels.forEach((s) => (defaultSizes[s] = 0));
    const fallbackExFactory = addDaysToIsoDate(poDate || new Date().toISOString().slice(0, 10), 14) || "2026-08-20";
    const derivedDates = deriveRowDatesFromExFactory(fallbackExFactory, addDaysToIsoDate(fallbackExFactory, 21));
    const newRow: QuantityRow = {
      id: `qr-${Date.now()}`,
      poNo: `PI_NF_00${quantityRows.length + 1}`,
      dcType: dcTypeOptions[0] || "",
      dcPort: dcPortOptions[0] || "",
      sizes: defaultSizes,
      totalQty: 0,
      price: parseFloat(unitPrice) || 1.15,
      exFactory: fallbackExFactory,
      hod: derivedDates.hod,
      sailing: derivedDates.sailing,
    };
    setQuantityRows([...quantityRows, newRow]);
  }

  function handleDeleteOrderRow(id: string) {
    if (quantityRows.length <= 1) return;
    setQuantityRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next;
    });
  }

  function syncPoDateFromRows(rows: QuantityRow[]) {
    const exFactoryDates = rows
      .map((row) => row.exFactory)
      .filter((value) => Boolean(value))
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    if (exFactoryDates.length === 0) {
      setPoDate("");
      return;
    }

    const earliestDate = exFactoryDates[0];
    setPoDate((current) => {
      if (!current) return earliestDate;
      const currentDate = new Date(`${current}T00:00:00`);
      const selectedDate = new Date(`${earliestDate}T00:00:00`);
      if (Number.isNaN(currentDate.getTime()) || selectedDate.getTime() !== currentDate.getTime()) {
        return earliestDate;
      }
      return current;
    });
  }

  useEffect(() => {
    if (quantityRows.length > 0) {
      syncPoDateFromRows(quantityRows);
    }
  }, [quantityRows]);

  function handleSizeQtyChange(rowId: string, size: string, val: number) {
    setQuantityRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const newSizes = { ...r.sizes, [size]: val };
        const newTotal = Object.values(newSizes).reduce((a, b) => a + (Number(b) || 0), 0);
        return {
          ...r,
          sizes: newSizes,
          totalQty: newTotal,
        };
      })
    );
  }

  function handleAddFabric() {
    const newFab: FabricRow = {
      id: `fab-${Date.now()}`,
      colourCode: "",
      fabricType: "",
      composition: "",
      gsm: "",
    };
    setFabricRows([...fabricRows, newFab]);
  }

  function handleDeleteFabric(id: string) {
    if (fabricRows.length <= 1) return;
    setFabricRows(fabricRows.filter((f) => f.id !== id));
  }

  function handleToggleTest(test: TestingRequirement) {
    setSelectedTests((previous) => previous.some((item) => item.id === test.id)
      ? previous.filter((item) => item.id !== test.id)
      : [...previous, test]);
  }

  function openTestingPicker() {
    setPendingTestIds(selectedTests.map((test) => test.id));
    setIsTestModalOpen(true);
  }

  function togglePendingTest(testId: string) {
    setPendingTestIds((previous) => previous.includes(testId)
      ? previous.filter((id) => id !== testId)
      : [...previous, testId]);
  }

  function togglePendingCategory(category: string) {
    const categoryIds = AVAILABLE_TESTS.filter((test) => test.category === category).map((test) => test.id);
    setPendingTestIds((previous) => {
      const allSelected = categoryIds.every((id) => previous.includes(id));
      return allSelected
        ? previous.filter((id) => !categoryIds.includes(id))
        : Array.from(new Set([...previous, ...categoryIds]));
    });
  }

  function commitTestingRequirements() {
    const nextTests = AVAILABLE_TESTS.filter((test) => pendingTestIds.includes(test.id));
    setSelectedTests(nextTests);
    setExpandedTestGroups((previous) => Array.from(new Set([...previous, ...nextTests.map((test) => test.category)])));
    setIsTestModalOpen(false);
  }

  function handleRemoveTest(testId: string) {
    setSelectedTests((previous) => previous.filter((test) => test.id !== testId));
  }

  function toggleTestGroup(category: string) {
    setExpandedTestGroups((previous) => previous.includes(category)
      ? previous.filter((item) => item !== category)
      : [...previous, category]);
  }

  function handleDownloadTestingRequirements() {
    if (!selectedTests.length) return;
    const header = ["Category", "Parameter", "Product", "Requirement", "Test Method", "Notes"];
    const rows = selectedTests.map((test) => [test.category, test.parameter, test.product, test.requirement, test.testMethod, test.notes || ""]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${modelNo || "model"}-testing-requirements.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const fileUrl = await uploadFile("purchase-orders", modelId, file);
      const newDoc: PODocument = {
        id: `doc-${Date.now()}`,
        fileName: file.name,
        uploadDate: new Date().toISOString().split("T")[0],
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        comment: "Official Purchase Order Release PDF",
        fileUrl,
      };
      setPoDocuments((prev) => [newDoc, ...prev]);
    } catch (error: any) {
      showGlobalToast(error?.message || "Failed to upload purchase-order document.", "error");
    }
  }

  async function handleSaveChanges() {
    try {
      const savedOrder = await ModelsApi.savePurchaseOrder({
        modelId,
        brandId: currentModel?.brandId,
        factoryId: currentModel?.factoryId,
        poNumber: quantityRows[0]?.poNo || `PO-${Date.now().toString().slice(-4)}`,
        buyer: buyer || undefined,
        season,
        department,
        totalQty: totalOrderQty,
        totalAmount: totalOrderValue,
        shipmentMode: shipmentType,
        orderDate: poDate,
        specialInstructions: JSON.stringify({
          factory,
          intake,
          subClass,
          buyerAssistant,
          unitPrice: parseFloat(unitPrice) || 0,
          paymentTerms,
          incoTerms,
          documents: poDocuments,
          quantityRows,
          fabricRows,
          selectedTests,
          packSize,
          sizeLabels,
        }),
      });
      if (savedOrder?.id) setSavedPurchaseOrderId(savedOrder.id);
      if (savedOrder?.id) {
        await ModelsApi.saveTestingRequirements(savedOrder.id, selectedTests);
      }
      showGlobalToast("Purchase Order details saved successfully.", "success");
    } catch (err: any) {
      console.warn("Failed to save PO:", err);
      showGlobalToast(err?.message || "Failed to save purchase order.", "error", 6000);
    }
  }

  async function handleDeleteAll() {
    if (confirm("Are you sure you want to delete this purchase order record?")) {
      if (savedPurchaseOrderId) {
        try {
          await ModelsApi.deletePurchaseOrder(savedPurchaseOrderId);
        } catch (error: any) {
          showGlobalToast(error?.message || "Failed to delete purchase order.", "error");
          return;
        }
      }
      router.push(`/models/${modelId}`);
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-8 pb-16 text-gray-200">

        {/* Top Info Grid + Model Image Card */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main 4-Column Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Model No</label>
                <input
                  type="text"
                  value={modelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Factory</label>
                <select
                  value={factory}
                  onChange={(e) => setFactory(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select factory</option>
                  {factoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select season</option>
                  {seasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Intake</label>
                <select
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select intake</option>
                  {intakeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Sub-class</label>
                <select
                  value={subClass}
                  onChange={(e) => setSubClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select subclass</option>
                  {subclassOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Buyer</label>
                <select
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select buyer</option>
                  {buyerOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Buyer Assistant</label>
                <select
                  value={buyerAssistant}
                  onChange={(e) => setBuyerAssistant(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select assistant</option>
                  {buyerAssistantOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Price in $</label>
                <input
                  type="text"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Inco Terms</label>
                <input
                  type="text"
                  value={incoTerms}
                  onChange={(e) => setIncoTerms(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Shipment Type</label>
                <select
                  value={shipmentType}
                  onChange={(e) => setShipmentType(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select shipment type</option>
                  {shipmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">PO Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Order Quantity</label>
                <input
                  type="text"
                  readOnly
                  value={totalOrderQty.toLocaleString()}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs font-bold text-white outline-none cursor-default"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Order Value</label>
                <input
                  type="text"
                  readOnly
                  value={`$${totalOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs font-bold text-teal-300 outline-none cursor-default"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">No. Of Sizes</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={sizeLabels.length}
                  onChange={(e) => handleSizeCountChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Model Image Preview Card */}
          <div className="w-full lg:w-56 shrink-0 flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-400 mb-2 self-start lg:self-center">
              Model Image
            </span>
            <div className="w-full h-56 rounded-2xl border border-gray-800 bg-[#0d1414] p-3 flex items-center justify-center overflow-hidden shadow-md">
              {currentModel?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentModel.image}
                  alt={currentModel.name || "Model"}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-20 h-28 bg-black rounded-lg border border-gray-800 flex items-center justify-center shadow-inner">
                    <span className="font-extrabold text-xs tracking-widest bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                      CHAOS
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2">Tote Bag</span>
                </div>
              )}
            </div>
            {currentModel && <ModelStatusWidget model={currentModel} compact />}
          </div>
        </div>

        {/* ── Section: Quantity Details ───────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white tracking-tight font-serif">
                Quantity Details
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Enter Pack</span>
                <input
                  type="number"
                  value={packSize}
                  onChange={(e) => setPackSize(e.target.value)}
                  className="w-12 rounded border border-gray-800 bg-[#0d1414] px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total Pcs</span>
                <span className="rounded-lg bg-teal-500/10 px-3 py-1 font-mono text-xs font-bold text-teal-300 border border-teal-500/20">
                  {totalOrderQty.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Size Labels Manager */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Size Labels:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {sizeLabels.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-[#0d1414] border border-gray-800 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-400"
                  >
                    {s}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setIsAddSizeOpen(true)}
                  className="rounded border border-dashed border-gray-700 bg-transparent px-2 py-0.5 text-[11px] text-gray-400 hover:border-teal-400 hover:text-white"
                >
                  + Add Size
                </button>
              </div>
            </div>
          </div>

          {/* Add Size Input Popover */}
          {isAddSizeOpen && (
            <div className="flex items-center gap-2 p-3 bg-[#0d1414] rounded-lg border border-gray-800 max-w-sm">
              <input
                type="text"
                placeholder="Size name (e.g. XL, 32, ONE SIZE)"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                className="flex-1 rounded border border-gray-700 bg-black px-2.5 py-1 text-xs text-white outline-none focus:border-teal-400"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="rounded bg-teal-500 px-3 py-1 text-xs font-bold text-black hover:bg-teal-400"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddSizeOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0d1414]/90 shadow-md">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 bg-black/60 text-[11px] font-semibold text-gray-400">
                <tr>
                  <th className="py-3 px-3">PO No</th>
                  <th className="py-3 px-3">DC Type</th>
                  <th className="py-3 px-3">DC Port</th>
                  {sizeLabels.map((s) => (
                    <th key={s} className="py-3 px-3 text-center uppercase">
                      {s}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Total Qty</th>
                  <th className="py-3 px-3 text-center">Price ($)</th>
                  <th className="py-3 px-3">Ex-Factory</th>
                  <th className="py-3 px-3">HOD</th>
                  <th className="py-3 px-3">Sailing</th>
                  <th className="py-3 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {quantityRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/20 transition">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={r.poNo}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, poNo: e.target.value } : row))
                          )
                        }
                        className="w-28 rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={r.dcType}
                          onChange={(e) => setQuantityRows((prev) => prev.map((row) => row.id === r.id ? { ...row, dcType: e.target.value } : row))}
                          className="w-24 rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400 font-sans"
                        >
                          <option value="">Select</option>
                          {dcTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </td>
                    <td className="py-2.5 px-3">
                        <select
                          value={r.dcPort}
                          onChange={(e) => setQuantityRows((prev) => prev.map((row) => row.id === r.id ? { ...row, dcPort: e.target.value } : row))}
                          className="w-24 rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400 font-sans"
                        >
                          <option value="">Select</option>
                          {dcPortOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </td>
                    {sizeLabels.map((s) => (
                      <td key={s} className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={r.sizes[s] ?? 0}
                          onChange={(e) =>
                            handleSizeQtyChange(r.id, s, Number(e.target.value) || 0)
                          }
                          className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs font-bold text-white outline-none focus:border-teal-400"
                        />
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center font-bold text-teal-300">
                      {r.totalQty.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-200">
                      <input
                        type="number"
                        step="0.01"
                        value={r.price}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) =>
                              row.id === r.id ? { ...row, price: parseFloat(e.target.value) || 0 } : row
                            )
                          )
                        }
                        className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={r.exFactory}
                        onChange={(e) => {
                          const nextExFactory = e.target.value;
                          setQuantityRows((prev) => {
                            const nextRows = prev.map((row) => {
                              if (row.id !== r.id) return row;
                              const derivedDates = deriveRowDatesFromExFactory(nextExFactory, row.sailing);
                              return {
                                ...row,
                                exFactory: nextExFactory,
                                sailing: derivedDates.sailing,
                                hod: derivedDates.hod,
                              };
                            });
                            syncPoDateFromRows(nextRows);
                            return nextRows;
                          });
                        }}
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-xs font-mono text-gray-400">{r.hod || "-"}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={r.sailing}
                        onChange={(e) => {
                          const nextSailing = e.target.value;
                          setQuantityRows((prev) =>
                            prev.map((row) => row.id === r.id
                              ? {
                                  ...row,
                                  sailing: nextSailing,
                                  hod: calculateHod(nextSailing),
                                }
                              : row)
                          );
                        }}
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteOrderRow(r.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddOrderRow}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD ORDER
            </button>
          </div>
        </div>

        {/* ── Section: Fabric Details ─────────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <h2 className="text-xl font-bold text-white tracking-tight font-serif">
            Fabric Details
          </h2>

          <div className="space-y-3">
            {fabricRows.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Colour Code
                  </label>
                  <input
                    type="text"
                    value={f.colourCode}
                    placeholder="e.g. BLACK"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, colourCode: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    value={f.fabricType}
                    placeholder="e.g. WOVEN"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, fabricType: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Composition
                  </label>
                  <input
                    type="text"
                    value={f.composition}
                    placeholder="e.g. 100% Cotton"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, composition: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[120px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    GSM
                  </label>
                  <input
                    type="text"
                    value={f.gsm}
                    placeholder="e.g. 280 GSM"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) => (row.id === f.id ? { ...row, gsm: e.target.value } : row))
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => handleDeleteFabric(f.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddFabric}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD FABRIC +
            </button>
          </div>
        </div>

        {/* ── Section: Testing Requirements ───────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight font-serif">Testing Requirements</h2>
                <button type="button" onClick={handleDownloadTestingRequirements} disabled={!selectedTests.length} aria-label="Download testing requirements" title="Download testing requirements" className="rounded-lg bg-teal-500/10 p-2 text-teal-400 hover:bg-teal-500/20 disabled:cursor-not-allowed disabled:opacity-30">
                  <Download size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Define the tests required for this model. These will be available for selection in the Test Report.
              </p>
            </div>
            <button type="button" onClick={openTestingPicker} className="shrink-0 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition">
              ADD TEST
            </button>
          </div>

          {selectedTests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-800 bg-[#0d1414]/50 px-4 py-8 text-center text-xs text-gray-500">
              No testing requirements added yet.
            </div>
          ) : Array.from(new Set(selectedTests.map((test) => test.category))).map((category) => {
            const tests = selectedTests.filter((test) => test.category === category);
            const expanded = expandedTestGroups.includes(category);
            const hasParameter = tests.some((test) => test.parameter);
            const isColourFastness = category === "Colour Fastness";
            const isDimensionalStability = category === "Dimensional Stability";
            const isStretchRecovery = category === "Stretch & Recovery (Knitted)" || category === "Stretch & Recovery (Woven)";
            return (
              <div key={category} className="overflow-hidden rounded-xl border border-gray-800 bg-[#0d1414]/70">
                <button type="button" onClick={() => toggleTestGroup(category)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-800/40">
                  <span className="flex items-center gap-2 text-xs font-bold text-white">
                    <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                    {category}
                    <span className="font-normal text-gray-500">{tests.length} {tests.length === 1 ? "test" : "tests"}</span>
                  </span>
                </button>
                {expanded && (
                  <div className="overflow-x-auto border-t border-gray-800">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-black/50 text-[10px] uppercase text-gray-500">
                        <tr>
                          {!isDimensionalStability && !isStretchRecovery && hasParameter && <th className="px-4 py-2">Parameter</th>}
                          <th className="px-4 py-2">Product</th>
                          {isColourFastness ? <>
                            <th className="px-4 py-2">Colour Change</th>
                            <th className="px-4 py-2">Colour Staining</th>
                            <th className="px-4 py-2">Cross Staining</th>
                          </> : isStretchRecovery ? <>
                            <th className="px-4 py-2">Loading /cm width Strip</th>
                            <th className="px-4 py-2">Loop</th>
                            <th className="px-4 py-2">Growth [%] (Max)</th>
                          </> : <th className="px-4 py-2">Requirement</th>}
                          {!isDimensionalStability && !isStretchRecovery && <th className="px-4 py-2">Test Method</th>}
                          <th className="w-10 px-2 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/70">
                        {tests.map((test) => {
                          const requirementValues = test.requirement.split("/").map((value) => value.trim());
                          return <tr key={test.id}>
                            {!isDimensionalStability && !isStretchRecovery && hasParameter && <td className="px-4 py-3">{test.parameter || "-"}</td>}
                            <td className="px-4 py-3">{test.product || "-"}</td>
                            {isColourFastness ? <>
                              <td className="px-4 py-3">{requirementValues[0] || "-"}</td>
                              <td className="px-4 py-3">{requirementValues[1] || "-"}</td>
                              <td className="px-4 py-3">{requirementValues[2] || "-"}</td>
                            </> : isStretchRecovery ? <>
                              <td className="px-4 py-3">{requirementValues[0] || "-"}</td>
                              <td className="px-4 py-3">{requirementValues[1] || "-"}</td>
                              <td className="px-4 py-3">{requirementValues[2] || "-"}</td>
                            </> : <td className="px-4 py-3">{test.requirement || "-"}</td>}
                            {!isDimensionalStability && !isStretchRecovery && <td className="px-4 py-3">{test.testMethod || "-"}{test.notes ? <div className="mt-1 text-[10px] text-gray-500">{test.notes}</div> : null}</td>}
                            <td className="px-2 py-3 text-center">
                              <button type="button" onClick={() => handleRemoveTest(test.id)} aria-label="Remove test" className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        })}
                      </tbody>
                    </table>
                    {tests.some((test) => test.notes) && <p className="px-4 py-3 text-[10px] text-gray-500">{tests.find((test) => test.notes)?.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Section: PO Documents ───────────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight font-serif">
              PO Documents
            </h2>
            <label className="cursor-pointer rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">
              ADD +
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Documents Box */}
          {poDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0d1414]/50 py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-300">No PO documents yet</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload a purchase order PDF to extract and track PO data
                </p>
              </div>
              <label className="cursor-pointer rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">
                ADD +
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {poDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#0d1414] p-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-teal-400" />
                    <div>
                      <span className="font-bold text-white">{doc.fileName}</span>
                      <span className="text-gray-500 ml-2">({doc.fileSize})</span>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Uploaded on: {doc.uploadDate} {doc.comment && `• ${doc.comment}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      Latest
                    </span>
                    <button
                      type="button"
                      onClick={() => setPoDocuments(poDocuments.filter((d) => d.id !== doc.id))}
                      className="text-gray-500 hover:text-red-400 transition ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Action Bar ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-800">
          <button
            type="button"
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition"
          >
            <Trash2 size={15} /> DELETE
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-5 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="rounded-lg bg-teal-500 px-6 py-2 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg"
            >
              SAVE CHANGES
            </button>
          </div>
        </div>

        {/* ── Modal: Select Tests from Standards ───────────────────────────────── */}
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <div>
                  <h2 className="text-base font-bold text-white">Select Tests from Standards</h2>
                  <p className="mt-1 text-xs text-gray-500">Choose one or more testing variants for this purchase order.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto p-6">
                {Array.from(new Set(AVAILABLE_TESTS.map((test) => test.category))).map((category) => {
                  const tests = AVAILABLE_TESTS.filter((test) => test.category === category);
                  const selectedCount = tests.filter((test) => pendingTestIds.includes(test.id)).length;
                  const expanded = expandedTestGroups.includes(category);
                  const isColourFastness = category === "Colour Fastness";
                  const isDimensionalStability = category === "Dimensional Stability";
                  const isStretchRecovery = category === "Stretch & Recovery (Knitted)" || category === "Stretch & Recovery (Woven)";
                  return (
                    <div key={category} className="overflow-hidden rounded-xl border border-gray-800 bg-black/30">
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <button type="button" onClick={() => toggleTestGroup(category)} className="flex min-w-0 items-center gap-2 text-left text-xs font-bold text-white">
                          <ChevronDown size={15} className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                          <span className="truncate">{category}</span>
                          {selectedCount > 0 && <span className="shrink-0 font-normal text-gray-500">{selectedCount} already added</span>}
                        </button>
                        <button type="button" onClick={() => togglePendingCategory(category)} className="shrink-0 text-[10px] font-bold text-teal-400 hover:text-white">
                          {selectedCount === tests.length ? "CLEAR ALL" : "SELECT ALL"}
                        </button>
                      </div>
                      {expanded && (
                        <div className="overflow-x-auto border-t border-gray-800">
                          <table className="w-full min-w-[720px] text-left text-xs text-gray-300">
                            <thead className="bg-gray-800/40 text-[10px] uppercase text-gray-500">
                              <tr>
                                <th className="w-12 px-4 py-2">Select</th>
                                {!isDimensionalStability && !isStretchRecovery && <th className="px-4 py-2">Parameter</th>}
                                <th className="px-4 py-2">Product</th>
                                {isColourFastness ? <>
                                  <th className="px-4 py-2">Colour Change</th>
                                  <th className="px-4 py-2">Colour Staining</th>
                                  <th className="px-4 py-2">Cross Staining</th>
                                </> : isStretchRecovery ? <>
                                  <th className="px-4 py-2">Loading /cm width Strip</th>
                                  <th className="px-4 py-2">Loop</th>
                                  <th className="px-4 py-2">Growth [%] (Max)</th>
                                </> : <th className="px-4 py-2">Requirement</th>}
                                {!isDimensionalStability && !isStretchRecovery && <th className="px-4 py-2">Test Method</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/70">
                              {tests.map((test) => {
                                const checked = pendingTestIds.includes(test.id);
                                const colourValues = test.requirement.split("/").map((value) => value.trim());
                                return (
                                  <tr key={test.id} onClick={() => togglePendingTest(test.id)} className={`cursor-pointer hover:bg-gray-800/30 ${checked ? "bg-teal-500/10" : ""}`}>
                                    <td className="px-4 py-3"><span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${checked ? "border-teal-400 bg-teal-500 text-black" : "border-gray-700"}`}>{checked ? "✓" : ""}</span></td>
                                    {!isDimensionalStability && !isStretchRecovery && <td className="px-4 py-3">{test.parameter || "-"}</td>}
                                    <td className="px-4 py-3">{test.product || "-"}</td>
                                    {isColourFastness ? <>
                                      <td className="px-4 py-3">{colourValues[0] || "-"}</td>
                                      <td className="px-4 py-3">{colourValues[1] || "-"}</td>
                                      <td className="px-4 py-3">{colourValues[2] || "-"}</td>
                                    </> : isStretchRecovery ? <>
                                      <td className="px-4 py-3">{colourValues[0] || "-"}</td>
                                      <td className="px-4 py-3">{colourValues[1] || "-"}</td>
                                      <td className="px-4 py-3">{colourValues[2] || "-"}</td>
                                    </> : <td className="px-4 py-3">{test.requirement || "-"}</td>}
                                    {!isDimensionalStability && !isStretchRecovery && <td className="px-4 py-3">{test.testMethod || "-"}</td>}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-800 bg-gray-800/40 px-6 py-4">
                <span className="text-xs text-gray-400">{pendingTestIds.length} tests selected</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsTestModalOpen(false)} className="rounded-lg border border-gray-700 px-5 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={commitTestingRequirements} className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-black hover:bg-teal-400">Add {pendingTestIds.length} Tests</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}
