"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ModelCard } from "@/components/cards/ModelCard";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
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
          <Link href={`/createmodel?brandId=${brandId}`} className="btn">
            Create model
          </Link>
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
