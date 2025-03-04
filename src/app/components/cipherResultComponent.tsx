"use client"

import styles from "../styles/cipherResult.module.css"

import Image from "next/image";

import Loading from "./loadingComponent";
import SkeletonLoader from "../skeletonLoaderComponent";
import { forwardRef } from "react";

import copy from "../assets/copy.svg" 

interface CipherResultProps {
    loading:boolean;
    cipher:string;
    isCopied:boolean,
    isEncrypting:boolean
    handleCopy: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const CipherResult = forwardRef<HTMLDivElement, CipherResultProps>(({loading,cipher,isCopied,isEncrypting,handleCopy} ,cipherResult)=>{

    return(
        <div className = "" ref = {cipherResult}> 

        {/* @TODO  buffer is useless right now the only point of this is to make some room between components */}
        <div className = "buffer d-flex align-item-center" style ={{minHeight:"150px"}}>
          
         {loading && <Loading loadingState={isEncrypting ? "Encrypting" : "Decrypting"} />}

              
        </div>
              
        <h1>Cipher Result</h1>

        <div className = {styles.cipher_result_Wraper}
            style={{position:"relative"}}>
        
            {
              loading //if loading
              ?                          
              <SkeletonLoader/> //return skelton loader
              :
              // otherwise
              <>
                 <p>
                  {cipher}                     
                </p>
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

       

        </div>
       
    )

})

CipherResult.displayName = "cipher results";

export default CipherResult

 