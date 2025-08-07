import { useRef, useEffect, useState } from 'react';
import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';
import glowVertexShader from './shaders/glow.vert.glsl?raw';
import glowFragmentShader from './shaders/glow.frag.glsl?raw';

function compileShader(gl,type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("error compiling shader!", gl.getShaderInfoLog(shader));
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
    initialPositions[i * 4 + 3] = 500.0 + Math.random() * 1500.0;
  }
  return initialPositions;
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

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error("webgl2 not supported!");
      return;
    }
    gl.enable(gl.PROGRAM_POINT_SIZE);
    const particleDensity = 1.5 / 100;
    particleCountRef.current = calculateParticleCount(particleDensity, canvas.width, canvas.height);
    const textureSize = Math.sqrt(particleCountRef.current);
    textureSizeRef.current = { width: textureSize, height: textureSize };

    if (!initialPositionsRef.current)
      initialPositionsRef.current = initParticles(particleCountRef.current);

    const starProgram = createProgram(gl, vertexShader, fragmentShader);
    const glowProgram = createProgram(gl, glowVertexShader, glowFragmentShader);

    const uvData = generateParticleUV(textureSizeRef.current.width, textureSizeRef.current.height);
    const uvBuffer = gl.createBuffer();
    uvBufferRef.current = uvBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);

    const positionTexture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, positionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      textureSizeRef.current.width,
      textureSizeRef.current.height,
      0,
      gl.RGBA,
      gl.FLOAT,
      initialPositionsRef.current
    );

    const lerp = (a, b, t) => a + (b - a) * t;
    const startTime = Date.now();
    let frameId;

    function renderFrame() {
      const time = Date.now() - startTime;
      const lerpStrength = 0.015;
      smoothMouseRef.current.x = lerp(smoothMouseRef.current.x, targetMouseRef.current.x, lerpStrength);
      smoothMouseRef.current.y = lerp(smoothMouseRef.current.y, targetMouseRef.current.y, lerpStrength);
      const mouse = smoothMouseRef.current;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.02,0.02,0.02,1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const drawPass = (program) => {
        gl.useProgram(program);
        const attribLocation = gl.getAttribLocation(program, 'a_particleUV');
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferRef.current);
        gl.enableVertexAttribArray(attribLocation);
        gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1i(gl.getUniformLocation(program, 'u_positions'), 0);
        gl.uniform2f(gl.getUniformLocation(program, 'u_mousePos'), mouse.x * canvas.width, mouse.y * canvas.height);
        gl.uniform2f(gl.getUniformLocation(program, 'u_canvasSize'), canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);

        gl.drawArrays(gl.POINTS, 0, particleCountRef.current);
      };

      gl.enable(gl.BLEND);

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      drawPass(glowProgram);
      drawPass(starProgram);

      frameId = requestAnimationFrame(renderFrame);
    }
    renderFrame();

    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const newParticleCount = calculateParticleCount(particleDensity, canvas.width, canvas.height);
      const textureSize = Math.ceil(Math.sqrt(newParticleCount));
      particleCountRef.current = textureSize * textureSize;
      textureSizeRef.current = { width: textureSize, height: textureSize };
      const newUVs = generateParticleUV(textureSize, textureSize);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, newUVs, gl.STATIC_DRAW);
      gl.viewport(0, 0, canvas.width, canvas.height);
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
