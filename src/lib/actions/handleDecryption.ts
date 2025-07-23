"use server"

import  { MagicCypherResults } from "@/app/types/MagicCypherResults";
import { CipherStats } from "@/app/types/CipherStats"

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

const encryptionResponse:MagicCypherResults = {
    message:"",
    error:true,
    cipherStats:cipherStats
}


const handleDecryption= async(message:string , decryptionKey:number):Promise<MagicCypherResults>=>{
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
    catch(error:unknown){

        // if error return error message

        if(error instanceof Error){
            encryptionResponse.error = true; 
            encryptionResponse.message = error.message; 
            encryptionResponse.output = {type:"text",value:error.message}

        }else{
            encryptionResponse.error = true; 
            encryptionResponse.message = "An unknown error occured"
            encryptionResponse.output = {type:"text", value:"An unknown error occured"}
        }
      
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