"use client"

import styles from "../styles/cipherResult.module.css"
import Image from "next/image";
import Loading from "./loadingComponent";
import SkeletonLoader from "./skeletonLoaderComponent";
import { forwardRef, useEffect } from "react";
import copy from "../assets/copy.svg"
import { MagicCypherResults } from "../types/MagicCypherResults";
import { CipherResultsActionsButtons } from "./cipherResultsActionButtons";
import { useRef } from "react";
import { PerceptualColorHasherOptions } from "../images/perceptualColorHasher";
import { PixelData } from "../images/page"; 
import { CipherKeyDisplay } from "./cipherKeyDisplayComponent";

import { usePlatformSupport } from "../hooks/usePlatformSupport";  // called here 1
import { useLoader } from "../hooks/useLoader";

interface CipherResultProps {
    loading: boolean;
    magicCypherResults: MagicCypherResults,
    isCopied: { key: boolean, output: boolean },
    isEncrypting: boolean
    handleCopy: (target: "key" | "output", event: React.MouseEvent<HTMLButtonElement>) => void;
    cipherImageURL?: string,
    animationComplete?: boolean
    handleShare?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    pixelData?: PixelData
    hashOptions?: PerceptualColorHasherOptions
    hashOutputImg?:(img:HTMLImageElement)=>void
}


// this component is responsible for displaying the results of MagicCypher 
const CipherResult = forwardRef<HTMLCanvasElement, CipherResultProps>(({
    magicCypherResults,
    isCopied, isEncrypting,
    cipherImageURL,
    loading,
    hashOptions,
    animationComplete,
    handleCopy,
    pixelData ,
    hashOutputImg 
}, outputCanvas) => {


    const { isMobile, canShare } = usePlatformSupport();

    const {widths,numBars,containerHeight,setContainerHeight} = useLoader()

    const overlayImg = useRef<HTMLImageElement | null>(null); 

    const resultsContainerRef  = useRef<HTMLDivElement | null>(null);

    const cipherFormatType = magicCypherResults.output.type;
    const encryptionKey = magicCypherResults.cipherStats.encryptionKey;
    const errorMessage = magicCypherResults.errorMessage;
     
    const debug = false;

    useEffect(()=>{ 

        if(!resultsContainerRef.current || !pixelData || !loading) return;

        const currentContainerHeight = resultsContainerRef.current.clientWidth;

        setContainerHeight((currentContainerHeight-20) / pixelData.dimensions.aspectRatio);

    },[pixelData,loading])

    const getAvgColor = async (): Promise<void> => {

        if (!overlayImg.current || !hashOptions || !hashOutputImg) {
            if(!hashOptions) console.error("hash options not provided");
            if(!overlayImg.current) console.error("overlay img not yet available");
            if(!hashOutputImg) console.error("attempted to call hashing function when it wasn't provided");

            return;
        }; 
        try {

            hashOutputImg(overlayImg.current)

        } catch (error: unknown) {
            console.error("failed to generate color hash")
            console.error(error);
        }
    }

    return (
        <> 
            <div className="d-flex align-item-center" style={{ minHeight: "150px" }}>

                {loading && <Loading loadingState={isEncrypting ? "Encrypting" : "Decrypting"} />}

            </div>

            <h1>Cipher Result</h1>

            <div className={styles.cipher_result_Wraper}
                ref = {resultsContainerRef}
                style={{height:containerHeight}}>
                {

                    (magicCypherResults.output.type === "image") &&
                    <>

                        <canvas
                            className = {styles.outputCanvas}
                            style={{
                                display: loading ? "none" : "block",  
                            }}
                            ref={outputCanvas} />
                         
                        {(cipherImageURL && !loading) &&
                            // image overlay of the output canvas so that users can click
                            // on it and download the image
                            <img
                                ref={overlayImg}
                                alt="Invisible Downloadable"
                                className = {styles.encryptedImage}
                                style={{
                                    opacity: animationComplete && !loading ? 1 : 0,
                                }}
                                src={cipherImageURL}
                                onLoad={debug ? () => getAvgColor() : undefined}
                            />

                        }

                    </>
                }

                {
                    loading //if loading
                        ?
                        // return skelton loader                        
                        //@TODO need to think of a cool way to generate differnt lengths that will look good 
                        // so that its not all just a loader with widths = "100%"
                        <SkeletonLoader numBars={numBars} widths={widths} />
                        :
                        // otherwise return cipher result

                        <>

                            {
                                cipherFormatType === "text" &&
                                <div>

                                    <p>
                                        {
                                            errorMessage ?  // if errorMessage =  "" , then  => evaluates to false
                                                errorMessage :
                                                magicCypherResults.output.value
                                        }
                                    </p>
                                </div>
                            }

                            {
                                (cipherFormatType === "text" && magicCypherResults.output.value.length !== 0) &&

                                <>
                                     <div className={styles.tooltip}
                                            style={{
                                                display: isCopied.output ? "inline-block" : "none"
                                            }}>
                                            Copied!
                                        </div>

                                    <div className={styles.results_btn_container}>
                                   
                                        <button className={styles.result_btn_controls}
                                            onClick={(e) => handleCopy("output", e)}>
                                            <Image src={copy} width={100} height={100} alt="copy button"
                                                className={styles.results_btn_icon} />
                                            Copy
                                        </button>
                                    </div>
                                </>
                            }
                        </>

                }

            </div>

            <CipherResultsActionsButtons
                cipherFormatType={cipherFormatType}
                canShare={canShare}
                magicCypherResults={magicCypherResults}
                loading={loading}
                encryptionKey={encryptionKey}
                isMobile={isMobile}
                animationComplete={animationComplete}
                cipherImageURL={cipherImageURL}
            />

            {
                (magicCypherResults.output.value.length != 0 && !magicCypherResults.error) &&
                <CipherKeyDisplay
                    encryptionKey={magicCypherResults.cipherStats.encryptionKey.toString()}
                    handleCopy={handleCopy}
                    animationComplete={animationComplete}
                    loading={loading}
                    isCopied = {isCopied}
                />
            }



        </>
    );


})

CipherResult.displayName = "cipher results";

export default CipherResult

