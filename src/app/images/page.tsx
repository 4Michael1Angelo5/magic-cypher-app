"use client"
import React, { useEffect, useState, useRef } from "react";
import { EncryptionUI } from "@/app/components/encryptionFormComponent";
import CipherStatsComponent from "@/app/components/cipherStatsComponent";
import style from "@/app/styles/imageTool.module.css"; 

import { useEncryptionForm } from "../hooks/useEncryptionForm";

import { WebGLParams, webglProgram , WebGLResources, WebGLResult } from "./webgl3";
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
          cipherOutput, 
          handleSubmit,
          loading,
          isEncrypting,setEncrypting,
          decryptionKey,
          handleKeyInput,
          magicCypherResults
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

  const [shouldUseDataURL, setShouldUseDataURL] = useState(false);
  const [isMobile,setIsMobile] = useState(true);

  const [cipherImageURL,setCipherImageURL] = useState<string>("")
  const [animationComplete,setAnimationComplete] = useState<boolean>(false); 
  const {data:session,status} = useSession();
  
  // detect device and browser user agent
    useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;

      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      
      const isWebView = (
        // iOS WebView doesn't contain Safari
        (isIOS && !userAgent.includes("Safari")) ||
        // iOS WKWebView often lacks "Version" string
        (/AppleWebKit/.test(userAgent) && !/Version/.test(userAgent))
      );

      const isChromeiOS = /CriOS/.test(userAgent); // Chrome on iOS

      if (isWebView || isChromeiOS) {
        setShouldUseDataURL(true);
      }
      if( /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ){
            
            setIsMobile(true); 
        }else{
            setIsMobile(false);
        }
    }, []);
 

    const handleCipherImageURL = () =>{
      if(!outputCanvas || !outputCanvas.current){
        return;
      } 
    const canvas:HTMLCanvasElement = outputCanvas.current; 

    if(!canvas){
      return;
    }

    if(isMobile){

      if(shouldUseDataURL){
        // enable long press to initiate download for
        // iphone users on chrome or google app

        // chrome and google app on iphone do not enable long press
        // for images that are blob urls or have opacity less then 0.5
        const url = canvas.toDataURL("image/jpeg");
        setCipherImageURL(url);

      }else{
        // safari on iOs supports this natively 
        canvas.toBlob((blob)=>{
        if(!blob){return};
        const url = URL.createObjectURL(blob);
        setCipherImageURL(url);
        }, "image/jpeg");
        }

    }else{
      // desktop supports also supports blob url 
        canvas.toBlob((blob)=>{
        if(!blob){return};
        const url = URL.createObjectURL(blob);
        setCipherImageURL(url);
        }, "image/jpeg");
        


    } 
  } 

  useEffect(()=>{
    if(animationComplete  === true){
      handleCipherImageURL();
    } 
  },[animationComplete]);

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

    const width = img.width;  const height = img.height

    canvas.width = width;     canvas.height = height;

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
      console.log("updating pixel data")
      setDrawFlag(true);
      console.log("setting draw flag to true")
    };

    // return () => {
    //   console.log("revoking ObjectURL")
    //   if (imageURL) URL.revokeObjectURL(imageURL);
    // };
  }, [imageURL]);
  
  useEffect( ()=>{
     
    if(pixelData){      
    setAspectRatio(pixelData.dimensions.aspectRatio)
    } 

  },[imageURL,pixelData]);

const handleDownload = (canvasRef: React.ForwardedRef<HTMLCanvasElement>) => {
  let canvas: HTMLCanvasElement | null = null;

  if (!canvasRef) {
    console.error("No ref provided");
    return;
  }

  // If ref is a function (callback ref)
  if (typeof canvasRef === "function") {
    // You can't synchronously get the current canvas element from a callback ref
    // So you'd have to refactor so the element is passed directly,
    // or store the element elsewhere and pass it here.
    console.error("Callback refs cannot be used here directly");
    return;
  } else if ("current" in canvasRef) {
    // It's a RefObject
    canvas = canvasRef.current;
  }

  if (!canvas) {
    console.error("Canvas element not available");
    return;
  }

    canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "encrypted-image.jpeg";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/jpeg");
  };

  // make sure cipher image output url resets everytime cipher inputs change
  // that way the previous image ouput does not flash when opacity changes from 0 to 1 
  // to render the new image ouput overlay. 
  useEffect(()=>{setCipherImageURL("")},[imageURL,cipherInput])

  const onSubmit =(event: React.FormEvent<HTMLFormElement>)=>{

        if(cipherResult.current){
        cipherResult.current.scrollIntoView({behavior:"smooth"});
      }
      setCipherImageURL(""); 
      setAnimationComplete(false);
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

        gl = canvasOUT.getContext("webgl2",{preserveDrawingBuffer: true});
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

        if(pixelData){

          const webglParams:WebGLParams = {
            setAnimationComplete:setAnimationComplete,
            gridPartitions: cipherInput.value,
            outputCanvas:outputCanvas,
            glCtx:gl,
            imgData:pixelData.imgObj,  
            width: pixelData.dimensions.width,
            height: pixelData.dimensions.height, 
            lookupTexture: cipherOutput.value
            }

            const webglResult:WebGLResult = webglProgram(webglParams);

          
            if (webglResult?.resources) {
              // store webgl resources inside a ref instead of state because it protects it persists across re renders
              // update webgl resources 
              webGlResources.current = webglResult.resources;
            }

            if (webglResult?.error) {
              setWebglError(webglResult?.error);
            }
        }

        return () => {
          console.log("cleaning up webgl")
            if (gl && canvasOUT && webGlResources.current) {
              cleanUpWebGL(gl, canvasOUT, webGlResources.current);
            }
          };
    }
  },[cipherOutput, loading])

  const handleGridPartion = (e:React.ChangeEvent<HTMLInputElement>)=>{

    setCipherInput({type:"image",value: Number(e.target.value)});  
  }

  useEffect(()=>{
    if(!pixelData && magicCypherResults.errorMessage.length!=0){
      console.log("Either there is no pixel data or magic cypher results returned an error")
      setDrawFlag(false);
    }else{
      console.log("good to draw")
      setDrawFlag(true);
    }
    
  },[magicCypherResults,pixelData]);

  return (
    <div>
      <h1>Encrypt an Image!</h1>
      <h2>{shouldUseDataURL ? "chrome or webview detected": "ios safari detected"}</h2>
      <input type="file" accept="image/*" onChange={handleImage} />

      <input
        type="range" 
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
          magicCypherResults={magicCypherResults}
        />
      </div>
      
      <div ref = {cipherResult}>
      <CipherResult
        animationComplete = {animationComplete}
        ref = {outputCanvas}
        magicCypherResults = {magicCypherResults} 
        loading = {loading} 
        isCopied = {false}
        isEncrypting = {isEncrypting}  
        handleDownload={handleDownload}  
        cipherImageURL= {cipherImageURL} 
      />
      </div>

      <CipherStatsComponent
        cipherStats={magicCypherResults.cipherStats}
        loading = {loading}
        hasError = {magicCypherResults.errorMessage.length!=0}
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
