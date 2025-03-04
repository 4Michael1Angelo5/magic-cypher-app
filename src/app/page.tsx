'use client'
// client side directive (meaning that this component is rendered client side)

import 'bootstrap/dist/css/bootstrap.min.css';

import React ,{useState,useRef, ChangeEvent}from "react";

import {Menu} from "./components/menu"; 

import { TextArea } from "./components/formComponent";

import NavLinks from './components/linksComponent'; 

import CipherResult from './components/cipherResultComponent'; 

// styles @TODO clean up and consolidate global vars 
import styles from "./page.module.css"; 


// interface for Promise return type to ensure ts knows what fields we'll have access to 
import  handleEncryption, {CipherStats, EncryptionResponse} from "./handleEncryption"; // this is an interface not a value
import  handleDecryption from "./handleDecryption";
import { WavyDivider } from "./components/wavyDividerComponent";
import CipherStatsComponent from './components/cipherStatsComponent';
 

//  @TODO: 
//  1) how to deal with line breaks as \n. it would be nice to preserve the format but also presents challenges
//  2) create a tool tip
 
export default function Home() {

   const [message , setMessage] =  useState("");
   const [cipher,setCipher] = useState("");
   const [cipherStats , setCipherStats] = useState<CipherStats|null>(null);
   const [loading,setLoading] = useState(false); 
   const [menuIsOpen,setMenuIsOpen] = useState(false);
   const [isEncrypting,setEncrypting] = useState(true);
   const [decryptionKey,setKey] = useState(0);
   const [isCopied, setCopied] = useState(false);
 
   const cipherResult = useRef<HTMLDivElement>(null);


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

    try{

      if(isEncrypting){

        cipher = await handleEncryption(message);  

      }else{

        cipher = await handleDecryption(message,decryptionKey);
      }

      setCipherStats(cipher.cipherStats);  


      setCipher(cipher.message);

    }
    catch(error){ 

      console.error(error)

    }
    finally{
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

   


  
  return (

  <div className ={styles.page}>

      <WavyDivider/>  

      <Menu menuIsOpen = {menuIsOpen} setMenuIsOpen = {setMenuIsOpen}/>
          
      <div className = "container"
      style = {{
        perspective:"12px",
        transform:menuIsOpen?"scale(.5) translateZ(-10px)": "scale(1) translateZ(0px)",
        opacity:menuIsOpen?".5":"1",
        transition:"opacity, transform .3s ease-in-out"
      }}>

          <div className = {styles.gradient_wrapper}>
            <h1 className="display-1">
              Magic Cypher
            </h1>
          </div>
      
          <h2> Securely cipher any message! </h2>
          
          <div className="row  mt-5 pt-5"/>       

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

            <CipherStatsComponent
              messageLength = {cipherStats?.messageLength}
              time = {cipherStats?.time}
              encryptionKey={cipherStats?.encryptionKey}
            /> 

            <CipherResult
              ref = {cipherResult}
              isEncrypting = {isEncrypting}
              loading= {loading}
              cipher= {cipher}
              isCopied= {isCopied}
              handleCopy = {handleCopy}
            /> 

            <NavLinks/>  

        </div>       
  </div>
  );
}
