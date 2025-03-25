'use client'
// client side directive (meaning that this component is rendered client side)

import React ,{useState,useRef, ChangeEvent}from "react";; 

import { TextArea } from "./components/formComponent";

import NavLinks from './components/linksComponent'; 

import CipherResult from './components/cipherResultComponent'; 

import { useSession } from 'next-auth/react';

import { postMessage } from '@/lib/actions/postMessage';

// styles @TODO clean up and consolidate global vars 
import styles from "./page.module.css"; 

import  handleEncryption from "@/lib/actions/handleEncryption"; 
import handleDecryption from '@/lib/actions/handleDecryption';
import CipherStatsComponent from './components/cipherStatsComponent';
import { JSONcipherRequest } from './types/JSONcipherResponse';
import { CipherStats } from "./types/CipherStats";
import { EncryptionResponse } from "./types/EncryptionResponse";
 

export default function Home() {
  
  // track session details about authenticated user ie username, profile image, email
  // const {data:session,status,update} = useSession();
  
   //cipher inputs
   const [message , setMessage] =  useState("");
   //cipher outputs
   const [cipher,setCipher] = useState("");
   // information about cipher results: how long it took to cipher, length of message, and encryption key.
   const [cipherStats , setCipherStats] = useState<CipherStats|null>(null);
   // state of cipher appliation while performing encryption/decryption
   const [loading,setLoading] = useState(false);  
   const [isEncrypting,setEncrypting] = useState(true);
   const [decryptionKey,setKey] = useState(0);
   const [isCopied, setCopied] = useState(false);


   const {data:session,status} = useSession();
 
   const cipherResult = useRef<HTMLDivElement>(null);

     //************************FUNCTIONS*********************************************


    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>):Promise<void> => {

      //prevent default form submission behavior which causes the entire page to reload
      event.preventDefault()

      if(cipherResult.current){
        cipherResult.current.scrollIntoView({behavior:"smooth"})
      }

      setLoading(true);

      const startTime = Date.now();
      
      //initialize and define type
      let cipher:EncryptionResponse;
      let cipherRequest:JSONcipherRequest;

      try{

        if(isEncrypting){

          cipher = await handleEncryption(message);  

        }else{

          cipher = await handleDecryption(message,decryptionKey);
        }

        // handleDecryption / encryption does not throw an error if one occurs so need to check
        // if cipher.error is true 
        
      
        setCipherStats(cipher.cipherStats);  
        setCipher(cipher.message); 

        if(status === "authenticated" && session?.user.id && cipher.cipherStats){
           
          cipherRequest = {
            input:message,
            output:cipher.message,
            userId:session.user.id,
            encryptionKey: cipher.cipherStats.encryptionKey,
            time:cipher.cipherStats.time
          }

          console.log('write before post message: ', cipherStats)

          postMessage(cipherRequest);
        }


      }
      catch(error){ 

        console.error(error)


      }
      finally{

            setMessage("");// clear input fields

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(3000 - elapsedTime, 0); // Ensures no negative delay    
            setTimeout(() => setLoading(false), remainingTime);
      }

  }

  const handleTextAreaInput=(event:React.ChangeEvent<HTMLTextAreaElement>)=>{
    // update message state when user types into the text area.
    event.preventDefault();
    setMessage(event.target.value)
    
  }

  const handleKeyInput = (event:ChangeEvent<HTMLInputElement>)=>{
    event.preventDefault();
    const value = event.target.value;

    // Only update the key if the value is a valid number or empty (cleared by user)
    if (value === "" || !isNaN(Number(value))) {
      setKey(value === "" ? 0 : Number(value));  // Reset to 0 if empty, else update key
    }
   
  }


  const handleCopy = async(event:React.MouseEvent<HTMLButtonElement>)=>{
    event.preventDefault();

    try{
      await navigator.clipboard.writeText(cipher);      
      setCopied(true);
      setTimeout( ()=>setCopied(false),1500)
    }
    catch(error){
      // access to clipboard fails 
      // reasons could be no access over HTTP 
      // user personal settings 
      console.error(error);
    }
    
  }

  // **************************  EFFECTS ***********************************

  // useEffect(()=>{console.log(session); console.log(status)},[session])

  
  return (
    <div>
    
          
            <div className = "mt-5 mb-5 pb-5">
            <div className = {styles.gradient_wrapper}>
              <h1 className="display-1">
                Magic Cypher
              </h1>
            </div>        
            <h2> Securely cipher any message! </h2>
            </div>

              <TextArea  
                message = {message}             
                //used to track whether the user is encrypting or decrypting
                isEncrypting = {isEncrypting}        
                setEncrypting = {setEncrypting}   
                handleTextAreaInput = {handleTextAreaInput}    
                handleSubmit = {handleSubmit}  
                handleKeyInput = {handleKeyInput}
                decryptionKey = {decryptionKey}
              />

              <CipherResult
                ref = {cipherResult}
                isEncrypting = {isEncrypting}
                loading= {loading}
                cipher= {cipher}
                isCopied= {isCopied}
                handleCopy = {handleCopy}
              /> 

              <CipherStatsComponent
                messageLength = {cipherStats?.messageLength}
                time = {cipherStats?.time}
                encryptionKey={cipherStats?.encryptionKey}
              /> 


              <NavLinks/>  

    </div>
  

  );
}
