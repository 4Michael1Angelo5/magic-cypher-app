import CipherObject from "@/lib/Encryption/CipherContract";
import MagicCypher from "@/lib/Encryption/MagicCypher"
import { ChildParams, CipherType, IndexedList, 
     IndexedValue, Matrix , EncryptionInput, EncryptionOutput,
    } from "./CipherTypes";

class EvenCypher<T extends CipherType> extends MagicCypher<T> implements CipherObject<T> {

    // order of the magic square
    order: number = 0;
    
    // generic matrix containing indexed values of cipher types
    // eg {index<number>:0,value<string>: "t"} or {inedx<number>:0 , value<Vertex>: {r:0,g:0,b:0,a:0}}
    
     cipherType:T;
     //
     encryptionInput!:EncryptionInput<T>;     
     encryptionOutPut!:EncryptionOutput<T>
 
     // magic square filled with characters or vertices rgba value
     magicSquare: Matrix<IndexedValue<T>>  = []; 
 
     indexedList!: IndexedList<T>;
    


    /**
     * Constructs an EvenCypher instance for handling encryption using a magic square
     * of order divisible by 4 (doubly-even).
     * 
     * @param params - An object containing the cipher type and data structures used
     *                 to initialize the cipher. It must conform to the `ChildParams<T>` interface:
     * 
     * @param params.type - The cipher type: either `"text"` or `"image"`.
     * 
     * @param params.value.indexedList - A flat list of indexed values (text or vertices),
     *                 where each item has the shape `{ index: number, value: string | Vertex }`.
     *                 The list's length must be the square of a number divisible by 4 (e.g., 16, 64).
     * 
     * @param params.value.matrix - A 2D matrix (array of arrays) shaped as N x N
     *                 filled with placeholder values, used as the initial state of the magic square.
     *                 The total number of cells (N²) must match the length of `indexedList`.
     * 
     * @throws Will throw an error if the matrix order is not divisible by 4.
     * 
     * @remarks
     * The `order` of the cipher (N) is automatically derived from the matrix size.
     */

    constructor(params:ChildParams<T>) {
        super();         
        // validate the square
        if (params.value.matrix.length % 4 !== 0) {
            throw new Error("indexedList is not the square of a number divisible by 4. \n" +
                            "Order of an even cipher must be divisible by 4.");
        }
        this.cipherType = params.type as T; 
        this.order = params.value.matrix.length; 
        this.magicSquare = params.value.matrix  as Matrix<IndexedValue<T>>; 
        this.indexedList = params.value.indexedList as IndexedList<T>; 

        // init outputs
        this.output = {
            type: params.type, 
            value : params.type === "text" ? "" : new Float32Array(this.order*this.order*4) 
        } as EncryptionOutput<T>;  // do I even want to store output? 
   
        // Note: For objects like `magicSquare` and `indexedList`, you need to use `JSON.parse(JSON.stringify(...))`
        // to get an accurate snapshot of their current values. Because these objects are mutated asynchronously,
        // a simple `console.log()` outputs their reference in memory, not their exact state at the time of logging.
        // As a result, console logs may reflect future (mutated) values instead of the current ones.
    }


    encrypt(cipherType:T): EncryptionOutput<T>{

        //step 1
        this.buildSquare();   
        //step 2
        this.transpose() ;  
        
        
        if(this.isMagic(this.magicSquare)){
            console.log("encryption performed successfully!")
        };

        const output:EncryptionOutput<T> = this.readSquare(cipherType,this.magicSquare);

        return output;
    }
    
    decrypt(cipherType:T):EncryptionOutput<T> {
        
        // step 1
        this.transpose();

        const decryptedIndexedList = this.traverseSquare();
        this.indexedList = decryptedIndexedList; 

        const output = this.listToOutput(cipherType, decryptedIndexedList);

        // @TODO state handling is super messy. need to clean this up !!

      
        return output;
    }
    
    // pattern: 

    //  N = 4                   N = 8                            N = 12

