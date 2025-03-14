interface DeleteRequest {
    userId:string;
    messageId:string;
}

export const deleteMessage = async (userId:string, messageId:string):Promise<Response>=>{

    const deleteRequest:DeleteRequest = {userId:userId, messageId:messageId}

    const baseURL = process.env.NEXTAUTH_URL;

    const requestBody = JSON.stringify(deleteRequest)

    const response = await fetch( baseURL+`/api/messages/${userId}`,{
        method:"DELETE",
        headers: {
            "Content-type" : "application/json",
        },
        body:requestBody
    }); 

    if (response.ok) {         
        const data = await response.json();
        return data;
    }else{
        throw new Error("Failed to delete message");
    }
    

}