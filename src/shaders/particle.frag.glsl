#version 300 es

precision highp float;

in float v_screenX;
out vec4 fragColor;

void main() {
  fragColor = vec4(v_screenX, 0.0, 1.0 - v_screenX, 1.0);
}
