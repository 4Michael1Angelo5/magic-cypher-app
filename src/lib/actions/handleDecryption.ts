"use server"
import { EncryptionInput, EncryptionOutput, CipherType } from "../Encryption/CipherTypes";
import MagicCypher from "../Encryption/MagicCypher";
import { MagicCypherResults } from "@/app/types/MagicCypherResults"; 

// handles requests for decryption
// returns undefined cipherResults.ouput if...
//  1) Encryption fails inside MagicCypher 
//      a) key validation fails  - (user error)
//      c) cipher inputs are not valid ie (not a square number for texts)
//      b) decryption logic fails - (programer error)
//  2) Recieves type mismatched inputs - (programer error)
//  3) Invalid decryption requests ie empty message (user error); 

// handleDecryption's job is to return user related errors
// so that useEncryptionForm hook can display these errors to 
// CipherResults Component. 
// and to console.error(programmer errors); 

// otherwise if decryption is succesful 
// handleDecryption's job is to return the decryption results

export const handleDecryption =  async (input:EncryptionInput<CipherType>,encryptionKey:number):Promise<MagicCypherResults>=> {
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

        // attempt decryption 

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
            throw new Error("type mismatch. recieved malformed inputs");
        }

        if(input.type === "text"){
            console.log(input)
            const n = input.value.length;
            const N = Math.sqrt(n);
            console.log(N);
            console.log(N*(N**2+1)/2)
            console.log(encryptionKey)
        }

        const cipher = new MagicCypher<typeof input.type>();
        result = await cipher.runDecryption(input, encryptionKey);
        cipherResult.output = result;

        console.log("result from new class", result);

    }catch(error:unknown){
        // this should catch any errors thrown from MagicCypher
        // and log them in errorMessage field to display to user ... 
        // but some of the errors it may throw are really only errors that the 
        // programer should see ... need to think about how to handle that...
        
        // if error return error message
        if(error instanceof Error){
            cipherResult.error = true; 
            cipherResult.errorMessage = error.message;
        
        }else{
            cipherResult.error = true; 
            cipherResult.errorMessage = "An unknown error occured"
        }
    }finally{
        const endTime = Date.now();
        const elapsedTime = endTime - startTime; 
        cipherResult.cipherStats.time = elapsedTime; 

        return cipherResult
    }
}