"use client";

import { createClient, cacheExchange, fetchExchange } from "urql";
import { API_CONFIG } from "../const";

// Fonction pour récupérer le token depuis les cookies
const getTokenFromCookies = () => {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies[API_CONFIG.COOKIE_CONFIG.TOKEN_NAME] || null;
};

export const browserUrqlClient = createClient({
  url: API_CONFIG.GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = getTokenFromCookies();
    return {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },
});

export const getUrqlClient = () => browserUrqlClient;
