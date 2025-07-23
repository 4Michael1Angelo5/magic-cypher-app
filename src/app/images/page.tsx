"use client"
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { EncryptionUI } from "@/app/components/encryptionFormComponent";
import CipherStatsComponent from "@/app/components/cipherStatsComponent";
import style from "@/app/styles/imageTool.module.css"; 

import { useEncryptionForm } from "../hooks/useEncryptionForm";

import { WebGLParams, webglProgram } from "./webgl3";
import { cleanUpWebGL } from "./cleanUpWebGL";
import CipherResult from "../components/cipherResultComponent";
import { useSession } from "next-auth/react"; 
 
interface PixelData {
    img: HTMLImageElement; 
    imgSrc:string
    imgObj: ImageData
    dimensions:{
        width:number, 
        height:number,
        aspectRatio:number,     }
}

const EncryptImage: React.FC = () => {

  const { cipherInput, setCipherInput, 
          cipherOutput, setCipherOutput, 
          handleSubmit,
          hasError,
          loading,setLoading,
          isEncrypting,setEncrypting,
          decryptionKey,
          handleKeyInput,
          cipherStats
  } = useEncryptionForm(
                          {type: "image", value:  3} ,                // initialInput
                          {type:"image" , value: new Float32Array() } // initialOutput
                          );
  const [pixelData,setPixelData] = useState<PixelData | undefined>(undefined);      
                                              
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<string[] | null>(null)

  // local errors to webgl or canvas ref assignment or access
  const [webglError, setWebglError] = useState<string>("");
  
  // aspect ratio of the image the user uploads
  const [aspectRatio,setAspectRatio] = useState<number>(0); 
  
  // used to tell when to trigger draw call to webgl
  const [drawFlag,setDrawFlag] = useState<boolean>(false);
  
  // ref object of ResultsComponent where the cipher results are displayed
  const cipherResult = useRef<HTMLDivElement>(null);

  // where to draw the encrypted image
  const outputCanvas = useRef<HTMLCanvasElement | null>(null);

  // a hidden canvas used to draw the image the user uploads for encryption or decryption
  // used to get pixel data needed for image texture 
  const inputCanvas = useRef<HTMLCanvasElement | null>(null);

  // ref object that stores the results of running webgl program
  const webGlResources = useRef<WebGLResources | null>(null);

  const {data:session,status} = useSession();

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageURL(url); // create a URL for preview or WebGL use
    }
  };

    //************************************************************
    // get pixel data with 2d canvas when user uploads an image
    //************************************************************
