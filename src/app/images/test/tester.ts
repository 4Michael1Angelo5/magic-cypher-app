// import PerceptualColorHasher, { PerceptualColorHasherOptions } from "../perceptualColorHasher";
import ColorHasher, {HashOptions} from "@/lib/hasher/colorHasher";
import a1 from "./a1.jpg";
import a1_compressed from "./a1_compressed.jpg" // 50% compression test
import a2 from "./a2.webp";
import a3 from "./a3.webp";
import a4 from "./a4.webp";
import a5 from "./a5.jpg";
import a6 from "./a6.jpg";
import a7 from "./a7.jpg";
import b1 from "./b1.jpg";
import b2 from "./b2.jpg"; 

import bw1 from "./bw1.webp";
import bw2 from "./bw2.jpg";
import bw3 from "./bw3.jpeg"; 
import bws1 from "./bws1.jpg";
import c1 from "./c1.jpg"; 
import g from "./g.jpg";  


import { WebGLParams, webglProgram } from "./webglTester";
import { handleEncryption } from "@/lib/actions/handleEncryption";
import { EncryptionInput } from "@/app/types/EncryptionInput";
import { MagicCypherResults } from "@/app/types/MagicCypherResults"; 
import PerceptualColorHasher, {PerceptualColorHasherOptions} from "../perceptualColorHasher";
import { StaticImageData } from "next/image"; 


const TEST_TRIALS = 30;
const WORKER_URL = "../hashWorker.ts";
const HASH_COLOR_BUCKETS = {r:10,g:10,b:10};
const IMAGE_TEST_SUBJECT:StaticImageData = a1;


const getLookUpTexture = async (order:number):Promise<Float32Array>=>{
    
    const cipherInput:EncryptionInput = {type:"image",value:order};
    const cipherResults:MagicCypherResults = await handleEncryption(cipherInput);
    const lookupTexture = cipherResults.output.value;

    return lookupTexture as Float32Array;
} 

const loadImage = (src:string):Promise<HTMLImageElement> =>{
    return new Promise((resolve,reject)=>{
        const img = new Image(); 
        img.src = src;
        img.onload = ()=> resolve(img);
        img.onerror = reject; 
    });
}

const getImageData = (canvas:HTMLCanvasElement, img: HTMLImageElement):ImageData|null=> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null; 
    canvas.width = img.width; canvas.height = img.height; 
    ctx.drawImage(img, 0,0,img.width,img.height);
    return ctx.getImageData(0,0,img.width, img.height);
}

/**
 * Compares RGB hash to HSV color hasher. (both calculations on main thread)
 * @returns void 
 */
export const runHashTests = async () => {
    console.log("Running Hash Tests...")

    const canvas = document.createElement('canvas');
    const img = await loadImage(IMAGE_TEST_SUBJECT.src); // <--- use the same image for both hashes
    
    const imageData = getImageData(canvas, img);
    if (!imageData) return;

    // -------------  RGB TEST ----------------
    let RGBHashIndex:number = 0;

    const hashOptions:HashOptions = {
        ...HASH_COLOR_BUCKETS, 
        imageData: new Uint8ClampedArray<ArrayBufferLike>(imageData.data.buffer)
    };

    const colorHasher:ColorHasher = new ColorHasher(hashOptions);

    // warm up phase:
    for (let i = 0; i < 5; i++) {
        RGBHashIndex = colorIndexToGridNumber(colorHasher.colorToIndex(colorHasher.getAvgColor()));
    }
    
    // test phase for RGB
    const startTime0 = performance.now();
    for (let i = 0; i < TEST_TRIALS; i++) {
        colorIndexToGridNumber(colorHasher.colorToIndex(colorHasher.getAvgColor()));
    }
    const endTime0 = performance.now();
    const avgTime0 = (endTime0 - startTime0) / TEST_TRIALS;

    // ------------ HSV TEST -------------------

    let HSVHashIndex:number = 0; 
    
    const canvas2 = document.createElement("canvas");

    getImageData(canvas2, img); // only uses side effect of setting up canvas width and height

    const hashOptions2:PerceptualColorHasherOptions = {
        hueBuckets:10,saturationBuckets:10, valueBuckets:10,
        canvas:canvas2,
        canvasWidth:img.width,
        canvasHeight:img.height
     }

    const perceptualColorHasher:PerceptualColorHasher = new PerceptualColorHasher(hashOptions2); 
   
    for (let i = 0; i < 5; i++) { 
        HSVHashIndex = (await perceptualColorHasher.imgToColorHash(img)).colorIndex;
    }

    const startTime1 = performance.now();
    for (let i = 0; i < TEST_TRIALS; i++) { 
        await perceptualColorHasher.imgToColorHash(img);
    }
    const endTime1 = performance.now();
    const avgTime1 = (endTime1 - startTime1) / TEST_TRIALS;
    
    const improvement = Math.floor(avgTime1/avgTime0);

    console.log(`Average Time RGB hash: ${avgTime0},\nRGB Color Index:: ${RGBHashIndex}\n`); 
    console.log(`Average Time HSV hash: ${avgTime1},\nHSV Color Index:: ${HSVHashIndex}\n`);
    console.log(`The RGB hasher was ${improvement} times faster`)
}
/**
 * Test results reveal that the RBG color hasher is about 9 to 12 times faster than the HSV color hasher. 
 */

 const colorIndexToGridNumber = (index: number): number => {

        const minOrder = 100;

        const maxOrder = 300;

        return minOrder + index % maxOrder;
    }

