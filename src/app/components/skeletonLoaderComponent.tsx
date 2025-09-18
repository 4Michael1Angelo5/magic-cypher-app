"use client"

import styles from "@/app/styles/skeleteonLoader.module.css"

import { useRef} from "react";

interface SkeletonLoaderProps {
  numBars:number,
  widths:string[],
}

const SkeletonLoader:React.FC<SkeletonLoaderProps> = ({numBars,widths}) => {

  // const [numBars, setNumBars] = useState(8); // Default to 8 skeleton bars

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
          className ={styles.skeleton_loader}
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
    <div>
      <div id="skeleton-container">
      
        {          
          createSkeletonLoaders()
        }
      </div>
    </div>
  );
};

export default SkeletonLoader