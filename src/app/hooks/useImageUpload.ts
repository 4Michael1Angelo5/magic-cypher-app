import { useState, useEffect } from "react";
import { PixelData } from "../images/page";

/**
 * Custom hook responsible for handling user image uploads
 * and extracting pixel data from a hidden canvas for further processing.
 */
export const useImageUpload = (inputCanvas: React.RefObject<HTMLCanvasElement | null>) => {

    const [pixelData, setPixelData] = useState<PixelData | undefined>(undefined);

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [imageURL, setImageURL] = useState<string | null>(null);

    // for debug use only
    const [imageInfo, setImageInfo] = useState<string[] | null>(null);

    // create a url from the image file the user uploads
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

            //@TODO should webgl context creation errors be handled here?

            //   if (!imageURL) return;
            //   if (!inputCanvas.current){
            //      setWebglError("input canvas ref not available");
            //     }
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
                // setWebglError("no 2d context");
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
            //   setDrawFlag(true);
        };

        return () => {
            if (imageURL) URL.revokeObjectURL(imageURL);
        };
    }, [imageURL]);
 
    return {
        imageInfo,
        pixelData,
        imageFile, // this should be renamed to inputImageFile
        imageURL,   // inputImageURL  
        handleImageUpload 
    }
}