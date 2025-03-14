 export interface Message {
    id:string,
    userId: string;
    input:string;
    output:string;
    encryptionKey:number;
    time:number;
    createdAt: string;
 }