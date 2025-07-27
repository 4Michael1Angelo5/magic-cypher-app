
export type EncryptionOutput = 
    | { type: "text"; value: string }
    | { type: "image"; value: Float32Array};