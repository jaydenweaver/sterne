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

function initParticles(particleCount) {
  const initialPositions = new Float32Array(particleCount * 4);
    for(let i = 0; i < particleCount; i++) {
      initialPositions[i * 4] = Math.random() * 1.2 - 0.1;
      initialPositions[i * 4 + 1] = Math.random() * 1.2 - 0.1;
      initialPositions[i * 4 + 2] = Math.random() ** 4;
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

function calculateParticleCount(density, width, height){
    return Math.ceil(Math.sqrt(density * width * height)) ** 2;
}

export default function WebGLCanvas() {
  const canvasRef = useRef(null);
  const smoothMouseRef = useRef({ x: 0.0, y: 0.0 });
  const targetMouseRef = useRef({ x: 0.0, y: 0.0 });
  const initialPositionsRef = useRef(null); 
  const particleCountRef = useRef(0);
  const textureSizeRef = useRef({ width: 0, height: 0 });
  const uvBufferRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particleDensity = 1.5 / 100; // 2 particles per 100 pixels^2
    particleCountRef.current = calculateParticleCount(particleDensity, canvas.width, canvas.height);

    const textureSize = Math.sqrt(particleCountRef.current);
    textureSizeRef.current = { width: textureSize, height: textureSize };
 
    if (!initialPositionsRef.current)
      initialPositionsRef.current = initParticles(particleCountRef.current);

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error("webgl2 not supported!");
      return;
    }
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    const vertexShaderSource = vertexShader;
    const fragmentShaderSource = fragmentShader;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const uvData = generateParticleUV(textureSizeRef.current.width, textureSizeRef.current.height);
    
    const uvBuffer = gl.createBuffer();
    uvBufferRef.current = uvBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);
    
    const uvAttribLocation = gl.getAttribLocation(program, 'a_particleUV');
    gl.enableVertexAttribArray(uvAttribLocation);
    gl.vertexAttribPointer(uvAttribLocation, 2, gl.FLOAT, false, 0, 0);
    
    const positionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, positionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const posTexLoc = gl.getUniformLocation(program, 'u_positions');
    gl.uniform1i(posTexLoc, 0); // texture unit 0

    function updateTextures() {
      const newParticleCount = particleCountRef.current;
      const { width: newTextureWidth, height: newTextureHeight } = textureSizeRef.current;

      const initialPositions = initialPositionsRef.current;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, positionTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32F,
        newTextureWidth,
        newTextureHeight,
        0,
        gl.RGBA,
        gl.FLOAT,
        initialPositions
      );
    }
  
    updateTextures();

    const canvasSizeLoc = gl.getUniformLocation(program, 'u_canvasSize');
    gl.uniform2f(canvasSizeLoc, window.innerWidth, window.innerHeight);
    
    gl.clearColor(0, 0, 0, 1);
  
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);   
    
    const lerp = (a, b, t) => a + (b - a) * t;

    const startTime = Date.now();
    let frameId;
    function renderFrame() {
      const time = Date.now() - startTime;
      const timeLoc = gl.getUniformLocation(program, 'u_time');
      gl.uniform1f(timeLoc, time);
      
      const lerpStrength = 0.02;
      smoothMouseRef.current.x = lerp(smoothMouseRef.current.x, targetMouseRef.current.x, lerpStrength);
      smoothMouseRef.current.y = lerp(smoothMouseRef.current.y, targetMouseRef.current.y, lerpStrength);

      const mousePosLoc = gl.getUniformLocation(program, 'u_mousePos');
      const mouse = smoothMouseRef.current;
      gl.uniform2f(mousePosLoc, mouse.x * canvas.width, mouse.y * canvas.height);
     
      renderParticles(gl, particleCountRef.current);
      frameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();
    
    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const canvasSizeLoc = gl.getUniformLocation(program, 'u_canvasSize');
      gl.uniform2f(canvasSizeLoc, canvas.width, canvas.height);
      
      const newParticleCount = calculateParticleCount(particleDensity, canvas.width, canvas.height);
      const textureSize = Math.ceil(Math.sqrt(newParticleCount));

      particleCountRef.current = textureSize * textureSize;
      textureSizeRef.current = { width: textureSize, height: textureSize };
      
      const newUVs = generateParticleUV(textureSize, textureSize);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, newUVs, gl.STATIC_DRAW);

      updateTextures();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    targetMouseRef.current = {
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
