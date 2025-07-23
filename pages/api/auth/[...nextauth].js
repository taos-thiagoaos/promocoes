import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_AUTH_ID,
      clientSecret: process.env.GITHUB_AUTH_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      session.user.username = token.login;
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = profile.login;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);