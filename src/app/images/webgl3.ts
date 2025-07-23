//@TODO // this import needs to get integrated in MagicCypher Class
import { traverseSquare } from "@/util/generateLookUpTexture"; 

interface WebGLResources {
  program: WebGLProgram | undefined;
  vertexShader: WebGLShader | undefined;
  fragmentShader: WebGLShader | undefined;
  vertexBuffer: WebGLBuffer | undefined; // For combined positions and texCoords
  texture: WebGLTexture | undefined; // Main image texture
  magicMapTexture: WebGLTexture | undefined; // Lookup texture
}

interface WebGLResult {
  error: string;
  code: string;
  resources: WebGLResources;
}

export interface WebGLParams{
  gridPartitions:number,
  outputCanvas: React.RefObject<HTMLCanvasElement | null> 
  glCtx:WebGL2RenderingContext,
  imgData:ImageData,
  width:number,
  height:number,
  lookupTexture:Float32Array;
}

export const webglProgram = (
  webglParams:WebGLParams
): WebGLResult => {
  const webGLResult: WebGLResult = {
    error: "",
    code: "",
    resources: {
      program: undefined,
      vertexShader: undefined,
      fragmentShader: undefined,
      vertexBuffer: undefined, 
      texture: undefined,
      magicMapTexture: undefined,
    },
  };

  // grid partions for an NxN grid
  const N = webglParams.gridPartitions; 
  // output canvas (where to draw the image)
  const canvas = webglParams.outputCanvas;  
  // gl rendering context
  const gl = webglParams.glCtx;

  // image data object of our lookup texture (what the fragment shader samples from)
  const img = webglParams.imgData;
  // image dimension
  const height = webglParams.height; 
  const width = webglParams.width;

  // u_magicMap lookup texture (tells webgl fragment shader where to sample from)
  const lookUpData = webglParams.lookupTexture; 

  // keep track of how long it takes webgl to draw. 
  const programStartTime = performance.now();

  // ***********************************************************************
  // 1) CONTEXT, CANVAS, AND ERROR HANDLING SETUP

  if (!gl) {
    webGLResult.error = "WebGL2 not supported by this browser.";
    return webGLResult;
  }

  // Handle context loss (optional, but good practice for robustness)
  canvas.current?.addEventListener("webglcontextlost", (event) => {
    webGLResult.error = "WebGL context lost. " + event;
    event.preventDefault(); // Prevent default browser behavior
    // In a real app, you'd re-initialize everything here.
  });

  if (canvas.current) {
    canvas.current.width = width;
    canvas.current.height = height;
  } else {
    webGLResult.error = "Canvas element not found.";
    return webGLResult;
  }

  // ***********************************************************************
  // 2) SHADER SOURCE CODES

  // Vertex Shader: Passes position and texture coordinates directly.
  // The 'a_position' represents the clip-space coordinates of the quad.
  // The 'a_texCoord' represents the UV coordinates (0-1) for the entire quad.
  const vertexShaderSource = `#version 300 es
  precision mediump float;

  in vec2 a_position;
  in vec2 a_texCoord;

  out vec2 v_texCoord;

  void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }`;

  // u_mapMapTexture for u_N = 3; 
  // [  0,1  ] , [ 1/3,1  ] ,  [2/3 , 1  ]
  // [ 0,2/3 ] , [ 1/3, 2/3] , [2/3 , 2/3]
  // [ 0, 1/3] , [ 1/3 , 1/3] ,[2/3 , 1/3]

/*
  WebGL texelFetch() - Coordinate System Overview
  -----------------------------------------------

  In WebGL / OpenGL, texelFetch(ivec2(x, y), ...) uses
  integer coordinates where (0, 0) refers to the **bottom-left**
  texel of the texture.

  For a 2×2 texture laid out in memory like this:

      y=1        [1] [2]     ← top row
      y=0        [3] [4]     ← bottom row
                 x=0 x=1

  texelFetch(x, y) returns:
    texelFetch(0, 0) → [3]   // bottom-left
    texelFetch(1, 0) → [4]
    texelFetch(0, 1) → [1]
    texelFetch(1, 1) → [2]

     To use a top-left origin instead (like typical 2D image logic),
     flip the row index:  flippedY = height - 1 - y
*/


  // Fragment Shader: Samples from two textures to create the animated tile effect.
  
// gltich with randomized delayoffset
const fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texCoord;

uniform float u_time;
uniform float u_animationDuration;
uniform float u_tileTransitionDuration;
uniform int u_N;

uniform sampler2D u_imageTexture;
uniform sampler2D u_magicMapTexture;

out vec4 outputColor;

void main() {
  float tileSize = 1.0 / float(u_N);

  // Compute tile coordinates
  int row = int(floor(v_texCoord.y / tileSize));
  int col = int(floor(v_texCoord.x / tileSize));
  int flippedRow = u_N - 1 - row;

  // Fetch per-tile metadata
  vec4 tileData = texelFetch(u_magicMapTexture, ivec2(col, flippedRow), 0);
  vec2 tileOrigin = tileData.rg;
  float delayOffset = tileData.b;
  float glitchSeed = tileData.a;

  // Compute local offset
  float originalTileOrigin_V = 1.0 - float(flippedRow) * tileSize;
  float originalTileOrigin_U = float(col) * tileSize;
  float localOffset_u = v_texCoord.x - originalTileOrigin_U;
  float localOffset_v = originalTileOrigin_V - v_texCoord.y;

  // Compute remapped UV
  vec2 originalUV = v_texCoord;
  vec2 remappedUV = vec2(tileOrigin.r + localOffset_u, tileOrigin.g - localOffset_v);

  // Per-tile delay logic
  float tileStartTime = delayOffset * u_animationDuration;
  float t = clamp((u_time - tileStartTime) / u_tileTransitionDuration, 0.0, 1.0);
  float easedT = t * t * (3.0 - 2.0 * t); // smoothstep easing
  vec2 baseUV = mix(originalUV, remappedUV, easedT);

  float glitchType = glitchSeed * 4.0;
  vec2 glitchOffset = vec2(0.0);

  if (glitchType < 1.0) {
    glitchOffset = vec2(0.01, 0.0);  // right
  } else if (glitchType < 2.0) {
    glitchOffset = vec2(-0.01, 0.0); // left
  } else if (glitchType < 3.0) {
    glitchOffset = vec2(0.0, 0.01);  // up
  } else {
    glitchOffset = vec2(0.0, -0.01); // down
  }

  // Optional: glitch "flicker" for intensity
  float flicker = step(0.5, fract(sin(u_time * 0.01 + glitchType * 17.0) * 43758.5453));
  glitchOffset *= flicker;

  // Stop glitch once animation is complete
  bool isFinished = easedT >= 1.0;

  vec2 rUV = baseUV + glitchOffset;
  vec2 gUV = baseUV - glitchOffset * 0.5;
  vec2 bUV = baseUV + glitchOffset.yx * 0.75;

  float r = texture(u_imageTexture, isFinished ? baseUV : rUV).r;
  float g = texture(u_imageTexture, isFinished ? baseUV : gUV).g;
  float b = texture(u_imageTexture, isFinished ? baseUV : bUV).b;

  outputColor = vec4(r, g, b, 1.0);
}
`;


  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    webGLResult.error = "Failed to create shader objects.";
    return webGLResult;
  }

  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) {
    webGLResult.error = "EXT_color_buffer_float not supported!";
    return webGLResult;
  }

  // Compile Vertex Shader
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    webGLResult.error =
      gl.getShaderInfoLog(vertexShader) || "Vertex shader compilation error";
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return webGLResult;
  }

  // Compile Fragment Shader
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    webGLResult.error =
      gl.getShaderInfoLog(fragmentShader) || "Fragment shader compilation error";
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return webGLResult;
  }

  // Create and Link Program
  const program = gl.createProgram();
  if (!program) {
    webGLResult.error = "Failed to create WebGL program.";
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return webGLResult;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    webGLResult.error = gl.getProgramInfoLog(program) || "Program linking error";
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return webGLResult;
  }

  gl.useProgram(program); // Activate this program

  // ***********************************************************************
  // 4) BUFFER SETUP (Combined Positions and Texture Coordinates)

  // Define a single array containing interleaved position (x,y) and texture (u,v) data
  // Each vertex is 4 floats (2 for position, 2 for texCoord)
  const positionsAndTexCoords = new Float32Array([
    // x,   y,   u,   v
    -1.0,  1.0, 0, 1, // top left
     1.0,  1.0, 1, 1, //top right
    -1.0, -1.0, 0, 0,  // bottom left

     1.0,  1.0, 1, 1, //top right
    -1.0, -1.0, 0, 0,  // bottom left
    1.0,  -1.0, 1.0, 0 // bottom right    
  ]);


  // Create a Vertex Array Object (VAO) to encapsulate buffer states
  const vao = gl.createVertexArray();
  if (!vao) {
    webGLResult.error = "Failed to create VAO.";
    return webGLResult;
  }
  gl.bindVertexArray(vao); // Bind VAO for subsequent buffer/attribute setup

  // Create and bind the combined vertex buffer
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    webGLResult.error = "Failed to create vertex buffer.";
    gl.deleteVertexArray(vao);
    return webGLResult;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionsAndTexCoords, gl.STATIC_DRAW);

  // ***********************************************************************
  // 5) ATTRIBUTE POINTERS (for the VAO)

  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aTexCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  if (aPositionLocation < 0 || aTexCoordLocation < 0) {
    webGLResult.error = "Failed to get attribute locations.";
    // Clean up resources already created
    gl.deleteBuffer(vertexBuffer);
    // gl.deleteBuffer(indexBuffer);
    gl.deleteVertexArray(vao);
    return webGLResult;
  }

  const stride = (2 + 2) * Float32Array.BYTES_PER_ELEMENT; // 2 floats (pos) + 2 floats (tex) = 4 floats * 4 bytes/float = 16 bytes

  // Position attribute
  gl.enableVertexAttribArray(aPositionLocation);
  gl.vertexAttribPointer(aPositionLocation,
    2,                   // size (2 components: x, y)
    gl.FLOAT,            // type
    false,               // normalize
    stride,              // stride (bytes between vertices)
    0);                  // offset (bytes from start of vertex)

  // Texture coordinate attribute
  gl.enableVertexAttribArray(aTexCoordLocation);
  gl.vertexAttribPointer(aTexCoordLocation,
    2,                   // size (2 components: u, v)
    gl.FLOAT,            // type
    false,               // normalize
    stride,              // stride
    2 * Float32Array.BYTES_PER_ELEMENT); // offset (2 floats = 8 bytes after position)

  // ***********************************************************************
  // 6) TEXTURE SETUP
  // --- Main Image Texture (u_imageTexture) ---
  const texture = gl.createTexture();
  if (!texture) {
    webGLResult.error = "Failed to create main image texture.";
    return webGLResult;
  }
  gl.activeTexture(gl.TEXTURE0); // Activate texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Crucial: Flip the Y-axis for standard image data (top-left origin) to WebGL's (bottom-left origin)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); // Use img directly (ImageData)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // --- Magic Map Texture (u_magicMapTexture) ---
  // const lookUpData = generateLookUpTexture(N); // Get the identity lookup data
  // const lookUpData = traverseSquare(N);
  // const lookUpData = createLookUpTex(N);  


//   const res = []
// for (let i = 0; i < lookUpData.length; i += 4) {
//   const u = lookUpData[i];     // R channel
//   const v = lookUpData[i + 1]; // G channel
//   res.push(`tile ${i / 4}: u = ${u.toFixed(3)}, v = ${v.toFixed(3)}`);
// }
// console.log("Lookup texture contents:");
// console.log(res.join("\n"));
// console.log("N value passed to generateLookUpTexture:", N);
// console.log("Raw Float32Array:", lookUpData);

  const magicMapTexture = gl.createTexture();
  if (!magicMapTexture) {
    webGLResult.error = "Failed to create lookup texture";
    return webGLResult;
  }

  gl.activeTexture(gl.TEXTURE1); // Activate texture unit 1
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.bindTexture(gl.TEXTURE_2D, magicMapTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // mip level
    gl.RGBA32F , // internal format: Two 32-bit float components (R for U, G for V)
    N, // width (N tiles)
    N, // height (N tiles)
    0, // border (must be 0)
    gl.RGBA, // format: Red, Green, Blue, Alpha channels
    gl.FLOAT, // type: Floating-point data
    lookUpData // Float32Array
  );
  // CRUCIAL: Set filtering for the lookup texture to NEAREST
  // We want to sample distinct (U,V) pairs for each conceptual tile/pixel of the lookup.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // ***********************************************************************
  // 7) UNIFORM BINDING (Program-level uniforms)

  // Get uniform locations
  const uImageTextureLocation = gl.getUniformLocation(program, "u_imageTexture");
  const uMagicMapTextureLocation = gl.getUniformLocation(program, "u_magicMapTexture");
  const uAnimationDurationLocation = gl.getUniformLocation(program, "u_animationDuration");
  const uNLocation = gl.getUniformLocation(program, "u_N"); // Note the 'u_' prefix in shader
  const uTimeLocation = gl.getUniformLocation(program, "u_time"); // Will be updated per frame

  if (!uImageTextureLocation || !uMagicMapTextureLocation || !uAnimationDurationLocation || !uNLocation || !uTimeLocation) {
    webGLResult.error = "Failed to get one or more uniform locations.";
    return webGLResult;
  }

  // Assign texture units to sampler uniforms
  gl.uniform1i(uImageTextureLocation, 0); // u_imageTexture samples from TEXTURE0
  gl.uniform1i(uMagicMapTextureLocation, 1); // u_magicMapTexture samples from TEXTURE1

  // Set constant uniforms
  const animationDuration = 3000; // 3 seconds
  gl.uniform1f(uAnimationDurationLocation, animationDuration);
  gl.uniform1i(uNLocation, N); // Pass the N grid size

  // ***********************************************************************
  // 8) DRAW LOOP AND ANIMATION

  gl.viewport(0, 0, width, height); // Set viewport to canvas size
  gl.clearColor(0.08, 0.08, 0.08, 1.0); // Set background clear color

  let startTime = performance.now(); // Record animation start time

  function draw(time: number) {
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear the color buffer

    // Update u_time uniform based on elapsed time
    gl.uniform1f(uTimeLocation, time - startTime);

    // Bind the VAO that contains all buffer and attribute settings
    gl.bindVertexArray(vao);
    // Draw the quad using indexed drawing
    gl.drawArrays(gl.TRIANGLES, 0 , 6);

    // Request next frame if animation is not complete
    if ((time - startTime) < animationDuration) {
      requestAnimationFrame(draw);
    } else {
      const elapsedTime = performance.now(); 
      console.log("Animation completed. Elapased Time: ", (elapsedTime - programStartTime)/1000 );
      // Optional: Set u_time to animationDuration to ensure final state is rendered accurately
      gl.uniform1f(uTimeLocation, animationDuration);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  requestAnimationFrame(draw); // Start the animation loop

  // ***********************************************************************
  // 9) RETURN RESOURCES

  webGLResult.resources.program = program;
  webGLResult.resources.vertexShader = vertexShader;
  webGLResult.resources.fragmentShader = fragmentShader;
  webGLResult.resources.vertexBuffer = vertexBuffer;
  // webGLResult.resources.indexBuffer = indexBuffer;
  webGLResult.resources.texture = texture;
  webGLResult.resources.magicMapTexture = magicMapTexture;

  return webGLResult;
};