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

  float parallaxStrength = 0.06;

  vec2 mouseNorm = u_mousePos / u_canvasSize;
  vec2 mouseOffset = (0.5 - mouseNorm) * parallaxStrength * z;

  float time = u_time * 0.0002;

  float waveX = sin(time * 1.3 + particlePos.x * 10.0) * 0.005;
  float waveY = sin(time * 1.7 + particlePos.y * 15.0 + 1.0) * 0.005;

  vec2 timeOffset = vec2(waveX, waveY) * z;
  vec2 pos = (particlePos + mouseOffset + timeOffset) * 2.0 - 1.0;

  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = mix(0.5, 1.2, z);
}
