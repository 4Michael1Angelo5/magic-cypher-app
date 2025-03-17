import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github"; 
import { PrismaAdapter } from "@auth/prisma-adapter";
import {prisma} from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers:[
        GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string, 
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
            authorization: { params: { timeout: 10000 } } // Increase timeout
        }),     
        Google({
            clientId:process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string
        }) 
    ], 
    debug:true,
    //connect NextAuth with prisma adapter so that
    // we can store information about the user in Neon DB
    adapter:PrismaAdapter(prisma), // use prisma adapter
    
    //environment variables used to authenticate requests from client origin
    secret: process.env.AUTH_SECRET,

    // modify authentication flow to return userId so we can associate 
    // unique user Id's with messages they encrypt
    callbacks: {


        // user ID to associate cipher messages with the correct user.
        async session({ session,user}) {
            if (session.user) {
                session.user.id = user.id as string;
            }

            return session;
        },


    }
}