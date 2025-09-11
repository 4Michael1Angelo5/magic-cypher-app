interface RGBcolor {
  r: number;
  g: number;
  b: number;
}

interface HSVcolor {
  h: number; // 0–360
  s: number; // 0–1
  v: number; // 0–1
}

export interface PerceptualColorHasherOptions {
  hueBuckets?: number;
  saturationBuckets?: number;
  valueBuckets?: number; 
  canvasWidth?:number,
  canvasHeight?:number
}

interface HashOutput {
  hsv:HSVcolor,
  colorIndex:number,
}


class PerceptualColorHasher {

  public hueBuckets:number = 0;  // hue 
  public saturationBuckets:number = 0;  // saturation
  public valueBuckets:number = 0;  // value

  public hueStepSize:number = 0;
  public saturationStepSize:number = 0; 
  public valueStepSize: number = 0;

  public canvasWidth:number = 0;
  public canvasHeight:number = 0; 

  constructor(options:PerceptualColorHasherOptions = {}){
    // @TODO make the canvas size optional in the constructor

     
    this.validateOptions(options); // throws error if options are invalid
  
    this.hueBuckets = options.hueBuckets ?? 10;  // ---> eg: 360/12 
    this.saturationBuckets = options.saturationBuckets ?? 5 // ---> eg: 1/10;      
    this.valueBuckets = options.valueBuckets ?? 5;  // ---> eg: 1/5

    this.canvasWidth = options.canvasWidth ?? 500;
    this.canvasHeight = options.canvasHeight ?? 500;

    this.hueStepSize = 360/this.hueBuckets;
    this.saturationStepSize = 1/this.saturationBuckets; 
    this.valueStepSize = 1/this.valueBuckets; 
 
  }

  private validateOptions = (options:PerceptualColorHasherOptions)=>{
    if(options.hueBuckets != undefined){
      if(options.hueBuckets > 360 || options.hueBuckets < 1){
        throw new Error("Recieved invalid Hue Bucket Size\n" + "Bucket sizes must be between 1 and 360 ");
      }
      if(!Number.isInteger(options.hueBuckets)){
        throw new Error("Recieved invalid Hue Bucket Size\n" + "Bucket sizes must be an integer ")
      }
    }
    if(options.saturationBuckets != undefined){
      if( !(options.saturationBuckets >= 1) ){
        throw new Error("Recieved invalid Saturation Bucket Size\n" + "Bucket sizes must be greater then or equal to 1 ");
      }
      if( !Number.isInteger(options.saturationBuckets)){
        throw new Error("Recieved invalid Saturation Bucket Size\n" + "Bucket sizes must be an integer")
      }
    }
    if(options.valueBuckets != undefined){
      if(!(options.valueBuckets >= 1 )){
        throw new Error("Recieved invalid Value Bucket Size\n" + "Bucket sizes must be greater than or equal to 1 ");
      }
      if(!Number.isInteger(options.valueBuckets)){
        throw new Error("Recieved invalid Value Bucket Size\n" + "Bucket sizes must be an integer");
      }
    }
  }

  private rgbToHSV(rgbColor:RGBcolor): HSVcolor {
    const { r, g, b } = rgbColor;
    const rPrime = r / 255;
    const gPrime = g / 255;
    const bPrime = b / 255;

    const cMax = Math.max(rPrime, gPrime, bPrime);
    const cMin = Math.min(rPrime, gPrime, bPrime);
    const delta = cMax - cMin;

    let h = 0;
    if (delta !== 0) {
      if (cMax === rPrime) {
        h = 60 * (((gPrime - bPrime) / delta) % 6);
      } else if (cMax === gPrime) {
        h = 60 * ((bPrime - rPrime) / delta + 2);
      } else {
        h = 60 * ((rPrime - gPrime) / delta + 4);
      }
      if (h < 0) h += 360;
    }

    const s = cMax === 0 ? 0 : delta / cMax;
    const v = cMax;

    return { h, s, v };
  }

  private getImageData = async (img:HTMLImageElement):Promise<ImageData | null>=>{

    let imgData:ImageData | null = null;

    try{
      
      const canvas = document.createElement("canvas");

      const ctx = canvas.getContext("2d");

      if(!ctx){
        throw new Error("failed to get 2d context");
      }
      
      // draw a scaled down version of the image; 
      canvas.width = this.canvasWidth; 
      canvas.height = this.canvasHeight; 
      // ctx.filter = "blur(2px)"; 
      ctx.drawImage(img,0,0,this.canvasWidth,this.canvasHeight);

       imgData = ctx.getImageData(0,0,this.canvasWidth,this.canvasHeight);

    }
    catch(error: unknown){
      console.error(error);
    }
 

    return imgData; 

  }

  private calculateQuantizedHSV = (hsvColor:HSVcolor):HSVcolor=>{


    const H = Math.floor(hsvColor.h/this.hueStepSize)*this.hueStepSize; 
    const S = Math.floor(hsvColor.s/this.saturationStepSize)*this.saturationStepSize; 
    const V = Math.floor(hsvColor.v/this.valueStepSize)*this.valueStepSize; 

    const quantizedHSVcolor:HSVcolor = {h:H,s:S,v:V}; 
    return quantizedHSVcolor; 
    
  }

  private computeColorIndex = (hsv: HSVcolor): number => {
    const hIndex = Math.floor(hsv.h / this.hueStepSize);
    const sIndex = Math.floor(hsv.s / this.saturationStepSize);
    const vIndex = Math.floor(hsv.v / this.valueStepSize);

    const colorIndex = hIndex * (this.saturationBuckets * this.valueBuckets)
         + sIndex * this.valueBuckets
         + vIndex; 

    return colorIndex
};


  public imgToColorHash = async (img:HTMLImageElement):Promise<HashOutput>=>{
    // this method gets the average hsv color of an image using quantized bucket sizes.
    // it returns an index; 

      let hX = 0, hY = 0;  // for circular hue averaging
      // let h = 0;
      let s = 0; 
      let v = 0;
      let avgHue = 0;

    try{
      
      const imgData:ImageData | null = await this.getImageData(img);

      if(!imgData){
        throw new Error("Failed to get imageData");

      }

      const data = imgData.data; 

      const numPixels = imgData.data.length/4; 


      for(let i = 0 ; i < data.length ; i+=4){
        const r = data[i]; 
        const g = data[i+1];
        const b = data[i+2]; 
        const hsv:HSVcolor = this.rgbToHSV({r,g,b}); 

        // circular averaging for hue
        const hRad = hsv.h * (Math.PI / 180);
        hX += Math.cos(hRad);
        hY += Math.sin(hRad);
 
          // h += hsv.h;
          s += hsv.s;
          v += hsv.v

      }

      avgHue = Math.atan2(hY, hX) * (180 / Math.PI);
      if (avgHue < 0) avgHue += 360;

      // h = h/numPixels;
      s = s/numPixels; 
      v = v/numPixels;

    }
    catch(error: unknown){
      console.error(error);
    }

    const averageHSVcolor:HSVcolor = {h:avgHue, s:s, v:v};  

    const quantizedAverageHSVColor = this.calculateQuantizedHSV(averageHSVcolor); 

    const uniqueColorIndex = this.computeColorIndex(quantizedAverageHSVColor); 

    const hashOutput:HashOutput = {hsv:quantizedAverageHSVColor,colorIndex:uniqueColorIndex};

    return hashOutput
  }
}

export default PerceptualColorHasher;
