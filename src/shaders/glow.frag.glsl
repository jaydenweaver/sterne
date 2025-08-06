#version 300 es
precision highp float;
in float z;
out vec4 fragColor;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  float falloff = smoothstep(0.5, 0.0, dist);
  float alpha = falloff * 0.09 * z;
  vec3 glowColor = vec3(1.0, 0.95, 0.8); // soft warm glow

  fragColor = vec4(glowColor, alpha);
}
