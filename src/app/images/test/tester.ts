import PerceptualColorHasher, { PerceptualColorHasherOptions } from "../perceptualColorHasher";
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

    const hashSetting:PerceptualColorHasherOptions = {
        canvasWidth:img.width,
        canvasHeight:img.height,
        hueBuckets:24,
        saturationBuckets:10,
        valueBuckets:10
    }
   
    const outputCanvas = document.createElement("canvas");  
     
    const webglRenderingContext = outputCanvas.getContext("webgl2");

    if(!webglRenderingContext) {
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

        const hash = new PerceptualColorHasher(hashSetting); 
         
        const imageColorHash = await hash.imgToColorHash(img);
        
        testResults.push(`${FileNames[i]} before, hsv: { ${imageColorHash.hsv.h} ${imageColorHash.hsv.s} ${imageColorHash.hsv.v} } , colorIndex: ${imageColorHash.colorIndex}`); 
        // set up webgl
 
        const webGLParams:WebGLParams = {
            width : img.width,
            height : img.height,
            gridPartitions : 198, 
            lookupTexture: lookUpData,
            glCtx:webglRenderingContext,
            imgData:imageData,
            outputCanvas:outputCanvas
        }

        webglProgram(webGLParams);

        const encryptedImage = new Image();
        encryptedImage.src = outputCanvas.toDataURL(); // default PNG
        await new Promise<void>((resolve)=>{
            encryptedImage.onload =()=>resolve();

        }); 
        const encryptedImageHash = new PerceptualColorHasher(hashSetting);

        const encryptedImageHashOutput = await encryptedImageHash.imgToColorHash(encryptedImage);

        
        testResults.push( `${FileNames[i]} after, hsv: { ${encryptedImageHashOutput.hsv.h} ${encryptedImageHashOutput.hsv.s} ${encryptedImageHashOutput.hsv.v} } , colorIndex: ${encryptedImageHashOutput.colorIndex}`);
        
        if(imageColorHash.colorIndex === encryptedImageHashOutput.colorIndex){

            successfulHashes ++
            
        }else{
            console.log(FileNames[i] + " failed!")
        }

}

 

console.log(`hash score ${Math.round(successfulHashes/totalImages * 10000)/100}%`)

console.log(testResults)

}