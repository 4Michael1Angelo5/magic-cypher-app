 import { EncryptionInput, EncryptionOutput, CipherType } from "../Encryption/CipherTypes";
import MagicCypher from "../Encryption/MagicCypher";
import { MagicCypherResults } from "@/app/types/MagicCypherResults"; 
 

export const handleDecryption1 =  async (input:EncryptionInput<CipherType>,encryptionKey:number):Promise<MagicCypherResults>=> {
    const startTime  = Date.now();

    let result:EncryptionOutput<CipherType>;

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
            result  = await cipher.runDecryption(input,encryptionKey);
            cipherResult.message = result.value,
            cipherResult.error = false; 
            cipherResult.output = result; 
         }else{
            const cipher = new MagicCypher<"image">(); 
            result  = await cipher.runDecryption(input,encryptionKey);
            cipherResult.message = "decryption performed sucessfully",
            cipherResult.error = false; 
            cipherResult.output = result;
         }

         console.log("result from new class", result);

    }catch(error:unknown){
        
        // if error return error message
        if(error instanceof Error){
            cipherResult.error = true; 
            cipherResult.message = error.message;
            if(input.type === "text"){
                
                cipherResult.output = {type:"text", value: error.message};
            }else{
                cipherResult.output = undefined;
            }
            

        }else{
            cipherResult.error = true; 
            cipherResult.message = "An unknown error occured"
        }
    }finally{
        const endTime = Date.now();
        const elapsedTime = endTime - startTime; 
        cipherResult.cipherStats.time = elapsedTime; 

        return cipherResult
    }
}