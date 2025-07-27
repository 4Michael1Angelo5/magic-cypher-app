"use client" 

import styles from "../styles/cipherResult.module.css"; 

import { useEffect, useState } from "react"; 

import btn from "@/app/styles/tableStyles.module.css";
import { CipherStats } from "../types/CipherStats"; 

interface CipherStatsProps {
    cipherStats:CipherStats
    hasError:boolean
    loading:boolean 
}

 
const CipherStatsComponent:React.FC<CipherStatsProps> = ({hasError,loading,cipherStats})=>{

    const [isOpen,setOpen] =  useState<boolean>(false);
    const [disabled,setDisabled] = useState<boolean>(true); 
    
    useEffect(()=>{
        console.log(cipherStats)
        console.log(hasError)

        if(cipherStats.messageLength && cipherStats.time && cipherStats.encryptionKey && !loading && !hasError){
            
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
            opacity:disabled? "0":"1"
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
                            message length:
                            { cipherStats.messageLength}
                        </p>
                        <p> 
                            time:
                            { cipherStats.time }ms
                        </p>
                        <p> 
                            encryption key: 
                            { cipherStats.encryptionKey}
                        </p>
                        
                    </div>

                </div>
            </div>

        </div>
        </>
    )
}

export default CipherStatsComponent; 