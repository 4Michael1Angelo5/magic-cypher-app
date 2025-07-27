
interface Vertex {
    r:number,
    g:number,
    b:number, 
    a:number,
}

const generateTileOriginUVCoords = (N:number) : Vertex[] =>{
    const vertices:Vertex[] = [];
    const dU = 1 / N; 
    const dV = 1 / N; 
   
    
    for (let i = 0; i < N; i++) { // i is the row index, from N-1 (top) to bottom (top)
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

            vertices.push(vertex);
        }
    }

    for(let i = 0 ; i < N ; i ++){
        for(let j = 0; j < N ; j ++){
            shuffleTileAnimationDelay(vertices, i*N+j);
        }
    }

    return vertices;
}




//helper function to calculate index of UV coords in Float32Array containing 
// rgba values with u in r chanel and v in g chanel with the other two unused for now

const calculateIndexOfVertexInArray = (N:number,row:number,column:number):number=>{
    const index = (row*N + column)*4
    return index; 
}




// one quad consists of two triangles
// each triangle has 3 vertices. 
// therefore each quad contains 6 vertices.
// this is so that we can use drawArrays. 

// if we did 4 verts then we would also need an indexBuffer in webgl

// upperLeft            upperRight
//      v0 - - - - - - - v1 
//      |             *  |
//      |          *     |
//      |        *       |
//      |      *         |
//      |    *           |
//      |  *             |
//      v2 - - - - - - - v3  
// lowerLeft            lowerRight

// helper method to take 1D indexed element and return its 
// i (row), j (column)  index in a 2D square matrix
// const calculateRowColumn = (index:number , squareSize:number):[number,number] => {
//   const j = index % squareSize; 
//   const i = Math.floor( index / squareSize);
//   return [i,j]
// }

 
export const traverseSquare = (N:number): Float32Array=>{
 
        const middleColumn = Math.floor(N / 2);
        const magicMapTexture = new Float32Array(N*N*4); 
        const orignalUVCoords:Vertex[] = generateTileOriginUVCoords(N);
        
        // row (i) & column (j) size
        let i = 0; // i starts in the first row
        let j = middleColumn; // j starts in the middle column
        let indexOfVertex = 0; // index of characters in the message

        const cellOccupancy: boolean[][] = Array.from({ length: N }, () =>
        Array(N).fill(false)
        );

        
        while (indexOfVertex < N * N) {
            
            const vertex = orignalUVCoords[indexOfVertex];
            const indexOfOutPutArray = calculateIndexOfVertexInArray(N,i,j); 
            magicMapTexture[indexOfOutPutArray + 0] = vertex.r; //
            magicMapTexture[indexOfOutPutArray + 1] = vertex.g;
            magicMapTexture[indexOfOutPutArray + 2] = vertex.b; // time delay 
            magicMapTexture[indexOfOutPutArray + 3] = vertex.a;
            

            cellOccupancy[i][j] = true;

              
            if (i - 1 < 0 && j + 1 < N) {
    
                // rule 1
                // if incrementing up and to the right results in
                // row being out of bound and column is still in bounds
                // let row = bottom row
    
                i = N - 1;
                j++;
    
            } else 
            if (i - 1 >= 0 && j + 1 >= N) {
                // rule 2
                // if incrementing up and the right results in column being out of bounds
                // but row is still in bounds, let column = the first column ;
    
                j = 0;
                i--;
    
            } else 
            if (i - 1 < 0 && j + 1 >= N) {
                // rule 3
                // if incrementing up and to the right results
                // in both i and j being out of bounds, go down one row
                // in the same column
    
                i++;
    
                // note that Rule 3 must go before rule 4 because it catches
                // rule 4 from creating error out of bounds 
    
            } else 
            if (cellOccupancy[i-1][j+1]===true && i + 1 < N) {
                // rule 4
                // check what's inside the next row above and next column over
                // if it's not empty, then it's occupied
    
                // // rule 4
                // // cell is occupied go down one row
    
                i++;
            } else {
                // No cases match increment going up and to the right
                i--;
                j++;
            }
            
            // move to next index of Quad 
            indexOfVertex++;
        }
        
       
        return magicMapTexture;
        
    }

    const shuffleTileAnimationDelay = (v:Vertex[],index:number)=>{
        
        const temp:number = v[index].b;
        const randomIndex = index + Math.floor(Math.random()*(v.length - index));
        v[index].b = v[randomIndex].b; 
        v[randomIndex].b = temp; 
       
    }


    
