
import ColorHasher from "@/lib/hasher/colorHasher";

self.onmessage = async (event:MessageEvent):Promise<number> => {
    const {r,g,b,buffer} = event.data;

    const hasher = new ColorHasher({redBuckets:r,greenBuckets:g,blueBuckets:b,imageData:new Uint8ClampedArray<ArrayBufferLike>(buffer)});
    const index:number = hasher.colorToIndex(hasher.getAvgColor());
    self.postMessage(index); 
    return index;
}