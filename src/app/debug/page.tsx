"use client"
import React, {useEffect, useState} from "react"
import MagicCypher from "@/lib/Encryption/MagicCypher";
import { CipherType, IndexedList, IndexedValue, Vertex, Matrix } from "@/lib/Encryption/CipherTypes";
import OddCypher from "@/lib/Encryption/OddCypher";
const Debug:React.FC = ()=>{
    const [data,setData] = useState<number>(0);


    const createEmptyCipherSquare = <T extends CipherType>(N:number,type:CipherType):Matrix<IndexedValue<T>>=>{
        
        const matrix:Matrix<IndexedValue<T>> = [];

        let index = 0;

        if(type ==="text"){
            for(let i = 0 ; i < N ; i ++){

            matrix.push([]);

                for(let j = 0 ; j < N ; j++){

                const indexedValue:IndexedValue<"text"> = {index:index, value:"null"};
                
                matrix[i][j] = indexedValue as IndexedValue<T>; 
                index++
                }
            }
        }else{

            for(let i = 0 ; i < N ; i ++){
            matrix.push([]);
            for(let j = 0 ; j < N ; j++){

                const indexedValue:IndexedValue<"image"> = {index:index, value:{r:0,g:0,b:0,a:0}};
                
                matrix[i][j] = indexedValue as IndexedValue<T>; 
                index++
            }

        }

        }



        return matrix 
    }


    useEffect(()=>{

        // const matrix:Matrix<IndexedValue<CipherType>> = createEmptyCipherSquare<"text">(9,"text"); 
        // const matrix2:Matrix<IndexedValue<CipherType>> = createEmptyCipherSquare<"image">(10,"image"); 

        // console.log(matrix);
        // console.log(matrix2)

        
        
            try{
                const cipher = new MagicCypher<"text">(); 
                const emptyMatrix:Matrix<IndexedValue<CipherType>> = cipher.createEmptyCipherSquare(3,"text");
                const indexedList:IndexedList<CipherType> = cipher.createIndexedList({type:"text" ,value:"123456789"},3);
                console.log("indexed list not stateful" , indexedList);
                console.log("empty matrix - not stateful:", emptyMatrix)
                // console.log("magic square",cipher.magicSquare); // these should still all be null
                // console.log("indexed list",cipher.indexedList); 
                // console.log("child params",cipher.childParams);
                // console.log("input",cipher.input); 

                const childParams = cipher.createChildParams("text",indexedList as IndexedList<"text"> ,emptyMatrix as Matrix<IndexedValue<"text">>); 
                console.log("child params - I expect this to be mutated!")
                console.log(childParams); 
                const oddCipher = new OddCypher<"text">(childParams);
                console.log(oddCipher.childParams)
                oddCipher.encrypt("text");
 
                // console.log("emptyMatrix",emptyMatrix)

            }catch(error:unknown){
                console.error(error);
            }
        

    },[])
    return(
        <h1>
            Hello world!
        </h1>
    )
}

export default Debug