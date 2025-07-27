// TEMP class for integration testing

import StringBuilder from "@/util/StringBuilder";
import CipherObject from "./CipherContract";
import { calculateIndexOfVertexInArray, generateIndexedUVCoordMatrix, generateTileOriginUVCoords } from "./ImageEnryptionHelpers";
import {     
            CipherType,
            IndexedList,IndexedValue,
            Vertex ,ChildParams, 
            EncryptionInput, EncryptionOutput, 
            IndexedChar, 
            Matrix } from "./CipherTypes"; 

// MagicCypher is a generic encryption orchestrator for "image" and "text" types.
// It determines and instantiates the appropriate child class - OddCypher, EvenCypher, or SinglyEvenCypher -
// based on the square order. Each child implements a specific magic square construction algorithm
// to spatially scramble data and obfuscate it accordingly.   

class MagicCypher<T extends CipherType> {
  
    // order of magic square
    order:number = 0; 
    input!:EncryptionInput<T>;
    output!:EncryptionOutput<T>;
    indexedList!: IndexedList<T>; 
    magicSquare!: Matrix<IndexedValue<T>>;
    childParams!:ChildParams<T>;  

    //===============================setters========================================
  
    setOrder = (order:number):void => {
        this.order= order;
    }
    
    setInput = (input:EncryptionInput<T>)=>{
        this.input = input;
    }

    setIndexedList = (indexedList:IndexedList<T>) => {
        this.indexedList = indexedList;
    }

    setOutput = (output:EncryptionOutput<T>)=>{
        this.output = output; 
    }
    setMagicSquare = (matrix:Matrix<IndexedValue<T>>)=>{
        this.magicSquare = matrix; 
    }

    setChildParams = (childParams:ChildParams<T>) => {
        this.childParams = childParams; 
    }

    //==============================================================================
    //meat and potatoes (main method)

    runEncryption = async (input:EncryptionInput<T>) :Promise<EncryptionOutput<T>>=>{
        // text enccryption logic

        let order = 0; 

        // initilize out put with temp values
        let output:EncryptionOutput<T> = {type:"text",value:""} as EncryptionOutput<T>; 
        
        // text encryption set up for order
        if (input.type === "text") {
            // type specific things we need  to do to prepare child params for type === "text"
         
            //step 1) remove any leading or trailing white space
            input.value = input.value.trim();

            //step 2) determine order
            order  = this.determineOrder(input.value.length);
            this.setOrder(order);
            
            // temp just to have it return something that makes sense to typescript 
            output = {type:"text",value:""} as EncryptionOutput<T>;
        }     

        // image encryption set up for order
        if (input.type === "image") {
            // type specific things we need  to do to prepare child params for type === "image"
            order = input.value; 
            this.setOrder(order); 

            // temp just to have it return something that makes sense to typescript 
            output = {type:"image",value:new Float32Array()} as EncryptionOutput<T>
        }
        
         try {

            const indexedList = this.createIndexedList(input,order); 
            this.setIndexedList(indexedList); 
            
            const emptyMatrix = this.createEmptyCipherSquare(order,input.type);  
            this.setMagicSquare(emptyMatrix);  
            
            // use indexed list and empty matrix to create child params
            const childParams:ChildParams<T> = this.createChildParams(input.type,indexedList,emptyMatrix); 
            this.setChildParams(JSON.parse(JSON.stringify(childParams))); 

                const cipherObject:CipherObject<T> = await this.determineCipher(order,this.childParams);

                const encryptedData = cipherObject.encrypt(input.type as T); 

                output = encryptedData;
                
                return encryptedData;
        }
        catch(error:unknown){

            console.error(error)
            console.error("error creating cipher object from child classes");
        }
        
        // Fallback for unreachable case (just to satisfy TS)
        //  throw new Error("Unsupported encryption type");
         return output; 
    }

    //================================================================================
    // steps

