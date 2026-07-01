import ColorHasher, {HashOptions} from "@/lib/hasher/colorHasher";
import { useCallback } from "react";

// @TODO: offload imgToColorHash pixel iteration to a Web Worker.
// Phone images (~12MP) iterate 48M+ values on the main thread which will freeze the UI.
// ImageData buffer can be transferred to the worker via postMessage using a Transferable.
// The computation is pure after ImageData is retrieved so no DOM access is needed in the worker.


const HASH_COLOR_BUCKETS = {r:10,g:10,b:10};

const createInstanceOfColorHasher = (imageData:ImageData):ColorHasher => {
    const hashOptions:HashOptions = {
        ...HASH_COLOR_BUCKETS, 
        imageData: imageData.data
    }
    return new ColorHasher(hashOptions);
}



/**
 * This hook exposes color hashing methods. 
 * The contract is given the correct input arguments I can guarntee 
 * the correct output arguments:
 * You give me an html canvas with image drawn on it, and I will give you a correct
 * image hash of that image. 
 * @param inputCanvas a react ref object to the input canvas element
 * @returns 
 */
export const useColorHash = () => {


    const hashImage = useCallback(
        (imageData:ImageData):number => {
            const colorHasher:ColorHasher = createInstanceOfColorHasher(imageData); 
            const avgColor = colorHasher.getAvgColor();
            const colorID = colorHasher.colorToIndex(avgColor); 
            return colorHasher.colorIndexToMagicSquareOrder(colorID); 
        }
    ,[]); 
    

    const getImageDataFromOutputCanvas = useCallback( 

        (outputCanvas:HTMLCanvasElement):ImageData|null => {
        
            const gl = outputCanvas.getContext("webgl2", { preserveDrawingBuffer: true });

            if (!gl) return null;

            const width = gl.canvas.width;
            const height = gl.canvas.height; 
            
            const pixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);

            gl.readPixels(0, 0, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            const clampedPixels = new Uint8ClampedArray(pixels.buffer);

            return new ImageData(clampedPixels,width, height); 
    },[]);

    return {
        hashImage,
        getImageDataFromOutputCanvas
    }
}
