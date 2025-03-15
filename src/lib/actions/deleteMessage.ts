import {DeleteRequest} from "@/app/types/DeleteRequest" 
import { NextResponse } from "next/server";

export const deleteMessage = async (userId:string, messageId:string):Promise<Response>=>{

    const deleteRequest:DeleteRequest = {userId:userId, messageId:messageId}

    // const baseURL = process.env.NEXTAUTH_URL;

    const requestBody = JSON.stringify(deleteRequest);

    const message = await fetch( `/api/messages/${userId}`,{
        method:"DELETE",
        headers: {
            "Content-type" : "application/json",
        },
        body:requestBody
    }); 
    // console.log("inside deleteMessage: ", response.body)

    if (message.ok) {
        
        return NextResponse.json(
            {message: "Message deleted successfully"},
            {status:200}
        )
         
    }else{
        return NextResponse.json(
            {error: "Failed to delete message"},
            {status:500}

        )
    }
    

}