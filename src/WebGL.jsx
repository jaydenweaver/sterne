import { useRef, useEffect } from 'react';
import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';

export default function WebGLCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const gl = canvasRef.current.getContext('webgl');
    if (!gl) {
      console.error("webgl not supported!");
      return;
    }
    const vertexShaderSource = vertexShader;
    const fragmentShaderSource = fragmentShader;

    function compileShader(type, source) {
      const shader = gl.createShader(type);

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("error compiling shader!");
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function createProgram(vertSource, fragSource) {
      const vertShader = compileShader(gl.VERTEX_SHADER, vertSource);
      const fragShader = compileShader(gl.FRAGMENT_SHADER, fragSource);
      const program = gl.createProgram();

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("program link failed!:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }

      return program;
    }

    const program = createProgram(vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const positions = new Float32Array([0, 0]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);

  }, []);

  return <canvas ref={canvasRef} width={800} height={600}/>;
}
