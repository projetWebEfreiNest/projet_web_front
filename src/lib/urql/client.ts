"use client";

import { createClient, cacheExchange, fetchExchange } from "urql";
import { API_CONFIG } from "../const";

export const browserUrqlClient = createClient({
  url: API_CONFIG.GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    credentials: "include",
  },
});

export const getUrqlClient = () => browserUrqlClient;
