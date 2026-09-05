"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Camera, ChevronRight, Upload, X } from "lucide-react";
import { ModelCard } from "@/components/cards/ModelCard";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import { uploadFile } from "@/lib/storage";
import type { Model, ModelStatus } from "../../../../types/model";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-black py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400/60";

export default function BrandModelsPage() {
  const params = useParams();
  const brandId = (params?.id as string) || "";
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [modelList, setModelList] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModelCode, setNewModelCode] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelImage, setNewModelImage] = useState("");
  const [newModelFile, setNewModelFile] = useState<File | null>(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [createModelError, setCreateModelError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    code: "",
    name: "",
    category: "",
    status: "Pending" as ModelStatus,
    daysToHandover: 0,
  });

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        setLoading(true);
        const [brandData, modelsData] = await Promise.all([
          BrandsApi.getById(brandId),
          ModelsApi.getByBrand(brandId),
        ]);
        setBrand(brandData);
        setModelList(modelsData as Model[]);
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [brandId]);

  const brandModels = useMemo(
    () =>
      modelList
        .filter((model) =>
          [model.code, model.name, model.category]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        ),
    [modelList, query],
  );

  const selectedModel = modelList.find((model) => model.id === selectedModelId) ?? null;

  useEffect(() => {
    if (selectedModel) {
      setDraft({
        code: selectedModel.code,
        name: selectedModel.name,
        category: selectedModel.category || "",
        status: selectedModel.status,
        daysToHandover: selectedModel.daysToHandover || 0,
      });
    }
  }, [selectedModel]);

  function toggleEditMode() {
    setEditMode((prev) => {
      const next = !prev;
      if (!next) setSelectedModelId(null);
      return next;
    });
  }

  async function saveModel() {
    if (!selectedModelId) return;
    const updates = {
      code: draft.code.trim(),
      name: draft.name.trim(),
      category: draft.category.trim(),
      status: draft.status,
      daysToHandover: Number(draft.daysToHandover) || 0,
    };
    await ModelsApi.update(selectedModelId, updates);
    setModelList((prev) =>
      prev.map((model) =>
        model.id === selectedModelId
          ? {
              ...model,
              ...updates,
            }
          : model,
      ),
    );
    setEditMode(false);
    setSelectedModelId(null);
  }

  async function deleteModel() {
    if (!selectedModelId) return;
    if (!window.confirm("Delete this model?")) return;
    await ModelsApi.delete(selectedModelId);
    setModelList((prev) => prev.filter((model) => model.id !== selectedModelId));
    setSelectedModelId(null);
    setEditMode(false);
  }

  function handleNewModelImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNewModelFile(file);
    setNewModelImage(URL.createObjectURL(file));
  }

  async function createModel() {
    const code = newModelCode.trim();
    if (!code) {
      setCreateModelError("Model code is required.");
      return;
    }
    setCreateModelError(null);
    setIsCreatingModel(true);
    try {
      const imageUrl = newModelFile ? await uploadFile("models", code, newModelFile) : "";
      const created = await ModelsApi.create({
        id: code,
        brandId,
        code,
        name: newModelName.trim() || code,
        category: "Apparel",
        image: imageUrl,
        status: "Pending",
        daysToHandover: 14,
        factory: "NANDHI FABRICS",
      });
      setModelList((prev) => [created as Model, ...prev]);
      setIsCreateModalOpen(false);
      setNewModelCode("");
      setNewModelName("");
      setNewModelImage("");
      setNewModelFile(null);
    } catch (error: any) {
      setCreateModelError(error?.message || "Failed to create model.");
    } finally {
      setIsCreatingModel(false);
    }
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/brands" className="transition-colors hover:text-teal-400">
            Brands
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">{brand?.name ?? brandId.toUpperCase()}</span>
        </>
      }
    >
      {/* Top action controls & Search */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsCreateModalOpen(true)} className="btn">
            Create model
          </button>
          <button
            type="button"
            onClick={toggleEditMode}
            className={editMode ? "btn-outline-active" : "btn-outline"}
          >
            Edit model
          </button>
        </div>

        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models"
            className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-teal-400/60"
          />
        </div>
      </div>

      {editMode ? (
        <p className="mb-4 text-sm text-gray-400">Select a model to rename or delete it.</p>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8">
          <div role="dialog" aria-modal="true" aria-labelledby="create-model-title" className="relative w-full max-w-[560px] rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-7 shadow-2xl sm:p-8">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} aria-label="Close create model dialog" className="absolute right-5 top-5 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 id="create-model-title" className="mb-7 text-2xl font-bold text-gray-200">Create Model</h2>
            {createModelError ? <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">{createModelError}</div> : null}
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-base font-semibold text-gray-200">Model Code</span>
                <input autoFocus value={newModelCode} onChange={(event) => setNewModelCode(event.target.value)} placeholder="e.g. 006GS" className="h-12 w-full rounded-xl border border-[#00BFA5] bg-[#1a1a1a] px-4 text-base text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#00BFA5]/30" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-base font-semibold text-gray-200">Name (optional)</span>
                <input value={newModelName} onChange={(event) => setNewModelName(event.target.value)} placeholder="e.g. Zebra Print Pants" className="h-12 w-full rounded-xl border border-teal-500/50 bg-[#1a1a1a] px-4 text-base text-white outline-none placeholder:text-gray-500 focus:border-[#00BFA5]" />
              </label>
              <div>
                <span className="mb-1.5 block text-base font-semibold text-gray-200">Model Image</span>
                <label className="relative flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-teal-500/50 bg-[#1a1a1a] hover:border-[#00BFA5]">
                  {newModelImage ? <Image src={newModelImage} alt="Model preview" width={480} height={176} unoptimized className="h-full max-w-full object-contain p-3" /> : <><Upload size={28} className="text-gray-500" /><span className="mt-2 text-sm text-gray-500">Click to upload</span></>}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleNewModelImage} />
                </label>
              </div>
              <button type="button" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()} className="inline-flex items-center gap-2 rounded-full bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#0cae9d]">ADD <Camera size={16} /></button>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-full border border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white">Cancel</button>
              <button type="button" onClick={createModel} disabled={isCreatingModel || !newModelCode.trim()} className="rounded-full bg-[#00BFA5] px-7 py-2.5 text-sm font-bold text-black hover:bg-[#0cae9d] disabled:cursor-not-allowed disabled:opacity-40">{isCreatingModel ? "Creating..." : "Create"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {editMode && selectedModel ? (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Edit model</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Model ID</label>
              <input
                value={draft.code}
                onChange={(e) => setDraft((prev) => ({ ...prev, code: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Model name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Category</label>
              <input
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as ModelStatus }))}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Days to handover</label>
              <input
                type="number"
                min={0}
                value={draft.daysToHandover}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, daysToHandover: Number(e.target.value) }))
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveModel} className="btn px-5 py-2 font-semibold">
              Save changes
            </button>
            <button type="button" onClick={deleteModel} className="delete-btn" title="Delete model">
              🗑
            </button>
            <button
              type="button"
              onClick={() => setSelectedModelId(null)}
              className="btn-outline px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3">
        {brandModels.length > 0 ? (
          brandModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selectable={editMode}
              selected={selectedModelId === model.id}
              onSelect={() => setSelectedModelId(model.id)}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-700 bg-gray-900 py-12 text-center text-gray-400">
            No models match your search.
          </div>
        )}
      </div>
    </SourcingShell>
  );
}
