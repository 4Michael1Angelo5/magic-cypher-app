// The shape of a JSON message the server
// expects
export interface JSONcipherRequest {
    userId:string;
    input:string;
    output:string;
    encryptionKey:number;
    time:number;
}