useEffect(() => {
  if (!imageURL || !inputCanvas.current) {
    if (!imageURL) return;
    if (!inputCanvas.current) setWebglError("input canvas ref not available");
    return;
  }

  const canvas = inputCanvas.current;
  const img = new Image();
  img.src = imageURL;

  img.onload = () => {

    const width = img.width;
    const height = img.height

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setWebglError("no 2d context");
      return;
    }

    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const pixelData: PixelData = {
      img,
      imgSrc: imageURL,
      imgObj: imageData,
      dimensions: {
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      },
    };
    

    setImageInfo(
      [
        `Dimensions: width: ${width} height: ${height}` , 
        `Number of pixels: ${width*height}`,
        `File name ${imageFile?.name} `
      ]
    )

  

    setPixelData(pixelData);
    setDrawFlag(true);
  };

  return () => {
    if (imageURL) URL.revokeObjectURL(imageURL);
  };
}, [imageURL]);

 

  
  

  
  useEffect( ()=>{
    
    // setCipherInput({type:"image",value:192});

    if(pixelData){
      
    setAspectRatio(pixelData.dimensions.aspectRatio)

    }
    // return ( ()=>setCipherInput({type:"image",value:0}) )

  },[imageURL,pixelData])

  const handleCopy = ()=>{
    // dummy for now to keep things happy
  }

  const onSubmit =(event: React.FormEvent<HTMLFormElement>)=>{

        if(cipherResult.current){
        cipherResult.current.scrollIntoView({behavior:"smooth"});
      }
 
      handleSubmit(event,{session:session,sessionStatus:status});
  }

  
  // **************************************************************************
  // webgl program call to draw
  // **************************************************************************
  useEffect(()=>{
        
      if(cipherInput.type === "image"  && cipherOutput.type === "image" && drawFlag && !loading){
      

        if(!outputCanvas.current){
          setWebglError("tried to submit before html canvas element rendered to DOM or before it's reference was available");
          return;
        }
        // now non null assertion is safe!
        const canvasOUT: HTMLCanvasElement = outputCanvas.current!

        let gl: WebGL2RenderingContext | null = null  

        gl = canvasOUT.getContext("webgl2");
      //--------------------------------------------------------------

        if (!gl) {
          //if webgl is not supported
          const isWebGL1Supported = outputCanvas.current!.getContext("webgl");
          if (!isWebGL1Supported) {

            setWebglError("Browser Does not Support WebGL 2 but supports webgl 1")

          } else {
            setWebglError("Browser Does not Support Webgl");
          }
          // end program
          return;
        }

        //--------------------------------------------------------------
        // webgl program call

        if( pixelData){

          let webglResult: WebGLResult;

          const webglParams:WebGLParams = {
            gridPartitions: cipherInput.value,
            outputCanvas:outputCanvas,
            glCtx:gl,
            imgData:pixelData.imgObj,  
            width: pixelData.dimensions.width,
            height: pixelData.dimensions.height, 
            lookupTexture: cipherOutput.value
            }

            webglResult = webglProgram(webglParams);
          
            if (webglResult?.resources) {
              // store webgl resources inside a ref instead of state because it protects it persists across re renders
              // update webgl resources 
              webGlResources.current = webglResult.resources;
            }

            if (webglResult?.error) {
              setWebglError(webglResult?.error);
            }
        }

        setDrawFlag(false);

        return () => {
            if (gl && canvasOUT && webGlResources.current) {
              cleanUpWebGL(gl, canvasOUT, webGlResources.current);
              webGlResources.current = {}; // optional reset
            }
          };
    }
  },[cipherOutput, loading])

  const handleGridPartion = (e:React.ChangeEvent<HTMLInputElement>)=>{

    setCipherInput({type:"image",value: Number(e.target.value)});  
  }


  return (
    <div>
      <h1>Encrypt an Image!</h1>
      <input type="file" accept="image/*" onChange={handleImage} />

      <input
        type="range"
        id="cowbell"
        name="cowbell"
        min="3"
        max="100"
        value= {cipherInput.value}
        step="1" 
        onChange={e=>handleGridPartion(e)}
        /> 
        <label>{cipherInput.value}</label>
      <div className="row d-flex justify-content-center">
        
        {/* Hidden from user - used to get pixelData of image upload*/}
        <canvas ref={inputCanvas} className={style.imageCanvas}></canvas>

        <EncryptionUI
          encryptionInput = {cipherInput}
          isEncrypting = {isEncrypting}  
          handleTextAreaInput={()=>{}} // make this optional
          handleSubmit={onSubmit}
          handleKeyInput={handleKeyInput}
          decryptionKey={decryptionKey}
          setEncrypting={setEncrypting} 
          imageURL={imageURL}
          aspectRatio = {aspectRatio}
        />
      </div>
      
      <div ref = {cipherResult}>
      <CipherResult
        ref = {outputCanvas}
        cipherFormatType = {"image"}
        loading = {loading}
        cipher = {cipherOutput.value}
        isCopied = {false}
        isEncrypting = {true}
        encryptionKey= {0}
        hasError = {true}
        handleCopy = {handleCopy}
      />
      </div>

      <CipherStatsComponent
        messageLength = {cipherStats?.messageLength}
        time = {cipherStats?.time}
        encryptionKey={cipherStats?.encryptionKey}
        loading = {loading}
        hasError = {hasError}
      /> 

      <div className={style.imageInfoBox}>
        {
          imageInfo
          // only display information about the image if it is defined
          &&
          (
            imageInfo.map((e, i) => {
              return (
                <p key={i}>
                  {
                    e
                  }
                </p>
              )
            })

          )
        }
        {webglError && webglError}
      </div>
    </div>
  );
};

export default EncryptImage;
