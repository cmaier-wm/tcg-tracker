import { z } from "zod";

export const upstreamCategorySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string()
});

export const upstreamSetSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  category_id: z.union([z.string(), z.number()]).transform(String).optional(),
  name: z.string(),
  abbreviation: z.string().optional().nullable(),
  release_date: z.string().optional().nullable()
});

export const upstreamCardSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  set_id: z.union([z.string(), z.number()]).transform(String).optional(),
  category_id: z.union([z.string(), z.number()]).transform(String).optional(),
  name: z.string(),
  clean_name: z.string().optional().nullable(),
  collector_number: z.string().optional().nullable(),
  rarity: z.string().optional().nullable(),
  image_url: z.string().optional().nullable()
});

export const upstreamVariationSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  product_id: z.union([z.string(), z.number()]).transform(String),
  language: z.string().optional().nullable(),
  finish: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  market_price: z.number().optional().nullable(),
  updated_at: z.string().optional().nullable()
});

export const holdingPayloadSchema = z.object({
  cardVariationId: z.string().min(1),
  quantity: z.number().int().positive()
});

export const updateHoldingPayloadSchema = z.object({
  quantity: z.number().int().positive()
});

