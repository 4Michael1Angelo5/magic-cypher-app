import { error } from "console";
import { EncryptionInput, EncryptionOutput, CipherType } from "../Encryption/CipherTypes";
import MagicCypher from "../Encryption/MagicCypher";
import { MagicCypherResults } from "@/app/types/MagicCypherResults";

const getKeyForImage = (N:number):number=>{
    // N = grid partitions
    return  N*(N**2+1)/2   
}

const getKeyForText = (messageLength:number):number=>{
    const N = Math.floor(Math.sqrt(messageLength)); 

    return N*(N**2+1)/2
}
 

export const handleEncryption1 =  async (input:EncryptionInput<CipherType>):Promise<MagicCypherResults>=> {

    const startTime  = Date.now();

    let result:EncryptionOutput<CipherType>
    let cipherResult:MagicCypherResults = {
        error:true,
        message:"",
        cipherStats:{
            messageLength:0,
            time:0,
            encryptionKey:0
            },
        output: undefined
    }; 

    try{

        if(input.type === "text" && typeof(input.value)!= "string"){
            throw new Error("type mismatch. recieved malformed inputs")
        }
         if(input.type === "image" && typeof(input.value)!= "number"){
            throw new Error("type mismatch. recieved malformed inputs")
        }

         if(input.type==="text"){
            const cipher = new MagicCypher<"text">(); 
            result  = await cipher.runEncryption(input);
            cipherResult.message = result.value,
            cipherResult.error = false; 
            cipherResult.output = result; 
         }else{
            const cipher = new MagicCypher<"image">(); 
            result  = await cipher.runEncryption(input);
            cipherResult.message = "encryption performed successfuly",
            cipherResult.error = false; 
            cipherResult.output = result;
         }

         console.log("result from new class", result);

    }catch(error:unknown){
        // if an error was thrown from magicCypher
        console.error(error);

        if ( error instanceof Error){
            
            cipherResult.error = true; 
            cipherResult.message = error.message

        }else{

            cipherResult.error = true; 
            cipherResult.message = "An unknown error occured"

        }

    }finally{
        // update cipher stats
        if(input.type === "text"){
            cipherResult.cipherStats.messageLength = input.value.length; 
            cipherResult.cipherStats.encryptionKey = getKeyForText(input.value.length); 
            
        }else{
            // really more like grid partitions - need to rename theis field 
            cipherResult.cipherStats.messageLength = input.value
            cipherResult.cipherStats.encryptionKey = getKeyForImage(input.value);
        }
        const endTime = Date.now();
        const elapsedTime = endTime - startTime; 
        cipherResult.cipherStats.time = elapsedTime; 
         

        return cipherResult
    }
}