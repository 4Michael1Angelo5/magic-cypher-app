"use client"

import { MagicCypherResults } from "../types/MagicCypherResults";
import { GreySkeletonLoader } from "./greySkeletonLoader";
import styles from "@/app/styles/cipherResult.module.css";
import Image from "next/image";
import {useState } from "react";
import email from "@/app/assets/email.svg";
import download from "@/app/assets/donwload.svg"; 
import sendMessage from "@/app/assets/message.svg";
import { Modal } from "./modalComponent"; 

interface CipherResultsButtonsProps {
    loading:boolean,
    animationComplete?:boolean,
    magicCypherResults:MagicCypherResults,
    isMobile:boolean,
    cipherImageURL?:string,
    encryptionKey:number
}

 
export const CipherResultsActionsButtons:React.FC<CipherResultsButtonsProps>
    = ({animationComplete,isMobile, cipherImageURL ,encryptionKey, loading, magicCypherResults})=>{

        const [useEmail,setUseEmail] = useState<boolean>(true);
        const [showModal,setShowModal] = useState<boolean>(false);
        const [includeKey,setIncludeKey]  = useState<boolean>(false);
        const [includeLink,setIncludeLink] = useState<boolean>(false);     

   
const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();

  if (typeof window === "undefined") {
    alert("Web Share API is not supported in this environment.");
    return;
  }

  if (!navigator.share) {
    alert("Sharing is not supported on this device.");
    return;
  }

  if (!cipherImageURL) {
    alert("Cipher image URL not ready. Try again.");
    return;
  }

  try {
    const res = await fetch(cipherImageURL);
    const blob = await res.blob();
    const file = new File([blob], "encrypted_image.jpeg", { type: blob.type });

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      alert("Sharing files is not supported on this device.");
      return;
    }

    await navigator.share({
      files: [file],
      title: "Magic Cypher Encrypted Image",
      text: "Check out this encrypted image!",
    });

  } catch (error: unknown) {
    console.error("Error sharing file:", error);
    alert("Sharing failed. Try again.");
  }
};

   
   


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

        const scrubbedCipher = encodeURIComponent(magicCypherResults.output.value + textParams); 

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

    return(
        <div>
            {
            (!magicCypherResults.errorMessage)&&( 
                //action btns for sending cipher as email or text message 
                // only render if magic cypher does not have any errors

                // if not loading and the cipher result is defined 
                <>               
                <div className="row d-flex justify-content-center">
                    {
                        //if the user is on a mobile device 
                        (isMobile) && (
                            // allow user to send cipher as a text message                        
                            <div className="col d-flex justify-content-center">
                                {
                                    // if the form state is still loading
                                    loading?
                                    // show a loader
                                    <>
                                        <div className={styles.spinner}/>
                                        <GreySkeletonLoader numBars={1} widths={["100%"]}/>
                                    </>
                                    :
                                    // otherwise show the buttons
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
                        {
                            // if form state is still loading
                            (loading || !animationComplete )
                            ? 
                            // show a loader
                            <>
                                <div className={styles.spinner}/>
                                <GreySkeletonLoader numBars={1} widths={["100%"]}/>
                            </>
                            // otherwise show the send as email button
                            :
                            <>
                                <Image className = {styles.action_btns} src = {email} width={100} height={100} alt="send as text messag"/>
                                <button className = "cyber_btn" 
                                    style={{width:"100%"}}
                                    onClick={()=>handleModal("email")}> send as email 
                                </button> 
                            </>
                        }               
                    </div>

                </div> 

                <div className = "row d-flex justify-content-center">
                    
                        <div className="col d-flex justify-content-center">
                    {
                        loading || !animationComplete ?
                        <>
                            <div className={styles.spinner}/>
                            <GreySkeletonLoader numBars={1} widths={["100%"]}/>
                        </>
                        :
                        <>
                        <Image className = {styles.action_btns} src = {download} width={100} height={100} alt="send as text messag"/>
                        <a className = "cyber_btn" 
                        style={{width:"100%"}}
                        href={cipherImageURL}
                        download="encrypted-image.jpeg"
                        target="_blank"
                        rel="noopener noreferrer"
                        > download 
                        </a> 

                        <button className="cyber-btn"
                            onClick = { e=>handleShare?.(e)}
                            style ={{width:"100%"}}>
                                share
                        </button> 

                        </>
                        
                    }
                    </div>
                </div>
                </>
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
                                    <input type="checkbox" checked = {includeLink} onChange={(e)=>setIncludeLink(e.target.checked)}/>
                                </div>
                            </div>
                            <button className = "cyber_btn" onClick={e=>{sendCipher(e)}}>send</button>
                        </form>
                    </Modal>                    
                )
            }

        </div>
    
    );
}
