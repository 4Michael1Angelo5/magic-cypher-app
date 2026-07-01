import { useState, useEffect, useRef } from "react";
import { PixelData } from "../images/page"; 

/**
 * Custom hook responsible for handling user image uploads
 * and extracting pixel data from a hidden canvas for further processing.
 */
export const useImageUpload = (debugMode:boolean) => {

    const [pixelData, setPixelData] = useState<PixelData | undefined>(undefined);

    const [inputImageFile, setInputImageFile] = useState<File | null>(null);
     
    // for debug use only
    const [imageInfo, setImageInfo] = useState<string[] | null>(null);

    const [imageURL, setImageURL] = useState<string | null>(null);

    const inputCanvas = useRef<HTMLCanvasElement | null>(null);

    const inputImageRef = useRef<ImageData | null> (null);


    // create a url from the image file the user uploads
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setInputImageFile(file);
            const url = URL.createObjectURL(file);
            // setImageURL(url); // create a URL for preview or WebGL use
            setImageURL(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
            });
        }
    };

    // get pixel data from 2d canvas after user uploads an image 
    useEffect(() => {

        if (!imageURL) {
            return;
        }

        const canvas = inputCanvas.current || document.createElement('canvas');
        inputCanvas.current = canvas; 

        const img = new Image();
        img.src = imageURL;

        img.onload = async () => {

            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) {
                return;
            }
            
            // what if this gets done by an offscreen canvas? 
            // image upload
            // useImageHasher kicks in 
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);

            const pixelData: PixelData = {
                img,
                imgSrc: imageURL, 
                dimensions: {
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height,
                },
            };

            if (debugMode) {
                const imageInfo = [
                    `Dimensions: width: ${img.width} height: ${img.height}`,
                    `Number of pixels: ${img.width * img.height}`,
                    `File name ${inputImageFile?.name} `
                ]
                setImageInfo(imageInfo);
            } 

            inputImageRef.current =  imageData;
            setPixelData(pixelData);
        };

        return () => {
            if (imageURL) URL.revokeObjectURL(imageURL);
        };
    }, [imageURL, inputImageFile, debugMode]);
 
    return {
        pixelData,
        imageInfo,
        inputImageRef,
        inputImageFile, // this should be renamed to inputImageFile
        setImageURL,imageURL,   // inputImageURL  
        handleImageUpload 
    }
}