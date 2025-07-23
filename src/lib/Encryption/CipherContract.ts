import { EncryptionInput,
         EncryptionOutput, 
         CipherType,  
         IndexedList,
         IndexedValue,  
         Matrix,
         } from "./CipherTypes";


export default abstract class CipherObject<T extends CipherType>{

  // Defining contract for all cipher objects
  // cipher objects are instances of the MagicCypher Class

  // Abstract property enforcement
  // array of maps containing {number: charIndex, char: "string"}
  abstract indexedList: IndexedList<T>;

  // 2D array of maps containing elements for charMapList
  abstract magicSquare: Matrix<IndexedValue<T>> ;  

  abstract order: number; 

  //**********************************************************

  //  method for encryption; all child classes must implement it
  abstract encrypt(type:T):EncryptionOutput<T>;

  //  method for decryption; all child classes must implement it
  abstract decrypt(type:T):EncryptionOutput<T>;

  // method to construct magic squares 
  abstract buildSquare(): Matrix<IndexedValue<T>>;
}

