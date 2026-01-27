"use client";

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
    credentials: "include",
  });

  const authLink = new ApolloLink((operation, forward) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });

    return forward(operation);
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            shipments: {
              keyArgs: ["filter", "sortBy", "sortOrder"],
              merge(_, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });
}

// Export a singleton client for client-side usage
let apolloClientSingleton: ApolloClient | undefined;

export function getApolloClient() {
  if (typeof window === "undefined") {
    // Server-side: always create a new client
    return makeClient();
  }
  // Client-side: reuse the same client
  if (!apolloClientSingleton) {
    apolloClientSingleton = makeClient();
  }
  return apolloClientSingleton;
}
