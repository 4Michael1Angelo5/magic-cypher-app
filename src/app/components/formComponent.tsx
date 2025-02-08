"use client"

// import styles from "../page.module.css"
import styles from "../styles/textAreaUI.module.css"

import { forwardRef, useState } from "react"
import Image from "next/image"
import resizeIcon from "../assets/resize.svg"

// Interface for the component's props
interface TextAreaProps {
  message: string; // message to display
  isEncrypting: boolean; // flag for encrypting or decrypting
  handleTextAreaInput: React.ChangeEventHandler<HTMLTextAreaElement>; // input handler for text area
//   encryptMessage: React.MouseEventHandler<HTMLButtonElement>; // encryption handler
//   decryptMessage: React.MouseEventHandler<HTMLButtonElement>; // decryption handler
  handleSubmit: React.FormEventHandler<HTMLFormElement>; // form submission handler
  handleKeyInput: React.ChangeEventHandler<HTMLInputElement>;
  decryptionKey:number;
  setEncrypting: React.Dispatch<React.SetStateAction<boolean>>;
}

const activeTabColor = "#373744"
const inactiveTabColor = "#27252f"

// TextArea component using forwardRef for access to ref
export const TextArea = forwardRef<HTMLFormElement, TextAreaProps>(
  ({ message, isEncrypting, handleSubmit, handleTextAreaInput,handleKeyInput ,setEncrypting,decryptionKey}, ref) => {
   
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
   
    return (
      <form onSubmit={handleSubmit} ref={ref}>

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
              onClick={()=>setEncrypting(true)}
            >
              Encrypt
            </button>
          </div>

          <div className={styles.tabButtonContainer}>
            <svg viewBox="0 0 122 40" className="tab" 
            style={{ 
                transform: "rotateY(180deg)" ,                
                // filter: (isFocused && !isEncrypting) ? "drop-shadow(0px 0px 3px aquamarine)":"",
                // stroke: (isFocused && !isEncrypting) ?"aquamarine":""
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
              onClick={()=>setEncrypting(false)}
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

        <div className={styles.textarea_wrapper}>
          <textarea
            onFocus={handleFocus}  // Trigger focus event
            onBlur={handleBlur}    // Trigger blur event          
            name="paragraph_text"
            value={message}
            onChange={handleTextAreaInput}
            placeholder="Enter your message"
          ></textarea>

          <Image
            src={resizeIcon}
            width={100}
            height={100}
            alt="resize icon"
            style={{
              width: "25px",
              height: "25px",
              position: "absolute",
              bottom: "5px",
              right: "5px",
            }}
          />
        </div>

        <button type="submit" className={styles.cyber_btn}>
          Submit
        </button>

        <input value={decryptionKey || ""} onChange = {handleKeyInput} type="number" placeholder="enter key"/>

      </form>
    )
  }
)

