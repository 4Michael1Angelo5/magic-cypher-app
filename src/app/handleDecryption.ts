"use server"

import { EDGE_RUNTIME_WEBPACK } from "next/dist/shared/lib/constants";
import  { EncryptionResponse } from "./handleEncryption";
import { CipherStats } from "./handleEncryption";

import MagicCypher from "@/lib/MagicCypher";


const getKey = (messageLength:number):number =>{

    const N = Math.sqrt(messageLength); 

    return N*(N**2 + 1)/2 ; 
} 


// initialize cipherStats and encryptionRespnse objects

const cipherStats:CipherStats = {
    time:0,
    messageLength:0,
    encryptionKey:0   
}

const encryptionResponse:EncryptionResponse = {
    message:"",
    error:true,
    cipherStats:cipherStats
}


const handleDecryption= async(message:string , decryptionKey:number):Promise<EncryptionResponse>=>{
    "use server"

    const startTime = Date.now();

    if(!message){
        encryptionResponse.message = "empty message"
        return encryptionResponse; 
    };

    try{
        
        // attempt decryption 
        const magicCypher = new MagicCypher; 
        const cipher:string =  await magicCypher.decryptMessage(message,decryptionKey);
        
        //if successful update encryption response
        encryptionResponse.error = false; 
        encryptionResponse.message = cipher; 

        encryptionResponse.cipherStats.messageLength = cipher.length; 
        encryptionResponse.cipherStats.encryptionKey = getKey(cipher.length);
        
    }
    catch(error:any){

        // if error return error message
        encryptionResponse.error = true; 
        encryptionResponse.message = error.message; 
    }
    finally{
        
        // update time
        const endTime:number = Date.now(); 
        const elaspedTime:number = endTime - startTime;
        encryptionResponse.cipherStats.time = elaspedTime; 
        
        //return encryption response
        return encryptionResponse
    }


}


export default handleDecryption;