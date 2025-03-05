import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github"; 
 

export const authOptions: NextAuthOptions = {
    providers:[
        GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string, 
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
        })
    ],
   
    
    secret: process.env.AUTH_SECRET,
}