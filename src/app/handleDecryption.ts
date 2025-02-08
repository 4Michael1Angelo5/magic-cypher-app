"use server"

import  { EncryptionResponse } from "./handleEncryption";

import MagicCypher from "@/lib/MagicCypher";


const handleDecryption= async(message:string , decryptionKey:number):Promise<EncryptionResponse>=>{
    "use server"

    if(!message){return {error:true,message:"empty message"}};

    try{

        const magicCypher = new MagicCypher; 

        const cipher:string =  await magicCypher.decryptMessage(message,decryptionKey);

        return {error:false,message:cipher};
    }
    catch(error:any){
        //is error going to be a string? 
    
        return {error:true,message:error.message}
    }


}


export default handleDecryption;