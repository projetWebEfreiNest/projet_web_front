export const API_CONFIG = {
  GRAPHQL_URL:
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql",
  REST_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/",
  REQUEST_TIMEOUT: 10000,
  COOKIE_CONFIG: {
    TOKEN_NAME: "token",
    DEFAULT_EXPIRY_DAYS: 7,
    REMEMBER_ME_EXPIRY_DAYS: 30,
  },
} as const;

export const API_URL = API_CONFIG.REST_BASE_URL;
