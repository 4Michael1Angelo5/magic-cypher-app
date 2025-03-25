"use client" 

import styles from "../styles/cipherResult.module.css"; 

import { useEffect, useState } from "react"; 

import btn from "@/app/styles/userMessages.module.css"

 
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

    },[messageLength,time,encryptionKey]);

    const open: string = `${btn.circlePlus} ${btn.closed} ${btn.opened}`
    const close: string = `${btn.circlePlus} ${btn.closed}`
     
    return(
        <>

        <div className = {styles.cipherStatsContainer} 
            style ={{opacity:disabled?"0":"1"}}
        >

        <h2>Your Cipher Details</h2>
        <p>Explore key insights about your cipher, including its security features and performance metrics.</p>
                <div className={isOpen?open:close}
                    onClick={()=>setOpen(!isOpen)}>
                    <div className={btn.circle}>
                        <div className={btn.horizontal}></div>
                        <div className={btn.vertical}></div>
                    </div>
                </div> 

            <div className = {styles.cipherStats_ui}
                style = {{maxHeight:isOpen?"500px":"0px", opacity:isOpen?"1":"0"}}> 
                
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