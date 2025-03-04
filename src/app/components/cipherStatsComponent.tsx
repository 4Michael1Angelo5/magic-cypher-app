"use client" 

import styles from "../styles/cipherResult.module.css"; 

import { useEffect, useState } from "react";

import stats from "../assets/stats.svg";

import Image from "next/image";

 
interface CipherStatsProps {
    messageLength: number|undefined
    time:number|undefined, 
    encryptionKey:number|undefined
}

const CipherStatsComponent:React.FC<CipherStatsProps> = ({messageLength,time,encryptionKey})=>{

    const [isOpen,setOpen] =  useState<boolean>(false);
    const [disabled,setDisabled] = useState<boolean>(true); 
    
    useEffect(()=>{

        if(messageLength && time && encryptionKey){
            
            setDisabled(false);

        }else{
            setDisabled(true);
        }

    },[messageLength,time,encryptionKey])
     
    return(
        <>
        <Image className = {styles.stats_btn} src = {stats} width={100} height = {100} alt = {"cipher stats btn"}
         onClick = {()=>setOpen(!isOpen)} role="button"
         style = {{opacity: disabled? "0%":"100%"}}/>
        <div className = {styles.cipherStatsContainer }
            style = {{
                transform:isOpen?"translateX(0%)":"translateX(120%)",
                display: disabled?"none":"block",
            }}>

            <div className = {styles.cipherStats_ui +" container"}>
            <h1>Cipher Stats</h1>
            <p> 
                message length:
                { messageLength}
            </p>
            <p> 
                time:
                { time }ms


            </p>
            <p> 
                encryption key: 
                { encryptionKey}
            </p>
            </div>

        </div>
        </>
    )
}

export default CipherStatsComponent; 