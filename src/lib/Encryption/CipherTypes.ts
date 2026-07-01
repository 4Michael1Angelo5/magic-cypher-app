//======================== Base Types (Smallest components of a type)

/**
 * Represents a single RGBA vertex encoded as normalized float values.
 * Commonly used for WebGL attribute data or texture-based encoding.
 */
 export interface Vertex {
    /** Normalized U coordinate (0 → 1) */
    r:number;

    /** Normalized V coordinate (0 → 1) */
    g:number;

    /** Normalized delay or offset value used for animation/timing */
    b:number;

    /** Reserved for future use (e.g., flags, metadata, or alpha channel) */
    a:number;
}

/**
 * Supported cipher data types.
 */
export type CipherType = "text" | "image";

/**
 * Input payload for encryption.
 * Type is preserved via conditional typing.
 *
 * @template T - Cipher type ("text" or "image")
 */
export type EncryptionInput<T extends CipherType> =
  T extends "text" ? { type: "text"; value: string } :
  T extends "image" ? { type: "image"; value: number } : never;

/**
 * Output payload for encryption.
 * Type is preserved via conditional typing.
 *
 * @template T - Cipher type ("text" or "image")
 */
export type EncryptionOutput<T extends CipherType> =
  T extends "text" ? { type: "text"; value: string } :
  T extends "image" ? { type: "image"; value: Float32Array } : never;


//======================= Generic class with type-preserving methods

/**
 * Generic 2D matrix type.
 *
 * @template T - Element type stored in the matrix
 */
export type Matrix<T> = T[][];

/**
 * Represents a value paired with its original index.
 * Used to preserve ordering during encryption transformations.
 *
 * @template T - Cipher type ("text" or "image")
 */
export type IndexedValue<T extends CipherType> = 
  T extends "text" ? {index:number , value: string} : 
  T extends "image" ? {index:number , value: Vertex} : never


/**
 * A list of indexed values for a given cipher type.
 *
 * @template T - Cipher type ("text" or "image")
 */
export type IndexedList<T extends CipherType> = IndexedValue<T>[]


/**
 * Convenience alias for indexed text values.
 */
export type IndexedChar = IndexedValue<"text">;

/**
 * Convenience alias for indexed image vertex values.
 */
export type IndexedVertex = IndexedValue<"image">;

/**
 * Parameters passed to child cipher classes.
 * Encapsulates both the indexed list and matrix representation
 * of the data while preserving type safety.
 *
 * @template T - Cipher type ("text" or "image")
 */
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




 
