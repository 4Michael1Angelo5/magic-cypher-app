//======================== Base Types (Smallest Componets of a type)
// RGBA FLOAT32 
 export interface Vertex {
    r:number; // normalized u coord
    g:number; // normalized v coord
    b:number; // normalized delay offset
    a:number; // idunno yet
}

export type CipherType = "text" | "image";

export type EncryptionInput<T extends CipherType> =
  T extends "text" ? { type: "text"; value: string } :
  T extends "image" ? { type: "image"; value: number } : never;

export type EncryptionOutput<T extends CipherType> =
  T extends "text" ? { type: "text"; value: string } :
  T extends "image" ? { type: "image"; value: Float32Array } : never;


//======================= Generic class with type-preserving methods
// generic matrix type
export type Matrix<T> = T[][]; 

// generic Indexed Value
export type IndexedValue<T extends CipherType> = 
  T extends "text" ? {index:number , value: string} : 
  T extends "image" ? {index:number , value: Vertex} : never
 



export type IndexedList<T extends CipherType> = IndexedValue<T>[]



export type IndexedChar = IndexedValue<"text">; 

export type IndexedVertex = IndexedValue<"image">; 
    


export type ChildParams<T extends CipherType> = 
T extends "text"? {
      type: "text";
      value: {
      indexedList: IndexedList<T>;
      matrix: Matrix<IndexedValue<T>>;
    }

}:
T extends "image"?{
        type: "image";
        value: {
        indexedList: IndexedList<T>;
        matrix: Matrix<IndexedValue<T>>;
      };

}: never

// export type ChildParams<T extends CipherType> = 
//  {
//       type: "text";
//       value: {
//       indexedList: IndexedList<T>;
//       matrix: Matrix<IndexedValue<T>>;
//     }

// }| {
//         type: "image";
//         value: {
//         indexedList: IndexedList<T>;
//         matrix: Matrix<IndexedValue<T>>;
//       };

// } 




 
