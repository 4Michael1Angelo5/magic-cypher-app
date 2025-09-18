import { useState, useEffect } from "react"; 

export const useLoader = ()=>{

    const [numBars,setNumBars] = useState<number>(4);
    const [widths,setWidths] = useState<string[]>(["100"]);
    const [containerHeight,setContainerHeight] = useState(150);

    const calculateNumBars = (containerHeight:number):number =>{

        const barHeight = 32; // one bar's pixel height; 
        const padding = 20; 
        

        return Math.floor((containerHeight-padding)/barHeight) // how many bars can fit in the container height
    }

    const createWidths = (numBars:number):string[]=>{
        const widths:string[] = [];

        for(let i = 0 ; i < numBars; i++){
            widths.push("100");
        }
        return widths;
    }

    useEffect(()=>{
        const numBars = calculateNumBars(containerHeight);
        const widths = createWidths(numBars);
        setWidths(widths);
        setNumBars(numBars); 
    },[containerHeight])


    return{
        numBars,
        containerHeight,setContainerHeight,
        widths
    }
}