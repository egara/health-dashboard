import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Permisos (scopes) para la nueva Google Health API (Fitbit data)
          scope: "openid email profile https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Guarda el Access Token inicial de Google cuando el usuario se loguea
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Pasa el token a la sesión para que podamos usarlo al consultar la API de Google Health
      session.accessToken = token.accessToken
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
