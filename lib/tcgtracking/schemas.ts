import { z } from "zod";

export const upstreamCategorySchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  products: z.number().optional().nullable(),
  sets: z.number().optional().nullable()
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
  set_name: z.string().optional().nullable(),
  set_abbr: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  collector_number: z.string().optional().nullable(),
  rarity: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  tcgplayer_url: z.string().optional().nullable(),
  finishes: z.array(z.string()).optional().nullable(),
  cardtrader: z
    .array(
      z.object({
        finishes: z.array(z.string()).optional().nullable(),
        languages: z.array(z.string()).optional().nullable(),
        properties: z
          .array(
            z.object({
              name: z.string(),
              default_value: z.union([z.string(), z.boolean()]).optional().nullable(),
              possible_values: z.array(z.union([z.string(), z.boolean()])).optional().nullable()
            })
          )
          .optional()
          .nullable()
      })
    )
    .optional()
    .nullable()
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

export const upstreamPricingSubtypeSchema = z.object({
  low: z.number().optional().nullable(),
  market: z.number().optional().nullable(),
  high: z.number().optional().nullable()
});

export const upstreamPricingProductSchema = z.object({
  tcg: z.record(upstreamPricingSubtypeSchema).optional().nullable(),
  manapool: z.record(z.number()).optional().nullable(),
  mp_qty: z.number().optional().nullable()
});

export const upstreamPricingSetSchema = z.object({
  updated: z.string().optional().nullable(),
  prices: z.record(upstreamPricingProductSchema).optional().nullable()
});

export const upstreamSkuSchema = z.object({
  cnd: z.string().optional().nullable(),
  var: z.string().optional().nullable(),
  lng: z.string().optional().nullable(),
  mkt: z.number().optional().nullable(),
  low: z.number().optional().nullable(),
  hi: z.number().optional().nullable(),
  cnt: z.number().optional().nullable()
});

export const upstreamSkuSetSchema = z.object({
  updated: z.string().optional().nullable(),
  products: z.record(z.record(upstreamSkuSchema)).optional().nullable()
});

export const holdingPayloadSchema = z.object({
  cardVariationId: z.string().min(1),
  quantity: z.number().int().positive()
});

export const updateHoldingPayloadSchema = z.object({
  quantity: z.number().int().positive()
});
