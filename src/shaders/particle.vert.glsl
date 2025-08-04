#version 300 es

precision highp float;
in vec2 a_particleUV;

uniform sampler2D u_positions;
uniform vec2 u_canvasSize;
uniform vec2 u_mousePos;

out float z;

void main() {
  vec4 posData = texture(u_positions, a_particleUV);
  vec3 pos = posData.xyz;
  
  vec2 mouseOffset = (u_mousePos - 0.5) * 2.0; // convert to [-1, 1] bounds from [0 ,1] 

  z = pos.z;

  vec2 parallaxShift = mouseOffset * z * 0.03;
  
  vec2 normalizedPos = ((pos.xy + parallaxShift) / u_canvasSize) * 2.0 - 1.0;
  normalizedPos.y = -normalizedPos.y;    
  gl_Position = vec4(normalizedPos, 0.0, 1.0);
  gl_PointSize = mix(1.0, 3.0, z);
}
