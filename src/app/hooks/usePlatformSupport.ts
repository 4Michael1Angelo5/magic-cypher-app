import { useState, useEffect } from "react";

/**
 * Custom hook for detecting platform capabilities and determining
 * the appropriate method to generate an image URL (toBlob vs toDataURL).
 */

export const usePlatformSupport = () => {
    const [shouldUseDataURL, setShouldUseDataURL] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(true);
    const [canShare, setCanShare] = useState<boolean>(true);

    useEffect(() => {
        // --- Detect mobile (for UI decisions like showing Share button) ---
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(isMobileDevice);

        // --- Decide between toBlob vs toDataURL ---
        const testCanvas = document.createElement("canvas");
        const supportsToBlob = !!testCanvas.toBlob;
        console.log("supports blob", supportsToBlob)
        setShouldUseDataURL(!supportsToBlob);

        // --- Decide if Share API should be enabled ---
        if (!isMobileDevice) {
            // Desktop → always skip Share API
            setCanShare(false);
            return;
        }

        if (!navigator.share || !navigator.canShare) {
            setCanShare(false);
            return;
        }

        let supportsText = false;
        let supportsImage = false;

        try {
            supportsText = navigator.canShare({ text: "test" });

            const dummyBlob = new Blob(["dummy"], { type: "image/png" });
            const dummyFile = new File([dummyBlob], "test.png", { type: "image/png" });
            supportsImage = navigator.canShare({ files: [dummyFile] });
        } catch {
            supportsText = false;
            supportsImage = false;
        }

        setCanShare(supportsText || supportsImage);
    }, []);

    // use the approptiate url type (blob or data url) 
    // for the encrypted/decrypted image output from MagicCypher
    const handleOutputImageURL = async (outputCanvas: HTMLCanvasElement): Promise<string> => {
        // it is the responsibility of the caller to confirm the 
        // outputCanvas exists before calling this function
        // along with handling any errors while attempting to create the URL

        const canvas: HTMLCanvasElement = outputCanvas;

        try {

            if (shouldUseDataURL) {
                const url = canvas.toDataURL("image/png");
                return url

            } else {
                // Use toBlob (non-blocking)
                return await new Promise<string>((resolve, reject) => {
                    outputCanvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error("Failed to create blob"));
                            return;
                        }
                        const url = URL.createObjectURL(blob);
                        resolve(url);
                    }, "image/png");
                });

            }
        }
        catch (err) {
            console.error("Error generating output image URL", err)
            return outputCanvas.toDataURL("image/png")
        }

    }

    return {
        isMobile,
        canShare,
        shouldUseDataURL,
        handleOutputImageURL
    }
}