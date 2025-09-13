"use client"

import styles from "../styles/cipherResult.module.css"
import Image from "next/image";
import Loading from "./loadingComponent";
import SkeletonLoader from "./skeletonLoaderComponent";
import { forwardRef } from "react";
import copy from "../assets/copy.svg"
import { MagicCypherResults } from "../types/MagicCypherResults";
import { CipherResultsActionsButtons } from "./cipherResultsActionButtons"; 
import { useRef } from "react";
import {PerceptualColorHasherOptions}  from "../images/perceptualColorHasher";
import { PixelData } from "../images/page";
import { useColorHash } from "../hooks/useColorHash";

import { usePlatformSupport } from "../hooks/usePlatformSupport";  // called here 1

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
    pixelData  // =>?? does this need to be here?
}, outputCanvas) => {

    const { isMobile, canShare } = usePlatformSupport();

    const { processImageHash } = useColorHash();

    const overlayImg = useRef<HTMLImageElement | null>(null)

    const cipherFormatType = magicCypherResults.output.type;
    const encryptionKey = magicCypherResults.cipherStats.encryptionKey;
    const errorMessage = magicCypherResults.errorMessage;

    const debug = true;

    const getAvgColor = async (): Promise<void> => {

        if (!overlayImg.current) {
            console.error("i guess i need to wait for the image to load first")
            return
        };
        if (!hashOptions) {
            console.error("hash options not provided")
            return;
        }
        try {

            const order = await processImageHash(overlayImg.current, hashOptions);

            console.log("unique color index", order)

        } catch (error: unknown) {
            console.error("failed to generate color hash")
            console.error(error);
        }
    }

    return (
        <div className="" >
            {/* i don't know why i have this wrapped in an outer div i think its useless */}

            {/* @TODO  buffer is useless right now the only point of this is to make some room between components */}
            <div className="buffer d-flex align-item-center" style={{ minHeight: "150px" }}>

                {loading && <Loading loadingState={isEncrypting ? "Encrypting" : "Decrypting"} />}

            </div>

            <h1>Cipher Result</h1>

            <div className={styles.cipher_result_Wraper}
                style={{ position: "relative" }}>

                {

                    (magicCypherResults.output.type === "image") &&
                    <>

                        <canvas
                            style={{
                                width: "100%",
                                display: loading ? "none" : "block"

                            }}
                            ref={outputCanvas} />

                        {(cipherImageURL && !loading) &&
                            // image overlay of the output canvas so that users can click
                            // on it and download the image

                            <img
                                ref={overlayImg}
                                alt="Invisible Downloadable"
                                style={{
                                    transition: "opacity .5s ease-in-out",
                                    position: 'absolute',
                                    top: 0,
                                    padding: "10px",
                                    left: 0,
                                    borderRadius: "10px",
                                    opacity: animationComplete && !loading ? 1 : 0,
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'auto', // must allow touch!
                                    WebkitTouchCallout: 'default', // this enables long-press
                                }}
                                src={cipherImageURL}
                                onLoad={debug && getAvgColor}
                            />

                        }

                    </>
                }

                {
                    loading //if loading
                        ?
                        // return skelton loader                       
                        <SkeletonLoader numBars={4} widths={["100%", "100%", "100%", "75%"]} />
                        :
                        // otherwise return cipher result
                        <>

                            {
                                cipherFormatType === "text" &&

                                <p>
                                    {
                                        errorMessage ?  // if errorMessage =  "" , then  => evaluates to false
                                            errorMessage :
                                            magicCypherResults.output.value
                                    }
                                </p>
                            }

                            <div className={styles.tooltip}
                                style={{
                                    display: isCopied.output ? "inline-block" : "none"
                                }}>
                                Copied!
                            </div>
                            <div className={styles.results_btn_container} role="button">
                                <button className={styles.result_btn_controls}
                                    onClick={(e) => handleCopy("output", e)}>
                                    <Image src={copy} width={100} height={100} alt="copy button"
                                        className={styles.results_btn_icon} />
                                    Copy
                                </button>
                            </div>
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
        </div>
    );


})

CipherResult.displayName = "cipher results";

export default CipherResult

