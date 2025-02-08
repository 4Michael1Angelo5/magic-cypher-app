"use client"

import { motion,animate,useTransform ,easeInOut, useMotionValue } from "motion/react";
import { interpolate } from "flubber";
import { useEffect, useState } from "react";

const doubleHelix = "M185.6 144c24-9.6 44.8-11.2 72-3.2 20.8 6.4 32 16 41.6 33.6l11.2 22.4c9.6 20.8 8 35.2-1.6 59.2-3.2 11.2-4.8 12.8-4.8 16-4.8 17.6-24 35.2-41.6 43.2-1.6 0-3.2 1.6-6.4 3.2-1.6 0-1.6 0-1.6 1.6-12.8 6.4-19.2 8-30.4 9.6-22.4 1.6-75.2-27.2-88-52.8-14.4-25.6-11.2-76.8 3.2-94.4 12.8-17.6 28.8-32 46.4-38.4z m4.8 16c-12.8 4.8-28.8 17.6-41.6 33.6-9.6 11.2-11.2 56-1.6 76.8 11.2 19.2 56 44.8 73.6 43.2 9.6 0 14.4-3.2 25.6-8 1.6 0 1.6 0 1.6-1.6 3.2-1.6 4.8-1.6 6.4-3.2 14.4-6.4 30.4-20.8 33.6-32 1.6-4.8 1.6-6.4 6.4-17.6 8-19.2 9.6-30.4 1.6-44.8l-11.2-22.4c-8-14.4-14.4-20.8-32-25.6-24-8-41.6-8-62.4 1.6z" ; 
const cell = "M37.6,-42.8C47.4,-27.8,53.2,-13.9,55.9,2.7C58.6,19.2,58.1,38.4,48.2,47.4C38.4,56.3,19.2,55.1,-1.5,56.6C-22.2,58.1,-44.4,62.4,-59.9,53.4C-75.3,44.4,-84.1,22.2,-80.7,3.3C-77.4,-15.5,-62,-31.1,-46.6,-46.1C-31.1,-61.1,-15.5,-75.6,-0.8,-74.8C13.9,-74,27.8,-57.8,37.6,-42.8Z"
const paths = [doubleHelix,cell]
export const AnimatedIcons = ()=>{

    const progress = useMotionValue(0);

    const path1 = useTransform(progress,[0,1], paths,{
        mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 1})
    })
    
    useEffect(()=>{
    const animation = animate(progress, 1, {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      });
  
      return () => animation.stop();
    }, [progress]);

    return(
        <motion.svg layout data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"   
        style = {{height:"100px", width:"100%"}}
        >
        <motion.path d = {path1} fill = {"red"}/>
        </motion.svg>
    )
}