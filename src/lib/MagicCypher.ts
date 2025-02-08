
import StringBuilder from "../util/StringBuilder";
import CipherObject from "./CipherContract";


class MagicCypher{
  
    // order of magic square
    order:number = 0; 

    // message
    message:string = "";

    // map of characters in message and their corresponding index

    charMapList:Array< Map<number,string>> = new Array();

    // magic square filled with chars from message
    cipherSquare:Array<Array<Map<number,string>>> = [];
 

    //===============================setters========================================
  
    setOrder = (order:number):void => {
        this.order= order;
    }
    setMessage = (message:string):void=>{
        this.message = message; 
    }
    setCharMap = (mapList: Array<Map<number,string>>):void=>{
        this.charMapList = mapList; 
    }

    setCipherSquare = (square:Array<Array<Map<number,string>>>) :void =>{
        this.cipherSquare = square;
    }

    //==============================================================================
    //meat and potatoes (main method)

    encryptMessage = async (message:string):Promise<string>=>{

        //step 1) remove leading and trail white spaces; 
        message = message.trim(); 

        //step 2) determine order
        const order = this.determineOrder(message.length); 
        this.setOrder(order);  
        
        //step 3) sanitize and map the message
        const charMapList = this.sanitizeAndMap(message,order); 
        this.setCharMap(charMapList);

        //step 4) create an empty cipher square to pass to children
        const emptyCipherSquare = this.createEmptyCipherSquare(order);
        this.setCipherSquare(emptyCipherSquare); 

        //step 5) determine encyption logic and child class object creation
        try{
            
            // async bc of dynamic imports to avoid circular dependecy 
            const cipherObject = await this.determineCipher(order); 

            let errMessageOrder = ""; 

            if(order%2===0){
                if(order%4===0){
                    errMessageOrder = "doubly even"
                }else{
                    errMessageOrder = "singly even"
                }
            }else{
                errMessageOrder = "odd"
            }

            const magicSquare = cipherObject.encrypt();
            
            if(this.isMagic(magicSquare)){ //throws error if false
                
                const cipheredText = this.readSquare(magicSquare); //throws error if unable to read
                this.printSquare(magicSquare) // throws error if unable to read
                console.log(cipheredText)
                 
                this.setCipherSquare(magicSquare);
                this.setMessage(cipheredText);
                return cipheredText;
            } 
             
        }
        catch(error:any){
            console.error(error);
            throw new Error("Encryption failed due to invalid magic square or encryption logic.")
        }
        
        //default value if encryption fails
        return message;
    }

    //================================================================================
    // steps

    //step 0) readText 
    //@TODO:  future feature to encrypt messages from a .txt file    
    readFile = (message:string):string =>{
        this.setMessage(message);
        return message;
      }

    //step 2) determine order
    determineOrder = (messageLength:number):number =>{

        // if message length is 8 
        // sqrt(8) = 2.8 then round up to 3
        // create a nxn matrix that can contain our message; 
        let newOrder = Math.ceil(Math.sqrt(messageLength)); 

        if(newOrder<3){
            return 3; 
        }

        return newOrder; 
    }


    //step 3) sanitize message & create an array of maps<number,string> of chars from the sanitized message; 
    sanitizeAndMap = ( message:string , order:number ) : Array<Map<number,string>> =>{
        //@TODO need to think about how to deal with line breaks ie "\n"
        // it would be nice to preserve the orignal format of the message but it presents certain challenges

        let sanitizedMessage = new StringBuilder;  ;

        let newCharMapList: Array<Map<number,string>> = new Array();

        for(let i = 0 ; i < order*order ; i ++){

            if(i>=message.length){
                // pad the message so that it's length is a square number
                sanitizedMessage.append("-");
            }else
            if(message[i] === " "){
                //replace white space with an underscore
                sanitizedMessage.append("_")
            }else{              
                //otherwise add the char in message to the sanitize string      
                sanitizedMessage.append(message[i]);
            }  
            
            let charMap:Map<number,string> = new Map();

            charMap.set(i,sanitizedMessage.textArray[i])
            
            // add the sanitized message to the new char map
            newCharMapList.push(charMap); 
        }

        //update message with the new sanitized message;          
        this.setMessage(sanitizedMessage.toString());  
        // ?? not sure this needs to be here: 
        // this confilicts with singliness of purpose
    
        return  newCharMapList
    }

