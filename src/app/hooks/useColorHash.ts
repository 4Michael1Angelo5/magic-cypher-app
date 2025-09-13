import { useState } from "react";
import PerceptualColorHasher, { PerceptualColorHasherOptions } from "../images/perceptualColorHasher";

export const useColorHash = () => {

    const [hashOptions, setHashOptions] = useState<PerceptualColorHasherOptions>({
        canvasWidth: 0,
        canvasHeight: 0,
        hueBuckets: 24,
        saturationBuckets: 10,
        valueBuckets: 10
    });

    const processImageHash = async (img: HTMLImageElement,hashOptions:PerceptualColorHasherOptions):Promise<number|undefined> => {

        const hash = new PerceptualColorHasher(hashOptions);

        try {
            const hashOutput = await hash.imgToColorHash(img);

            const uniqueColorIndex: number = hashOutput.colorIndex;

            const magicSquareOrder = colorIndexToGridNumber(uniqueColorIndex);

            return magicSquareOrder; 
        }
        catch (error: unknown) {
            console.error("failed to generate color hash")
            console.error(error);
            return undefined;
        }

    }

    // take a unique color index and return a "reasonable" number for
    // grid partions "N" which becomes the order of the magic square
    const colorIndexToGridNumber = (index: number): number => {

        const minOrder = 100;

        const maxOrder = 300;

        return minOrder + index % maxOrder;
    }



    return {
        colorIndexToGridNumber,
        hashOptions,
        setHashOptions,
        processImageHash
    }
}
