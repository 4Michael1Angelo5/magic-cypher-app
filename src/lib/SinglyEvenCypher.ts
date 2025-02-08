import MagicCypher from "./MagicCypher";
import CipherObject from "./CipherContract";
import OddCypher from "./OddCypher";
import StringBuilder from "@/util/StringBuilder";

// algorithm we followed https://www.1728.org/magicsq3.htm

class SinglyEvenCypher extends MagicCypher implements CipherObject {

    // map of characters in message and their corresponding index
    readonly charMapList: Array<Map<number, string>> = new Array();

    // magic square filled with characters
    magicSquare: Array<Array<Map<number, string>>> = [];

    // order
    order: number = 0; 
    
    //=========================================================
    // char map message

    //chars for upper left square
    charsForUpperLeftSquare: Array<Map<number, string>> = new Array();
    //chars for upper right square
    charsForUpperRightSquare: Array<Map<number, string>> = new Array();
    //chars for lower left square
    charsForLowerLeftSquare: Array<Map<number, string>> = new Array();
    //chars for lower right square
    charsForLowerRightSquare: Array<Map<number, string>> = new Array();

    //=========================================================
    // 4 odd squares for construction
    upperLeftSquare:    Array<Array<Map<number,string>>> = new Array(); 
    upperRightSquare:   Array<Array<Map<number,string>>> = new Array(); 
    lowerLeftSquare:    Array<Array<Map<number,string>>> = new Array(); 
    lowerRightSquare:   Array<Array<Map<number,string>>> = new Array(); 

   /**
    * 
    * @param charMapList - A list of character maps, each with a single entry `{number: 0, char: "a"}`.
    * The length of this list must be the square of an even number divisible by 2 but not by 4 (e.g., 6^2, 10^2, 14^2 etc.).
    * @param emptySquare : empty matrix containing empty char maps
    * 
    * @remarks
    * The `order` of the cipher is derived from the length of `charMapList` and is assumed to be the square root of its length.
    */

    constructor(charMap: Array<Map<number, string>>, emptySquare: Array<Array<Map<number, string>>>) {
        if (emptySquare.length % 2 !== 0 || emptySquare.length % 4 === 0) {
            throw new Error("charMapList is not the square of an singly even number \n" +
                            "Order of an singly even cipher must be a singly even number (eg: 6,10,14...etc).");
        }
        super();
        this.charMapList= charMap;
        this.magicSquare = emptySquare; 
        this.order = emptySquare.length; 
    }

    encrypt(): Map<number,string>[][] {

        // step 1) build 4 odd order empty squares
        this.splitMessageInto4();

        // step 2) create 4 odd magic cypher objects 
        this.create4_OddMagicSquares();

        // step 3) build square (contains 3 other steps)

        const magicSquare = this.buildSquare();

        return magicSquare; 
    }
    decrypt(): string {

        // initilize empty chars for upperLeft, upperRight, lowerLeft and lowerRight charMaps
      
        this.charsForLowerLeftSquare  = this.createEmptyCharMapList(this.order/2);
        this.charsForUpperRightSquare = this.createEmptyCharMapList(this.order/2);
        this.charsForLowerLeftSquare  = this.createEmptyCharMapList(this.order/2);
        this.charsForLowerRightSquare = this.createEmptyCharMapList(this.order/2);

        

        this.performRowColumnSwapOperations(); 

        const decryptedMessage:string = this.splitInto4Squares();

        
        return decryptedMessage
    }

    //Encryption Steps:

    // step 1)
    // split the char map into 4 differnt maps
    splitMessageInto4(): void {
        // updates state

        let N = this.charMapList.length/4;

        let charsForUpperLeftSquare: Array<Map<number, string>> = new Array();
        let charsForUpperRightSquare: Array<Map<number, string>> = new Array();
        let charsForLowerLeftSquare: Array<Map<number, string>> = new Array();
        let charsForLowerRightSquare: Array<Map<number, string>> = new Array();


        for (let i = 0; i < 4; i++) {
            for (let j = i * N; j < (i + 1) * N; j++) {

                let charMap = this.charMapList[j];

                if(i == 0){
                    //uppper left
                    charsForUpperLeftSquare.push(charMap);

                }else
                if(i===1){
                    //lower right
                    charsForLowerRightSquare.push(charMap);

                }else
                if(i===2){
                    //upper right
                    charsForUpperRightSquare.push(charMap);

                }else{
                    //lower left
                    charsForLowerLeftSquare.push(charMap);

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

        let N = this.order;
        
        // initlize squares as empty matrices
        let upperLeftSquare:    Array<Array<Map<number,string>>> = this.createEmptyCipherSquare(N/2);
        let upperRightSquare:   Array<Array<Map<number,string>>> = this.createEmptyCipherSquare(N/2);
        let lowerLeftSquare:    Array<Array<Map<number,string>>> = this.createEmptyCipherSquare(N/2);
        let lowerRightSquare:   Array<Array<Map<number,string>>> = this.createEmptyCipherSquare(N/2);

        // create 4 odd cipher objects
        let upperLeftOddMagicSquare  = new OddCypher(this.charsForUpperLeftSquare,upperLeftSquare); 
        let upperRightOddMagicSquare = new OddCypher(this.charsForUpperRightSquare,upperRightSquare); 
        let lowerLeftOddMagicSquare  = new OddCypher(this.charsForLowerLeftSquare,lowerLeftSquare); 
        let lowerRightOddMagicSquare = new OddCypher(this.charsForLowerRightSquare,lowerRightSquare); 

        // build 4 odd magic squares
        this.upperLeftSquare  = upperLeftOddMagicSquare.buildSquare();
        this.upperRightSquare = upperRightOddMagicSquare.buildSquare();
        this.lowerLeftSquare  = lowerLeftOddMagicSquare.buildSquare();
        this.lowerRightSquare = lowerRightOddMagicSquare.buildSquare();    
        
    }

    //step 3)
    buildSquare(): Array<Array<Map<number, string>>> {

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
    combineSquares(): Array<Array<Map<number, string>>> {

        let N = this.order
        
        let tempSquare:Array<Array<Map<number, string>>> = new Array();

        for(let i = 0 ; i < N ; i ++){
            
            // create a new row for us to add to our temp square
            let row : Array<Map<number,string>> = new Array();

            for(let j = 0; j<N ; j ++){
                
                // correctly adjust index                 //   we are trying to map the indecies of a (N/2 x N/2) matrix to an (N x N) matrix
                let rowIndex:number = i%(N/2) ;       //   ie we map row 0 1 2 3 4 5 of our larger matrix 
                let columnIndex:number = j%(N/2);     //   to row's      0 1 2 0 1 2 of our smaller matrix   
                
                
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

        let N:number = this.order;        

        let upperLeftCell:Map<number,string> = new Map();
        let lowerLeftCell:Map<number,string> = new Map();
        let upperRightCell:Map<number,string> = new Map();
        let lowerRightCell:Map<number,string> = new Map();

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

    // helper method to streamline map key value pair swaping 
    protected swap(mapA:Map<number,string>,mapB:Map<number,string>):void{
        // swap two map's key value pairs
        // note that mapA.size() == mapB.size() == 1 

            const aValues = mapA.entries().next().value;
            const bValues = mapB.entries().next().value; 

            if(aValues && bValues){
            
            const [aKey,aValue] = aValues;
            const [bKey,bValue] = bValues; 

            mapA.clear();
            mapB.clear();
            
            mapA.set(bKey,bValue);
            mapB.set(aKey,aValue);

        }else
        if(aValues || bValues){
            
            throw new Error("row column swap opperations failed in singly even magic cypher construction")
        }
    }

    //decryption steps
    splitInto4Squares = ():string=>{
        // the method splits a singly even square into 4 odd squares
        // then it creates 4 oddMagicCypher Objects out of the split squares
        // and uses the decryption process for those squares. 
        // NOTE: this method updates state!
         
        let N = this.order;

        let decryptedMessage = new StringBuilder;
        
        // initialize squares as empty matrices
        let upperLeftSquare:    Array<Array<Map<number,string>>> = [];
        let upperRightSquare:   Array<Array<Map<number,string>>> = [];
        let lowerLeftSquare:    Array<Array<Map<number,string>>> = [];
        let lowerRightSquare:   Array<Array<Map<number,string>>> = [];

        

        for(let i = 0 ; i < N/2; i++){
            //only need to itterate through half of the rows

                //create a space to store cells in each row
                const upperLeftRow:Map<number,string>[] = [];
                const upperRightRow:Map<number,string>[] = [];
                const lowerLeftRow:Map<number,string>[] = [];
                const lowerRightRow:Map<number,string>[] = [];


            for(let j = 0 ; j < N ; j ++){

                const upperCell:Map<number,string> = this.magicSquare[i][j];
                const lowerCell:Map<number,string> = this.magicSquare[i+N/2][j];
 
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
        // this.printSquare(upperLeftSquare);
        console.log(upperLeftSquare)
        // this.printSquare(upperRightSquare);
        console.log(upperRightSquare);
        // this.printSquare(lowerLeftSquare);
        console.log(lowerLeftSquare);
        // this.printSquare(lowerRightSquare)
        console.log(lowerRightSquare)
 

        //update state
        this.upperLeftSquare = upperLeftSquare
        this.upperRightSquare = upperRightSquare;
        this.lowerLeftSquare = lowerLeftSquare; 
        this.lowerRightSquare = lowerRightSquare;

        //


        //create 4 OddMagicCyphers
        const upperLeftOddMagicSquare  = new OddCypher(this.charsForUpperLeftSquare,upperLeftSquare); 
        const upperRightOddMagicSquare = new OddCypher(this.charsForUpperRightSquare,upperRightSquare); 
        const lowerLeftOddMagicSquare  = new OddCypher(this.charsForLowerLeftSquare,lowerLeftSquare); 
        const lowerRightOddMagicSquare = new OddCypher(this.charsForLowerRightSquare,lowerRightSquare); 

        //traverse 
        const upperLeftText:string = upperLeftOddMagicSquare.decrypt(); 
        const upperRigtText:string = upperRightOddMagicSquare.decrypt();
        const lowerLeftText:string = lowerLeftOddMagicSquare.decrypt();
        const lowerRightText:string = lowerRightOddMagicSquare.decrypt();

        
        decryptedMessage.append(upperLeftText);
        decryptedMessage.append(lowerRightText);
        decryptedMessage.append(upperRigtText);
        decryptedMessage.append(lowerLeftText);

        return decryptedMessage.toString();

    }

    
}

export default SinglyEvenCypher;