    //step 4) create an empty matrix to pass to children

    createEmptyCipherSquare = (order:number): Array<Array<Map<number,string>>>=>{
    
        let newCipherSquare: Array<Array<Map<number,string>>> = [];

        for(let i = 0 ; i < order ; i++){
            //create row
            newCipherSquare.push([]);

            for(let j = 0 ; j < order ; j ++){
                // itterate over columns and
                // create cells with a map hold char indices 
                newCipherSquare[i][j] = new Map();              

            }

        }

        return newCipherSquare;
                
    }

    //step 5) 
    // responsible for algorithm determination 
    // and child object creation 
    determineCipher = async (order:number):Promise<CipherObject>=>{

        // define the shape of the cipher object to let 
        // type script know no matter what object gets returned it will have these methods
        let cipherObject: CipherObject;

        if(order%2===0){

            if(order%4===0){
                console.log("doubly even");

                const { default: EvenCypher } = await import('./EvenCypher');
                cipherObject = new EvenCypher(this.charMapList,this.cipherSquare);  // Now you can instantiate it
            }else{
                console.log("singly even");

                const { default: SinglyEvenCypher } = await import('./SinglyEvenCypher');
                cipherObject = new SinglyEvenCypher(this.charMapList,this.cipherSquare);  // Now you can instantiate it
            }                                      
        }else{
            console.log("odd cipher")
            const { default: OddCypher } = await import('./OddCypher');
            cipherObject = new OddCypher(this.charMapList,this.cipherSquare);   
            
        }

        return cipherObject; 

          
    }
    // code doc notes:

    // This method dynamically imports child classes to avoid circular dependency issues in TypeScript/JavaScript.

    // In TypeScript/JavaScript, imports must be resolved at the time of import, 
    // unlike languages like Java where imports are resolved at the time of instantiation.
    
    // Statically importing child classes here causes a circular dependency, 
    // resulting in the error: 
    // "Cannot access '__TURBOPACK__default__export__' before initialization."
    
    // This error occurs because TypeScript attempts to use a class before it has been fully initialized due to the cyclic dependency.


    //=======================================================================================================
    decryptMessage = async(message:string,key:number) :Promise<string>=> {

        message = message.trim();
        const length = message.length;
        const order = Math.floor(Math.sqrt(length));
        
        //decryption steps

        //step 1) check to see if the message is a valid cipher 
        if(!this.isValidCipher(message)){
            throw new Error("Invalid cipher message")
        }

        // step 2) check if the key provided matches the magic constant
        if(!this.isValidKey(order,key)){
            throw new Error("Access Denied, inavlid key")
        }

        // if we get here then it is valid to begin decryption
        this.setOrder(order); 

        // step 3) convert string message into a 2d array of maps
        const cipherSquare = this.stringToSquare(message);
        this.setCipherSquare(cipherSquare);

        const emptyCharMapList = this.createEmptyCharMapList(order);
        this.setCharMap(emptyCharMapList);

      
         //step 5) determine encryption logic and child class object creation
         try{
            
            // async bc of dynamic imports to avoid circular dependecy 
            const cipherObject = await this.determineCipher(order); 

            let errMessageOrder = ""; 

            if(order%2===0){
                if(order%4===0){
                    errMessageOrder = "doubly even"
                }else{
                    errMessageOrder = "singly even"
                }
            }else{
                errMessageOrder = "odd"
            }

            const decryptedMessage = cipherObject.decrypt();

            return decryptedMessage
            
    
             
        }
        catch(error:any){
            console.error(error);
            throw new Error("Encryption failed due to invalid magic square or encryption logic.")
        }
        
        //default value if encryption fails
         
    }
    
    //step 1
    private isValidCipher = (message:string):boolean => {

        const length = message.length;
        
        // if the the length of the message is not a squre number 
        // it is not a valid cipher to decrypt.
        return Math.floor(Math.sqrt(length)) * Math.floor(Math.sqrt(length)) === length;
    }

    //step 2 
    private isValidKey = (N:number,key:number):boolean =>{

        // if the key does not match the magic constant for
        // the magic square of order N return false 
        return this.caluclateMagicConstant(N)===key;
    }

