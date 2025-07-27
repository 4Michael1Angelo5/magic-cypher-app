import CipherObject from "./Legacy MagicCypherClass/CipherContract";
import MagicCypher from "./MagicCypher";

class EvenCypher extends MagicCypher implements CipherObject {

    // order of the magic square
    order: number = 0;
    // map of characters in message and their corresponding index
    readonly charMapList: Map<number, string>[];
    //the magic square 
    magicSquare: Map<number, string>[][];

    /**
    * 
    * @param charMapList - A list of character maps, each with a single entry `{number: 0, char: "a"}`.
    * The length of this list must be the square of an even number divisible by 4 (e.g., 4^2, 8^2, 12^2 etc.).
    * @param emptySquare - empty matrix containing empty char maps
    * 
    * @remarks
    * The `order` of the cipher is derived from the length of `charMapList` and is assumed to be the square root of its length.
    */


    constructor(charMapList: Map<number, string>[], emptySquare: Map<number, string>[][]) {
        
        // validate the square
        if (emptySquare.length % 4 !== 0) {
            throw new Error("charMapList is not the square of a number divisible by 4. \n" +
                            "Order of an even cipher must be divisible by 4.");
        }

        super();       
        this.charMapList = charMapList;
        this.magicSquare = emptySquare;
        this.order = this.magicSquare.length;
    }


    encrypt(): Map<number,string>[][] {
        
        //step 1
        this.buildSquare();   
        //step 2
        this.transpose() ;        

        const magicSquare = this.magicSquare;

        return magicSquare; 
    }
    
    decrypt(): string {
        
        // step 1
        this.transpose();

        const decryptedMessage = this.traverseSquare();

    
        return decryptedMessage;
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
    buildSquare(): Array<Array<Map<number, string>>> {

        const N = this.order; 
        let ascendingIndexCount = 0; 
        let descendingIndexCount = N**2-1;  

        for(let i = 0 ; i < N ; i ++){

            for(let j = 0 ; j< N ; j ++){

                if ( (i<N/4  || i>=N-N/4 ) && (j<N/4  || j>=N-N/4 )){
                    // outer 4 corner squares
                     
                    this.magicSquare[i][j] = this.charMapList[descendingIndexCount]; 
                  
                }else
                if ( (i>=N/4 && i< N-N/4) && (j>= N/4 && j<N-N/4) ){
                    //center squares
                    this.magicSquare[i][j] = this.charMapList[descendingIndexCount];

                }else{
                    // otherwise fill with from ascendingIndexCount
                    this.magicSquare[i][j] = this.charMapList[ascendingIndexCount]
                }

            ascendingIndexCount++;
            descendingIndexCount--;

            }

        }

        return this.magicSquare; 
        
    }
    // step 2    
    // tranpose of a matrix for enhanced obfusication
    transpose():void{
        const N = this.order; 
        const temp: Map<number, string>[][] = [];

       for(let j = 0 ; j < N ; j ++){
        const column:Map<number,string>[] = [];
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

    traverseSquare =():string=>{

      

        const N = this.order; 
        let ascendingIndexCount = 0; 
        let descendingIndexCount = N**2-1;  

        const decryptedMessage:string[] = new Array(N*N).fill(0);

        for(let i = 0 ; i < N ; i ++){

            for(let j = 0 ; j< N ; j ++){

                const char = this.magicSquare[i][j].values().next().value || "undefined";

                if(char==="undefined"){ 
                    this.printSquare(this.magicSquare);
                    throw new Error("programer error: decrypt method in EvenCypher recieved invalid cipher object")
                } 

                if ( (i<N/4  || i>=N-N/4 ) && (j<N/4  || j>=N-N/4 )){                    
                    // outer 4 corner squares          
                    // use descending counter         
                    
                    decryptedMessage[descendingIndexCount] = char
                    
                }else
                if ( (i>=N/4 && i< N-N/4) && (j>= N/4 && j<N-N/4) ){
                    //center squares
                    //use descending counter
                    decryptedMessage[descendingIndexCount] = char
                 

                }else{
                    // otherwise fill with from ascendingIndexCount
                    decryptedMessage[ascendingIndexCount] = char
                
                }

            ascendingIndexCount++;
            descendingIndexCount--;

            }

        }

        return decryptedMessage.join("");
    }

}

export default EvenCypher;