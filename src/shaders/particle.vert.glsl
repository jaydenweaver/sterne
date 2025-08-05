#version 300 es

precision highp float;
in vec2 a_particleUV;

uniform sampler2D u_positions;
uniform vec2 u_canvasSize;
uniform vec2 u_mousePos;
uniform float u_time;

out float z;

void main() {
  vec4 posData = texture(u_positions, a_particleUV);
  vec2 particlePos = posData.xy;
  float z = posData.z;

  float parallaxStrength = 0.05;

  vec2 mouseNorm = u_mousePos / u_canvasSize;
  vec2 offset = (0.5 - mouseNorm) * parallaxStrength * z;

  vec2 pos = (particlePos + offset) * 2.0 - 1.0;
  pos.y = -pos.y;

  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = mix(1.0, 3.0, z);
}
