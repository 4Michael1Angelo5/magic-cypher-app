import { useState, useCallback } from "react";
import { CipherStats } from "@/app/types/CipherStats";
// import { EncryptionInput } from "../types/EncryptionInput";
// import { EncryptionOutput } from "../types/EncryptionOutput";
import { CipherType, EncryptionInput, EncryptionOutput } from "@/lib/Encryption/CipherTypes";
 
import { Session } from "next-auth";
import handleDecryption from "@/lib/actions/handleDecryption";
import handleEncryption from "@/lib/actions/handleEncryption";
import { postMessage } from "@/lib/actions/postMessage";

// server reqquest /response types
import { MagicCypherResults } from "@/app/types/MagicCypherResults";
import { JSONcipherRequest } from "@/app/types/JSONcipherResponse";

// testers
import { handleEncryption1 } from "@/lib/actions/handleNewEncryption";
import {handleDecryption1} from "@/lib/actions/handleDecryption1";
 

// useEncryptionForm custom hook's purpose is to reuse stateful logic across 
// multiple components that use the same encryption form user interface
export const useEncryptionForm = ( initialInput:EncryptionInput<CipherType> = {type: "text", value:""} ,
                                    initialOutput:EncryptionOutput<CipherType> = {type:"text",value:""}
    
                                 )=>{
    const [hasError,setHasError] = useState<boolean>(true);

    const [cipherInput,setCipherInput] = useState<EncryptionInput<CipherType>>(initialInput);    
    const [cipherOutput,setCipherOutput] = useState<EncryptionOutput<CipherType>>(initialOutput);

    const [loading,setLoading] = useState<boolean>(false); 
    const [isEncrypting,setEncrypting] = useState<boolean>(true);
    const [decryptionKey,setDecryptionKey] = useState<number>(0); 
    const [cipherStats , setCipherStats] = useState<CipherStats|null>(null);
    const [isCopied, setCopied] = useState<boolean>(false);
    

    const resetForm = () => {
        setCipherInput(initialInput); 
    };

    const handleKeyInput = (event:React.ChangeEvent<HTMLInputElement>)=>{
      event.preventDefault();
      const value = event.target.value;
  
      // Only update the key if the value is a valid number or empty (cleared by user)
      if (value === "" || !isNaN(Number(value))) {
        setDecryptionKey(value === "" ? 0 : Number(value));  // Reset to 0 if empty, else update key
      }
    }

    const handleSubmit = useCallback(async (
                                    event: React.FormEvent<HTMLFormElement>,  
                                    auth: {session: Session | null, sessionStatus: "authenticated" | "loading" | "unauthenticated" }                               
                                  )
                                :Promise<void> => {

      //prevent default form submission behavior which causes the entire page to reload
      event.preventDefault();  // yes belongs in handle submit
 

      setLoading(true);

      const startTime = Date.now();
      
      //initialize and define type
      let cipherResults:MagicCypherResults; 
      // contains stats
      // message field 
      // optional output field which is the real payload 
      // and time it took to cipher 

      // used for sending requests to server to store ciphers in DB
      let cipherRequest:JSONcipherRequest;

      try{

        if(isEncrypting){

            // user is trying to encrypt a text message 
            if(cipherInput.type === "text"){
                cipherResults = await handleEncryption(cipherInput.value); // this method does leaves the outputfield blank
                cipherResults.output = {type:"text",value:cipherResults.message}

                const abstractClassResults = await handleEncryption1(cipherInput); 

                if(cipherResults.output.value  != abstractClassResults.output?.value){
                  cipherResults.error = true;
                  console.error("the two classes produced different results")
                  console.error("abstract class results: ", abstractClassResults.output?.value); 
                  console.error("working class results: ", cipherResults.output?.value)
                }else{
                  console.log("success both the abstract class and existing MagicCypher class produced the same output for input type `text` ")
                }
                 
            }
            else{              
            // user is trying to encrypt an image

                const result = await handleEncryption1(cipherInput);    // this method does not leave the output field blank
                // the goal is replace all the handleEncryption's with handleEncryption1's 
                // then port everything to new handler then do the same for handle decryptions
                console.log("inside custom hook, result from handleEncryption1")
                console.log(result)
                cipherResults = result; 

            }

        }else{
          // user is trying to decrypt 

            if(cipherInput.type === "text"){
              // user is trying to decrypt a text message

                cipherResults = await handleDecryption(cipherInput.value,decryptionKey);
                cipherResults.output = {type:"text",value:cipherResults.message}
 

                  console.log("testing new class handleDecryption1 results against handleDecrpptino's results:");
                                     
          
                    const cipherResultsFromNewClass = await handleDecryption1(cipherInput,decryptionKey);

                    // console.log(cipherResults.output.value); 
                    // console.log(cipherResultsFromNewClass.output?.value); 
                    // console.log(cipherResults.output.value === cipherResultsFromNewClass.output?.value)
            
                    
                    if(cipherResultsFromNewClass.output?.value != cipherResults.output.value){
                      console.error("GenericMagicCypher class produced different  decryption results  from orignal class for text ciphers \n" +
                        "or there is a mix up in cipherResults assignment in the useEncryptionForm hook or handleDecryption1 or handleDecryption handling of class outputs");
                      console.log("generic class: ",cipherResultsFromNewClass);
                      console.log("old class",cipherResults);
                      throw new Error("GenericMagicCypher class produced decryption results from orignal class for text ciphers \n" +
                        "or there is a mix up in cipherResults assignment in the useEncryptionForm hook"
                      );

                    }else{
                      console.log("Sucess! Both MagicCypher classes produced the same decryption results!")
                    }
            

               
    
            }else{
              // user is trying to decrypt an image
 
                  const cipherResultsFromNewClass = await handleDecryption1(cipherInput,decryptionKey);
                  console.log("odd image decryption request") 
                  console.log("new class results from handleEncryption1 called by use encryptionForm: ",cipherResultsFromNewClass);
                  cipherResults = cipherResultsFromNewClass;
                  cipherResults.error = cipherResultsFromNewClass.error;

                } 
               
        }

        console.log("inside use form hook, cipher output:", cipherResults)


        setCipherStats(cipherResults.cipherStats);  
        // setCipherOutput({type:"text" ,value:cipher.message});
        // this needs to change to 
        //setCipherOutput({type:"text",value:cipher.message});
        if(cipherResults.output){ 
  
          setCipherOutput(cipherResults.output);
          console.log("checking if cipherResults has an error returned from handleEncryption: ");
          console.log(cipherResults.error);
          setHasError(cipherResults.error);

         
        }else{
         console.error("Error: handlers did not recieve output from MagicCypher: ", cipherResults.output)
          setHasError(true)
        }       
         
        
        // only allow authenticated uses that are trying to submit an image post to server 
        if(auth.sessionStatus === "authenticated" && auth.session?.user.id && cipherResults.cipherStats && !cipherResults.error && cipherInput.type === "text"){
           
          cipherRequest = {
            input:cipherInput.value,  
            output:cipherResults.message,  // @TODO this field in EncryptionResponseType needs a new name bc it can be either a text or an image
            userId:auth.session.user.id,
            encryptionKey: cipherResults.cipherStats.encryptionKey,
            time:cipherResults.cipherStats.time
          }
          // send request to server to store user input (image/text)
          postMessage(cipherRequest);
        }

        console.log("errors returned from MagicCypher:", cipherResults.error )
        console.log("Form Error state:", hasError) 

        if(!cipherResults.error && !hasError && cipherInput.type === "text"){
          // only clear input fields
          // if there is not an error 
          resetForm();
        }


      }
      catch(error){ 

        console.error(error)
      }
      finally{

            const elapsedTime = Date.now() - startTime;
            // make the user wait a minimum of 3 seconds for output
            const remainingTime = Math.max(3000 - elapsedTime, 0); // Ensures no negative delay    
            setTimeout(() => setLoading(false), remainingTime);
      }
    },[
        resetForm,
        cipherInput,
        decryptionKey,
        isEncrypting,
        hasError,
        setLoading,
        setCipherStats,
        setCipherOutput,        
    ]);
 

 
    return{
        // setters and getter for input type format and values
        cipherInput,setCipherInput,
        
        // setters and getter for output type format and values`
        cipherOutput,setCipherOutput,

        //encryption form submission handler
        handleSubmit,

        // semantic setter to reset form to initial state
        resetForm,

        // tracks whether a user has copied the results from the cipher output
        isCopied, setCopied,

        // information about cipher results: how long it took to cipher, length of message, and encryption key.
        cipherStats , setCipherStats, 

        // getter and setter for decryption key
        decryptionKey, setDecryptionKey,

        // used to determine encryption direction (whether the user is trying decrypt or encrypt and image/text
        isEncrypting, setEncrypting,
        
        // used to trace when a cipher request/ submission has been made
        // and update UI loading state
        loading, setLoading,

        hasError, setHasError,

        handleKeyInput

    }


}