    //  X 0 0 X             X X 0 0 0 0 X X               X X X 0 0 0 0 0 0 X X X 
    //  0 X X 0             X X 0 0 0 0 X X               X X X 0 0 0 0 0 0 X X X 
    //  X 0 0 X             0 0 X X X X 0 0               X X X 0 0 0 0 0 0 X X X 
    //                      0 0 X X X X 0 0               0 0 0 X X X X X X 0 0 0 
    //                      0 0 X X X X 0 0               0 0 0 X X X X X X 0 0 0 
    //                      X X 0 0 0 0 X X               0 0 0 X X X X X X 0 0 0
    //                      X X 0 0 0 0 X X               0 0 0 X X X X X X 0 0 0 
    //                                                    0 0 0 X X X X X X 0 0 0 
    //                                                    0 0 0 X X X X X X 0 0 0  
    //                                                    X X X 0 0 0 0 0 0 X X X
    //                                                    X X X 0 0 0 0 0 0 X X X
    //                                                    X X X 0 0 0 0 0 0 X X X  

    // approach:

    // create an ascending counter going from 1 to N^2;
    // create a descending counter going from N^2 to 1; 

    // start at the first row and first column.
    // go left to right through each column of every row of the matrix
    // with every cell that you explore add one to left counter and substract one from right counter
    // if it is an X fill it with descending counter, otherwise fill it with ascending counter 

    // size of outer corner squares is N/4   
    // we can create boolean statements to check if row i and column j fall with-in these parameters 
    // and if they do we know that we need to fill it with rightCounter. 
    // otherwise we need to fill with left counter. 

    // ********************* Encryption ******************************
    buildSquare(): Matrix<IndexedValue<T>> {

        const N = this.order; 
        let ascendingIndexCount = 0; 
        let descendingIndexCount = N**2-1;  

        for(let i = 0 ; i < N ; i ++){

            for(let j = 0 ; j< N ; j ++){

                if ( (i<N/4  || i>=N-N/4 ) && (j<N/4  || j>=N-N/4 )){
                    // outer 4 corner squares
                     
                    this.magicSquare[i][j] = this.indexedList[descendingIndexCount]; 
                  
                }else
                if ( (i>=N/4 && i< N-N/4) && (j>= N/4 && j<N-N/4) ){
                    //center squares
                    this.magicSquare[i][j] = this.indexedList[descendingIndexCount];

                }else{
                    // otherwise fill with from ascendingIndexCount
                    this.magicSquare[i][j] = this.indexedList[ascendingIndexCount]
                }

            ascendingIndexCount++;
            descendingIndexCount--;
            }
        }
        //*************************************************************************** */
        // why do I even have a return type here if I don't even use what it returns?
        // maybe consider having its return type be void if all i do is refernce state 
        // when its time to return things
        //**************************************************************************** */
        return this.magicSquare; 
    }
    // step 2    
    // tranpose of a matrix for enhanced obfusication
    transpose():void{
        const N = this.order; 
        const temp: Matrix<IndexedValue<T>> = [];

       for(let j = 0 ; j < N ; j ++){
        const column:IndexedList<T> = [];

        for(let i = 0 ; i < N ; i++){
            const cell = this.magicSquare[i][j]
            column.push(cell);
        }
        temp.push(column);
       }

       this.magicSquare = temp;
    }

    // ********************* Decryption ******************************

    //step 1
    //transpose

    //step 2
    //traverse square

    traverseSquare =():IndexedList<T>=>{

        const N = this.order; 
        let ascendingIndexCount = 0; 
        let descendingIndexCount = N**2-1;  
 

        const decryptedIndexedList:IndexedList<T> = new Array(N*N); 


        let item:IndexedValue<T> 
    

        for(let i = 0 ; i < N ; i ++){

            for(let j = 0 ; j< N ; j ++){

                item = this.magicSquare[i][j]  as IndexedValue<T>; 


                if ( (i<N/4  || i>=N-N/4 ) && (j<N/4  || j>=N-N/4 )){                    
                    // outer 4 corner squares          
                    // use descending counter         
                    
                    decryptedIndexedList[descendingIndexCount] = item
                    
                }else
                if ( (i>=N/4 && i< N-N/4) && (j>= N/4 && j<N-N/4) ){
                    //center squares
                    //use descending counter
                    decryptedIndexedList[descendingIndexCount] = item
                 

                }else{
                    // otherwise fill with from ascendingIndexCount
                    decryptedIndexedList[ascendingIndexCount] = item
                
                }

            ascendingIndexCount++;
            descendingIndexCount--;

            }

        }

        // return decryptedMessage.join("");

        return decryptedIndexedList; 
    }

}

export default EvenCypher;