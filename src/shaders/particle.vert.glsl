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
  z = posData.z;

  float animationDuration = posData.w; // random duration in ms

  float parallaxStrength = 0.1;
  vec2 mouseNorm = u_mousePos / u_canvasSize;
  vec2 mouseOffset = (0.5 - mouseNorm) * parallaxStrength * z;

  float time = u_time * 0.0002;
  float waveStrength = 0.007;
  float waveX = sin(time * 1.3 + particlePos.x * 10.0);
  float waveY = sin(time * 1.7 + particlePos.y * 15.0 + 1.0);
  vec2 timeOffset = vec2(waveX, waveY) * z * waveStrength;

  vec2 fullPos = (particlePos + mouseOffset + timeOffset) * u_canvasSize;

  // t goes from 0 to 1 depending on that particle's duration
  float t = clamp(u_time / animationDuration, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t); // ease-out

  vec2 center = u_canvasSize * 0.5;
  vec2 animatedPos = mix(center, fullPos, t);
  vec2 pos = (animatedPos / u_canvasSize) * 2.0 - 1.0;

  gl_Position = vec4(pos, 0.0, 1.0);
  gl_PointSize = mix(0.5, 1.5, z);
}
