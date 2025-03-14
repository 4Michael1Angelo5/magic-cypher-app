import { CipherStats } from "./CipherStats";

export interface EncryptionResponse {
    error: boolean;
    message:string;
    cipherStats:CipherStats
}