    // text encryption 
    // step 2) determine order
    determineOrder = (messageLength:number):number =>{

        // if message length is 8 
        // sqrt(8) = 2.8 then round up to 3
        // create a nxn matrix that can contain our message; 
        const newOrder = Math.ceil(Math.sqrt(messageLength)); 

        if(newOrder<3){
            return 3; 
        }

        return newOrder; 
    }
    
    // create indexed list of cipher input values
    createIndexedList = (input: EncryptionInput<T> , order:number): IndexedList<T> =>{

        // let list:IndexedList<T> = [];

        if (input.type === "text") { 
             
            const indexedList:IndexedList<"text"> = this.sanitizeAndMap(input.value,order); 

            // then return list
            return indexedList as IndexedList<T>; 
        }

        if (input.type === "image") {

            // helper method specific to image encryption
            const indexedList: IndexedList<"image"> = generateTileOriginUVCoords(order); 
            return indexedList as IndexedList<T>;
         
        }

        throw new Error("Unsupported input type");
    }

    // text Encryption
    //step 3) sanitize message & create an array of maps<number,string> of chars from the sanitized message; 
    sanitizeAndMap = ( message:string , order:number ) : IndexedChar[] =>{
        //@TODO need to think about how to deal with line breaks ie "\n"
        // it would be nice to preserve the orignal format of the message but it presents certain challenges

        // update sovled this can be achieved via css propterty: can't rmeber the name but yea you already solved this

        const sanitizedMessage = new StringBuilder;  ;

        const indexedCharList:IndexedChar[] = []
 

        for(let i = 0 ; i < order*order ; i ++){

            let sanitizedChar:string; 

            if(i>=message.length){
                // pad the message so that it's length is a square number
                sanitizedMessage.append("-");
                sanitizedChar = "-"
            }else
            if(message[i] === " "){
                //replace white space with an underscore
                sanitizedMessage.append("_")
                sanitizedChar = "_"
            }else{              
                //otherwise add the char in message to the sanitize string      
                sanitizedMessage.append(message[i]);
                sanitizedChar = message[i]; 
            }  
            
            // create an indexed char
            const indexedChar:IndexedChar = {index: i, value: sanitizedChar};
            
            // add it to the list
            indexedCharList.push(indexedChar); 
        }
    
        return  indexedCharList
    }
    
    //step 4) create an empty matrix to pass to children
    createEmptyCipherSquare = (order:number, type:CipherType):Matrix<IndexedValue<T>> => {
         
        let index = 0;
        let matrix:Matrix<IndexedValue<T>>= []; 

        if(type === "text"){
            const square:Matrix<IndexedValue<"text">> = [];
            for(let i = 0 ; i < order ; i ++){
                square.push([]);
                for(let j = 0 ; j < order ; j ++){
                    square[i][j] = {index:index,value:"null"}; 
                    index++;
                }
            }
            matrix = square as Matrix<IndexedValue<T>>;
        }else{

            const square:Matrix<IndexedValue<"image">> = [];
            for(let i = 0 ; i < order ; i ++){
                square.push([]);
                for(let j = 0 ; j < order ; j ++){
                    square[i][j] = {index:index,value:{r:0,g:0,b:0,a:0}}; 
                    index++;
                }
            }

            matrix = square as Matrix<IndexedValue<T>>;
        }

        return matrix;
    }

    // create childParams
    createChildParams = (type:CipherType, indexedList:IndexedList<T>,matrix:Matrix<IndexedValue<T>>):ChildParams<T>=>{

        const  childParams:ChildParams<T> =  {
                type:type,
                value:{
                    indexedList:indexedList,
                    matrix:matrix     
                } 
            }  as ChildParams<T> 
            
            console.log(JSON.parse(JSON.stringify(childParams)));            

        return childParams; 
    }

