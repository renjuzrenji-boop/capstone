export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'Capstone',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 15000),
  useMockAuth: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
} as const