"use client";

import { createClient, cacheExchange, fetchExchange } from "urql";

export const browserUrqlClient = createClient({
  url: "http://locahost:3000/graphql",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    credentials: "include",
  },
});
