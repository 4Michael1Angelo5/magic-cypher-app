abstract class CipherObject{

  // Defining contract for all cipher objects
  // cipher objects are instances of the MagicCypher Class

  // Abstract property enforcement
  // array of maps containing {number: charIndex, char: "string"}
  abstract charMapList: Array<Map<number, string>>;
  
  // 2D array of maps containing elements for charMapList
  abstract magicSquare: Array<Array<Map<number, string>>>;

  abstract order: number; 

  //**********************************************************

  //  method for encryption; all child classes must implement it
  abstract encrypt(): Map<number,string>[][];

  //  method for decryption; all child classes must implement it
  abstract decrypt(): string;

  // method to construct magic squares 
  abstract buildSquare(): Array<Array<Map<number,string>>>;
}

export default CipherObject; 

// points to consider: charMapList... why does charMapList have to be that way? 
// why not GenericInputType[]
// emptySquare could be GenericInputType[][]
// 

// all cipher clases must use a method called assignCellValue
// assignCellValue will assign the correct value to each cell of 
// a 2D Matrix depending on the EncryptionInput type 

// the constructor of MagicCypher must be updated to include EncryptionType. 

// const encryptionInput:EncryptionInput = {type:"text"  , value : "Text to encrypt or decrypt"} | 
//                                         {type:"image" , value : someImage:ImageData}
//                                         {type: "audio" , value: someMP4 : file.mp4} ... etc

 
 
