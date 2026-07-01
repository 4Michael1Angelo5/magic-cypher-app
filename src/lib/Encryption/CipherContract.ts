import { 
         EncryptionOutput, 
         CipherType,  
         // IndexedList,
         IndexedValue,  
         Matrix,
         } from "./CipherTypes";

/**
 * Defining contract for all cipher objects.
 * Cipher objects are instances of the MagicCypher Class
 */
export default abstract class CipherObject<T extends CipherType>{

  abstract order: number;


    /**
     * method for encryption; all child classes must implement it
     * @param type
     */
  abstract encrypt(type:T):EncryptionOutput<T>;

    /**
     * method for decryption; all child classes must implement it
     * @param type
     */
  abstract decrypt(type:T):EncryptionOutput<T>; // should this really need type in the method sig?

    /**
     * method to construct magic squares
     */
  abstract buildSquare(): Matrix<IndexedValue<T>>;
}

 