"use client"
import React, { useEffect, useRef } from "react";
import { EncryptionUI } from "@/app/components/encryptionFormComponent";
import CipherStatsComponent from "@/app/components/cipherStatsComponent";
import style from "@/app/styles/imageTool.module.css";
import NavLinks from "../components/linksComponent";
import { useEncryptionForm } from "../hooks/useEncryptionForm";
import { WebGLResources } from "./webgl3"; 
import CipherResult from "../components/cipherResultComponent";
import { useSession } from "next-auth/react";
import { runTester } from "./test/tester";
import { useImageUpload } from "../hooks/useImageUpload";
import { useColorHash } from "../hooks/useColorHash";
import { usePlatformSupport } from "../hooks/usePlatformSupport";
import { useImageDownload } from "../hooks/useImageDownload";
import { useWebGL } from "../hooks/useWebGL";

export interface PixelData {
  img: HTMLImageElement;
  imgSrc: string
  imgObj: ImageData
  dimensions: {
    width: number,
    height: number,
    aspectRatio: number,
  }
}

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

  const { data: session, status } = useSession();

  // user image inputs
  const {
    pixelData,
    handleImageUpload,
    imageURL,
    imageInfo
  } = useImageUpload(inputCanvas);

  // image outputs
  const {
    outputImageURL, setOutputImageURL,
    handleOutputImageURL,
  } = useImageDownload(outputCanvas);

  // color hashing
  const {
    processImageHash,
    hashOptions, setHashOptions
  } = useColorHash();

  // device detection
  const {
    shouldUseDataURL // should this live in results?
  } = usePlatformSupport();

  // webgl resources and program execution
  const {
    runEncryptGL, cleanUpWebGL, 
    drawFlag, setDrawFlag,                   // tells webgl when its ok to run
    webglError,                              // errors that occur with webgl (context creation || webgl source code) - programmer related
    animationComplete, setAnimationComplete, // tells other components when webgl has finished animating
  } = useWebGL(outputCanvas, webGlResources);

  // debug mode for devs
  const debug = false;

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

  // 2)
  // ***************************************************************************
  //  update color hash options canvas width and height with new dimension
  // ***************************************************************************
  useEffect(() => {
    if (!pixelData) { return };
    if (!pixelData.img) return;

    setHashOptions(prev => ({
      ...prev,
      canvasWidth: pixelData.dimensions.width,
      canvasHeight: pixelData.dimensions.height
    }));

  }, [pixelData]);
  
  //3)
  // ***************************************************************************
  // color hash indexing that runs whenever the user uploads an image
  // ***************************************************************************

  useEffect(() => {

    if (!pixelData || !pixelData.img || hashOptions.canvasHeight === 0) { return };

    const runHasher = async () => {
      try {
        const magicSquareOrder = await processImageHash(pixelData.img, hashOptions);
        if (magicSquareOrder) {
          setCipherInput({ type: "image", value: magicSquareOrder });
        }
      }
      catch (e: unknown) {
        console.error("failed to hash image", e);
      }
    }
    runHasher();

  }, [pixelData, hashOptions]);
  
  //4)
  // ***************************************************************************
  //  Let WebGL know when it's ok to begin drawing
  // ***************************************************************************

  useEffect(() => {

    if (pixelData && magicCypherResults.errorMessage.length === 0) {
      setDrawFlag(true);
    } else {
      setDrawFlag(false)
    }

  }, [magicCypherResults, pixelData]);

  // 5)
  // ***************************************************************************
  //  run webgl program to animation encryption process
  // ***************************************************************************

  useEffect(() => {

    const shouldRun = cipherInput.type === "image" && cipherOutput.type === "image" && drawFlag && !loading;

    if (!shouldRun) return;

    runEncryptGL(cipherInput, cipherOutput, pixelData, loading);

    return () => {
      cleanUpWebGL();
    };
  }, [cipherOutput, loading]);


  //6)
  // ***************************************************************************
  // once the encrypted image animation has completed 
  // create a url for the image so that it can be downloaded 
  // ***************************************************************************

  useEffect(() => {
    if (!outputCanvas || !outputCanvas.current || !animationComplete) {
      return;
    }

    handleOutputImageURL(shouldUseDataURL);

  }, [animationComplete]);


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
          <label htmlFor="fileInput" className="cyber_btn">
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
              max={200}
              value={cipherInput.value}
              step="1"
              onChange={e => handleGridPartions(Number(e.target.value))} />
            <label htmlFor="cowbell">{cipherInput.value}</label>
          </div>
        }

        {/* Hidden from user - used to get pixelData of image upload*/}
        <canvas ref={inputCanvas} className={style.imageCanvas}></canvas>

        <EncryptionUI
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
          hashOptions={hashOptions}
          animationComplete={animationComplete}
          ref={outputCanvas}
          magicCypherResults={magicCypherResults}
          loading={loading}
          isCopied={isCopied}
          isEncrypting={isEncrypting}
          cipherImageURL={outputImageURL}
          pixelData={pixelData}  // <--- why does this component need this information?
          handleCopy={handleCopy}
        />
      </div>

      <CipherStatsComponent
        cipherStats={magicCypherResults.cipherStats}
        loading={loading}
        hasError={magicCypherResults.errorMessage.length != 0}
        magicCypherResults={magicCypherResults}
        handleCopy={handleCopy}
        isCopied={isCopied}
      />

      {
        debug && (

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

        )
      }

      {debug && <button onClick={runTester}>RUN TESTER</button>}

      <NavLinks />
    </div>

  );
};

export default EncryptImage;
