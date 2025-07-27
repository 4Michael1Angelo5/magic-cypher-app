import MagicCypher from "./MagicCypher";
import CipherObject from "./CipherContract";
import OddCypher from "./OddCypher"; 
import { CipherType, IndexedList, IndexedValue,
    Matrix , ChildParams,
    EncryptionOutput,
} from "./CipherTypes";

// algorithm followed https://www.1728.org/magicsq3.htm

class SinglyEvenCypher<T extends CipherType> extends MagicCypher<T> implements CipherObject<T> {

    // Cipher Type "text" | "image"
    cipherType!: T 

    // map of characters in message and their corresponding index
    readonly indexedList:IndexedList<T> = []; 

    // magic square filled with characters
    magicSquare:Matrix<IndexedValue<T>> = [];

    // order
    order: number = 0; 
    
    //=========================================================
    // char map message

    //cell values for upper left square
    charsForUpperLeftSquare: IndexedList<T> = [];
    //cell values for upper right square
    charsForUpperRightSquare: IndexedList<T> = [];
    //cell values for lower left square
    charsForLowerLeftSquare: IndexedList<T> = [];
    //cell values for lower right square
    charsForLowerRightSquare: IndexedList<T> = [];

    //=========================================================
    // 4 odd squares for construction
    upperLeftSquare:    Matrix<IndexedValue<T>> = []; 
    upperRightSquare:   Matrix<IndexedValue<T>> = []; 
    lowerLeftSquare:    Matrix<IndexedValue<T>> = []; 
    lowerRightSquare:   Matrix<IndexedValue<T>> = []; 

   /**
    * 
    * @param charMapList - A list of character maps, each with a single entry `{number: 0, char: "a"}`.
    * The length of this list must be the square of an even number divisible by 2 but not by 4 (e.g., 6^2, 10^2, 14^2 etc.).
    * @param emptySquare : empty matrix containing empty char maps
    * 
    * @remarks
    * The `order` of the cipher is derived from the length of `charMapList` and is assumed to be the square root of its length.
    */

    constructor(params:ChildParams<T>) {
        super();
        const emptySquare  = params.value.matrix;
        if (emptySquare.length % 2 !== 0 || emptySquare.length % 4 === 0) {
            throw new Error("charMapList is not the square of an singly even number \n" +
                            "Order of an singly even cipher must be a singly even number (eg: 6,10,14...etc).");
        }
        if (Math.floor(Math.sqrt(params.value.indexedList.length)) != params.value.matrix.length){
            throw new Error("Programer Error: the indexed list should be the square of the matrix size");
        }
        this.cipherType = params.type as T; 
        this.order = params.value.matrix.length; 
        this.indexedList = params.value.indexedList as IndexedList<T>; 
        this.magicSquare =emptySquare as Matrix<IndexedValue<T>>; 

        // Note: For objects like `magicSquare` and `indexedList`, you need to use `JSON.parse(JSON.stringify(...))`
        // to get an accurate snapshot of their current values. Because these objects are mutated asynchronously,
        // a simple `console.log()` outputs their reference in memory, not their exact state at the time of logging.
        // As a result, console logs may reflect future (mutated) values instead of the current ones.
    }

    encrypt(cipherType:T):EncryptionOutput<T>{
 
        // step 1) build 4 odd order empty squares
        this.splitMessageInto4();

        // step 2) create 4 odd magic cypher objects 
        this.create4_OddMagicSquares();

        // step 3) build square (contains 3 other steps)

        const magicSquare = this.buildSquare();

        
        if(this.isMagic(this.magicSquare)){
            console.log("encryption performed successfully!")
        };

        return this.readSquare(cipherType,magicSquare);
 
    }
    decrypt(cipherType:T): EncryptionOutput<T> {
        // step 1
        // initilize empty chars for upperLeft, upperRight, lowerLeft and lowerRight charMaps 

        this.performRowColumnSwapOperations();     
        
        // so far so good that only leaves splitInto4Squares as the bug

        const decryptedMessageArray:IndexedList<T> = this.splitInto4Squares(); 
        
        const output = this.listToOutput(cipherType,decryptedMessageArray);


        return output;
    }

    //Encryption Steps:

    // step 1)
    // split the char map into 4 differnt maps
    
