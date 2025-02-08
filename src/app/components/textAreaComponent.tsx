"use client"

// import styles from "../page.module.css"
import styles from "../styles/textAreaUI.module.css"


import { forwardRef } from "react";


import Image from "next/image";
import resizeIcon from "../assets/resize.svg"

// interface/ contract agreement that this component will recieve the following props
interface TextAreaProps {
    // a message 
    message:string; 
    
    //used to track whether the user is encrypting or decrypting
    isEncrypting:boolean;
    
    // calls set message
    handleTextAreaInput:React.ChangeEventHandler<HTMLTextAreaElement>;
    
    // handle encryption logic with server actions
    encryptMessage:React.MouseEventHandler<HTMLButtonElement>;
    
    // handle decryption logic with server actions
    decryptMessage:React.MouseEventHandler<HTMLButtonElement>;

    handleSubmit: React.MouseEventHandler<HTMLButtonElement>;
}

const activeTabColor = "#373744";
const inactiveTabColor = "#27252f";

 // react functional component that takes TextAreaProps
export const TextArea = forwardRef<HTMLDivElement,TextAreaProps> (({message,isEncrypting,handleSubmit,encryptMessage,handleTextAreaInput,decryptMessage},ref)=>{

    return(

        <div ref = {ref}>

            <div  className = {styles.tabBar}  
                  style ={{              
                  display:"flex",
                  justifyContent:"space-between"
                  }}>

                <div className = {styles.tabButtonContainer}>

                    {/* tab shape  */}
                    <svg viewBox="0 0 122 40"
                    className="tab"
                    >
                    <path id="tab-shape" d="M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v28.033h122v-11H116.486
                        z" fill={isEncrypting?activeTabColor:inactiveTabColor}/>
                    </svg>
                
                    {/* button positioned absolutly to fit inside svg tab shape */}
                    <button className={styles.cyber_btn}
                        style= {{
                            position:"absolute",
                            top:"-10px",
                            left:"-10px",
                            color:isEncrypting ? "aquamarine" :"#757575",
                            // boxShadow:isEncrypting? "0px 1px 3px 0px var(--primary-color)" : ""
                        }}
                        onClick = {encryptMessage}>
                        Encrypt
                    </button>

                </div>

                <div className = {styles.tabButtonContainer}>
                    
                    {/* right side svg tab shape (decrypt button)*/}
                    <svg viewBox="0 0 122 40"
                    className="tab"
                    style = {{
                    transform:"rotateY(180deg)"
                    }}>
                    <path id="tab-shape" d="M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v28.033h122v-11H116.486
                        z" fill={isEncrypting?inactiveTabColor:activeTabColor}/>
                    </svg>
                    
                    {/* positioned absolutley to fit insie svg tab shape */}
                    <button className={styles.cyber_btn}
                        onClick={decryptMessage}
                        style= {{
                            position:"absolute",
                            top:"-10px",
                            right:"-10px",
                            color:isEncrypting ? "#757575" :"aquamarine",
                            // boxShadow:isEncrypting? "" : "0px 1px 3px 0px var(--primary-color)"
                        }}>
                        Decrypt
                    </button>

                </div>

   
            </div>

            <div className = {styles.textarea_wrapper}>
                    
                <textarea                  
                    name="paragraph_text"
                    value={message}
                    onChange={handleTextAreaInput} // Track input changes with state
                    placeholder="Enter your message">

                </textarea>
                <Image src={resizeIcon} width={100} height = {100} alt="resize icon" 
                    style = {{
                    width:"25px",
                    height:"25px",
                    position:"absolute",
                    bottom:"5px",   
                    right:"5px",

                    }}
                />

            </div> 

            <button className = {styles.cyber_btn}
            onClick={handleSubmit}
            >
                Submit
            </button>

        </div>
          
    )

})