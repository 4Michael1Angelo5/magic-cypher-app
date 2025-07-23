import { Vertex , Matrix} from "./CipherTypes";
import { IndexedValue, IndexedList } from "./CipherTypes";

// Image Encryption Helper Functions

 // Step 3b ) Image Encryption
export const  generateTileOriginUVCoords = (N:number) : IndexedList<"image"> =>{

        const indexedList:IndexedList<"image">=[]
        const dU = 1 / N; 
        const dV = 1 / N; 
        
        let index = 0;
    
        for (let i = 0; i < N; i++) { // i is the row index, from N-1 (top) to (0) bottom 
            for (let j = 0; j < N; j++) { // j is the column index, from 0 (left) to N-1 (right)
                    
                const glitchDirrection = Math.floor(Math.random() * 4)
                const delayOffset = (i * N + j) / (N * N); // linear tile-by-tile delay

                const u = 0 + j * dU;  
                const v = 1 - i * dV;
                    
                const vertex:Vertex = {
                    r : u, 
                    g : v,
                    b: delayOffset,
                    a: glitchDirrection /4.0 // normalized
                } 
                const indexedValue:IndexedValue<"image"> = {index:index,value:vertex};

                indexedList.push(indexedValue);

                // console.log([vertex.r,vertex.g])

                index++; 
            }
        }

        for(let i = 0 ; i < N ; i ++){
            for(let j = 0; j < N ; j ++){
                shuffleTileAnimationDelay(indexedList, i*N+j);
            }
        }

        return indexedList;
    }

// Randomly shuffle the animation delay offset stored in the b channel of an indexed list of vertices
const shuffleTileAnimationDelay = (list:IndexedList<"image">,index:number)=>{
        
        const vertex = list[index].value; 
        const tempBVal:number = vertex.b;  

        const randomIndex = index + Math.floor(Math.random()*(list.length - index));
        const randomVertexFromList = list[randomIndex].value;

        list[index].value.b = randomVertexFromList.b; 
        list[randomIndex].value.b = tempBVal; 
}

// this does the same as above but the return type is a matrix instead of a list
export const calculateIndexOfVertexInArray = (N:number,row:number,column:number):number=>{
    const index = (row*N + column)*4
    return index; 
}

export const generateIndexedUVCoordMatrix = (N:number):Matrix<IndexedValue<"image">>=>{

        // maybe do some check here to make sure the squareroot of the list is equal to N

        const dU = 1 / N; 
        const dV = 1 / N;         

    const matrix:Matrix<IndexedValue<"image">> = []; 

    let index = 0; 

    for(let i = 0 ; i < N ; i ++){
        matrix.push([]);
        for( let j = 0; j < N ; j ++){

            const glitchDirrection = Math.floor(Math.random() * 4)
            const delayOffset = (i * N + j) / (N * N); // linear tile-by-tile delay

            const u = 0 + j * dU;  
            const v = 1 - i * dV;
                
            const vertex:Vertex = {
                r : u, 
                g : v,
                b: delayOffset,
                a: glitchDirrection /4.0 // normalized
            } 
            // console.log([vertex.r,vertex.g])

            matrix[i][j] = {index: index , value:vertex}; 
            index++; 
        }

        // @NOTE not randomizing the delayoffset
        // maybe we do that later if the animation effect is not random enough/
        // the final Float32Array may appear random enough because they will be in the order 
        // of a magic square permutation ie:
        //  8 1 6   
        //  3 5 7   ==> will be the delay offset meaning tile 1 will be the 8'th to start animation
        //  4 9 2                                        tile 2 will the the 1'st to animate 
        //                                               tile 3 will the 6'th to animate
        //                                               tile 4 will be the 3rd to animate etc 
    }

    return matrix; 
}
