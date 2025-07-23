"use client"

import styles from "../styles/cipherResult.module.css"

import Image from "next/image";


import Loading from "./loadingComponent";
import SkeletonLoader from "./skeletonLoaderComponent";
import { GreySkeletonLoader } from "./greySkeletonLoader";
import { forwardRef, useEffect, useState, useRef } from "react";

import copy from "../assets/copy.svg" 
import sendMessage from "@/app/assets/message.svg"; 
import email from "@/app/assets/email.svg"
import { Modal } from "./modalComponent"; 

interface CipherResultProps {
    cipherFormatType: "text" | "image"
    loading:boolean;
    cipher:string | Float32Array;
    isCopied:boolean,
    isEncrypting:boolean
    encryptionKey:number|undefined,
    hasError:boolean
    handleCopy: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// this component is responsible for displaying the results of a MagicCypher 
const CipherResult = forwardRef<HTMLCanvasElement, CipherResultProps>(({
    cipherFormatType,
    encryptionKey,
    hasError,loading,cipher,isCopied,isEncrypting,handleCopy} ,outputCanvas) => {

    const [showModal,setShowModal] = useState(false);
    const [includeLink,setincludeLink] = useState(false);
    const [includeKey,setIncludeKey] = useState(false);
    const [useEmail,setUseEmail] = useState(true);
    const [isMobile,setIsMobile] = useState(true); 

    
    
    
    // allow the user to send the cipher as an email or message
    const sendCipher = (event:React.MouseEvent<HTMLButtonElement>)=>{

        event.preventDefault();

        let textParams = ""; 

        if(includeKey){
             
            textParams += "\n\n Encryption Key: " + encryptionKey
        };
        if(includeLink){

            textParams +=  "\n\n Link: https://magic-cypher-app-kml2.vercel.app/";
        }

        const scrubbedCipher = encodeURIComponent(cipher + textParams); 

        if(useEmail){
 

            window.open(`mailto:?body=${scrubbedCipher}`,"_blank");
            

        }else{

            window.open(`sms:?&body=${scrubbedCipher}`, "_blank");
        }
    }

    const handleModal = (method: "email"|"text")=>{
        
        if(method ==="email"){
           
            setUseEmail(true)

        }else{
            setUseEmail(false);

        }
        setShowModal(true);

    }

    useEffect( ()=>{

        if( /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ){
            
            setIsMobile(true); 
        }
    },[]);



    return(
        <div className = "" > 
        {/* i don't know why i have this wrapped in an outer div i think its useless */}

        {/* @TODO  buffer is useless right now the only point of this is to make some room between components */}
        <div className = "buffer d-flex align-item-center" style ={{minHeight:"150px"}}>
          
         {loading && <Loading loadingState={isEncrypting ? "Encrypting" : "Decrypting"} />}

              
        </div>
              
        <h1>Cipher Result</h1>

        <div className = {styles.cipher_result_Wraper}
            style={{position:"relative"}}>
                    {
                        cipherFormatType === "image" &&
                       <>
                        <canvas 
                            style = {{
                                width:"100%",
                                display:loading?  "none" : "block"

                            }} 
                            ref = {outputCanvas}/>
                        {
                        
                        }
                     </>
                    
                    } 
        
            {
              loading //if loading
              ?   
              // return skelton loader                       
              <SkeletonLoader numBars={4} widths={["100%","100%","100%","75%"]}/> 
              :
              // otherwise return cipher result
              <>
              
                    {
                    cipherFormatType === "text" &&
                    // this is not type safe needs to follow EncryptionOutput<CipherType> format
                    // so i can leverage discrimated union like:
                    // if(output.type === "text"){
                    // render ... output.value }
                    <p>
                      {cipher.toString()} 
                    </p>
                    } 
                    {/* {
                        cipherFormatType === "image" &&
                        <canvas 
                            style = {{
                                width:"100%",
                                

                            }} 
                            ref = {outputCanvas}/>
                    }  */}
                    
                <div className = {styles.tooltip}
                    style={{
                        display:isCopied?"inline-block":"none"
                    }}>
                    Copied!
                </div>
                <div className = {styles.results_btn_container} role="button">
                    <button className = {styles.result_btn_controls}
                        onClick={handleCopy}>    

                        <Image src={copy} width={100} height = {100} alt="resize icon" 
                            className = {styles.results_btn_icon}/>
                        Copy
                    </button>
                 </div> 

              </>
            } 
          
        </div>

        {
            //action btns for sending cipher as email or text message

            (!loading && !hasError) && (
            // if not loading and the cipher result is defined                
            <div className="row d-flex justify-content-center">

                {
                    //if the user is on a mobile device
                    (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ) && (
                        
                        <div className="col d-flex justify-content-center">
                            {
                                loading?
                                <>
                                    <div className={styles.spinner}/>
                                    <GreySkeletonLoader numBars={1} widths={["100%"]}/>
                                </>
                                :
                                <>
                                    <Image className = {styles.action_btns} src = {sendMessage} width={100} height={100} alt="send as text messag"/>
                                    <button className = "cyber_btn" 
                                        style ={{
                                            width:"100%"
                                        }}
                                        onClick={()=>handleModal("text")}> send as text
                                    </button>
                                </>

                            }
                         
                            
                        </div>
                    )
                }
                

                <div className="col d-flex justify-content-center">
                    <Image className = {styles.action_btns} src = {email} width={100} height={100} alt="send as text messag"/>
                    <button className = "cyber_btn" 
                        style={{width:"100%"}}
                        onClick={()=>handleModal("email")}> send as email 
                    </button> 

                </div>

            </div>            
            )

        }

        {
                showModal && (
                    <Modal onClose ={ ()=>setShowModal(false)}>
                        <form>
                            <div className= "row">
                                <div className = "col-12 d-flex justify-content-around">
                                    <label> include key</label>
                                    <input type="checkbox"  checked = {includeKey} onChange={(e)=>setIncludeKey(e.target.checked)} />
                                </div>
                                <div className = "col-12 d-flex justify-content-around">
                                    <label> inlcude link</label>                           
                                    <input type="checkbox" checked = {includeLink} onChange={(e)=>setincludeLink(e.target.checked)}/>
                                </div>
                            </div>
                            <button className = "cyber_btn" onClick={e=>{sendCipher(e)}}>send</button>
                        </form>
                    </Modal>                    
                )
            }

        </div>
       
    )

})

CipherResult.displayName = "cipher results";

export default CipherResult

 