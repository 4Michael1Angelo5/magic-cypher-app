import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { env } from "@/lib/env";

 export const authOption:NextAuthOptions = {

    providers:[
        GoogleProvider({
            clientId:env.GOOGLE_CLIENT_ID,
            clientSecret:env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret:env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOption);

//Next.js App Router requires these exports for API routes
export {handler as GET, handler as POST};

