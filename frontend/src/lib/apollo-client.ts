"use client";

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { getSession } from "next-auth/react";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
    credentials: "include",
  });

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      getSession()
        .then((session) => {
          const token = session?.accessToken;

          operation.setContext({
            headers: {
              authorization: token ? `Bearer ${token}` : "",
            },
          });

          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };

          forward(operation).subscribe(subscriber);
        })
        .catch((err) => {
          observer.error(err);
        });
    });
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

// Need to import Observable for the above logic
import { Observable } from "@apollo/client/utilities";

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
