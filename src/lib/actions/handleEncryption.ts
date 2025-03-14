"use server"; // this key word / directive tells next.js to run this code serverside 

import MagicCypher from "@/lib/MagicCypher";
import { EncryptionResponse } from "@/app/types/EncryptionResponse";
import { CipherStats } from "@/app/types/CipherStats";


const getKey = (messageLength:number):number =>{

    const N = Math.sqrt(messageLength); 

    return N*(N**2 + 1)/2 ; 
} 


// initialize cipherStats object
const cipherStats:CipherStats = {
    messageLength : 0,
    encryptionKey:  0,
    time: 0,
}

// initialize encryptionResponse object
const encryptionResponse: EncryptionResponse = {
    error: true,
    message:"",
    cipherStats:cipherStats
}


//     function name            params                  return type
const  handleEncryption  = async(message:string) : Promise<EncryptionResponse> =>{
    "use server";  // use this directive to ensure the function runs server side

    
    //create a time stamp for measuring encryption/decryption speed; 
    const startTime:number = Date.now();

 

       // don't process empty messages
       if(!message){

        encryptionResponse.error = true; 
        encryptionResponse.message = "empty message";
        return encryptionResponse
        };


    try{

        const magicCypher = new MagicCypher; 

        const cipher:string =  await magicCypher.encryptMessage(message);
        
        // if the cipher was successful update encryption response object
        encryptionResponse.error = false; 
        encryptionResponse.message = cipher; 
        cipherStats.messageLength = cipher.length; 
        cipherStats.encryptionKey = getKey(cipher.length);
    }
    catch(error:unknown){
        
        // if an error was thrown from magicCypher
        if ( error instanceof Error){
            
            encryptionResponse.error = true; 
            encryptionResponse.message = error.message

        }else{

            encryptionResponse.error = true; 
            encryptionResponse.message = "An unknown error occured"

        }
     
    }
    finally{

        const endTime:number = Date.now(); 
        const elaspedTime:number = endTime - startTime;
        encryptionResponse.cipherStats.time = elaspedTime; 

        return encryptionResponse
    }
 
}

export default handleEncryption;