const hashInputImage = async (imgData:ImageData):Promise<number> => {

        const worker = new Worker(new URL(WORKER_URL, import.meta.url)); 
            return new Promise((resolve, reject) => {
                 
            const copy = imgData.data.slice(0);

                worker.onmessage = (event) => resolve(colorIndexToGridNumber(event.data)); 
                worker.onerror = (event) => reject(event);
                worker.postMessage({
                    ...HASH_COLOR_BUCKETS, // the worker takes care of ColorHasher instantiation
                    buffer:copy.buffer
                },[copy.buffer]);

            });
    }

const runHasher = async (imgData:ImageData):Promise<number>=> {
    try {
        const index = await hashInputImage(imgData);
        return index;
    }
    catch (e:unknown) {
        console.log("failed!", e)
        return 0;
    }
}

export const runHashTestsWithWorker = async () => {

    console.log("Running Hash Tests with WebWorker...")

    // --------------- RGB TEST ---------------  
    const img = await loadImage(IMAGE_TEST_SUBJECT.src); // <--- use the same image for both hashes
   
    let RGBHashIndex = 0; 

    const canvas = document.createElement("canvas"); 

    const imageData = getImageData(canvas, img);
    if (!imageData) return; 
  
    for (let i =0; i < 5; i++) {
        RGBHashIndex = await runHasher(imageData); 
    }

    const startTime0 = performance.now();
    for (let i = 0 ; i < TEST_TRIALS; i++) {
        await runHasher(imageData);
    }
    const endTime0 = performance.now(); 

    const avgTime0 = (endTime0 - startTime0)/ TEST_TRIALS;
    
    // ---------------  HSV TEST ----------------
    let HSVHashIndex = 0; 

    const canvas2 = document.createElement("canvas");
    canvas2.width = img.width; canvas2.height = img.height;
    const hashOptions1:PerceptualColorHasherOptions = {
        hueBuckets:10,saturationBuckets:10, valueBuckets:10,
        canvas:canvas2,
        canvasWidth:img.width,
        canvasHeight:img.height,
    }

    const perceptualColorHasher:PerceptualColorHasher = new PerceptualColorHasher(hashOptions1); 

    // warm up phase (HSV): 
    for (let i = 0; i < 5; i++) {
        HSVHashIndex = (await perceptualColorHasher.imgToColorHash(img)).colorIndex
    }

    // test phase (HSV)
    const startTime1 = performance.now();
    for (let i = 0; i < TEST_TRIALS; i++) { 
        await perceptualColorHasher.imgToColorHash(img);
    }
    const endTime1 = performance.now();
    const avgTime1 = (endTime1 - startTime1) / TEST_TRIALS;
    console.log(`Average Time RGB hash with WebWorker: ${avgTime0}.\nRGB Color Index: ${RGBHashIndex}\n`);
    console.log(`Average Time HSV hash: ${avgTime1}.\nHSV Color Index: ${HSVHashIndex}\n`);
    if (avgTime0 < avgTime1) {
        console.log("The RGB hash with Webworker was about " + Math.floor(avgTime1/avgTime0) + " times faster");
    } else {
        console.log("The HSV hash was about " + Math.floor(avgTime0/avgTime1) + " times faster");

    }
}

