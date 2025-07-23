
interface PixelData {
    img: HTMLImageElement; 
    imgSrc:string
    imgObj: ImageData
    dimensions:{
        width:number, 
        height:number,
        aspectRatio:number,     }
}


export const getPixelData =  (ref:React.RefObject<HTMLCanvasElement>, imgURL:string):PixelData | undefined=>{
    

        const img = new Image();
        img.src = imgURL; 

    
        // store this
        const width = img.width;
        const height = img.height; 

        const ctx = ref.current.getContext("2d");

        if (!ctx) {
             console.log("getPixelData: ", "no webgl rendering context")
            return;
        }

        ref.current!.width = width;
        ref.current!.height = height;

        // get pixel data
        ctx.drawImage(img, 0, 0, width, height);
        const imageData:ImageData = ctx.getImageData(0, 0, width, height);

         console.log("getPixelData imagedata: ", imageData);

        const pixelData:PixelData = {
            img:img,
            imgSrc: imgURL,
            imgObj:imageData,
            dimensions:{
                width:width,
                height:height, 
                aspectRatio:width/height

            }
        }    
        

        return pixelData; 
     
}