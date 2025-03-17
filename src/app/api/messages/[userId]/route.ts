import {prisma} from "@/lib/prisma"
import { authOptions } from "@/util/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"
import { DeleteRequest } from "@/app/types/DeleteRequest";
 

// allow user to get their messages

//@TODO make the url prettier
interface Params {
    userId: string
}

// runs server side
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

// runs client side

export const DELETE = async (req: Request, { params }: { params: Promise<Params> }) => {
    const { userId } = await params;
  
    let body: DeleteRequest;
  
    try {
      body = await req.json();
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Incorrect JSON body request" },
        { status: 500 }
      );
    }
  
    const session = await getServerSession(authOptions);
  
    if (!session) {
      // not logged in
      return NextResponse.json(
        { error: "Unauthorized request to delete message, you must be logged in" },
        { status: 401 }
      );
    }
  
    if (session?.user.id !== userId || session?.user.id !== body.userId) {
      // logged in but requesting delete another user's message
      return NextResponse.json(
        { error: "Forbidden request to delete message" },
        { status: 403 }
      );
    }
  
    if (!body.messageId || !body.userId) {
      // did not provide the user id or the message id for the message to delete
      return NextResponse.json(
        { error: "Error, missing messageId and userId in JSON request body" },
        { status: 400 }
      );
    }
  
    try {
      const message = await prisma.cipherMessage.delete({
        where: { id: body.messageId, userId: body.userId }
      });
  
      // Return a success response using NextResponse
      return NextResponse.json(
        { message: 'Message deleted successfully', messageId: message.id },
        { status: 200 },
      );
    } catch (error) {
      // Handle the error and return a failure response
      console.error(error);
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }
  };