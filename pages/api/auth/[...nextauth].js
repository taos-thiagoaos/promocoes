
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isDev } from '@/lib/helpers';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_AUTH_ID,
      clientSecret: process.env.GITHUB_AUTH_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    ...(isDev ? [
      CredentialsProvider({
        name: "Dev Login",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        },
        async authorize(credentials) {
          if (credentials?.email) {
            return {
              id: credentials.email,
              name: credentials.email.split('@')[0],
              email: credentials.email,
              login: credentials.email.split('@')[0],
              image: null,
              isDev: true,
            };
          }
          return null;
        },
      })
    ] : [])
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, profile, account, user }) {
      if (profile) {
        token.login = profile.login || profile.email?.split('@')[0];
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user?.isDev) {
        token.login = user.login;
        token.isDev = true;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.username = token.login;
      session.accessToken = token.accessToken;
      if (token.isDev) session.user.isDev = true;
      return session;
    },
  },
};

export default NextAuth(authOptions);