    //step 5) 
    // responsible for algorithm determination 
    // and child object creation 
    determineCipher = async (order:number, childParams:ChildParams<T>):Promise<CipherObject<T>>=>{

        // define the shape of the cipher object to let 
        // type script know no matter what object gets returned it will have these methods
        // define for initalization
        let cipherObject: CipherObject<T>; 

        if(order%2===0){

            if(order%4===0){
                console.log("performing doubly even cipher");            
                const { default: EvenCypher } = await import('./EvenCypher');
                cipherObject = new EvenCypher<T>(childParams);   
            
            }else{
                console.log("performing singly even cipehr");
                const { default: SinglyEvenCypher } = await import('./SinglyEvenCypher');
                cipherObject = new SinglyEvenCypher<T>(childParams);  
                // Now you can instantiate it
            }                                      
        }else{
            console.log("performing odd cipher")
            const { default: OddCypher } = await import('./OddCypher');
            cipherObject = new OddCypher<T>(childParams);   
            
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
    // ***********************************************************************************************************
    //  DECRYPTION
    // ***********************************************************************************************************
    // How it works: 
    // 1) create a matrix of indexed values from the input. 
    //    Text:
    //    if the input is a message it fills the matrix from left to right , top - down with each
    //    char in the message. 
    //    Images:
    //    If it is an image it generates a matrix of normalized UV coordinates both ranging from 0 to 1
    //    with the origin [0,0] representing the bottom left vertex of the image texture and [1,1] representing
    //    the top left vertex of an image texture. It fills each matrix cell value with a UV coordinate
    //    representing the upperleft vertex position of each tile in an N x N grid.  

    runDecryption = async(input:EncryptionInput<T>,key:number):Promise<EncryptionOutput<T>>=>{

        if(input.type=== "text"){ 
            const length = input.value.length;
            const order = Math.floor(Math.sqrt(length));

            //step 1) check to see if the message is a valid cipher              
            if(!this.isValidCipher(input.value)){
                throw new Error("Invalid cipher message");
            }
            // step 2) check if the key provided matches the magic constant
            if(!this.isValidKey(order,key)){  
                throw new Error("Access Denied, inavlid key")
            }
            // set order 
            this.setOrder( Math.floor(Math.sqrt(input.value.length)));  
 
        }else{

            // for image encryption they need to provide how many partitions the image was split into
            // this logic is controlled via the front end right now with a slider and is not deterministic based
            // on image size 
            // consider making it deterministic like
            // order = Math.sqrt(imageWidth * imageHeight) % 100 + 100 or something like that not sure how I want to do this yet
           
            const order = input.value; 
       

            if(!this.isValidKey(order,key)){
                throw new Error("Access Denied, inavlid key")
            }

            this.setOrder(order); 
 
        }

        // if we get here that means the cipher is valid, the order is set and we can begin decryption process

        // we need to generate child params: indexedList:IndexedList<T> and matrix:Matrix<IndexedValue<>T>

        //  step 1) generate Matrix         
        const matrix:Matrix<IndexedValue<T>>  = this.toSquare(input);  
        this.setMagicSquare(matrix); 

        // step 2) create empty indexedList
        const emptyIndexedList:IndexedList<T> = this.createEmptyIndexedList(this.order,input.type as T); 
        this.setIndexedList(emptyIndexedList);

        // step 3) create childParams obj A
        const childParams = this.createChildParams(input.type as T, emptyIndexedList, matrix);
        this.setChildParams(childParams);

        // step 4 determine cipher 
        let cipherObject:CipherObject<T>;

        try{
            
            cipherObject = await this.determineCipher(this.order,childParams);  


        }catch(error:unknown){

            console.error(error);
            throw new Error("Encryption failed due to invalid magic square or encryption logic.")
        }   
        
        
        const output:EncryptionOutput<T> = cipherObject.decrypt(input.type as T);
        return output;
       
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

    private toSquare(input:EncryptionInput<T>):Matrix<IndexedValue<T>>{ 
        
        let square:Matrix<IndexedValue<T>> = this.createEmptyCipherSquare(this.order,input.type); 

        let index = 0;

        if(input.type === "text"){
            const message = input.value; 

            for(let i = 0 ; i  < this.order ; i++){
                for(let j = 0 ; j < this.order ; j ++){
                    
                    const char = message[index];
                    const cell:IndexedValue<T> = {index:index,value:char} as IndexedValue<T>;
                   
                    square[i][j] = cell  
                    index++;
                }
            }

        }else 
        if(input.type === "image"){

            square = generateIndexedUVCoordMatrix(input.value) as Matrix<IndexedValue<T>>  // need to still cast as generic     

        }else{
            throw new Error("Unsuported type for encryption. it must be type 'text' or 'image'");
        }

        return square;  
    }
    
    //step 4
    protected createEmptyIndexedList = (N:number,type:T):IndexedList<T>=>{

        const list:IndexedList<T> = []; 

        let index = 0; 

        if(type === "text"){
            for(let i = 0 ; i < N ; i ++){
                
                for(let j = 0 ; j < N ; j ++){

                    const value = "null"
                    const indexedValue:IndexedValue<"text"> = {index:index,value:value}; 
                    
                    list.push(indexedValue as IndexedValue<T>); 
                     
                    index++; 
                }
            }
        }else{  

            for(let i = 0 ; i < N ; i ++){
                for(let j = 0 ; j < N ; j ++){

                    const vertex:Vertex = {
                            r:0,
                            g:0,
                            b:0,
                            a:1
                        } 

                    const indexedValue:IndexedValue<"image"> = {index:index, value:vertex};

                    list.push(indexedValue as IndexedValue<T>); 

                    index++
                }
            }

            
        } 

        return list;  
    }

 
    //step 5
    // determineCipher 
 

    //=======================================================================================================
    // methods to be passed to children

    // extract cell values from matrix and construct the apppropriate encryption output format
    // this is innefficent but will keep for now for the sake of clarity eg:
    // I could just calculate the index of a char a vertex rgba based it's position in the row and column of 
    // the matrix and assign it at loop time inside each child classes buildSquare() method
    protected readSquare = (cipherType:T,cipherSquare:Matrix<IndexedValue<T>>):EncryptionOutput<T>=>{

        const N = cipherSquare.length; 

        const text:StringBuilder = new StringBuilder();
        const rgbaFloat32Array:Float32Array = new Float32Array(N*N*4); 
        
        for(let i = 0 ; i < N; i ++){

            for(let j  = 0 ; j < N ; j ++){
                
                // type narrowing
                if(cipherType === "text"){

                    const indexedChar:IndexedValue<"text"> = cipherSquare[i][j] as IndexedValue<"text">; 

                    const char:string = indexedChar.value; 

                    if(char.length !==1){
                        throw new EvalError(
                            "Error: readSquare  method recieved a malformed cipher square\n" +
                            "cipher squares of type `text` should each contain a single char\n" +   
                             "the cell [row: " + i + 1 + " column: " + j + 1 + " is empty or not a single char"
                        )
                    }
                    text.append(char)

                }else{
                    const indexedVertex:IndexedValue<"image"> = cipherSquare[i][j] as IndexedValue<"image">;
                    const index = calculateIndexOfVertexInArray(N,i,j);
                    const vertex:Vertex = indexedVertex.value; 
                    
                    rgbaFloat32Array[index + 0] = vertex.r ; 
                    rgbaFloat32Array[index + 1] = vertex.g ; 
                    rgbaFloat32Array[index + 2] = vertex.b ; 
                    rgbaFloat32Array[index + 3] = vertex.a ;  

                }  
            }
        }

        
        let output:EncryptionOutput<T>; 

        if(cipherType === "text"){
            output = {
                type: cipherType,
                value: text.toString()
            } as EncryptionOutput<T>
        }else{
            output = {
                type: cipherType,
                value: rgbaFloat32Array
            } as EncryptionOutput<T>
            
        }

        return output; 
    }

    protected printList = (list:IndexedList<T>):void=>{
        
        const printLine:string[] = []; 

        for(let i = 0 ; i < list.length ; i ++){
            // let {index,value} = list[i]; 
            const index = list[i].index;
            let value = list[i].value;

            if(typeof(value) === "object"){
                value = `[u:${value.a}, v:${value.b}]`             
            }

            printLine.push(`index:${index}, value:${value}`)
        }

        console.log(printLine.join(" "));
    }

    protected printSquare=(squareCipher:Matrix<IndexedValue<T>>):void=>{
        //helper method for debugging and printing out the square

        for(let i = 0 ; i < squareCipher.length; i ++){

            const row:string[] = [];

            squareCipher[i].forEach( (item:IndexedValue<T>)=>{ 
                    
                // let {index,value} = item; 
                const index = item.index;
                let value = item.value

                if(typeof(item.value) === "object"){
                    value = `[u:${item.value.a}, v:${item.value.b}]`
                }

                row.push( `{index:${index}, value: ${value}}`)
                        
            })

            console.log(row.toString()); 
        }
    }

    caluclateMagicConstant=(order:number):number=>{

        return order*(order*order+1)/2
    }

    protected listToOutput = (cipherType:T,list:IndexedList<T>):EncryptionOutput<T>=>{

        if(cipherType === "text"){

            const encrptedMessage:StringBuilder = new StringBuilder()

            for(let i = 0 ; i < list.length ; i ++){
                const char  = list[i].value; 
                
                encrptedMessage.append(char as string); 
            }

            const output:EncryptionOutput<"text"> = {
                type:cipherType,
                value:encrptedMessage.toString()
            }

             return output as EncryptionOutput<T>;

        }else if(cipherType === "image"){

            let index = 0; 

            const vertexArray = new Float32Array(list.length*4); 

            for(let i = 0 ; i < list.length ; i++){

                const vertex:Vertex = list[i].value as Vertex;  
                
                vertexArray[index + 0] = vertex.r; 
                vertexArray[index + 1] = vertex.g; 
                vertexArray[index + 2] = vertex.b; 
                vertexArray[index + 3] = vertex.a; 

                index+=4
            }

            const output:EncryptionOutput<"image">={
                type:cipherType, 
                value: vertexArray
            }

            return output as EncryptionOutput<T>;

        }else{
            throw new Error("programmer error unsported cipher type");
        }
   
    }

    protected isMagic =(square:Matrix<IndexedValue<T>>):boolean =>{
        // returns true if each row, column, and diagonal equal to the magic constant
        // or throws an error  

        const N:number = square.length;

        const magicConstant:number = this.caluclateMagicConstant(N);

        let sumLeftDiagonal:number = 0
        let sumRightDiagonal:number = 0 


        for(let i = 0 ; i < N ; i++ ){

            let sumRow = 0;
            let sumCol = 0;
            
            const leftDiagonalCell = square[i][i].index; 
            const rightDigonalCell =square[N-i-1][N-i-1].index;  
      
            if(leftDiagonalCell===undefined || rightDigonalCell===undefined){
                throw new EvalError("Error: the cell's key in [row: " + i+1 + "column: " + i+1+ "] is undefined")
            }else{
                
                sumLeftDiagonal += leftDiagonalCell+1; 
                sumRightDiagonal += rightDigonalCell+1;

            }        

            for(let j = 0 ; j < N ; j ++){
                
                //itterate over rows
                const cellInRow = square[i][j].index;
                //itterate over cols
                const cellInCol = square[j][i].index ; 
              
                //if there is not a key associated with a given cell throw error
                if(cellInRow===undefined   || cellInCol===undefined){

                    console.error(i,j);

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
            console.log("Encryption performed successfully!")            
            return true; 
        }

    }
  
  }

  export default MagicCypher;