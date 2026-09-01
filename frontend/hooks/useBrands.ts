import { useState, useEffect, useCallback } from "react";
import { brandService } from "../services/brand.service";
import { Brand } from "../types/brand";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await brandService.getBrands();
      setBrands(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(async (brand: Partial<Brand>) => {
    const created = await brandService.createBrand(brand);
    setBrands((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateBrand = useCallback(async (id: string, updates: Partial<Brand>) => {
    const updated = await brandService.updateBrand(id, updates);
    if (updated) {
      setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    }
    return updated;
  }, []);

  const deleteBrand = useCallback(async (id: string) => {
    await brandService.deleteBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    brands,
    loading,
    error,
    refresh: fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}

export default useBrands;
