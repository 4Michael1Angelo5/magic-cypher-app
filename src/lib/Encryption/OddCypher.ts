import MagicCypher from "./MagicCypher";
import CipherObject from "./CipherContract";
import {
    ChildParams,
    CipherType,
    EncryptionOutput,
    IndexedList,
    IndexedValue,
    Matrix,
} from "./CipherTypes";

/**
 * OddCypher creates odd order magic squares ciphers.
 * It uses the siamese method to generate a magic square.
 * The magic square is filled with an {@link IndexedValue}.
 * An indexed value is a key-value paired object. For,
 *  - TEXT: Maps string index [0...N²-1] to matrix coordinates (i, j).
 *  - IMAGE: Maps tile index [0...N²-1] to matrix coordinates (i, j).
 * @param T the {@link CipherType}
 * @author Chris Chun
 * @version 2.1
 */
class OddCypher<T extends CipherType> extends MagicCypher<T> implements CipherObject<T> {

    /**
     * The cipher type. Can be "text" or "image"
     */
    cipherType:T;

    /**
     * magic square filled with characters or UV tile lookups
     */
    magicSquare: Matrix<IndexedValue<T>>  = []; 

    declare indexedList: IndexedList<T>;
 
    // order of the magic square.
    order:number = 0; 

    cellOccupancy:boolean[][] = [];
    
    //===============================================================
    //constructor

    constructor (params:ChildParams<T>){
        super();

        if(params.value.matrix.length % 2 !== 1){
            throw new Error(
                "Error: Attempted to create an odd magic Square from an even ordered square \n" +
                    "Matrix size is not an odd number \n" +
                            "Order of an odd cipher must be an odd number.");
        }
        this.cipherType = params.type as T; 
        this.order = params.value.matrix.length; 
        this.magicSquare = params.value.matrix  as Matrix<IndexedValue<T>>; 
        this.indexedList = params.value.indexedList as IndexedList<T>; 

        if(Math.sqrt(this.indexedList.length) !== this.magicSquare.length ){
            // this is a good check makes sure the child is at least receiving the correct params and narrows down the error
            // to child class object creation in the parent
            // @TODO this check needs to be in ALL child classes
            throw new Error("Error: programmer error. OddCypher received a list that is not the square of the matrix length \n" +
                "Matrix.length must equal sqrt(indexedList.length) "
            )
        }

        // init outputs
        this.output = {
            type: params.type, 
            value : params.type === "text" ? "" : new Float32Array(this.order*this.order*4) 
        } as EncryptionOutput<T>; 

        this.cellOccupancy = Array.from({length:this.order},()=> new Array(this.order).fill(false));
        
        // Note: For objects like `magicSquare` and `indexedList`, you need to use `JSON.parse(JSON.stringify(...))`
        // to get an accurate snapshot of their current values. Because these objects are mutated asynchronously,
        // a simple `console.log()` outputs their reference in memory, not their exact state at the time of logging.
        // As a result, console logs may reflect future (mutated) values instead of the current ones.
         
    }

    //================================================================
    // main method

    encrypt = (cipherType:T) :EncryptionOutput<T> => {

        this.buildSquare();

        if(this.isMagic(this.magicSquare)){
            console.log("encryption performed successfully!")
        }

        return this.readSquare(cipherType,this.magicSquare);
    }
    
    //step 1) construct a magic square filled with indexedList data
    buildSquare(): Matrix<IndexedValue<T>> {
        // this method makes the magic square
        // each cell contains a map {indexOfChar : "char"}

        // shorthand
        const N = this.order; 
        const middleColumn = Math.floor(N / 2);
        
        // row (i) & column (j) size
        let coordinate= new Coordinate(0,middleColumn);

        let indexOfChar = 0; // index of characters in the message
    
        // initialize row variable
        let row:IndexedList<T> = [];

        
        while (indexOfChar < N * N) {

            // reassign row variable with each iteration
            row = this.magicSquare[coordinate.row];

            //put indexedValue in cell column j of row i
            row[coordinate.col] = this.indexedList[indexOfChar];

            // mark cell as being filled 
            this.cellOccupancy[coordinate.row][coordinate.col] = true;

            coordinate = this.getRowColCoordinate(coordinate);

            indexOfChar++;
        }
    
        return this.magicSquare;
    }

    

    decrypt(cipherType:T): EncryptionOutput<T> { 

        const decryptedIndexedList = this.traverseSquare();
 
        return this.listToOutput(cipherType, decryptedIndexedList);
    }


    traverseSquare = (): IndexedList<T> =>{
 
        // shorthand
        const N = this.order; 
        const middleColumn = Math.floor(N / 2);

        let indexOfChar = 0; // index of characters in the message

        const decryptedMessageArray:IndexedList<T> = this.indexedList;

        let coordinate = new Coordinate(0,middleColumn);

        
        while (indexOfChar < N * N) {

            const indexedValue:IndexedValue<T> = this.magicSquare[coordinate.row][coordinate.col];

            if(this.cipherType === "text"){
                if(indexedValue.value === "null"){
                    // this means we received an empty matrix in our constructor
                    // this should not happen                
                this.printSquare(this.magicSquare)
                    
                throw new Error("programmer error: " +
                    "decrypt method in OddMagicCypher received an invalid empty indexedList in its constructor")
                }
            }

            // mark cell as occupied/ explored
            this.cellOccupancy[coordinate.row][coordinate.col] = true;
            //assign the char/UV tex lookup to it's corresponding index in the message
             
            decryptedMessageArray[indexOfChar] = indexedValue;

            coordinate = this.getRowColCoordinate(coordinate);

              // move to next index of char in message
              indexOfChar++;
          } 
      
        return decryptedMessageArray;
    }

    getRowColCoordinate = (coordinate : Coordinate) :Coordinate => {

        // shorthand
        const N = this.order;
        let i = coordinate.row;
        let j = coordinate.col;

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
            if (this.cellOccupancy[i-1][j+1] && i + 1 < N) {
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

            return new Coordinate(i,j)
    }
}

class Coordinate {
    row: number;
    col: number;
    constructor(row:number, col:number) {
        this.row = row;
        this.col = col;
    }
}

export default OddCypher;