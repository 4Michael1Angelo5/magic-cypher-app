import { authOptions } from "@/util/authOptions";
import { Session } from "next-auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { AuthUser } from "@/app/types/AuthUser";


// get authUser tries to get the user's id from the database
// 1)
// if it's not in the database or the user is not logged in it returns null 
// this means we have a situation where the either the user is trying to access
// the messages from a certain user but is not logged in. 
// or the user is logged in but for somereason their credentials are not yet saved in the database
// 2) 
// if the user is logged in but their credentials don't match the credentials in the database
// this represents an attempt for another user to access the messages of another which is unauthorized
// 3) if all the above are false we return the successfully authenticated users information

export const getAuthUser = async (): Promise<AuthUser | null> => {

    try {

        const session: Session | null = await getServerSession(authOptions);

        if (!session) {
            // not logged in
            console.warn("Please login first")
            return null;
        }
        const dbUser = await prisma.user.findUnique(
            {
                where: { id: session.user.id },
                select: { id: true, name: true, email: true },
            }
        );

        if (!dbUser) {
            console.warn("Could not find user information from the database")
            // user is logged in but we could not find their credentials in 
            // the database
            return null;
        }

        if( dbUser.id != session.user.id){
            // if for some reason the user id of the current auth session 
            // does not match the id in the database then this represents 
            // an attempt to access another users message which is unauthorized
            const user:AuthUser = {
                id: dbUser.id, // Ensures `id` is always defined
                name: dbUser.name ?? null, // Keep nullable fields explicit
                email: dbUser.email ?? null,
                image: session.user.image ?? null, // Ensure `image` exists
                error:"unauthorized"
            }

            return user;            
        }

        const user:AuthUser = {
            id: dbUser.id, // Ensures `id` is always defined
            name: dbUser.name ?? null, // Keep nullable fields explicit
            email: dbUser.email ?? null,
            image: session.user.image ?? null, // Ensure `image` exists
            error:null
        }

        return user;

    }
    catch (error: unknown) {
        console.error("Error. Failed to retrieve authenticated user:", {
            error: error, 
        });
        return null;
    }

}