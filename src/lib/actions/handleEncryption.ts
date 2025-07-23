"use server"; // this key word / directive tells next.js to run this code serverside 

import MagicCypher from "@/lib/MagicCypher";
import { MagicCypherResults } from "@/app/types/MagicCypherResults";
import { CipherStats } from "@/app/types/CipherStats";
import { handleEncryption1 } from "./handleNewEncryption";
import { EncryptionInput } from "../Encryption/CipherTypes";


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

// initialize encryptionResults object
const encryptionResults: MagicCypherResults = {
    error: true,
    message:"",
    cipherStats:cipherStats
}


//     function name            params                  return type
const  handleEncryption  = async(message:string) : Promise<MagicCypherResults> =>{
    "use server";  // use this directive to ensure the function runs server side

    
    //create a time stamp for measuring encryption/decryption speed; 
    const startTime:number = Date.now(); 

       // don't process empty messages
       if(!message){

        encryptionResults.error = true; 
        // there is a weird scenario where encryptionResults has an error
        // but inorder to display it to the user I need to setHasError to false
        // and change message to the error - that is ass backwards!
        encryptionResults.message = "empty message";
        return encryptionResults
        };


    try{

        const magicCypher = new MagicCypher; 

        const cipher:string =  await magicCypher.encryptMessage(message);
        
        // if the cipher was successful update encryption response object
        encryptionResults.error = false; 
        encryptionResults.message = cipher; 
        cipherStats.messageLength = cipher.length; 
        cipherStats.encryptionKey = getKey(cipher.length);
    }
    catch(error:unknown){
        
        // if an error was thrown from magicCypher
        if ( error instanceof Error){
            
            encryptionResults.error = true; 
            encryptionResults.message = error.message

        }else{

            encryptionResults.error = true; 
            encryptionResults.message = "An unknown error occured"

        }
     
    }
    finally{

        const endTime:number = Date.now(); 
        const elaspedTime:number = endTime - startTime;
        encryptionResults.cipherStats.time = elaspedTime; 

        return encryptionResults
    }
 
}

export default handleEncryption;