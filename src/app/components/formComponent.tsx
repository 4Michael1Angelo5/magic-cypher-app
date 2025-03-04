"use client"

// import styles from "../page.module.css"
import styles from "../styles/textAreaUI.module.css"

import { useState ,useRef, useEffect} from "react"
import Image from "next/image"
import resizeIcon from "../assets/resize.svg"
import resizeMobileIcon from "../assets/resize-mobile.svg"

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

const activeTabColor = "#373744";
// const activeTabColor = "#7fffd459";
const inactiveTabColor = "#27252f";

// TextArea component using forwardRef for access to ref
export const TextArea :React.FC<TextAreaProps> = (
  ({ message, isEncrypting, handleSubmit, handleTextAreaInput,handleKeyInput ,setEncrypting,decryptionKey}) => {
   
    // const [isFocused, setIsFocused] = useState(false);
    const [canResize, setCanResize] = useState(false); 

    // const handleFocus = () => setIsFocused(true);
    // const handleBlur = () => setIsFocused(false);

    const textAreaWrapper = useRef(null);
    const formRef = useRef<HTMLFormElement>(null);

    // const [useModal,setUseModal] = useState(true);
    const [showModal,setShowModal] = useState(false);

    const isSmallDevice = ():boolean =>{

      return window.innerWidth<600
    }

    // need to make this better. it's supposed to pretty much detect whether the device is mobile or not
    // if it is mobile or a touch device then resize prop on textarea is disabled. 
    // if it is diabled then we should allow a differnt way for the user to resize the textarea

    useEffect(()=>{

      if(isSmallDevice()){
        setCanResize(false) 
      }else{ 
        setCanResize(true)
      }

    },[])

    // useEffect(()=>{
    //   if(canResize){
    //     setUseModal(false);
    //   }else{
    //     setUseModal(true)
    //   }
    // },[canResize])

 

    const toggleModal =()=>{

      if( formRef.current){
        requestAnimationFrame(()=>{
          
        formRef.current?.scrollIntoView({ behavior: "smooth" })

        })
      }
      
      return setShowModal(prev=>!prev);
    }


    const toggleEncryption = (event:React.MouseEvent<HTMLButtonElement>,target: "encrypt"|"decrypt")=>{

      //  single "|" operator is union type operator used for defining types that can be multiple values

      // event.preventDefault();
     
      setEncrypting(target === "encrypt") 

      if(formRef.current){
        formRef.current.scrollIntoView({ behavior: "smooth" })
      }

    }
 
  
    return (
      <form onSubmit={handleSubmit} ref={formRef}
        style={{ 
          transition:canResize? "none":"all .3s ease-out", 
          transform: showModal? "translateZ(1px)":"translateZ(0px)",
          zIndex:100
        }}>

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

        <div ref = {textAreaWrapper} className={styles.textarea_wrapper}
          style={{
            height:showModal ? "600px" : "150px",
            transition:canResize?"none":"height .3s ease-out",
            transformOrigin:"top",
            willChange:"height"
          }}>
          <textarea
            className = "textArea"
            // onFocus={handleFocus}   
            // onBlur={handleBlur}              
            name="paragraph_text"
            value={message}
            onChange={handleTextAreaInput}
            placeholder="Enter your message"
          />

          { 

            canResize
            ?           
            <Image
            role="button"
            src={resizeIcon}
            width={100}
            height={100}
            alt="resize icon"
            style={{
              width: "25px",
              height: "25px",
              position: "absolute",
              bottom: "5px",
              right: "5px"
            }}/>
            : 
            <Image
            role="button"  
            alt = "resize icon"
            src = {resizeMobileIcon}           
            onClick = {toggleModal}
            width = {100}
            height={100}
            style={{
              width: "25px",
              height: "25px",
              position: "absolute",
              bottom: "5px",
              right: "5px", 
              transform:"rotate(-45deg)",
              display:canResize?"none":"inline-block"
              }}>

            </Image>
          
          }


        </div>

        <button type="submit" className={styles.cyber_btn}>
          Submit
        </button>
        
        {
          // encryption key input 
          !isEncrypting &&
          <input 
            className = {styles.encryptionKeyInput} 
            value={decryptionKey || ""} 
            onChange = {handleKeyInput} 
            type="number" 
            placeholder="enter key"/>
        }
   
      </form>
    )
  }
)

