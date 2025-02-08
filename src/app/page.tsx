'use client'
// client side directive (meaning that this component is rendered client side)

import React ,{useState,useRef, useEffect, ChangeEvent}from "react";

import {Menu} from "./components/menu";
// import { TextArea } from "./components/textAreaComponent";
import { TextArea } from "./components/formComponent";
 
// next.js has built in ways of optomizing images for fast loading and cacheing
import Image from "next/image"; 

// styles @TODO clean up and consolidate global vars 
import styles from "./page.module.css"; 

import 'bootstrap/dist/css/bootstrap.min.css';  

 

// static assets
const buyMeACoffee = new URL("../app/assets/buyMeACoffee.svg", import.meta.url).href;
const gitHub = new URL("../app/assets/github.png", import.meta.url).href;
const logo  = new URL("../app/assets/logo.png", import.meta.url).href;

// interface for Promise return type to ensure ts knows what fields we'll have access to 
import  handleEncryption, {EncryptionResponse} from "./handleEncryption"; // this is an interface not a value
import  handleDecryption from "./handleDecryption";
import { WavyDivider } from "./components/wavyDividerComponent";
 

const Loading = ()=>{
  return(
    <div className="container">
      Loading...
      
      <div className= {styles.loadingspinner}>
      
        <div id="square1"></div>
        <div id="square2"></div>
        <div id="square3"></div>
        <div id="square4"></div>
        <div id="square5"></div>
      </div>
    </div>
  )
}

// move this out of Skeleton loader so that we don't recreate it every time SkeletonLoader mounts
const WIDTHS = ["100%","100%","100%","100%","75%","75%","75%","60%"]

const SkeletonLoader = () => {

  const [numBars, setNumBars] = useState(8); // Default to 8 skeleton bars

  const loaderRef = useRef(null)


  // Function to dynamically create skeleton loaders based on numBars
  const createSkeletonLoaders = () => {
    const loaders = [];
    for (let i = 0; i < numBars; i++) {
      const startPosition = -( (i + 1) * 50 ); // Adjust starting position for each loader
      

      loaders.push(
        <div
          ref = {loaderRef}
          key ={i}
          className ={styles.skeleton_loader}
          style =
          { 
            {
              "--startPosition": `-${startPosition}% 0`, 
              "--endPosition": `${startPosition}% 0`,
              width: WIDTHS[i]
            } as React.CSSProperties //  Explicit cast to allow CSS variable
          } 
        />
      );
     
    }
    return loaders;
  };

  return (
    <div>
      <div id="skeleton-container">
      {/* <Loading/> */}
        {          
          createSkeletonLoaders()
        }
      </div>
    </div>
  );
};
 

export default function Home() {

   const [message , setMessage] =  useState("");
   const [cipher,setCipher] = useState("");
   const [loading,setLoading] = useState(false); 
   const [menuIsOpen,setMenuIsOpen] = useState(false);
   const [isEncrypting,setEncrypting] = useState(true);
   const [decryptionKey,setKey] = useState(0);

   const textArea = useRef<HTMLFormElement>(null);


  const handleSubmit = async(event: React.FormEvent<HTMLFormElement>):Promise<void> => {

    //prevent default form submission behavior which causes the entire page to reload
    event.preventDefault()

    setLoading(true);

    const startTime = Date.now();

    let cipher:EncryptionResponse;

    try{

      if(isEncrypting){

        cipher = await handleEncryption(message);

      }else{

        cipher = await handleDecryption(message,decryptionKey);
      }

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
    event.preventDefault()
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

  useEffect(()=>{
    // focus the client window on the skeleton loader and the text area when
    // the user clicks either encrypt or decrypt

    if(loading && textArea.current ){  

       textArea.current.scrollIntoView({behavior:"smooth"})      
    }

  },[loading])


  
  return (

  <div className ={styles.page}>

      <WavyDivider/>  

      <Menu menuIsOpen = {menuIsOpen} />
          
      <div className = "container ">

          <div className = {styles.gradient_wrapper}>
            <h1 className="display-1">
              Magic Cypher
            </h1>
          </div>
      
          <h2> Securely cipher any message! </h2>
          
          <div className="row  mt-5 pt-5"/>       

          {/* text area UI */}

          <TextArea 
            ref = {textArea}
            message = {message}             
            //used to track whether the user is encrypting or decrypting
            isEncrypting = {isEncrypting}        
            setEncrypting = {setEncrypting}   
            handleTextAreaInput = {handleTextAreaInput}        
            // encryptMessage = {encryptMessage} 
            // decryptMessage = {decryptMessage}     
            handleSubmit = {handleSubmit}  
            handleKeyInput = {handleKeyInput}
            decryptionKey = {decryptionKey}
           />


            <div className = ""> 

            {/* @TODO  buffer is useless right now the only point of this is to make some room between components */}
            <div className = "buffer d-flex align-item-center" style ={{minHeight:"150px"}}>
              
              {
                loading && (<Loading/>)
              }   
            </div>
                  
            <h1>Cipher Result</h1>

            <div className = {styles.cipher_result_Wraper}>
            
                {
                  loading //if loading
                  ?                          
                  <SkeletonLoader/> //return skelton loader
                  :
                  <p>{cipher}</p> //otherwise
                } 
              
            </div>
            
            {/* this is a shit class --- needs to be renamed and actually styled "buffer doesn't acutaly do anything" */}
            <div className = "buffer" 
              style = {{
                height:"150px"
              }}/>

              <div className = "row d-flex justify-content-center">
                <div className="col-3 d-flex flex-column align-items-center">
                <Image src={buyMeACoffee} width={100} height = {100} alt="Buy me a coffee" />
                  <p className="text-center">buy me a coffee</p>
                </div>

                <div className="col-3 d-flex flex-column align-items-center">
                  <Image src ={gitHub} width= {100} height = {100} alt= "GitHub"/>
                  <p  className="text-center"> follow me on GitHub </p>
                </div>

                <div className="col-3  d-flex flex-column align-items-center">
                  <Image src ={logo} width={100} height = {100} alt= "GitHub"/>
                  <p  className="text-center"> check out my work</p>
                </div>

              </div>
          </div>
         
    </div>
  </div>
  );
}
