abstract class CipherObject{

  // Defining contract for all cipher objects

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

  abstract buildSquare(): Array<Array<Map<number,string>>>

}

export default CipherObject; 