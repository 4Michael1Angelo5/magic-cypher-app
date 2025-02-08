import MagicCypher from "./MagicCypher";
import CipherObject from "./CipherContract";
import StringBuilder from "@/util/StringBuilder";


class OddCypher  extends MagicCypher implements CipherObject {

    // map of characters in message and their corresponding index
    readonly charMapList:Array<Map<number,string>>= new Array();  

    // magic square filled with characters
    magicSquare:Array<Array<Map<number,string>>> = [];

    // order
    order:number = 0; 

    cellOccpancy:Array<Array<boolean>> = new Array();

    /**
    * 
    * @param charMapList - A list of character maps, each with a single entry `{number: 0, char: "a"}`.
    * The length of this list must be the square of an odd number (e.g., 3^2, 5^2, 7^2 etc.).
    * @param emptySquare - empty matrix containing empty char maps
    * 
    * @remarks
    * The `order` of the cipher is derived from the length of `charMapList` and is assumed to be the square root of its length.
    */

    
    //===============================================================
    //constructor
    constructor(charMapList:Array<Map<number,string>>,emptySquare:Array<Array<Map<number,string>>>){
                // validate the square
        if (emptySquare.length % 2 !== 1) {
            throw new Error("charMapList is not the square of an odd number \n" +
                            "Order of an odd cipher must be an odd number.");
        }
        
        super();
        this.charMapList = charMapList; 
        this.magicSquare = emptySquare; 
        this.order = emptySquare.length;     
    }

    //================================================================
    // main method

    encrypt(): Map<number,string>[][] {
  
        //step 1) buildSquare
        const magicSquare = this.buildSquare();

        return magicSquare;
    }

    
    //step 1) buildSquare
    buildSquare(): Array<Array<Map<number, string>>> {
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
        let row: Array<Map<number, string>> = [];

        
  
        while (indexOfChar < N * N) {
            
            // reassign row variable with each iteration
            row = this.magicSquare[i];    
    
            // map 
            // key is index of char in message we're trying to encrypt        
       
            // // put map in cell column j of row i             
            row[j] = this.charMapList[indexOfChar]

            // Create a new map for each cell, avoiding overwriting issues

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
            if (this.magicSquare[i-1][j+1].size!=0 && i + 1 < N) {
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

    decrypt(): string {
        //create a matrix to track cell occupancy
        this.cellOccpancy = Array.from({length:this.order},()=> new Array(this.order).fill(false));
        const decryptedMessage = this.traverseSquare()
        return decryptedMessage;
    }

    protected traverseSquare = (): string =>{

        console.log("inside odd magic cipher");
        this.printSquare(this.magicSquare)
          // short hand 
          const N = this.order; 
          const middleColumn = Math.floor(N / 2);
          
          // row (i) & column (j) size
          let i = 0; // i starts in the first row
          let j = middleColumn; // j starts in the middle column
          let indexOfChar = 0; // index of characters in the message

          let decryptedMessageArray:string[] = new Array(this.order).fill("null");
          while (indexOfChar < N * N) {


            // const cell = this.magicSquare[i]?.[j];
            // if (!cell || !(cell instanceof Map)) {
            //     console.error(`Invalid cell at i=${i}, j=${j}:`, cell);
            //     throw new Error("Unexpected undefined cell in magicSquare.");
            // }
            // const char = cell.values().next().value || "undefined";
                
            const char = this.magicSquare[i][j].values().next().value || "undefined";

            if(char==="undefined"){
                console.log("fail here: ") 
                this.printSquare(this.magicSquare)                 
                throw new Error("programer error: decrypt method in OddMagicCypher recieved invalid cipher object")
            }
            
            // mark cell as occupied/ explored
            this.cellOccpancy[i][j] = true;
            //assign the char to it's corresponding index in the message
            decryptedMessageArray[indexOfChar] = char;

  
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
      

        
        return decryptedMessageArray.join("");
    }
}

export default OddCypher;