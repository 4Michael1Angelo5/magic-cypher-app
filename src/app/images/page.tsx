"use client"
import React, { useEffect, useState, useRef } from "react";
import { EncryptionUI } from "@/app/components/encryptionFormComponent";
import CipherStatsComponent from "@/app/components/cipherStatsComponent";
import style from "@/app/styles/imageTool.module.css";
import NavLinks from "../components/linksComponent";

import PerceptualColorHasher from "@/app/images/perceptualColorHasher";


import { useEncryptionForm } from "../hooks/useEncryptionForm";

import { WebGLParams, webglProgram, WebGLResources, WebGLResult } from "./webgl3";
import { cleanUpWebGL } from "./cleanUpWebGL";
import CipherResult from "../components/cipherResultComponent";
import { useSession } from "next-auth/react";
import { PerceptualColorHasherOptions } from "./perceptualColorHasher";
import { runTester } from "./test/tester";

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

  const { cipherInput, setCipherInput,
    cipherOutput,
    handleSubmit,
    loading,
    isEncrypting, setEncrypting,
    decryptionKey,
    handleKeyInput,
    magicCypherResults,
    colorIndexToGridNumber,
    handleCopy, isCopied
  } = useEncryptionForm(
    { type: "image", value: 3 },                // initialInput
    { type: "image", value: new Float32Array() } // initialOutput
  );

  const [pixelData, setPixelData] = useState<PixelData | undefined>(undefined);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imageURL, setImageURL] = useState<string | null>(null);

  // for debug use
  const [imageInfo, setImageInfo] = useState<string[] | null>(null);

  const [hashOptions, setHashOptions] = useState<PerceptualColorHasherOptions>({
    canvasWidth: 0,
    canvasHeight: 0,
    hueBuckets: 24,
    saturationBuckets: 10,
    valueBuckets: 10
  })
  const debug = false;

  // local errors to webgl or canvas ref assignment or access
  const [webglError, setWebglError] = useState<string>("");

  // used to tell when to trigger draw call to webgl
  const [drawFlag, setDrawFlag] = useState<boolean>(false);

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

  const [cipherImageURL, setCipherImageURL] = useState<string>("")
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const { data: session, status } = useSession();

  // detect device and browser user agent ==? this needs to move to a custom hook
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
  }, []);

  // use the approptiate url type (blob or data url) 
  // for the encrypted/decrypted image output from MagicCypher
  const handleOutputImageURL = () => {
    if (!outputCanvas || !outputCanvas.current) {
      return;
    }
    const canvas: HTMLCanvasElement = outputCanvas.current;
    if (!canvas) return;

    if (shouldUseDataURL) {
      const url = canvas.toDataURL("image/png");
      setCipherImageURL(url);

    } else {
      canvas.toBlob((blob) => {
        if (!blob) { return };
        const url = URL.createObjectURL(blob);
        setCipherImageURL(url);
      }, "image/png");
    }
  }

  // once the encrypted image animation has completed 
  // create a url for the image so that it can be downloaded
  useEffect(() => {
    if (animationComplete === true) {
      handleOutputImageURL();
    }
  }, [animationComplete]);


  // set magic square order for image inputs
  const handleGridPartions = (n: number) => {
    // const gridPartions =  Math.floor(aspectRatio * 50); 
    setCipherInput({ type: "image", value: n });
  }

  // create a url from the image file the user uploads
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageURL(url); // create a URL for preview or WebGL use
    }
  };

  // get pixel data from 2d canvas after user uploads an image 
  useEffect(() => {
    if (!imageURL || !inputCanvas.current) {
      if (!imageURL) return;
      if (!inputCanvas.current) setWebglError("input canvas ref not available");
      return;
    }

    const canvas = inputCanvas.current;
    const img = new Image();
    img.src = imageURL;

    img.onload = async () => {

      const width = img.width; const height = img.height

      canvas.width = width; canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
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
          `Dimensions: width: ${width} height: ${height}`,
          `Number of pixels: ${width * height}`,
          `File name ${imageFile?.name} `
        ]
      );
      setPixelData(pixelData);
      setDrawFlag(true);
    };

    return () => {
      if (imageURL) URL.revokeObjectURL(imageURL);
    };
  }, [imageURL]);

  // calculate average color of image
  // and generate a magic square based on its color index
  const processImageHash = async (img: HTMLImageElement) => {

    const hash = new PerceptualColorHasher(hashOptions);

    try {

      const hashOutput = await hash.imgToColorHash(img);

      const uniqueColorIndex: number = hashOutput.colorIndex;
      const order = colorIndexToGridNumber(uniqueColorIndex);
      console.log(order)

      setCipherInput({ type: "image", value: order });
    }
    catch (error: unknown) {
      console.error("failed to generate color hash")
      console.error(error);
    }

  }

  // color hash indexing that runs whenever the user uploads an image or
  // when the encryption/ decryption process ends
  useEffect(() => {
    if (!pixelData) { return };
    if (!pixelData.img) return;

    setHashOptions(prev => ({
      ...prev,
      canvasWidth: pixelData.dimensions.width,
      canvasHeight: pixelData.dimensions.height
    }));

  }, [pixelData]);

  useEffect(() => {

    if (!pixelData) { return };
    if (!pixelData.img) return;
    if (hashOptions.canvasHeight === 0 || hashOptions.canvasWidth === 0) return;

    //only hash image if there is puxel data and hash options have been updated 
    processImageHash(pixelData.img);

  }, [pixelData, hashOptions]);

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
      a.download = "encrypted-image.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // make sure cipher image output url resets everytime cipher inputs change
  // that way the previous image ouput does not flash when opacity changes from 0 to 1 
  // to render the new image ouput overlay. 
  useEffect(() => { setCipherImageURL("") }, [imageURL, cipherInput]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {

    if (cipherResult.current) {
      cipherResult.current.scrollIntoView({ behavior: "smooth" });
    }
    setCipherImageURL("");
    setAnimationComplete(false);
    handleSubmit(event, { session: session, sessionStatus: status });
  }


  // **************************************************************************
  // webgl program call to draw
  // **************************************************************************
  useEffect(() => {

    if (cipherInput.type === "image" && cipherOutput.type === "image" && drawFlag && !loading) {

      if (!outputCanvas.current) {
        setWebglError("tried to submit before html canvas element rendered to DOM or before it's reference was available");
        return;
      }
      // now non null assertion is safe!
      const canvasOUT: HTMLCanvasElement = outputCanvas.current!

      let gl: WebGL2RenderingContext | null = null

      gl = canvasOUT.getContext("webgl2", { preserveDrawingBuffer: true });
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

      if (pixelData) {

        const webglParams: WebGLParams = {
          setAnimationComplete: setAnimationComplete,
          gridPartitions: cipherInput.value,
          outputCanvas: outputCanvas,
          glCtx: gl,
          imgData: pixelData.imgObj,
          width: pixelData.dimensions.width,
          height: pixelData.dimensions.height,
          lookupTexture: cipherOutput.value
        }

        const webglResult: WebGLResult = webglProgram(webglParams);


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
  }, [cipherOutput, loading])

  useEffect(() => {

    if (pixelData && magicCypherResults.errorMessage.length === 0) {
      setDrawFlag(true);
    } else {
      console.log("Either there is no pixel data or magic cypher results returned an error")
      setDrawFlag(false)
    }

  }, [magicCypherResults, pixelData]);

  return (
    <div>
      <h1>Encrypt an Image!</h1>
      <div className="row d-flex justify-content-center">

      <div className = "col-12">
      <input 
        id="fileInput" 
        type="file" 
        accept="image/*" 
        onChange={handleImage} 
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
          handleDownload={handleDownload}
          cipherImageURL={cipherImageURL}
          pixelData={pixelData}
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
