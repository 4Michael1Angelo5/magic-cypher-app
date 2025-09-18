import { useState, useEffect, useRef } from "react";
import PerceptualColorHasher, { PerceptualColorHasherOptions } from "../images/perceptualColorHasher";

export const useColorHash = (inputCanvas: React.RefObject<HTMLCanvasElement | null>) => {

    const hashRef = useRef<PerceptualColorHasher | null>(null);

    const [hashOptions, setHashOptions] = useState<PerceptualColorHasherOptions>({
        canvasWidth: 0,
        canvasHeight: 0,
        hueBuckets: 24,
        saturationBuckets: 10,
        valueBuckets: 10
    });

    const createHashOptionsAfterCanvasMount = (inputCanvas: HTMLCanvasElement) => {

        setHashOptions((prev) => ({
            ...prev,
            canvas: inputCanvas
        }));
    }

    const createInstanceOfPerceptualColorHasher = (canvas: HTMLCanvasElement) => {
        const hash = new PerceptualColorHasher({
            ...hashOptions, // other options
            canvas
        });
        hashRef.current = hash;
    };

    useEffect(() => {
        const canvas = inputCanvas?.current;
        if (!canvas) {
            return
        } else {
            console.log("attaching canvas to hash options after canvas mount")
            createHashOptionsAfterCanvasMount(canvas);
            createInstanceOfPerceptualColorHasher(canvas);
        }
    }, [inputCanvas])

    useEffect(() => { console.log(hashOptions) }, [hashOptions]);

    const hashOutputImg = async (img: HTMLImageElement) => {

        try {
            const magicSquareOrder = await processImageHash(img, hashOptions);
            console.log("Unique Color index after encryption", magicSquareOrder);

        } catch (error) {
            console.error("An error occurred while trying to hash the encrypted output image", error)
        }
    }



    const processImageHash = async (img: HTMLImageElement, hashOptions: PerceptualColorHasherOptions): Promise<number | undefined> => {
        console.log("inside process image hash")
        console.log(hashOptions)

        const hash = hashRef.current;
        if (!hash) { return }

        if (!hashOptions.canvasWidth || !hashOptions.canvasHeight) return

        hash.canvasWidth = hashOptions.canvasWidth;
        hash.canvasHeight = hashOptions.canvasHeight;


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
        hashOutputImg,
        colorIndexToGridNumber,
        hashOptions,
        setHashOptions,
        processImageHash
    }
}
