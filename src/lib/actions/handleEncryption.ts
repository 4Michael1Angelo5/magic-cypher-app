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
 

export const handleEncryption =  async (input:EncryptionInput<CipherType>):Promise<MagicCypherResults>=> {
 

    const startTime  = Date.now();

    let result:EncryptionOutput<CipherType>;

    const cipherResult:MagicCypherResults = {
        error:false,
        errorMessage:"",
        cipherStats:{
            messageLength:0,
            time:0,
            encryptionKey:0
            },
        output: {
            type:"text",
            value:""
        }
    }; 

    if(!input.value){
    // don't try to encrypt empy messages or images with no grid inputs
    cipherResult.error = true;

    if(input.type === "text"){  
        cipherResult.error = true;
        cipherResult.errorMessage = "Empty Message";
        return cipherResult
    }else{ 
        cipherResult.error = true;
        cipherResult.errorMessage = "No grid partions"
        return cipherResult
        }
    }

    try{        
        // check programer error
        if(input.type === "text" && typeof(input.value)!= "string"){
            console.error(
                "Programmer error: input type mismatch.\n" +
                "Expected a string for text input.\n" +
                "Check 'page.tsx' in the Home component."
            );
            throw new Error("type mismatch. recieved malformed inputs")
        }
         if(input.type === "image" && typeof(input.value)!= "number"){
            console.error(
                "Programmer error: input type mismatch.\n" +
                "Expected a number (image ID or reference) for image input.\n" +
                "Check 'page.tsx' in the Images folder."
            );
            throw new Error("type mismatch. recieved malformed inputs")
        }

         const cipher = new MagicCypher<typeof input.type>();
         result  = await cipher.runEncryption(input);
         cipherResult.error = false; 
         cipherResult.output = result;  
         cipherResult.cipherStats.encryptionKey = cipher.caluclateMagicConstant(cipher.order) 
         cipherResult.cipherStats.messageLength = input.type === "text" ? input.value.length : input.value;    
         console.log("result from new class", result);

    }catch(error:unknown){
        // if an error was thrown from magicCypher
        console.error(error);

        if ( error instanceof Error){
            
            cipherResult.error = true; 
            cipherResult.errorMessage = error.message

        }else{

            cipherResult.error = true; 
            cipherResult.errorMessage = "An unknown error occured"

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