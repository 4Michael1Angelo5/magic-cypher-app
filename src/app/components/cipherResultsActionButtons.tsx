"use client"

import { MagicCypherResults } from "../types/MagicCypherResults";
import { GreySkeletonLoader } from "./greySkeletonLoader";
import styles from "@/app/styles/cipherResult.module.css";
import Image from "next/image";
import {useState } from "react";
import email from "@/app/assets/email.svg";
import messsage from "@/app/assets/message.svg"
import download from "@/app/assets/donwload.svg";
import sendMessage from "@/app/assets/message.svg";
import { Modal } from "./modalComponent";
import { CipherType } from "@/lib/Encryption/CipherTypes";

interface CipherResultsButtonsProps {
    loading: boolean,
    animationComplete?: boolean,
    magicCypherResults: MagicCypherResults,
    isMobile: boolean,
    cipherImageURL?: string,
    encryptionKey: number
    cipherFormatType: CipherType,
    canShare: boolean
}

const Loader = () => {
    return (
        <>
            <div className={styles.spinner} />
            <GreySkeletonLoader numBars={1} widths={["100%"]} />
        </>
    );
}

interface ButtonFallBackProps {
    sendType: "email" | "share" | "text" | "download"
}



export const CipherResultsActionsButtons: React.FC<CipherResultsButtonsProps>
    = ({ animationComplete, cipherImageURL, encryptionKey, loading, magicCypherResults, cipherFormatType, isMobile, canShare }) => {

        const [useEmail, setUseEmail] = useState<boolean>(true);
        const [showModal, setShowModal] = useState<boolean>(false);
        const [includeKey, setIncludeKey] = useState<boolean>(false);
        const [includeLink, setIncludeLink] = useState<boolean>(false);

        const ButtonFallBack: React.FC<ButtonFallBackProps> = ({ sendType }) => {
            if (loading || !animationComplete) {
                return <Loader />;
            } else {
                switch (sendType) {
                    case "share": {
                        return <ShareButtonFallBack />;
                    };
                    case "download": {
                        return <DownloadButtonFallBack />;
                    };
                    case "email": {
                        return <EmailButtonFallBack />;
                    };
                    case "text": {
                        return <TextMessageButtonFallBack />;
                    }
                }
            }
        }

        const ShareButtonFallBack = () => {

            return (
                <>
                    <Image className={styles.action_btns}
                        src={sendMessage}
                        width={100} height={100}
                        alt="share your cipher" />
                    <button className="cyber_btn"
                        style={{
                            width: "100%"
                        }}
                        onClick={handleShare}
                    >
                        share
                    </button>
                </>
            );
        }

        const EmailButtonFallBack = () => {
            return (
                <>
                    <Image className={styles.action_btns}
                        src={email}
                        width={100} height={100}
                        alt="send as email" />
                    <button className="cyber_btn"
                        style={{ width: "100%" }}
                        onClick={() => handleModal("email")}> send as email
                    </button>
                </>
            );
        }

        const TextMessageButtonFallBack = () => {

            return (
                <>
                    <Image className={styles.action_btns}
                        src={messsage}
                        width={100} height={100}
                        alt="send as text messag" />
                    <button className="cyber_btn"
                        style={{ width: "100%" }}
                        onClick={() => handleModal("text")}> send as text
                    </button>
                </>
            );

        }

        const DownloadButtonFallBack = () => {

            return (
                <>
                    <Image className={styles.action_btns}
                        src={download}
                        width={100} height={100}
                        alt="send as text message" />
                    <a className="cyber_btn"
                        style={{ width: "100%", textDecoration: "none" }}
                        href={cipherImageURL}
                        download="encrypted-image.png"
                        target="_blank"
                        rel="noopener noreferrer"
                    > download
                    </a>
                </>
            );
        }

        const handleShareImage = async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            if (!cipherImageURL) {
                alert("Cipher image URL not ready. Try again.");
                return;
            }

            const optionalText = "\n\n Encryption Key: " + encryptionKey + "\n\n Link: https://magic-cypher-app-kml2.vercel.app/";


            try {
                const res = await fetch(cipherImageURL);
                const blob = await res.blob();
                const file = new File([blob], "encrypted_image.jpeg", { type: blob.type });

                if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                    alert("Sharing files is not supported on this device.");
                    return;
                }


                await navigator.share({
                    files: [file],
                    title: "Magic Cypher Encrypted Image",
                    text: "Check out this encrypted image! " + optionalText,
                });

            } catch (error: unknown) {
                console.error(error);
                // do nothing use most likely cancelled share api
            }
        };

        const handleShareText = async (): Promise<void> => {
            // make sure this method is only getting called when 
            // output type is text
            if (magicCypherResults.output.type !== "text") {
                return;
            }
            // make sure the results are defined
            if (!magicCypherResults.output) { 
                return;
            }

            const optionalText = "\n\n Encryption Key: " + encryptionKey + "\n\n Link: https://magic-cypher-app-kml2.vercel.app/";

            try {
                await navigator.share({
                    title: "Check out this encrypted message!",
                    text: magicCypherResults.output.value + optionalText
                })
            } catch (error: unknown) {
                alert("either window share canceled or failed");
                console.error(error);

            }
        }

        const buildOptionalText = (): string => {
            let text: string = "";
            if (includeKey) {
                text += "\n\n Encryption Key: " + encryptionKey;
            }
            if (includeLink) {
                text += "\n\n Link: https://magic-cypher-app-kml2.vercel.app/";
            }
            return text;
        }

        const handleShare = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
            if (typeof window === "undefined") {
                alert("Web Share API is not supported in this environment.");
                return;
            }
            if (!navigator.share) {
                alert("Sharing is not supported on this device.");
                return;
            }
            if (cipherFormatType === "text") {
                await handleShareText();
            } else {
                await handleShareImage(event);
            }
        }

        // allow the user to send the cipher as an email or message
        const sendCipher = (event: React.MouseEvent<HTMLButtonElement>) => {

            event.preventDefault();

            const optionalText = buildOptionalText();

            const scrubbedCipher = encodeURIComponent(magicCypherResults.output.value + optionalText);

            if (useEmail) {

                window.open(`mailto:?body=${scrubbedCipher}`, "_blank");


            } else {

                window.open(`sms:?&body=${scrubbedCipher}`, "_blank");
            }
        }

        const handleModal = (method: "email" | "text") => {

            if (method === "email") {

                setUseEmail(true)

            } else {
                setUseEmail(false);

            }
            setShowModal(true);

        }

        return (
            <div>
                {
                    (!magicCypherResults.errorMessage && magicCypherResults.output.value.length != 0) && (
                        //action btns for sending, sharing and downloading ciphers  
                        // only render if magic cypher does not have any errors and its outputs are defined / length!=0

                        <>
                            <div className="row d-flex justify-content-center">
                                {
                                    // if the user is on a mobile device or is on a desktop 
                                    // and its an image cipher and they can share - show a share button
                                    ((isMobile && canShare) || (!isMobile && cipherFormatType === "image" && canShare)) && (
                                        <div className="col d-flex justify-content-center">
                                            <ButtonFallBack sendType="share" />
                                        </div>
                                    )
                                }
                                {
                                    (isMobile && !canShare && cipherFormatType === "text") && (
                                        // if the user is on mobile but sharing is not supported and they are encrypting or decryptin an text cipher
                                        // show a send as text button
                                        <>
                                            <div className="col d-flex justify-content-center">

                                                {/* // but if the cipher results are still loading or the animation is not complete show a loader instead */}
                                                <ButtonFallBack sendType="text" />
                                            </div>

                                            <div className="col d-flex justify-content-center">

                                                {/* // but if the cipher results are still loading or the animation is not complete show a loader instead */}
                                                <ButtonFallBack sendType="email" />
                                            </div>

                                        </>)

                                }
                                {
                                    // if the user is on a desktop show send as email button for text ciphers and and a download button for image ciphers
                                    (!isMobile) && (

                                        <div className="col d-flex justify-content-center">

                                            {
                                                (cipherFormatType === "text") && (

                                                    // but if the cipher results are still loading or the animation is not complete show a loader instead
                                                    <ButtonFallBack sendType="email" />
                                                )
                                            }

                                            {

                                                (cipherFormatType === "image") && (

                                                    <ButtonFallBack sendType={"download"} />

                                                )

                                            }
                                        </div>
                                    )
                                }

                            </div>
                        </>
                    )
                }

                {
                    showModal && (
                        <Modal onClose={() => setShowModal(false)}>
                            <form>
                                <div className="row">
                                    <div className="col-12 d-flex justify-content-around">
                                        <label> include key</label>
                                        <input type="checkbox" checked={includeKey} onChange={(e) => setIncludeKey(e.target.checked)} />
                                    </div>
                                    <div className="col-12 d-flex justify-content-around">
                                        <label> inlcude link</label>
                                        <input type="checkbox" checked={includeLink} onChange={(e) => setIncludeLink(e.target.checked)} />
                                    </div>
                                </div>
                                <button className="cyber_btn" onClick={e => { sendCipher(e) }}>send</button>
                            </form>
                        </Modal>
                    )
                }

            </div>

        );
    }
