import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        token.login = profile.login;
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token;
    },
    async session({ session, token }) {
      // get data from token and add to session

      session.user.username = token.login;
      session.accessToken = token.accessToken

      return session;
    },
  },
};

export default NextAuth(authOptions);