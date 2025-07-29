"use client"

import styles from "../styles/cipherResult.module.css"
import Image from "next/image";
import Loading from "./loadingComponent";
import SkeletonLoader from "./skeletonLoaderComponent"; 
import { forwardRef } from "react";
import copy from "../assets/copy.svg"  
import { MagicCypherResults } from "../types/MagicCypherResults"; 
import { CipherResultsActionsButtons } from "./cipherResultsActionButtons";
import { useEncryptionForm } from "../hooks/useEncryptionForm";

interface CipherResultProps {   
    loading:boolean; 
    magicCypherResults:MagicCypherResults,
    isCopied:boolean,
    isEncrypting:boolean 
    handleCopy?:(event: React.MouseEvent<HTMLButtonElement>) => void;
    handleDownload?: (canvasRef: React.ForwardedRef<HTMLCanvasElement>) => void;
    cipherImageURL?:string,
    animationComplete?:boolean
    handleShare?: (event:React.MouseEvent<HTMLButtonElement>) =>Promise<void>; 
}

// this component is responsible for displaying the results of a MagicCypher 
const CipherResult = forwardRef<HTMLCanvasElement, CipherResultProps>(({
 magicCypherResults, isCopied,isEncrypting,cipherImageURL, loading,
 animationComplete, handleCopy , 
} ,outputCanvas) => {

    const {isMobile,canShare} = useEncryptionForm();
 
    const cipherFormatType = magicCypherResults.output.type; 
    const encryptionKey =  magicCypherResults.cipherStats.encryptionKey;  
    const errorMessage = magicCypherResults.errorMessage;



 


    return(
        <div className = "" > 
        {/* i don't know why i have this wrapped in an outer div i think its useless */}

        {/* @TODO  buffer is useless right now the only point of this is to make some room between components */}
        <div className = "buffer d-flex align-item-center" style ={{minHeight:"150px"}}>
          
         {loading && <Loading loadingState = {isEncrypting ? "Encrypting" : "Decrypting"} />}

        </div>
              
        <h1>Cipher Result</h1>

        <div className = {styles.cipher_result_Wraper}
            style={{position:"relative"}}>

            {
               
                (magicCypherResults.output.type === "image") &&
                <>
                       
                <canvas 
                    style = {{
                        width:"100%",
                        display:loading?  "none" : "block"

                    }} 
                    ref = {outputCanvas}/>
                    
                     {   (cipherImageURL && !loading) &&
                        
                        <img   
                                alt="Invisible Downloadable"
                                style={{
                                transition:"opacity .5s ease-in-out",
                                position: 'absolute', 
                                top: 0,
                                padding:"10px",
                                left: 0,
                                borderRadius:"10px",
                                opacity: animationComplete && !loading?1:0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'auto', // must allow touch!
                                WebkitTouchCallout: 'default', // this enables long-press
                                }}
                        src = {cipherImageURL}/>

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
            
                    <p>
                        {   
                            errorMessage ?  // if errorMessage =  "" , then  => evaluates to false
                            errorMessage :
                            magicCypherResults.output.value
                        } 
                    </p>
                } 
              
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
        <CipherResultsActionsButtons
            cipherFormatType = {cipherFormatType}
            canShare = {canShare}
            magicCypherResults={magicCypherResults}
            loading = {loading}
            encryptionKey={encryptionKey}
            isMobile= {isMobile}
            animationComplete = {animationComplete}
            cipherImageURL={cipherImageURL}
            />
        </div>
    );


})

CipherResult.displayName = "cipher results";

export default CipherResult

 