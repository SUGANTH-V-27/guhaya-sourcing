import { useState, useEffect, useCallback } from "react";
import { modelService } from "../services/model.service";
import { Model } from "../types/model";

export function useModels(brandId?: string) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelService.getModels(brandId);
      setModels(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const createModel = useCallback(async (model: Partial<Model>) => {
    const created = await modelService.createModel(model);
    setModels((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateModel = useCallback(async (id: string, updates: Partial<Model>) => {
    const updated = await modelService.updateModel(id, updates);
    if (updated) {
      setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    }
    return updated;
  }, []);

  const deleteModel = useCallback(async (id: string) => {
    await modelService.deleteModel(id);
    setModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    models,
    loading,
    error,
    refresh: fetchModels,
    createModel,
    updateModel,
    deleteModel,
  };
}

export default useModels;
