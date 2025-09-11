"use client" 

import styles from "../styles/cipherResult.module.css"; 

import { useEffect, useState } from "react"; 

import Image from "next/image";

import copy from "@/app/assets/copy.svg"

import btn from "@/app/styles/tableStyles.module.css";
import { CipherStats } from "../types/CipherStats";  
import { MagicCypherResults } from "../types/MagicCypherResults"; 

interface CipherStatsProps {
    cipherStats:CipherStats
    hasError:boolean
    loading:boolean 
    magicCypherResults:MagicCypherResults
    handleCopy: (target:"key"|"output",event: React.MouseEvent<HTMLButtonElement>) => void;
    isCopied:{key:boolean,output:boolean}
}

 
const CipherStatsComponent = ({handleCopy,isCopied,hasError,loading,cipherStats}:CipherStatsProps)=>{

    const [isOpen,setOpen] =  useState<boolean>(false);
    const [disabled,setDisabled] = useState<boolean>(true); 

   
    
    useEffect(()=>{ 
        console.log(cipherStats)

        if(cipherStats.order && cipherStats.encryptionKey && !hasError && !loading){
            setDisabled(false);
        }else{
            setDisabled(true);
        }

    },[cipherStats,loading,hasError]);

    const open: string = `${btn.circlePlus} ${btn.closed} ${btn.opened}`
    const close: string = `${btn.circlePlus} ${btn.closed}`
     
    return(
        <>

        <div style= {{
            marginTop:"150px",
            opacity:disabled? "0":"1",
            position:"relative"
            }}>

            <h2>Your Cipher Details</h2>
            <p>Explore key insights about your cipher, including its security features and performance metrics.</p>
            
            <div className = "row d-flex justify-content-center">
                <div className = "col d-flex justify-content-center">

                    <div className={isOpen?open:close}
                        onClick={()=>setOpen(!isOpen)}>
                        <div className={btn.circle}>
                            <div className={btn.horizontal}></div>
                            <div className={btn.vertical}></div>
                        </div>
                    </div> 

                    <div className = {isOpen ? `${styles.cipherStats} ${styles.cipherStatsOpen}` : `${styles.cipherStats} ${styles.cipherStatsClose}`}> 
                        
                        <h1>Cipher Stats</h1>
                        <p> 
                            encryption key: 
                            { " " + cipherStats.encryptionKey}
                        </p>
                        <p>
                            order: 
                            {" " + cipherStats.order}
                        </p>                      
                        <p> 
                            time:
                            { " " + cipherStats.time }ms
                        </p>
                        
                        {
                            isOpen && 
                            (<div className = {styles.results_btn_container} role = "button"
                                style = {{
                                    transition : ".3s ease-in-out",
                                    opacity : isOpen? "1" : "0"
                                    }}>
                                <button className = {styles.result_btn_controls}
                                    onClick = {e=>handleCopy("key",e)}>                                   
                                        <Image src = {copy} width = {100} height = {100} alt = "copy button"
                                            className = {styles.results_btn_icon}/>
                                        Copy Key
                                </button>
                            </div>)
                        }
                     
               
                        
                    </div>
                    

                </div>
              
            </div>
                 <div className = {styles.tooltip}
                            style={{
                                display:isCopied.key?"inline-block":"none"
                            }}>
                            Copied!
                        </div>

        </div>
        </>
    )
}

export default CipherStatsComponent; 