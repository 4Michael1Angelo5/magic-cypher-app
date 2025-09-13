"use client"

// import styles from "../page.module.css"
import styles from "../styles/textAreaUI.module.css"

import { useState ,useRef, useEffect} from "react"
import {EncryptionFormTabs} from "./encryptionFormTabsComponent"
import Image from "next/image"
import resizeIcon from "../assets/resize.svg"
import resizeMobileIcon from "../assets/resize-mobile.svg"
import { EncryptionInput } from "../types/EncryptionInput"  
import { PixelData } from "../images/page"
import { usePlatformSupport } from "../hooks/usePlatformSupport"

// Interface for the component's props
interface EncryptionUIprops { 
  isEncrypting: boolean; // flag for encrypting or decrypting
  handleTextAreaInput?: React.ChangeEventHandler<HTMLTextAreaElement>; // input handler for text area
  handleSubmit: React.FormEventHandler<HTMLFormElement>; // form submission handler
  handleKeyInput: React.ChangeEventHandler<HTMLInputElement>;
  decryptionKey:number;
  setEncrypting: React.Dispatch<React.SetStateAction<boolean>>; 
  imageURL?: string | null 
  encryptionInput:EncryptionInput 
  uploadedImage?:PixelData;
}

// TextArea component using forwardRef for access to ref
export const EncryptionUI :React.FC<EncryptionUIprops> = (({
                                                      uploadedImage, // width/height
                                                      imageURL,
                                                      encryptionInput,
                                                      isEncrypting,
                                                      handleSubmit,
                                                      handleTextAreaInput,
                                                      handleKeyInput,
                                                      setEncrypting,
                                                      decryptionKey,
                                                      }) => {
   
    const textAreaWrapper = useRef(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [showModal,setShowModal] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null)
    const [wrapperHeight,setWrapperHeight] = useState("0");

    const {isMobile} = usePlatformSupport();    
       
    // expand/ collapse encryption ui for mobile users
    const toggleModal =()=>{

      if( formRef.current){

        requestAnimationFrame(()=>{
        formRef.current?.scrollIntoView({ behavior: "smooth" })

        })
      }
      
      return setShowModal(prev=>!prev);
    }

    // switch between encryption or decryption directions
    const toggleEncryption = (event:React.MouseEvent<HTMLButtonElement>,target: "encrypt"|"decrypt")=>{

      //  single "|" operator is union type operator used for defining types that can be multiple values
     
      setEncrypting(target === "encrypt"); 

      if(formRef.current){
        formRef.current.scrollIntoView({ behavior: "smooth" })
      }

    }

    const submitForm = (event: React.FormEvent<HTMLFormElement>)=>{
      event.preventDefault();
      
      // if the user is on a mobile device and the input ui is expanded close it
      if(isMobile && showModal ){
        setShowModal(prev=>!prev);
      }
      handleSubmit(event);
    }
    
    // resize the input ui when a user uploads an image 
    // so that they can see the whole image in the ui
    useEffect(()=>{

    const aspectRatio = uploadedImage?.dimensions.aspectRatio;

    if(!aspectRatio) return;    
    // if the user is trying to encrypt an image
    // but the refs are not available or the image is not yet
    // uploaded do not run the effect
    if((!imageURL || !imgRef ) && encryptionInput.type === "image") return;
    // if the image ref is not available and the user is trying to 
    // encrypt an image do not run the effect.
    if(!imgRef.current && encryptionInput.type === "image"){
      return;
    }

    if(imgRef.current){

    const curImgWidth = imgRef.current.clientWidth; 
    
    const containerHeight = curImgWidth/aspectRatio;

        if(aspectRatio){
          setWrapperHeight(`${containerHeight}px`);
        }else{
          setWrapperHeight("120px");
        }
    }
 
    }
    ,[imageURL, uploadedImage , imgRef])

    useEffect(()=>{
      if(showModal){
        setWrapperHeight("600px");
      }else{
        setWrapperHeight("120px");
      }
       
    },[showModal])
 
  
    return (
      <form onSubmit={submitForm} ref={formRef}
        // @TODOS all this style needs to be put in css class
        style={{ 
          willChange:"transform",
          position:"relative",
          transition:!isMobile? "none":"all .3s ease-out", 
          transform: showModal? "scale(1.07)":"scale(1)",
          perspective:showModal? "12px":"10px",
          zIndex:9
        }}>

        {/* Navigation Tabs for encryption direction ie (encrypt/ decrypt) */}
        <EncryptionFormTabs isEncrypting = {isEncrypting} toggleEncryption={toggleEncryption}/>

        <div ref = {textAreaWrapper} className={styles.textarea_wrapper} //@TODO this css class name needs to be changed bc it is 
                                                                         // no longer just a text area it could also be an image
                                                                         // maybe something like encryptionUIwrapper
          style={{
            height:wrapperHeight,
            // Disable transitions on desktop because manual resizing interferes with animation.
            // On mobile, we allow smooth height transitions since users can't resize manually.  
            // @TODOS all this style needs to be put in css class
            transition:!isMobile?"none":"height .3s ease-out",
            transformOrigin:"top",
            willChange:"height",
            }}>

          {
            //render a text area only if they are trying to encrypt a text
            encryptionInput.type === "text" && (
              <textarea
              className = "textArea"            
              name="paragraph_text"
              value={encryptionInput.value}
              onChange={handleTextAreaInput}
              placeholder="Enter your message"
            />)
          }
          {
            // render an image only if they are trying to encrypt an image and the image has been uploaded
            encryptionInput.type === "image" && imageURL && (
              <img
              ref = {imgRef}
              src={imageURL}
              alt="Uploaded preview"
              style={{  
                width: "100%", 
                border: "1px solid #ccc",
                borderRadius: "10px",
                opacity:1,                
                pointerEvents: 'auto', // must allow touch!
                WebkitTouchCallout: 'default', // this enables long-press
                }}/>)            
          } 

           {/* Resize Icon Logic */}
          {
          //render mobile resize icons only if user is encrypting text messages
          isMobile && encryptionInput.type === "text" && 
          <Image
          role="button"  
          alt = "resize icon"
          src = {resizeMobileIcon}           
          onClick = {toggleModal} 
          width = {100}
          height={100}
          // @TODOS all this style needs to be put in css class
          style={{
            width: "25px",
            height: "25px",
            position: "absolute",
            zIndex:"10",
            bottom: "5px",
            right: "5px", 
            transform:"rotate(-45deg)", 
            }}>
          </Image>
          }
          {    
          // render a drag resize icon only if the user is on desktop
          !isMobile &&  
            <Image
              role="button"
              src={resizeIcon}
              width={100}
              height={100}
              alt="resize icon"
              // @TODOS all this style needs to be put in css class
              style={{
                width: "25px",
                height: "25px",
                position: "absolute",
                bottom: "5px",
                right: "5px"
              }}/>
          }
        </div>

        <button type="submit" className= "cyber_btn">
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