    // step 3
    private stringToSquare = (message:string): Array<Array<Map<number,string>>> => {
        // create a square from a string message
         
        
        // initilize empty matrix
        let cipherSquare = Array.from({ length: this.order }, () => new Array(this.order).fill(0));
        
        // init 
        let index:number = 0; 

        for(let i = 0 ; i  < this.order ; i++){
            for(let j = 0 ; j < this.order ; j ++){
                
                const char = message[index];
                const cell = new Map();
                cell.set(index,char);
                cipherSquare[i][j] = cell; 
                index++;

            }
        }

        return cipherSquare;
    }

    //step 4)
    createEmptyCharMapList = (order:number):Array<Map<number,string>>=>{

        let charMapList = new Array(order*order).fill(0);

        for(let i = 0 ; i < order*order; i++){
            charMapList[i] = new Map();
        }

        return charMapList;
    }


    //step 5
    // determineCipher 
 

    //=======================================================================================================
    // methods to be passed to children

    protected readSquare = (squareCipher:Array<Array<Map<number,string>>>):string=>{

        let cipheredText:StringBuilder = new StringBuilder();
        let index:number = 0;

        for(let i = 0 ; i < squareCipher.length; i ++){

            for(let j  = 0 ; j < squareCipher.length ; j ++){

                const cell:Map<number,string> = squareCipher[i][j];

                let char = cell.entries().next().value?.[1];
                
                if( char != undefined ){
                    cipheredText.append(char);
                }else{
                    throw new EvalError(
                        "Error: unable to to read ciphered square \
                         the cell [row: " + i + 1 + " column: " + j + 1 + " is empty")
                }
             
            }
        }

        return cipheredText.toString();

    }

    protected printSquare=(squareCipher:Array<Array<Map<number,string>>>):void=>{
        //helper method for debugging and printing out the square


        for(let i = 0 ; i < squareCipher.length; i ++){

            let row:string[] = [];

            squareCipher[i].forEach( (map)=>{ 

                    map.forEach( (value,key)=>{

                        row.push(`{ ${key} -> ${value} }`)

                    })
                 
            })

            console.log(row.toString());
          
        }
        console.log("");

    }

    protected caluclateMagicConstant=(order:number):number=>{

        return order*(order*order+1)/2
    }

    protected isMagic =(square:Array<Array<Map<number,string>>>):boolean =>{
        // returns true if each row, column, and diagonal equal to the magic constant
        // or throws an error  

        let N:number = square.length;

        let magicConstant:number = this.caluclateMagicConstant(N);

        let sumLeftDiagonal:number = 0
        let sumRightDiagonal:number = 0 


        for(let i = 0 ; i < N ; i++ ){

            let sumRow = 0;
            let sumCol = 0;

            let leftDiagonalCell = square[i][i].keys().next().value; 
            let rightDigonalCell =square[N-i-1][N-i-1].keys().next().value; 
      
            if(leftDiagonalCell===undefined || rightDigonalCell===undefined){
                throw new EvalError("Error: the cell's key in [row: " + i+1 + "column: " + i+1+ "] is undefined")
            }else{
                
                sumLeftDiagonal += leftDiagonalCell+1; 
                sumRightDiagonal += rightDigonalCell+1;

            }        

            for(let j = 0 ; j < N ; j ++){
                
                //itterate over rows
                let cellInRow = square[i][j].keys().next().value 
                //itterate over cols
                let cellInCol = square[j][i].keys().next().value
              
                //if there is not a key associated with a given cell throw error
                if(cellInRow===undefined   || cellInCol===undefined){

                    console.log(i,j)

                    throw new EvalError("Error: the cell's key in [row: " + i+1 + "column: " + j+1+ "] is undefined");

                }else{
                    //otherwise we have defined keys and we can sum them up
                    sumRow+=cellInRow+1; 
                    sumCol+=cellInCol+1; 
                }

            }

            // check the sum in each row and col against the magic sum

            if(sumRow!=magicConstant){
                throw new Error("the sum in row " + i+1 + " is not equal to the magic constant")
            }else
            if(sumCol!=magicConstant){
                throw new Error("the sum in col "+ i+1 + " is not equal to the magic constant")

            }
        }
        

        if(sumLeftDiagonal!=magicConstant || sumRightDiagonal!=magicConstant){
            throw new Error("the sum in one of the diagonals does equal to the magic constant")

        }else{
            console.log(this.message)
            console.log("Encryption performed successfully!")            
            return true; 
        }

    }
  
  }

  export default MagicCypher;
  