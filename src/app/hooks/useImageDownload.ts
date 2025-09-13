import { useState } from "react";

/**
 * Custom hook for generating and managing a downloadable URL
 * from a canvas (using toBlob or toDataURL as appropriate).
 */

export const useImageDownload = (outputCanvas:React.RefObject<HTMLCanvasElement | null>) => {

    const [outputImageURL,setOutputImageURL] = useState<string>("");
     
    // use the approptiate url type (blob or data url) 
    // for the encrypted/decrypted image output from MagicCypher
    const handleOutputImageURL = (shouldUseDataURL:boolean) => { 

        if(!outputCanvas || !outputCanvas.current){return}

        const canvas: HTMLCanvasElement = outputCanvas.current;

        try {

            if (shouldUseDataURL) {
                console.log("recieved shouldUseDataURL = true")
                const url = canvas.toDataURL("image/png");
                setOutputImageURL(url);

            } else {
                // Use toBlob bc it does not block the main thread           
                    canvas.toBlob((blob) => {
                        if (blob) { 
                            console.log("using blob url")
                            const url = URL.createObjectURL(blob);
                            setOutputImageURL(url);
                        }else{  
                            console.log("using data image url")
                            // fall back to data url if blob url fails
                            const url = canvas.toDataURL("image/png");
                            setOutputImageURL(url);         
                        }
 
                    }, "image/png");
            }
        }
        catch (err) {
            console.error("Error generating output image URL", err)
            return canvas.toDataURL("image/png")
        }

    }

    return{
        handleOutputImageURL,
        outputImageURL, setOutputImageURL
    }
}