    splitMessageInto4(): void {
        // updates state

        const N = this.indexedList.length/4;

        const charsForUpperLeftSquare: IndexedList<T> = [];
        const charsForUpperRightSquare: IndexedList<T> = [];
        const charsForLowerLeftSquare: IndexedList<T> = [];
        const charsForLowerRightSquare: IndexedList<T> = [];


        for (let i = 0; i < 4; i++) {
            for (let j = i * N; j < (i + 1) * N; j++) {

                const indexedValue:IndexedValue<T> = this.indexedList[j];

                if(i == 0){
                    //uppper left
                    charsForUpperLeftSquare.push(indexedValue);

                }else
                if(i===1){
                    //lower right
                    charsForLowerRightSquare.push(indexedValue);

                }else
                if(i===2){
                    //upper right
                    charsForUpperRightSquare.push(indexedValue);

                }else{
                    //lower left
                    charsForLowerLeftSquare.push(indexedValue);

                }
            

            }
        }
        
        this.charsForUpperLeftSquare = charsForUpperLeftSquare;
        this.charsForUpperRightSquare = charsForUpperRightSquare;
        this.charsForLowerLeftSquare = charsForLowerLeftSquare;
        this.charsForLowerRightSquare = charsForLowerRightSquare;
    }

    //step 2
    // create 4 odd magic squares
    create4_OddMagicSquares():void{

        const N = this.order;
        
        // initlize squares as empty matrices
        const upperLeftSquare:    Matrix<IndexedValue<T>> = this.createEmptyCipherSquare(N/2, this.cipherType);
        const upperRightSquare:   Matrix<IndexedValue<T>> = this.createEmptyCipherSquare(N/2, this.cipherType);
        const lowerLeftSquare:    Matrix<IndexedValue<T>> = this.createEmptyCipherSquare(N/2, this.cipherType);
        const lowerRightSquare:   Matrix<IndexedValue<T>> = this.createEmptyCipherSquare(N/2, this.cipherType);

        // create 4 odd cipher objects
        // params for upper left square
         
        const paramsUL:ChildParams<T> = this.createChildParams(this.cipherType, this.charsForUpperLeftSquare, upperLeftSquare);
        const upperLeftOddMagicSquare  = new OddCypher(paramsUL);
        
        // params for upper right square 
        const paramsUR:ChildParams<T> = this.createChildParams(this.cipherType, this.charsForUpperRightSquare, upperRightSquare);
        const upperRightOddMagicSquare = new OddCypher(paramsUR); 

        // params for lower left square 
        const paramsLL:ChildParams<T> = this.createChildParams(this.cipherType, this.charsForLowerLeftSquare, lowerLeftSquare);
        const lowerLeftOddMagicSquare  = new OddCypher(paramsLL); 
        
        // params for lower right square 
        const paramsLR:ChildParams<T> = this.createChildParams(this.cipherType, this.charsForLowerRightSquare, lowerRightSquare);
        const lowerRightOddMagicSquare = new OddCypher(paramsLR); 

        // build 4 odd magic squares
        this.upperLeftSquare  = upperLeftOddMagicSquare.buildSquare();
        this.upperRightSquare = upperRightOddMagicSquare.buildSquare();
        this.lowerLeftSquare  = lowerLeftOddMagicSquare.buildSquare();
        this.lowerRightSquare = lowerRightOddMagicSquare.buildSquare();    
        
    }

    //step 3)
    buildSquare(): Matrix<IndexedValue<T>> {

        //step 3a)
        //combine all squares        
        this.combineSquares();

        //step 3b)
        //perform row column swap operations
        this.performRowColumnSwapOperations();

        return this.magicSquare;
    }

    //step 3a)
    //combine all 4 odd magic squares
    combineSquares(): Matrix<IndexedValue<T>> {

        const N = this.order
        
        const tempSquare:Matrix<IndexedValue<T>> = [];

        for(let i = 0 ; i < N ; i ++){
            
            // create a new row for us to add to our temp square
            const row : IndexedList<T> = [];

            for(let j = 0; j<N ; j ++){
                
                // correctly adjust index                //   we are trying to map the indecies of a (N/2 x N/2) matrix to an (N x N) matrix
                const rowIndex:number = i%(N/2) ;       //   ie we map row 0 1 2 3 4 5 of our larger matrix 
                const columnIndex:number = j%(N/2);     //   to row's      0 1 2 0 1 2 of our smaller matrix   
                
                
                if(i<N/2){
                    // then we're in the upper half of the larger matrix
                    if(j<N/2){
                        //then we're in the top left quadrant
                        row.push(this.upperLeftSquare[rowIndex][columnIndex]);
                         
                    }else{
                        // we're in the top right quadrant
                        row.push(this.upperRightSquare[rowIndex][columnIndex]);
                    }
                }else{
                    //other wise we're in the lower half of the larger matrix
                    if(j<N/2){
                        // then we're in the lower left quadrant
                        row.push(this.lowerLeftSquare[rowIndex][columnIndex]);
                    }else{
                        // then we're in the lower right quadrant
                        row.push(this.lowerRightSquare[rowIndex][columnIndex]);
                    }
                }
            }
            // push the new row filled with maps to our temp square
            tempSquare.push(row);
        }

        this.magicSquare = tempSquare;
        
        return tempSquare;
    }

