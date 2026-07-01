

export interface HashOptions {
    // optional settings
    redBuckets?: number;
    greenBuckets?: number;
    blueBuckets?: number;
    // mandatory
    imageData:Uint8ClampedArray
}

type RGBcolor = {
    r: number,
    g: number,
    b: number,
}

class ColorHasher {

    declare redBuckets: number;
    declare greenBuckets: number;
    declare blueBuckets: number;
    declare imageData: Uint8ClampedArray;

    constructor(HashOptions: HashOptions) {
        this.redBuckets = HashOptions.redBuckets ? HashOptions.redBuckets: 10;
        this.greenBuckets = HashOptions.greenBuckets ? HashOptions.greenBuckets: 10;
        this.blueBuckets = HashOptions.blueBuckets ? HashOptions.blueBuckets: 10;
        this.imageData = HashOptions.imageData;
        this.validateHashOptions();
    }

    validateHashOptions(): void {
        if (this.redBuckets <= 0 || this.redBuckets > 255) {
            throw new Error("redBuckets must be greater than 0 and less than or equal to 255");
        }

        if (this.greenBuckets <= 0 || this.greenBuckets > 255) {
            throw new Error("greenBuckets must be greater than 0 and less than or equal to 255");
        }

        if (this.blueBuckets <= 0 || this.blueBuckets > 255) {
            throw new Error("blueBuckets must be greater than 0 and less than or equal to 255");
        }
    }

    getAvgColor = ():RGBcolor => {

        if (!this.imageData) throw new Error('Invalid data');

        const n = this.imageData.length/4; // stride = 4 [r0,g0,b0,a0,r1,g1,b1,a1...]

        let avgR = 0;  const qR = 256/this.redBuckets;    // red bucket step size
        let avgG = 0;  const qG = 256/this.greenBuckets; // green bucket step size
        let avgB = 0;  const qB = 256/this.blueBuckets;   // ...

       for (let i = 0; i < this.imageData.length; i+=4) {
           avgR+=this.imageData[i];
           avgG+=this.imageData[i+1];
           avgB+=this.imageData[i+2];
       }
       // return avg color
        avgR = Math.floor(avgR/n/qR)*qR;
        avgG = Math.floor(avgG/n/qG)*qG;
        avgB = Math.floor(avgB/n/qB)*qB;

        return {r:avgR,g:avgG, b:avgB}
    }

    colorToIndex = (color: RGBcolor):number => {

        // step size delta's for red, green, and blue
        const dR = 256/this.redBuckets
        const dG = 256/this.greenBuckets
        const dB = 256/this.blueBuckets

        // row i, column j, layer k
        const i = Math.min(this.redBuckets - 1, Math.floor(color.r / dR));  //guard against i <= 256
        const j = Math.min(this.greenBuckets - 1, Math.floor(color.g / dG));
        const k = Math.min(this.blueBuckets - 1, Math.floor(color.b / dB));

        // (i,j,k) => index = i * (J * K) + j * (K) + k
        return  i * (this.greenBuckets * this.blueBuckets) + j * this.blueBuckets + k;
    }

    // take a unique color index and return a "reasonable" number for
// grid partitions "N" which becomes the order of the magic square
    colorIndexToMagicSquareOrder = (index: number): number => {

        const minOrder = 100;

        const maxOrder = 300;

        return minOrder + index % maxOrder;
    }

}

export default ColorHasher;