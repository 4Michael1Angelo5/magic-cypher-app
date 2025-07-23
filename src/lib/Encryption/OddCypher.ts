import MagicCypher from "./MagicCypher";
import CipherObject from "./CipherContract";
import { ChildParams, EncryptionInput, EncryptionOutput,  
        IndexedValue, Matrix, CipherType , IndexedList, 
        Vertex} from "./CipherTypes";

import { calculateIndexOfVertexInArray } from "./ImageEnryptionHelpers";
class OddCypher<T extends CipherType> extends MagicCypher<T> implements CipherObject<T> {
 
        
    encryptionInput!:EncryptionInput<T>;

    cipherType:T;

    encryptionOutPut!:EncryptionOutput<T>

    // magic square filled with characters
    magicSquare: Matrix<IndexedValue<T>>  = []; 

    indexedList!: IndexedList<T>;
 
    // order
    order:number = 0; 

    cellOccpancy:boolean[][] = [];
    
    //===============================================================
    //constructor

    constructor (params:ChildParams<T>){
        super();

        if(params.value.matrix.length % 2 !== 1){
            throw new Error(
                "Error: Attempted to create an odd magic Square from an even orderd square \n" +
                    "Matrix size is not an odd number \n" +
                            "Order of an odd cipher must be an odd number.");
        };
        this.cipherType = params.type as T; 
        this.order = params.value.matrix.length; 
        this.magicSquare = params.value.matrix  as Matrix<IndexedValue<T>>; 
        this.indexedList = params.value.indexedList as IndexedList<T>; 

        if(Math.sqrt(this.indexedList.length) !== this.magicSquare.length ){
            // this is a good check makes sure the child is at least recieving the correct params and narrows down the error
            // to child class object creation in the parent
            // @TODO this check needs to be in ALL child classes
            throw new Error("Error: programer error. OddCypher recieved a list that is not the square of the matrix length \n" +
                "Matrix.length must equal sqrt(indexedList.length) "
            )
        }

        // init outputs
        this.output = {
            type: params.type, 
            value : params.type === "text" ? "" : new Float32Array(this.order*this.order*4) 
        } as EncryptionOutput<T>; 

        this.cellOccpancy = Array.from({length:this.order},()=> new Array(this.order).fill(false));  
        
        console.log("this should be empty if encrypting", this.magicSquare); 
        console.log("this should be empty if decrypting", this.indexedList)
    }

    //================================================================
    // main method

    encrypt = (cipherType:T) :EncryptionOutput<T>=> {

        this.buildSquare();

        if(this.isMagic(this.magicSquare)){
            console.log("encryption performed successfully!")
        };

        const output:EncryptionOutput<T> = this.readSquare(cipherType,this.magicSquare);

        return output; 
    }
    
    //step 1) construct a magic square filled with indexedList data
    buildSquare(): Matrix<IndexedValue<T>> {
        // this method makes the magic square
        // each cell contains a map {indexOfChar : "char"}

        // short hand 
        const N = this.order; 
        const middleColumn = Math.floor(N / 2);
        
        // row (i) & column (j) size
        let i = 0; // i starts in the first row
        let j = middleColumn; // j starts in the middle column
        let indexOfChar = 0; // index of characters in the message
    
        // initialize row variable
        let row:IndexedList<T> = [];

        
        while (indexOfChar < N * N) {
            
            // reassign row variable with each iteration
            row = this.magicSquare[i];    

            const val:IndexedValue<T> = this.indexedList[indexOfChar]

             //put indexedValue in cell column j of row i 
            row[j] = val; 

            // mark cell as being filled 
            this.cellOccpancy[i][j] = true; 


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
            if (this.cellOccpancy[i-1][j+1] === true && i + 1 < N) {

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
            
            // move to next index of char in message
            indexOfChar++;
        }
    
        return this.magicSquare;
    }

    

    decrypt(cipherType:T): EncryptionOutput<T> { 

        let output:EncryptionOutput<T>; 

        this.traverseSquare();

        // console.log("traverse square  should have filled empty indexed list: "); 
        if(this.cipherType ==="image"){
            console.log("decrypting an image"); 
            this.indexedList.forEach(e=>{
                const vertex:Vertex = e.value as Vertex; 

                // console.log([vertex.r, vertex.g]);
            })

        }
 


        output  = this.listToOutput(cipherType, this.indexedList);



        return output;
    }


        traverseSquare = (): IndexedList<T> =>{

            console.log("at the start of traversal",this.magicSquare)

        // this.printSquare(this.magicSquare)
          // short hand 
          const N = this.order; 
          const middleColumn = Math.floor(N / 2);
          
          // row (i) & column (j) size
          let i = 0; // i starts in the first row
          let j = middleColumn; // j starts in the middle column
          let indexOfChar = 0; // index of characters in the message

          const decryptedMessageArray:IndexedList<T> = [...this.indexedList]; 

            
          while (indexOfChar < N * N) {

            let indexedValue:IndexedValue<T> = this.magicSquare[i][j]

            if(this.cipherType === "text"){
                if(indexedValue.value === "null"){
                    // this means we recived an empty matrix in our constructor
                    // this should not happen
                
                this.printSquare(this.magicSquare)
                 
                throw new Error("programer error: decrypt method in OddMagicCypher recieved an invalid empty indexedList in its constructor")
            }
            }

      
            // mark cell as occupied/ explored
            this.cellOccpancy[i][j] = true;
            //assign the char to it's corresponding index in the message
            
            console.log("before swap", decryptedMessageArray[indexOfChar]);
            decryptedMessageArray[indexOfChar] = indexedValue;
             console.log("after swap", decryptedMessageArray[indexOfChar]);
             

  
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
              if (this.cellOccpancy[i-1][j+1]===true && i + 1 < N) {
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
              
              // move to next index of char in message
              indexOfChar++;
          }

          console.log("at the end of traversal",decryptedMessageArray)
      

        
        return decryptedMessageArray;
    }
}

export default OddCypher;