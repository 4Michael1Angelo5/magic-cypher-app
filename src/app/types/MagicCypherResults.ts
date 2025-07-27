 
import { EncryptionOutput ,CipherType} from "@/lib/Encryption/CipherTypes";

// how MagicCypher class responds to an encryption input
export interface MagicCypherResults {
    error: boolean;  // if MagicCypher encountered an error
    errorMessage:string,  
    output: EncryptionOutput<CipherType> // make this optional for now until i get the other part working
    cipherStats:CipherStats // key metrics about how MagicCypher handled the request 
                            // ie how long it took to decrpyt encrypt
                            // how long the input text was 
                            // how many pixels the image had
                            // image width/ height
}

export interface CipherStats {
    messageLength:number;
    encryptionKey:number;
    time:number;
}