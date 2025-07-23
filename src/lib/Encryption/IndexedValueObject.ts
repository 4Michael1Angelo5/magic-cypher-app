import { CipherType, Vertex} from "./CipherTypes";

class IndexedValueObject{
    
    index:number = 0;
    value:Vertex | string = "null" 

    constructor(index:number, value:Vertex|string){
        this.index = index;
        this.value = value
    }


}

export default IndexedValueObject