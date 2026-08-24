import type { Brand } from "../../types/brand";
import type { Model } from "../../types/model";

/**
 * Default empty collections for initial production state.
 * Data is dynamically fetched and stored in Supabase / PostgreSQL database.
 */
export const brands: Brand[] = [];
export const models: Model[] = [];
