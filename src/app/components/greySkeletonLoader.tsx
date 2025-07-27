"use client"
import styles from "@/app/styles/skeleteonLoader.module.css"
import { useRef } from "react"

interface GreySkeletonLoaderProps {
    numBars:number,
    widths:string[]
}

export const GreySkeletonLoader:React.FC<GreySkeletonLoaderProps>=({numBars , widths})=>{
    const loaderRef = useRef(null)


    // Function to dynamically create skeleton loaders based on numBars
    const createSkeletonLoaders = () => {
      const loaders = [];
      for (let i = 0; i < numBars; i++) {
        const startPosition = ( (i + 1) * 50 ); // Adjust starting position for each loader
        const endPosition = -startPosition
          
  
        loaders.push(
          <div
            ref = {loaderRef}
            key ={i}
            className ={styles.grey_skeleton_loader}
            style =
            { 
              {
                "--startPosition": `${startPosition}%`, 
                "--endPosition": `${endPosition}%`,
                width: widths[i]
              } as React.CSSProperties //  Explicit cast to allow CSS variable
            } 
          />
        );
       
      }
      return loaders;
    };
  
    return (
      
        <div id="skeleton-container" 
            className = {styles.grey_skeleton_container}>
          {          
            createSkeletonLoaders()
          }
        </div>
      
    );
}