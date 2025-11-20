export const API_BASE_URL: string =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:9161';

export const APP_NAME = 'Nazr';
export const DEFAULT_PAGE_SIZE = 200;
export const STATS_POLL_MS = 2000;

export const PAGE_SIZE_TIERS = {
  low: 120,
  medium: 200,
  high: 320,
} as const;

