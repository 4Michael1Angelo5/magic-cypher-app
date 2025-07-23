'use client'
// client side directive (meaning that this component is rendered client side)

import React ,{useState,useRef, ChangeEvent}from "react";; 

import { EncryptionUI } from "./components/encryptionFormComponent";

import NavLinks from './components/linksComponent'; 

import CipherResult from './components/cipherResultComponent'; 

import { useSession } from 'next-auth/react';

import { handleEncryption1 } from "@/lib/actions/handleNewEncryption";
 

// styles @TODO clean up and consolidate global vars 
import styles from "./page.module.css"; 

import  handleEncryption from "@/lib/actions/handleEncryption"; 
import handleDecryption from '@/lib/actions/handleDecryption';
import CipherStatsComponent from './components/cipherStatsComponent';
import { JSONcipherRequest } from './types/JSONcipherResponse';
import { CipherStats } from "./types/CipherStats"; 
import { useEncryptionForm } from "./hooks/useEncryptionForm";
import { EncryptionInput } from "./types/EncryptionInput";
 

export default function Home() {

  const {
        // cipher outputs can be either a string or Float32Array (look up texture)
        cipherOutput,setCipherOutput,
        // setters and getter for input type format and values 
        cipherInput,setCipherInput,

        // information about cipher results: how long it took to cipher, length of message, and encryption key.
        cipherStats , setCipherStats, 

        // getter and setter for decryption key
        decryptionKey, setDecryptionKey,

        // used to determine encryption direction (whether the user is trying decrypt or encrypt and image/text
        isEncrypting, setEncrypting,

        // tracks whether a user has copied the results from the cipher output
        isCopied, setCopied,

        hasError,

        
        // used to trace when a cipher request/ submission has been made
        // and update UI loading state
        loading,
        
        handleSubmit,

        handleKeyInput


      } = useEncryptionForm({type: "text",value:""},  // initial input
                            {type:"text",value: ""}  // initial output
                           );

  
  // track session details about authenticated user ie username, profile image, email
  const {data:session,status} = useSession();

  const cipherResult = useRef<HTMLDivElement>(null);

  const onSubmit =(event: React.FormEvent<HTMLFormElement>)=>{

        if(cipherResult.current){
        cipherResult.current.scrollIntoView({behavior:"smooth"});
      }

      handleSubmit(event,{session:session,sessionStatus:status});
  }

  
  const handleTextAreaInput=(event:React.ChangeEvent<HTMLTextAreaElement>)=>{
    // update message state when user types into the text area.
    event.preventDefault();
    // setMessage(event.target.value);
    setCipherInput({type:"text",value: event.target.value});
    
  }

  // const handleKeyInput = (event:ChangeEvent<HTMLInputElement>)=>{
  //   event.preventDefault();
  //   const value = event.target.value;

  //   // Only update the key if the value is a valid number or empty (cleared by user)
  //   if (value === "" || !isNaN(Number(value))) {
  //     setDecryptionKey(value === "" ? 0 : Number(value));  // Reset to 0 if empty, else update key
  //   }
  // }


  const handleCopy = async(event:React.MouseEvent<HTMLButtonElement>)=>{
    event.preventDefault();

    if(cipherOutput.type ==="text"){
      
        try{
          await navigator.clipboard.writeText(cipherOutput.value);      
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

    
  }

  
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

              <EncryptionUI  
                aspectRatio={0}
                imageURL={null} 
                encryptionInput = {cipherInput}                     
                isEncrypting = {isEncrypting}                  
                setEncrypting = {setEncrypting}     
                handleTextAreaInput = {handleTextAreaInput}   // this should be optional 
                handleSubmit = {onSubmit}  
                handleKeyInput = {handleKeyInput}
                decryptionKey = {decryptionKey}
              />
              <div ref = {cipherResult}>
              <CipherResult
                cipherFormatType = {cipherInput.type}
                isEncrypting = {isEncrypting}
                loading= {loading}
                hasError = {hasError}
                cipher= {cipherOutput.value}
                isCopied= {isCopied}
                handleCopy = {handleCopy}
                encryptionKey={cipherStats?.encryptionKey}
              />
              </div> 

                <CipherStatsComponent
                messageLength = {cipherStats?.messageLength}
                time = {cipherStats?.time}
                encryptionKey={cipherStats?.encryptionKey}
                loading = {loading}
                hasError = {hasError}
              /> 

              <NavLinks/>  

    </div>
  

  );
}
