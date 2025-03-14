 
import { JSONcipherRequest } from "@/app/types/JSONcipherResponse"


export const postMessage = async(data: JSONcipherRequest): Promise<Response>=> {

    const requestBody:JSONcipherRequest  = data;
 
        const response = await fetch("/api/messages", {
            method:"POST",
            headers: {
                "Content-type" : "application/json",
            },
            body: JSON.stringify(requestBody)
        })
        return response
}