export const runHashingTests =  async() => {
    await runHashTests();
    console.log("------------------\n")
    await runHashTestsWithWorker();
}
 


export const runTester = async ()=> {

const testResults:string[]=[];
let successfulHashes = 0;

const ImageArray = [a1,a1_compressed , a2,a3,a4,a5,a6,a7,b1,b2, bw1, bw2, bw3,bws1, c1, g ]; 
const FileNames:string[] = ["a1","a1_compressed","a2","a3","a4","a5","a6","a7","b1","b2", "bw1", "bw2" , "bw3","bws1", "c1", "g"];
 
// generate magic square look up texture; 
const lookUpData = await getLookUpTexture(198);

const totalImages = ImageArray.length; 


for(let i = 0 ; i < ImageArray.length; i++){

    console.log("processing next pair of images...")


    const img = await loadImage(ImageArray[i].src);

    const outputCanvas = document.createElement("canvas");  
     
    const gl = outputCanvas.getContext("webgl2");

    if(!gl) {
        throw new Error("something went wrong")
    }  


        // set up input canvas
        const width = img.width;
        const height = img.height; 
        const inputCanvas = document.createElement("canvas"); 
        const ctx = inputCanvas.getContext("2d");
        inputCanvas.width = width;
        inputCanvas.height = height;

    // draw image and hash color

        ctx?.drawImage(img,0,0,width,height);
        const imageData = ctx?.getImageData(0, 0, img.width, img.height);

        if(!imageData)throw new Error("failed to get image data");

        const hashOptions:HashOptions = {redBuckets: 10,greenBuckets: 10, blueBuckets:10, imageData: new Uint8ClampedArray<ArrayBufferLike>(imageData.data.buffer)};

        const hash = new ColorHasher(hashOptions);

        const avgColorBefore = hash.getAvgColor();
         
        const colorIndex =  hash.colorToIndex(avgColorBefore);
        
        testResults.push(`${FileNames[i]} RGB before: {r:${avgColorBefore.r}, g:${avgColorBefore.g}, b:${avgColorBefore.b}} , colorIndex: ${colorIndex}`);
        // set up webgl
 
        const webGLParams:WebGLParams = {
            width : img.width,
            height : img.height,
            gridPartitions : 198, 
            lookupTexture: lookUpData,
            glCtx:gl,
            imgData:imageData,
            outputCanvas:outputCanvas
        }

        webglProgram(webGLParams);

        const encryptedImage = new Image();
        encryptedImage.src = outputCanvas.toDataURL(); // default PNG
        await new Promise<void>((resolve)=>{
            encryptedImage.onload =()=>resolve();
        });

        // const pixels = new Uint8Array(outputCanvas.width * outputCanvas.height * 4);
        const pixels = new Uint8ClampedArray(outputCanvas.width * outputCanvas.height * 4);
        gl.readPixels(0, 0, outputCanvas.width, outputCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        const imgOutputHasher = new ColorHasher({redBuckets:10,greenBuckets:10,blueBuckets:10, imageData: pixels});
        const avgOutputColor = imgOutputHasher.getAvgColor();
        const outputHashColorIndex = imgOutputHasher.colorToIndex(avgOutputColor);
        
        testResults.push( `${FileNames[i]} RGB after: { r:${avgOutputColor.r}, g:${avgOutputColor.g}, b:${avgOutputColor.b}} , colorIndex: ${outputHashColorIndex}`);
        
        if(colorIndex === outputHashColorIndex){

            successfulHashes++
            
        }else{
            console.log(FileNames[i] + " failed!")
        }

}

console.log(`hash score ${Math.round(successfulHashes/totalImages * 10000)/100}%`)

console.log(testResults)

}