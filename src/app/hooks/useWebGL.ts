import { useState } from "react";
import { WebGLParams, WebGLResult } from "../images/webgl3"; 
import { EncryptionInput } from "@/app/types/EncryptionInput";
import { PixelData } from "../images/page";
import { EncryptionOutput } from "../types/EncryptionOutput";
import { webglProgram } from "../images/webgl3";

interface WebGLResources {
    program?: WebGLProgram;
    vertexShader?: WebGLShader;
    fragmentShader?: WebGLShader;
    vertexBuffer?: WebGLBuffer;
    indexBuffer?: WebGLBuffer;
    texture?: WebGLTexture;
}

/**
 * Custom hook for managing WebGL rendering of image encryption,
 * including setup, execution, cleanup, and tracking animation state.
 */


export const useWebGL = (   outputCanvas: React.RefObject<HTMLCanvasElement | null>, 
                            webGlResources: React.RefObject<WebGLResources | null> 
                        ) => {

    // local errors to webgl or canvas ref assignment or access
    const [webglError, setWebglError] = useState<string>("");

    // used to tell when to trigger draw call to webgl
    const [drawFlag, setDrawFlag] = useState<boolean>(false);

    const [animationComplete, setAnimationComplete] = useState<boolean>(false);


    // **************************************************************************
    // webgl program call to draw
    // **************************************************************************

    const runEncryptGL = (cipherInput: EncryptionInput,
        cipherOutput: EncryptionOutput,
        pixelData: PixelData | undefined,
        loading: boolean) => {

        if (cipherInput.type === "image" && cipherOutput.type === "image" && drawFlag && !loading) {

            if (!outputCanvas.current) {
                setWebglError("tried to submit before html canvas element rendered to DOM or before it's reference was available");
                return;
            }
            // now non null assertion is safe!
            //   const outputCanvas: HTMLCanvasElement = outputCanvas.current!

            let gl: WebGL2RenderingContext | null = null

            gl = outputCanvas.current.getContext("webgl2", { preserveDrawingBuffer: true });
            //--------------------------------------------------------------

            if (!gl) {
                //if webgl is not supported
                const isWebGL1Supported = outputCanvas.current!.getContext("webgl");
                if (!isWebGL1Supported) {

                    setWebglError("Browser Does not Support WebGL 2 but supports webgl 1")

                } else {
                    setWebglError("Browser Does not Support Webgl");
                }
                return;
            }

            //--------------------------------------------------------------
            // webgl program call

            if (pixelData) {  // why would you not put pixelData in the deps array?

                const webglParams: WebGLParams = {
                    setAnimationComplete: setAnimationComplete,
                    gridPartitions: cipherInput.value,
                    outputCanvas: outputCanvas,
                    glCtx: gl,
                    imgData: pixelData.imgObj,
                    width: pixelData.dimensions.width,
                    height: pixelData.dimensions.height,
                    lookupTexture: cipherOutput.value
                }

                const webglResult: WebGLResult = webglProgram(webglParams);  // <--- this name sucks... maybe runWebGL , runEncryptGL


                if (webglResult?.resources) {
                    // store webgl resources inside a ref instead of state because it protects it persists across re renders
                    // update webgl resources 
                    webGlResources.current = webglResult.resources;
                }

                if (webglResult?.error) {
                    setWebglError(webglResult?.error);
                }
            }

        }
    }

    const cleanUpWebGL = () => {

        if (!outputCanvas.current || !webGlResources.current) return;

        const resources = webGlResources.current;

        let gl: WebGL2RenderingContext | null = null


        gl = outputCanvas.current.getContext("webgl2", { preserveDrawingBuffer: true });

        if (!gl) return;


        if (resources.program) {
            gl.deleteProgram(resources.program);
        }
        if (resources.vertexShader) {
            gl.deleteShader(resources.vertexShader);
        }
        if (resources.fragmentShader) {
            gl.deleteShader(resources.fragmentShader);
        }
        if (resources.vertexBuffer) {
            gl.deleteBuffer(resources.vertexBuffer);
        }
        if (resources.indexBuffer) {
            gl.deleteBuffer(resources.indexBuffer);
        }
        if (resources.texture) {
            gl.deleteTexture(resources.texture);
        }

        // Optionally clear the canvas too
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };


    return {
        runEncryptGL, cleanUpWebGL,  
        drawFlag, setDrawFlag,
        animationComplete, setAnimationComplete,
        webglError, setWebglError

    }
}