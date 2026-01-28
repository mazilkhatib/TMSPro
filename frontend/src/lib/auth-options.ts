
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    token
                    user {
                      id
                      email
                      name
                      role
                    }
                  }
                }
              `,
                            variables: {
                                input: {
                                    email: credentials.email,
                                    password: credentials.password,
                                },
                            },
                        }),
                    });

                    const data = await res.json();

                    if (data.errors || !data.data?.login) {
                        throw new Error(data.errors?.[0]?.message || "Login failed");
                    }

                    const { token, user } = data.data.login;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        accessToken: token, // Rename to accessToken for clarity
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token && session.user) {
                session.accessToken = token.accessToken as string;
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
