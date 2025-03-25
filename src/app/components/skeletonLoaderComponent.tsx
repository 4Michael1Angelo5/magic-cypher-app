"use client"

import styles from "@/app/styles/skeleteonLoader.module.css"

import { useRef} from "react";


// move this out of Skeleton loader so that we don't recreate it every time SkeletonLoader mounts
const WIDTHS = ["100%","100%","100%","75%","75%","75%","60%"]

const numBars = 4

const SkeletonLoader = () => {

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
              width: WIDTHS[i]
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
      {/* <Loading/> */}
        {          
          createSkeletonLoaders()
        }
      </div>
    </div>
  );
};

export default SkeletonLoader