    performRowColumnSwapOperations():void{

        // right side row swaping

        // example of row swaping :

                                // All the X's need to be swapped with their corresponding 
                                // lower half. ie item in row 0 column 0 needs to be swaped with
                                // row 0 column 0 of the lower half. that is the i'th row gets swaped with i+n/2 row in the same column j 

        //  for n = 6                       for n = 10                  for n = 14
        
        // upper half of quare             upper half                  upper half
     
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X 
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                              0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                              0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                                                          0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                                                          0 0 0 0 0 0 0 0 0 0 0 0 X X
        // 
        // lower half of square             lower half                     lower half 
        // 
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //  0 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X 
        //                              0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                              0 0 0 0 0 0 0 0 0 X         0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                                                          0 0 0 0 0 0 0 0 0 0 0 0 X X
        //                                                          0 0 0 0 0 0 0 0 0 0 0 0 X X

        //  f(6) = 0                        f(10) = 1                      f(14) = 2 

        // pattern: 

        // f(N) = (N+2)/4 -2, where N is a singly even number

        //  f(6) = (6+2)/4 - 2  =  8/4 - 2 = 0

        // f(10) = (10+2)/4 - 2 = 12/4 - 2 = 1

        // f(14) = (14+2)/4 - 2 = 16/4 - 2 = 2

        //**************************************************************************************************** */

        // left side row swaping

        // example of row swaping :

                                // All the X's need to be swapped with their corresponding 
                                // lower half. ie item in row 0 column 0 needs to be swaped with
                                // row 0 column 0 of the lower half.  

        //  for n = 6                       for n = 10                  for n = 14
        
        // upper half of quare             upper half                  upper half
     
        //  X 0 0 0 0 0                 X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0 
        //  0 X 0 0 0 0                 X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //  X 0 0 0 0 0                 0 X X 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //                              X X 0 0 0 0 0 0 0 0         0 X X X 0 0 0 0 0 0 0 0 0 0  <- shift over one column when i = n/4
        //                              X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //                                                          X X X 0 0 0 0 0 0 0 0 0 0 0
        //                                                          X X X 0 0 0 0 0 0 0 0 0 0 0
        // 
        // lower half of square             lower half                     lower half 
        // 
        //  X 0 0 0 0 0                 X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //  0 X 0 0 0 0                 X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //  X 0 0 0 0 0                 0 0 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0 
        //                              X X 0 0 0 0 0 0 0 0         0 X X X 0 0 0 0 0 0 0 0 0 0  <- shift over one column when i = n/4
        //                              X X 0 0 0 0 0 0 0 0         X X X 0 0 0 0 0 0 0 0 0 0 0
        //                                                          X X X 0 0 0 0 0 0 0 0 0 0 0
        //                                                          X X X 0 0 0 0 0 0 0 0 0 0 0
        
        //pattern :
        //  f(6) = 1                          f(10) = 2                   f(14) = 3                        f(18) = 4 ; ...etc

        // the number of j columns we need to swap as a function of the order of the matrix
        // is f(N) = (N+2)/4  where N is a singly even number. 

        // and there is a special case, that once we've reached the n/4'th row we need to shift over one clolumn. 

        const N:number = this.order;        

        let upperLeftCell:IndexedValue<T>; 
        let lowerLeftCell:IndexedValue<T>;
        let upperRightCell:IndexedValue<T>;
        let lowerRightCell:IndexedValue<T>;

        for(let j = 0 ; j < (N+2)/4-1; j++){
            // columns
            for(let  i = 0 ; i < N/2 ;i++){

                if(j<(N+2)/4 - 2){
                    
                    //right side row column swaping
                    upperRightCell = this.magicSquare[i][N-j-1];
                    lowerRightCell = this.magicSquare[i+N/2][N-j-1];
                    
                    this.swap(upperRightCell,lowerRightCell)    

                }

                

                //left side row column swaping
                if( i === Math.floor(N/4)){
                    // special shift 

                    upperLeftCell = this.magicSquare[i][j+1];
                    lowerLeftCell = this.magicSquare[i+N/2][j+1]
                }else{
                    
                    upperLeftCell = this.magicSquare[i][j]; 
                    lowerLeftCell = this.magicSquare[i+N/2][j]

                }
                
                // swap the two pairs
                this.swap(upperLeftCell,lowerLeftCell);;

            }
        }
    }

