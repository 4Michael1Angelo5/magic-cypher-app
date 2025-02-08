"use server"; // this key word / directive tells next.js to run this code serverside 

export interface EncryptionResponse {
    error: boolean;
    message:string;
}

import MagicCypher from "@/lib/MagicCypher";

//     function name            params                  return type
const  handleEncryption  = async(message:string) : Promise<EncryptionResponse> =>{
    "use server";  // use this directive to ensure the function runs server side

    if(!message){return {error:true,message:"empty message"}};

    try{
        const magicCypher = new MagicCypher; 

        const cipher:string =  await magicCypher.encryptMessage(message);

        return {error:false,message:cipher};
    }
    catch(error:any){
        //is error going to be a string? 
    
        return {error:true,message:error.message}
    }
}

export default handleEncryption;