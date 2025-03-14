import {prisma} from "@/lib/prisma"
import { authOptions } from "@/util/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"
 

// allow user to get their messages

//@TODO make the url prettier
interface Params {
    userId: string
}
export const GET = async (req: Request, { params }: { params: Promise<Params> }) => {

     const {userId}  = await params

    // 1:
    // (req: Request, { params }: { params: Params }) ... why does this cause an error?
    // 2 : (req: Request, params: Promise<Params>) then const {userId} = await params why does this work?
    // 3:  (req: Request,  params: Params ) ... why does this work?  
    // 4: all of the above fail production build ... use this:
    // (req: Request, { params }: { params: Promise<Params> })

    // see docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments
 

    try {
        const messages = await prisma.cipherMessage.findMany({
            where: { userId: userId},
            orderBy: {createdAt:"desc"}
        });

        return NextResponse.json(messages);

    } catch ( error ){
        console.error(error)
        return NextResponse.json({error: "Failed to fetch messages"},{status:500})
    }
}

interface DeleteRequest {
    userId:string;
    messageId:string;
}

export const DELETE = async (req: Request, { params }: { params: Promise<Params> })=>{

    const {userId}  =  await params;

    let body:DeleteRequest

    try{
        body =  await req.json();
    }catch(error){
        console.error(error)
        return new Response(JSON.stringify({error: "Incorrect JSON body request"}),{
            status:500,
            headers: {"Content-Type" : "application/json"},
        });
    }

    const session = await getServerSession(authOptions);

    if(!session){
        // not logged in
        return new Response(JSON.stringify({error: "Unathorized request to delete message, you must be logged in"}),{
            status:401,
            headers: {"Content-Type" : "application/json"},
        });
    }

    if (session?.user.id != userId || session?.user.id != body.userId) {
        // logged in but requesting delete another users message

        return new Response(JSON.stringify({error: "Forbidden request to delete message"}),{
            status:403,
            headers: {"Content-Type" : "application/json"},
        });
    }

    if(!body.messageId || !body.userId){
        // did not provide the user id or the message id for the message to delete         
        return new Response(JSON.stringify({error: "Error, missing messageId and userId in JSON request body"}),{
            status:400,
            headers: {"Content-Type" : "application/json"},
        });
    }

 
    try{
        const message = await prisma.cipherMessage.delete({
            where: {id:body.messageId , userId:body.userId}
        })
        console.log(message)

       // Return a success response
       return new Response(JSON.stringify({ message: 'Message deleted successfully' }), {
        status: 200,
        });
        
    } catch (error) {
        // Handle the error and return a failure response
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to delete message: '}), {
            status: 500,
        });
    }
};

 