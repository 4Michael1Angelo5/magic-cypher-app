"use client"

import styles from "@/app/styles/textAreaUI.module.css"
import { SetStateAction } from "react";
 

interface EncryptionFormTabsProps {
    isEncrypting:boolean;
    toggleEncryption: (event: React.MouseEvent<HTMLButtonElement>, target: "encrypt" | "decrypt") => void;
}

const activeTabColor = "#373744";
// const activeTabColor = "#7fffd459";
const inactiveTabColor = "#27252f";

export const EncryptionFormTabs:React.FC<EncryptionFormTabsProps>= ({
    isEncrypting,
    toggleEncryption
})=>{
    return(
                <div className={styles.tabBar} style={{ display: "flex", justifyContent: "space-between" }}>

          <div className={styles.tabButtonContainer}>
            <svg viewBox="0 0 122 40" className="tab"
             style ={{
                // filter: (isFocused && isEncrypting)  ? "drop-shadow(0px 0px 3px aquamarine)":"",
                // stroke: (isFocused && isEncrypting)  ? "aquamarine":""
                 
            }}>
              <path
                id="tab-shape"
                d="M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v28.033h122v-11H116.486z"
                fill={isEncrypting ? activeTabColor : inactiveTabColor}
              />
            </svg>

            <button
              type = "button"
              className={styles.toggle_encryption_btn}
              style={{
                position: "absolute",
                top: "-10px",
                left: "-10px",
                color: isEncrypting ? "aquamarine" : "#757575",
              }}
              onClick={(event)=>toggleEncryption(event,"encrypt")}
            >
              Encrypt
            </button>
          </div>

          <div className={styles.tabButtonContainer}>
            <svg viewBox="0 0 122 40" className="tab" 
                style={{ 
                transform: "rotateY(180deg)" ,                
                }}>
              <path
                id="tab-shape"
                d="M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v28.033h122v-11H116.486z"
                fill={isEncrypting ? inactiveTabColor : activeTabColor}              
              />
            </svg>

            <button
              type="button"
              className={styles.toggle_encryption_btn}
              onClick={(event)=>toggleEncryption(event,"decrypt")}
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                color: isEncrypting ? "#757575" : "aquamarine",
              }}
            >
              Decrypt
            </button>
          </div>

        </div>
    )
}