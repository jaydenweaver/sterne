#version 300 es

precision highp float;

in float v_screenX;
in float v_screenY;
in float z;
out vec4 fragColor;

uniform vec2 u_mousePos;
uniform float u_time;

void main() {
  float alpha = mix(0.4, 1.0, z);
  fragColor = vec4(1.0, 1.0, 1.0, alpha);
}
