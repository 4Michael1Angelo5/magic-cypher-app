"use client"
import React, { useEffect, useRef, useState } from "react";
import { CipherForm } from "@/app/components/cipherForm";
import CipherStatsComponent from "@/app/components/cipherStatsComponent";
import CipherResult from "../components/cipherResult";
import { ImageDebugger } from "./imageDebugger";

import style from "@/app/styles/imageTool.module.css";
import NavLinks from "../components/linksComponent";
import { WebGLResources } from "./webglMagic";

// hooks
import { useEncryptionForm } from "../hooks/useEncryptionForm";
import { useSession } from "next-auth/react"; 
import { useImageUpload } from "../hooks/useImageUpload";
import { useColorHash } from "../hooks/useColorHash";
import { usePlatformSupport } from "../hooks/usePlatformSupport";
import { useImageDownload } from "../hooks/useImageDownload";
import { useWebGL } from "../hooks/useWebGL";  

export interface PixelData {
  img: HTMLImageElement;
  imgSrc: string
  dimensions: {
    width: number,
    height: number,
    aspectRatio: number,
  }
}

// debug mode for devs
const debug = false;

const EncryptImage: React.FC = () => {

  const {
    cipherInput, setCipherInput,
    cipherOutput,
    handleSubmit,
    loading,
    isEncrypting, setEncrypting,
    decryptionKey,
    handleKeyInput,
    magicCypherResults,
    handleCopy, isCopied
  } = useEncryptionForm(
    { type: "image", value: 3 },                // initialInput
    { type: "image", value: new Float32Array() } // initialOutput
  );


  // a hidden canvas used to draw the image the user uploads for encryption or decryption
  // used to get pixel data needed for image texture 
  const inputCanvas = useRef<HTMLCanvasElement | null>(null); 

  // where to draw the encrypted image
  const outputCanvas = useRef<HTMLCanvasElement | null>(null);

  // ref object that stores the results of running webgl program
  const webGlResources = useRef<WebGLResources | null>(null);

  // ref object of ResultsComponent where the cipher results are displayed
  const cipherResult = useRef<HTMLDivElement>(null);

  const [layoutReady, setLayoutReady] = useState<boolean>(false);

  const { data: session, status } = useSession();

  // user image inputs
  const {
    pixelData,
    handleImageUpload,
    imageURL, 
    inputImageRef,
    imageInfo
  } = useImageUpload(debug);

  // image outputs
  const {
    outputImageURL, setOutputImageURL,
    handleOutputImageURL,
  } = useImageDownload(outputCanvas);

  // color hashing
  const {
    hashImage, 
    getImageDataFromOutputCanvas
  } = useColorHash();

  // device detection
  const {
    shouldUseDataURL // should this live in results?
  } = usePlatformSupport();

  // webgl resources and program execution
  const {
    runEncryptGL, cleanUpWebGL,
    drawFlag, setDrawFlag,                   // tells webgl when it's ok to run
    webglError,                              // errors that occur with webgl (context creation || webgl source code) - programmer related
    animationComplete, setAnimationComplete, // tells other components when webgl has finished animating
  } = useWebGL(outputCanvas, inputImageRef, webGlResources);

  // set magic square order for image inputs (only used in debugger for slider input type)
  const handleGridPartions = (n: number) => {
    // const gridPartions =  Math.floor(aspectRatio * 50); 
    setCipherInput({ type: "image", value: n });
  };

  // handler for submitting image to server for encryption/decryption requests
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {

    if (cipherResult.current) {
      cipherResult.current.scrollIntoView({ behavior: "smooth" });
    } 
    setOutputImageURL("");
    setAnimationComplete(false);
    handleSubmit(event, { session: session, sessionStatus: status });
  }

  // 1) user uploads an image
  
     //2)
    // ***************************************************************************
    // color hash indexing that runs whenever the user uploads an image
    // ***************************************************************************
  
    useEffect(() => {
  
      const shouldNotRunHash =  !pixelData || 
                                !pixelData.img || 
                                !layoutReady 
  
      if (shouldNotRunHash) { return };
      if (!inputImageRef.current) return; 
      
      const startTime = performance.now();
      const magicSquareOrder = hashImage(inputImageRef.current);
      const endTime = performance.now(); 
      const elapsedTime = endTime - startTime;
      console.log("Elapsed Time (main thread + RGB): ",elapsedTime);
      console.log("Hash Index: " + magicSquareOrder +"\n");
      console.log(magicSquareOrder);
      setCipherInput({type: "image", value:magicSquareOrder })
      setLayoutReady(false)
    }, [pixelData, layoutReady,
      // lint warnings...
      hashImage,
      inputImageRef,
      setCipherInput
    ]);
  
    //3)
    // ***************************************************************************
    //  Let WebGL know when it's ok to begin drawing
    // ***************************************************************************
  
    useEffect(() => {
  
      if (pixelData && magicCypherResults.errorMessage.length === 0) {
        setDrawFlag(true);
      } else {
        setDrawFlag(false)
      }
  
    }, [magicCypherResults, pixelData, 
      // eslint error...
      setDrawFlag
    ]);
  
    // 4)
    // ***************************************************************************
    //  run webgl program to animate encryption process
    // ***************************************************************************
  
    useEffect(() => {
  
      const shouldRun = 
                      cipherOutput.type === "image"
                      && cipherOutput.value.length > 0                
                      && drawFlag 
                      && !loading;
  
      if (!shouldRun) return;
  
      runEncryptGL(cipherInput, cipherOutput, pixelData, loading);
  
      return () => {
        cleanUpWebGL();
      };
    }, [cipherOutput, loading,
      // eslint errors..
      // cipherInput', 'cleanUpWebGL', 'drawFlag', 'pixelData', and 'runEncryptGL.
      // cipherInput, <---- error causing
      // cleanUpWebGL, //,---- error causing
      // drawFlag, //<---- error causing
      // pixelData, //<--- causes webgl to run when it shouldn't
      // runEncryptGL <----- error causing

    ]);
  
  
    //5)
    // ***************************************************************************
    // once the encrypted image animation has completed 
    // create a url for the image so that it can be downloaded 
    // ***************************************************************************
  
    useEffect(() => {
      if (!outputCanvas || !outputCanvas.current || !animationComplete) {
        return;
      }
  
      const imageData:ImageData|null = getImageDataFromOutputCanvas(outputCanvas.current); 
  
      if (imageData && debug) {
        const hashResult = hashImage(imageData);
        console.log("mainthread + RGB hashResult: " + hashResult)
      }
  
      handleOutputImageURL(shouldUseDataURL);
  
    }, [animationComplete]);
  
    //6)
    // ***************************************************************************
    // once the encrypted image animation has completed 
    // create a url for the image so that it can be downloaded 
    // ***************************************************************************

  return (
    <div>
      <h1>Encrypt an Image!</h1>
      <div className="row d-flex justify-content-center">

        <div className="col-12">
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <label htmlFor="fileInput" className="cyber_btn" role="button">
            Upload Image
          </label>
        </div>

        {
          debug &&
          <div className="col-6 d-lex justify-content-end">
            <input
              type="range"
              id="cowbell"
              name="cowbell"
              min={3}
              max={600}
              value={cipherInput.value}
              step="1"
              onChange={e => handleGridPartions(Number(e.target.value))} />
            <label htmlFor="cowbell">{cipherInput.value}</label>
          </div>
        }

        {/* Hidden from user - used to get pixelData of image upload*/}
        <canvas ref={inputCanvas} className={style.imageCanvas}></canvas>

        <CipherForm
          setLayoutReady = {setLayoutReady} 
          encryptionInput={cipherInput}
          isEncrypting={isEncrypting}
          handleTextAreaInput={() => { }} // make this optional
          handleSubmit={onSubmit}
          handleKeyInput={handleKeyInput}
          decryptionKey={decryptionKey}
          setEncrypting={setEncrypting}
          imageURL={imageURL}
          uploadedImage={pixelData}
        />
      </div>

      <div ref={cipherResult}>
        <CipherResult
          // hashOptions={hashOptions}
          animationComplete={animationComplete}
          ref={outputCanvas}
          magicCypherResults={magicCypherResults}
          loading={loading}
          isCopied={isCopied}
          isEncrypting={isEncrypting}
          cipherImageURL={outputImageURL}
          pixelData={pixelData}
          handleCopy={handleCopy}
          // hashOutputImg={hashOutputImg2}
        />
      </div>
      {

        magicCypherResults.output.value.length != 0 ?

          <CipherStatsComponent
            cipherStats={magicCypherResults.cipherStats}
            loading={loading}
            hasError={magicCypherResults.errorMessage.length != 0}
            magicCypherResults={magicCypherResults}
          />
          :
          <div className= {style.statsComponentPlaceHolder}/>
      }
      {
        debug && 
          <ImageDebugger imageInfo={imageInfo ?? [""]} webglError={webglError}/>
      }
      <NavLinks />
    </div>

  );
};

export default EncryptImage;
