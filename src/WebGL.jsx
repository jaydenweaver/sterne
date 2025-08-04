import { useRef, useEffect, useState } from 'react';
import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';

function compileShader(gl,type, source) {
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

function createProgram(gl, vertSource, fragSource) {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
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

function initParticles(particleCount, canvas) {
  const initialPositions = new Float32Array(particleCount * 4);
    for(let i = 0; i < particleCount; i++) {
      initialPositions[i * 4] = Math.random() * canvas.width;
      initialPositions[i * 4 + 1] = Math.random() * canvas.height;
      initialPositions[i * 4 + 2] = 0;
      initialPositions[i * 4 + 3] = 0;
    }
  return initialPositions;
}

function renderParticles(gl, particleCount) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, particleCount);
}

function generateParticleUV(textureWidth, textureHeight) {
  const particleCount = textureWidth * textureHeight;
  const uv = new Float32Array(particleCount * 2);

  for (let y = 0; y < textureHeight; y++) {
    for (let x = 0; x < textureWidth; x++) {
      const i = y * textureWidth + x;
      uv[i * 2] = x / textureWidth;
      uv[i * 2 + 1] = y / textureHeight;
    }
  }
  return uv;
}

export default function WebGLCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y:0.5 });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const gl = canvas.getContext('webgl2');
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    if (!gl) {
      console.error("webgl2 not supported!");
      return;
    }
    
    const vertexShaderSource = vertexShader;
    const fragmentShaderSource = fragmentShader;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const textureWidth = 256;
    const textureHeight = 256;
    const particleCount = textureWidth * textureHeight;
    const uvData = generateParticleUV(textureWidth, textureHeight);
    
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);
    
    const uvAttribLocation = gl.getAttribLocation(program, 'a_particleUV');
    gl.enableVertexAttribArray(uvAttribLocation);
    gl.vertexAttribPointer(uvAttribLocation, 2, gl.FLOAT, false, 0, 0);

    let initialPositions = initParticles(particleCount, canvas);

    const positionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, positionTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      textureWidth,
      textureHeight,
      0,
      gl.RGBA,
      gl.FLOAT,
      initialPositions  
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    const posTexLoc = gl.getUniformLocation(program, 'u_positions');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, positionTexture);
    gl.uniform1i(posTexLoc, 0); // texture unit 0

    const canvasSizeLoc = gl.getUniformLocation(program, 'u_canvasSize');
    gl.uniform2f(canvasSizeLoc, canvas.width, canvas.height);
    
    gl.clearColor(0, 0, 0, 1);
  
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);   
    const startTime = Date.now();
    let frameId;
    function renderFrame() {
      const time = Date.now() - startTime;
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      gl.uniform1f(timeLoc, time);

      const mousePosLoc = gl.getUniformLocation(program, 'u_mousePos');
      const mouse = mouseRef.current;
      gl.uniform2f(mousePosLoc, mouse.x * canvas.width, mouse.y * canvas.height);
     
      renderParticles(gl, particleCount);
      frameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    };
  };

  return <canvas ref={canvasRef} style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'block',
    zIndex: 0,
  }} onMouseMove={handleMouseMove} />;
}
