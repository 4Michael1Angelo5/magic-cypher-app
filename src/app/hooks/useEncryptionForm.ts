import { useState, useCallback, useEffect } from "react"; 

import { CipherType, EncryptionInput, EncryptionOutput } from "@/lib/Encryption/CipherTypes";
 
import { Session } from "next-auth"; 
import { postMessage } from "@/lib/actions/postMessage";

// server reqquest /response types
import { MagicCypherResults} from "@/app/types/MagicCypherResults";
import { JSONcipherRequest } from "@/app/types/JSONcipherResponse";
import { CipherStats } from "../types/CipherStats";
 
import { handleEncryption } from "@/lib/actions/handleEncryption";
import {handleDecryption} from "@/lib/actions/handleDecryption";

interface CopiedObj {
  key:boolean,
  output:boolean
}
 

// useEncryptionForm custom hook's purpose is to reuse stateful logic across 
// multiple components that use the same encryption form user interface
export const useEncryptionForm = ( initialInput:EncryptionInput<CipherType> = {type: "text", value:""} ,
                                    initialOutput:EncryptionOutput<CipherType> = {type:"text",value:""}
    
                                 )=>{
    const [hasError,setHasError] = useState<boolean>(true);
    const [errorMessage,setErrorMessage] = useState<string>("");

    const [cipherInput,setCipherInput] = useState<EncryptionInput<CipherType>>(initialInput);    
    const [cipherOutput,setCipherOutput] = useState<EncryptionOutput<CipherType>>(initialOutput);

    const [loading,setLoading] = useState<boolean>(false); 
    const [isEncrypting,setEncrypting] = useState<boolean>(true);
    const [decryptionKey,setDecryptionKey] = useState<number>(0); 
    const [cipherStats , setCipherStats] = useState<CipherStats|undefined>(undefined);
    const [isCopied, setCopied] = useState<CopiedObj>({key:false,output:false});

    const [isMobile, setIsMobile] = useState<boolean>(true); 
    const [canShare,setCanShare] = useState<boolean>(true);

    const [magicCypherResults, setMagicCypherResults] = useState<MagicCypherResults>({
      error: false,
      errorMessage: "",
      output: initialOutput,
      cipherStats: { 
        order:0,
        time:0,
        encryptionKey:0, 
      },
    });

    useEffect( ()=>{
        // detect if mobile on mount
        if( /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ){
          console.log("mobile device detected")
            setIsMobile(true); 
        }else{
          console.log("desktop detected")
            setIsMobile(false);
        };

      if (!navigator.canShare || !navigator.share) return setCanShare(false);

      // Test for text support (simple case)
      const supportsText = navigator.canShare({ text: "test" });

      // Test for image/file support
      const dummyBlob = new Blob(["dummy"], { type: "image/png" });
      const dummyFile = new File([dummyBlob], "test.png", { type: "image/png" });

      const supportsImage = navigator.canShare({ files: [dummyFile] });

      setCanShare(supportsText || supportsImage);
    
    },[]);

    // take a unique color index and return a "reasonable" number for
    // grid partions "N" which becomes the order of the magic square
    const colorIndexToGridNumber = (index:number):number=>{
      
      const minOrder = 100;

      const maxOrder = 300;

      return minOrder + index % maxOrder;
    }


    const resetForm = () => {
        setCipherInput(initialInput); 
    };

    const handleCopy = async(target:"output"|"key",event:React.MouseEvent<HTMLButtonElement>)=>{

      event.preventDefault();

      if(cipherOutput.type ==="text" && target === "output"){
        
          try{
            await navigator.clipboard.writeText(cipherOutput.value);      
            setCopied({key:false,output:true});
            setTimeout( ()=>setCopied({key:false,output:false}),1500)
          }
          catch(error){
            // access to clipboard fails 
            // reasons could be no access over HTTP 
            // user personal settings 
            console.error(error);
          }
      }else
      if (cipherOutput.type === "image" && target === "output"){
        // handle copying an image
      }else{
        // user is trying to copy the key
          await navigator.clipboard.writeText(`${magicCypherResults.cipherStats.encryptionKey}`);      
          setCopied({key:true,output:false});
          setTimeout( ()=>setCopied({key:false,output:false}),1500);

      }
    }

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
      event.preventDefault();  

      setLoading(true);

      const startTime = Date.now();
      
      //initialize and define type
      let cipherResults:MagicCypherResults;  

      // used for sending requests to server to store ciphers in DB
      let cipherRequest:JSONcipherRequest;

      try{

        if(isEncrypting){
          // user trying to decrypt
  
              cipherResults = await handleEncryption(cipherInput);  
              setMagicCypherResults(cipherResults);        
        }
        else {
          // user trying to decrypt 

              cipherResults = await handleDecryption(cipherInput,decryptionKey);   
              setMagicCypherResults(cipherResults);
        }


        setCipherStats(cipherResults.cipherStats); 

        if(cipherResults.output && !cipherResults.errorMessage){  

          setCipherOutput(cipherResults.output);
          // console.log("checking if cipherResults has an error returned from handleEncryption: ");
          // console.log(cipherResults.error);
          // setHasError(cipherResults.error);
         
        }else{
          console.error(cipherResults.errorMessage)
          console.log(cipherResults) 
          setHasError(true);
          setErrorMessage(cipherResults.errorMessage);
        }                

        // only allow authenticated uses that are trying to submit an text post to server 
        if(auth.sessionStatus === "authenticated" && auth.session?.user.id && cipherResults.cipherStats && !cipherResults.error && cipherInput.type === "text" && cipherResults.output){
           
          cipherRequest = {
            input:cipherInput.value,  
            output:cipherResults.output.value as string,  
            userId:auth.session.user.id,
            encryptionKey: cipherResults.cipherStats.encryptionKey,
            time:cipherResults.cipherStats.time
          }
          // send request to server to store user input (text)
          postMessage(cipherRequest);
        }


        if(!cipherResults.error && !hasError && cipherInput.type === "text"){
          // only clear input fields
          // if there is not an error 
          resetForm();
        }


      }
      catch(error:unknown){ 
        // server errors unable to communicate with server
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

        errorMessage,

        handleKeyInput,

        magicCypherResults,

        isMobile,
        canShare,

        handleCopy,

        colorIndexToGridNumber

    }


}