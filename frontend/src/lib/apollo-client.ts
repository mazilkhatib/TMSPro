import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
    credentials: "include",
});

const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

export const apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    shipments: {
                        // Merge paginated results
                        keyArgs: ["filter", "sortBy", "sortOrder"],
                        merge(existing, incoming) {
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
