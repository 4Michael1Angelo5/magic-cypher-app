 
import { Message } from "@/app/types/Message"

export const getMessages = async (userId:string):Promise<Message[]>=>{

    // @TODO    
    // this needs to be done because the components that are calling this function run server side
    // note that need production you will have to define base url variable accross differnt .env files
    // eg: .env.production, .env.local, .env.development etc. 

    const baseURL = process.env.NEXTAUTH_URL;

    const response = await fetch( baseURL+`/api/messages/${userId}`,{
        method:"GET",
        headers: {
            "Content-type" : "application/json",
        },
    }); 

    if (response.ok) {         
        const data = await response.json();
        return data;
    }else{
        throw new Error("Failed to fetch messages");
    }
}