"use client" 

import styles from "../styles/cipherResult.module.css"; 

import { useEffect, useState } from "react";   

import btn from "@/app/styles/tableStyles.module.css";
import { CipherStats } from "../types/CipherStats";  
import { MagicCypherResults } from "../types/MagicCypherResults"; 

interface CipherStatsProps {
    cipherStats:CipherStats
    hasError:boolean
    loading:boolean 
    magicCypherResults:MagicCypherResults 
}

 
const CipherStatsComponent = ({hasError,loading,cipherStats}:CipherStatsProps)=>{

    const [isOpen,setOpen] =  useState<boolean>(false);
    const [disabled,setDisabled] = useState<boolean>(true); 

   
    
    useEffect(()=>{  
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

        <div className = {styles.cipherStatsContainer}
            style= {{
            marginTop:"75px",
            opacity:disabled? "0":"1", 
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
                        
                    </div>
                    

                </div>
              
            </div>

        </div>
        </>
    )
}

export default CipherStatsComponent; 