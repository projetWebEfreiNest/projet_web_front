"use server";
import { createClient, ssrExchange, cacheExchange, fetchExchange } from "urql";

export const ssr = ssrExchange({ isClient: false });

export const serverUrqlClient = createClient({
  url: "http://localhost:3000/graphql",
  exchanges: [cacheExchange, ssr, fetchExchange],
  fetchOptions: {
    credentials: "include",
  },
});
