export const MIN_PUBLIC_BETA_AGE = 18;

export const PILOT_REGION = "Comunidad de Madrid";

export const SUPPORTED_MODALITIES = [
  "football_11",
  "football_7",
  "futsal"
] as const;

export const SUPPORTED_GENDERS = ["male", "female"] as const;

export type SupportedModality = (typeof SUPPORTED_MODALITIES)[number];
export type SupportedGender = (typeof SUPPORTED_GENDERS)[number];
