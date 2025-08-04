#version 300 es

precision highp float;
in vec2 a_particleUV;

uniform sampler2D u_positions;
uniform sampler2D u_targets;
uniform vec2 u_canvasSize;
uniform vec2 u_mousePos;
uniform float u_time;

out float z;

float customEase(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec4 currentPos = texture(u_positions, a_particleUV);
  vec4 targetPos = texture(u_targets, a_particleUV);

  z = currentPos.z;

  float t = clamp(u_time * 0.001, 0.0, 1.0); 
  float smoothedT = customEase(t);
  vec3 interpolated = mix(currentPos.xyz, targetPos.xyz, smoothedT);

  vec2 position = interpolated.xy / u_canvasSize * 2.0 - 1.0;
  position.y *= -1.0;

  gl_Position = vec4(position, interpolated.z, 1.0);
  gl_PointSize = mix(1.0, 3.0, z);
}
