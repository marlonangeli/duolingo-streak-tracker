import { z } from "zod";

export const cardThemeSchema = z.enum(["duo", "dark", "light", "sunset"]);
export const cardVariantSchema = z.enum([
  "default",
  "compact",
  "minimal",
  "badges",
]);
export const metricKeySchema = z.enum([
  "streak",
  "xp",
  "languages",
  "league",
  "plus",
]);

export const DEFAULT_METRICS = [
  "streak",
  "xp",
  "languages",
  "league",
  "plus",
] as const;

export const cardOptionsSchema = z.object({
  theme: cardThemeSchema.default("duo"),
  variant: cardVariantSchema.default("default"),
  title: z.string().trim().min(1).max(48).optional(),
  langLimit: z.number().int().min(1).max(6).default(3),
  metrics: z.array(metricKeySchema).default([...DEFAULT_METRICS]),
});

export type CardTheme = z.infer<typeof cardThemeSchema>;
export type CardVariant = z.infer<typeof cardVariantSchema>;
export type MetricKey = z.infer<typeof metricKeySchema>;
export type CardOptions = z.infer<typeof cardOptionsSchema>;

const parseNumber = (value: string | null) => {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return undefined;
  }

  return number;
};

export const parseCardOptions = (searchParams: URLSearchParams) => {
  const themeInput = searchParams.get("theme");
  const variantInput = searchParams.get("variant");
  const titleInput = searchParams.get("title");

  const langLimitInput = parseNumber(searchParams.get("langLimit"));

  const metricsInput =
    searchParams
      .get("show")
      ?.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean) ?? [];

  const parsedMetrics = metricsInput
    .map((metric) => metricKeySchema.safeParse(metric))
    .filter((result): result is { success: true; data: MetricKey } =>
      result.success
    )
    .map((result) => result.data);

  const parsedOptions = cardOptionsSchema.safeParse({
    theme: cardThemeSchema.safeParse(themeInput).success
      ? themeInput
      : undefined,
    variant: cardVariantSchema.safeParse(variantInput).success
      ? variantInput
      : undefined,
    title: titleInput ?? undefined,
    langLimit: langLimitInput,
    metrics: parsedMetrics.length > 0 ? parsedMetrics : undefined,
  });

  if (parsedOptions.success) {
    return parsedOptions.data;
  }

  return cardOptionsSchema.parse({});
};
