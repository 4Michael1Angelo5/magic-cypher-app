"use client"

import styles from "@/app/styles/imageTool.module.css";
import { runTester } from "./test/tester";


interface ImageDebuggerProps {
    imageInfo : string[];
    webglError: string;
}

export const ImageDebugger:React.FC<ImageDebuggerProps> = ({imageInfo,webglError})=>{
    return (
    <>
      <div className={styles.imageInfoBox}>
            {
              imageInfo
              // only display information about the image if it is defined
              &&
              (
                imageInfo.map((e, i) => {
                  return (
                    <p key={i}>
                      {
                        e
                      }
                    </p>
                  )
                })

              )
            }
            {webglError && webglError}
          </div>

          
         <button onClick={runTester}>RUN TESTER</button>

    </>
    );
}