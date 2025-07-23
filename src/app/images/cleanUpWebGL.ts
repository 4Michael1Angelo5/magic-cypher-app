interface WebGLResources {
  program?: WebGLProgram;
  vertexShader?: WebGLShader;
  fragmentShader?: WebGLShader;
  vertexBuffer?: WebGLBuffer;
  indexBuffer?: WebGLBuffer;
  texture?: WebGLTexture;
}

export const cleanUpWebGL = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  resources: WebGLResources
) => {
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
