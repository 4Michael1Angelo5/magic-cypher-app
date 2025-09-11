// webglProgram.ts 

export interface WebGLResources {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  vertexBuffer: WebGLBuffer;
  texture: WebGLTexture;
  magicMapTexture: WebGLTexture;
  vao: WebGLVertexArrayObject;
}

export interface WebGLResult {
  error: string;
  resources?: WebGLResources;
}

export interface WebGLParams {
//   setAnimationComplete: React.Dispatch<SetStateAction<boolean>>;
  gridPartitions: number;
  outputCanvas:  HTMLCanvasElement ;
  glCtx: WebGL2RenderingContext;
  imgData: ImageData;
  width: number;
  height: number;
  lookupTexture: Float32Array;
}

// --------------------
// Helpers
// --------------------

const fail = (msg: string): WebGLResult => ({ error: msg });

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function createVAO(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): { vao: WebGLVertexArrayObject; vertexBuffer: WebGLBuffer } | null {
  const vao = gl.createVertexArray();
  const vertexBuffer = gl.createBuffer();
  if (!vao || !vertexBuffer) return null;

  const positionsAndTexCoords = new Float32Array([
    -1.0,  1.0, 0, 1, // top left
     1.0,  1.0, 1, 1, // top right
    -1.0, -1.0, 0, 0, // bottom left
     1.0,  1.0, 1, 1, // top right
    -1.0, -1.0, 0, 0, // bottom left
     1.0, -1.0, 1, 0, // bottom right
  ]);

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionsAndTexCoords, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, "a_position");
  const aTexCoord = gl.getAttribLocation(program, "a_texCoord");

  const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
  const STRIDE = 4 * FLOAT_SIZE;

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, STRIDE, 0);

  gl.enableVertexAttribArray(aTexCoord);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, STRIDE, 2 * FLOAT_SIZE);

  return { vao, vertexBuffer };
}

function createTextureFromImage(
  gl: WebGL2RenderingContext,
  img: ImageData
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function createLookupTexture(
  gl: WebGL2RenderingContext,
  N: number,
  lookUpData: Float32Array
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, N, N, 0, gl.RGBA, gl.FLOAT, lookUpData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

// --------------------
// Main Orchestrator
// --------------------
export const webglProgram = (params: WebGLParams): WebGLResult => {
  const { glCtx: gl, gridPartitions: N, outputCanvas, imgData, width, height, lookupTexture } = params;

  if (!gl) return fail("WebGL2 not supported");
//   if (!outputCanvas.current) return fail("Canvas element not found");

  outputCanvas.width = width;
  outputCanvas.height = height;

  // Shaders
  const vertexShaderSource = `#version 300 es
    precision mediump float;
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
      v_texCoord = a_texCoord;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

  const fragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;
    uniform int u_N;
    uniform sampler2D u_imageTexture;
    uniform sampler2D u_magicMapTexture;
    out vec4 outputColor;
    void main() {
      float tileSize = 1.0 / float(u_N);
      int row = int(floor(v_texCoord.y / tileSize));
      int col = int(floor(v_texCoord.x / tileSize));
      int flippedRow = u_N - 1 - row;
      vec4 targetTileOrigin = texelFetch(u_magicMapTexture, ivec2(col, flippedRow), 0);
      float originalTileOrigin_V = 1.0 - float(flippedRow) * tileSize;
      float originalTileOrigin_U = float(col) * tileSize;
      float localOffset_u = v_texCoord.x - originalTileOrigin_U;
      float localOffset_v = originalTileOrigin_V - v_texCoord.y;
      vec2 remappedUV = vec2(targetTileOrigin.r + localOffset_u, targetTileOrigin.g - localOffset_v);
      outputColor = texture(u_imageTexture, remappedUV);
    }`;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return fail("Shader compilation failed");

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return fail("Program linking failed");
  gl.useProgram(program);

  const vaoBundle = createVAO(gl, program);
  if (!vaoBundle) return fail("Failed to create VAO");

  const texture = createTextureFromImage(gl, imgData);
  const magicMapTexture = createLookupTexture(gl, N, lookupTexture);
  if (!texture || !magicMapTexture) return fail("Texture creation failed");

  // Uniforms
  gl.uniform1i(gl.getUniformLocation(program, "u_imageTexture"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "u_magicMapTexture"), 1);
  gl.uniform1i(gl.getUniformLocation(program, "u_N"), N);

  // Draw
  gl.viewport(0, 0, width, height);
  gl.clearColor(0.08, 0.08, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindVertexArray(vaoBundle.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.finish()

  return {
    error: "",
    resources: {
      program,
      vertexShader,
      fragmentShader,
      vertexBuffer: vaoBundle.vertexBuffer,
      vao: vaoBundle.vao,
      texture,
      magicMapTexture,
    },
  };
};
