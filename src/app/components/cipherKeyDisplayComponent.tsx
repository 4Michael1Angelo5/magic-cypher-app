import styles from "@/app/styles/cipherResult.module.css" 
import Image from "next/image";
import copy from "@/app/assets/copy.svg"
import { useEffect, useState } from "react";  
import show from "@/app/assets/show.svg";
import hide from "@/app/assets/hide.svg";
import { GreySkeletonLoader } from "./greySkeletonLoader"; 
import { CopiedObj } from "@/app/hooks/useEncryptionForm"


interface CipherKeyDisplayProps {
    handleCopy: (target: "key" | "output", event: React.MouseEvent<HTMLButtonElement>) => void;
    encryptionKey: string,
    animationComplete?: boolean,
    loading: boolean,
    isCopied: CopiedObj
}

export const CipherKeyDisplay: React.FC<CipherKeyDisplayProps> = ({ isCopied, handleCopy, encryptionKey, loading, animationComplete }) => {


    const [keyPlaceHolder, setKeyPlaceHolder] = useState("•••••")

    const createHiddenKeyPlaceHolderDots = (key: string): string => {
        const dot = "•";

        const dots: string[] = [];

        for (let i = 0; i < key.length; i++) {
            dots.push(dot);
        }

        return dots.join("").trim();
    }

    useEffect(() => {
        if (!encryptionKey) {
            return
        }
        const dots: string = createHiddenKeyPlaceHolderDots(encryptionKey);
        setKeyPlaceHolder(dots);

    }, [encryptionKey])

    const [showKey, setShowKey] = useState<boolean>(false);

    return (

        <div className={styles.keyDisplayComponent}>
            <h1>Encryption Key</h1>
            <div className={styles.keyDisplay}>
                <div className="row">

                    <div className="col-8 d-flex justify-content-center">

                        {
                            (loading || !animationComplete) ?
                                <GreySkeletonLoader numBars={1} widths={["100"]} />
                                :
                                (
                                    showKey ?
                                        <span className={styles.hidden_key}>   {encryptionKey} </span>
                                        :
                                        <span className={styles.hidden_key}>   {keyPlaceHolder} </span>
                                )

                        }


                    </div>

                    <div className="col-2  d-flex justify-content-center align-items-center">

                        {
                            (loading || !animationComplete) ?
                                <div className={styles.spinner} />
                                :
                                (showKey ?
                                    <button onClick={() => setShowKey(!showKey)} className={styles.result_btn_controls}>
                                        <Image src={hide} width={100} height={100} alt="show key button"
                                            className={styles.results_btn_icon} />
                                    </button>
                                    :
                                    <button onClick={() => setShowKey(!showKey)} className={styles.result_btn_controls}>
                                        <Image src={show} width={100} height={100} alt="show key button"
                                            className={styles.results_btn_icon} />
                                    </button>
                                )
                        }


                    </div>

                    <div className="col-2  d-flex justify-content-center align-items-center">

                        {
                            (loading || !animationComplete)      ?

                                <div className={styles.spinner} />

                                :                                   

                                <button onClick={e => handleCopy("key", e)} className={styles.result_btn_controls}>

                                    <Image src={copy} width={100} height={100} alt="copy button"
                                        className={styles.results_btn_icon} />

                                </button>
                                   
                        }

                    </div>

                </div>

            </div>
            <div className={styles.tooltip}
                style={{
                    display: isCopied.key ? "inline-block" : "none"
                }}>
                Copied!
            </div>
        </div>

    )
}