    // helper method to streamline key value pair swaping 
    protected swap(mapA:IndexedValue<T>,mapB:IndexedValue<T>):void{
        // swap two map's key value pairs

            const aValues = mapA.value
            const bValues = mapB.value; 
            
            // make sure its not empty 
            if(aValues && bValues){

            const aKey = mapA.index; const aValue = mapA.value; 
            const bKey = mapB.index; const bValue = mapB.value;
            
            mapA.index = bKey; mapA.value = bValue;
            mapB.index = aKey; mapB.value = aValue;  

        }else
        if((!aValues && bValues) || (!bValues && aValues)){

            
            throw new Error("row column swap opperations failed in singly even magic cypher construction")
        }
 
    }

    // decryption steps
    splitInto4Squares = ():IndexedList<T>=>{
        // the method splits a singly even square into 4 odd squares
        // then it creates 4 oddMagicCypher Objects out of the split squares
        // and uses the decryption process for those squares. 
        // NOTE: this method updates state!
         
        const N = this.order;

        const decryptedIndexedList:IndexedList<T> = []; 
        
        // initialize squares as empty matrices
        const upperLeftSquare:   Matrix<IndexedValue<T>> = [];
        const upperRightSquare:  Matrix<IndexedValue<T>> = [];
        const lowerLeftSquare:   Matrix<IndexedValue<T>> = [];
        const lowerRightSquare:  Matrix<IndexedValue<T>> = [];

        for(let i = 0 ; i < N/2; i++){
            //only need to itterate through half of the rows

                //create a space to store cells in each row
                const upperLeftRow:IndexedList<T>= [];
                const upperRightRow:IndexedList<T> = [];
                const lowerLeftRow:IndexedList<T> = [];
                const lowerRightRow:IndexedList<T> = [];

            for(let j = 0 ; j < N ; j ++){

                const upperCell:IndexedValue<T> = this.magicSquare[i][j];
                const lowerCell:IndexedValue<T> = this.magicSquare[i+N/2][j];
 
                 if(j<N/2){
                    upperLeftRow.push(upperCell);
                    lowerLeftRow.push(lowerCell);

                 }else{

                    upperRightRow.push(upperCell);
                    lowerRightRow.push(lowerCell);

                 }
            }

            upperLeftSquare.push(upperLeftRow);
            upperRightSquare.push(upperRightRow);
            lowerLeftSquare.push(lowerLeftRow);
            lowerRightSquare.push(lowerRightRow);
        }

        //update state
        this.upperLeftSquare = upperLeftSquare 
        this.upperRightSquare = upperRightSquare; 
        this.lowerLeftSquare = lowerLeftSquare;  
        this.lowerRightSquare = lowerRightSquare;  
         

        //create 4 OddMagicCyphers
        const charsForUpperLeftSquare = this.createEmptyIndexedList(N/2,this.cipherType);
        const charsForUpperRightSquare = this.createEmptyIndexedList(N/2,this.cipherType);
        const charsForLowerLeftSquare = this.createEmptyIndexedList(N/2,this.cipherType);;
        const charsForLowerRightSquare = this.createEmptyIndexedList(N/2,this.cipherType);
        
        const ULchildParams = this.createChildParams(this.cipherType, charsForUpperLeftSquare, upperLeftSquare);
        const upperLeftOddMagicSquare = new OddCypher(ULchildParams);

        const URchildParams = this.createChildParams(this.cipherType, charsForUpperRightSquare, upperRightSquare); 
        const upperRightOddMagicSquare = new OddCypher(URchildParams);

        const LLchildParams = this.createChildParams(this.cipherType, charsForLowerLeftSquare, lowerLeftSquare); 
        const lowerLeftOddMagicSquare = new OddCypher(LLchildParams);

        const LRchildParams = this.createChildParams(this.cipherType, charsForLowerRightSquare, lowerRightSquare); 
        const lowerRightOddMagicSquare = new OddCypher(LRchildParams);


        //traverse 
        const upperLeftText = upperLeftOddMagicSquare.traverseSquare();      

        const upperRightText = upperRightOddMagicSquare.traverseSquare(); 

        const lowerLeftText = lowerLeftOddMagicSquare.traverseSquare() 

        const lowerRightText = lowerRightOddMagicSquare.traverseSquare();
        

        // combine strings to form message

        decryptedIndexedList.push(...upperLeftText); 
        decryptedIndexedList.push(...lowerRightText);
        decryptedIndexedList.push(...upperRightText); 
        decryptedIndexedList.push(...lowerLeftText); 

        return decryptedIndexedList;
    }

    
}

export default SinglyEvenCypher;