#version 300 es

precision highp float;
in vec2 a_particleUV;

uniform sampler2D u_positions;
uniform vec2 u_canvasSize;

out float v_screenX;

void main() {
  vec4 posData = texture(u_positions, a_particleUV);

  vec2 pos = posData.xy;
  vec2 normalizedPos = (pos / u_canvasSize) * 2.0 - 1.0;
  normalizedPos.y = -normalizedPos.y;  // Flip Y axis
  gl_Position = vec4(normalizedPos, 0.0, 1.0);
  gl_PointSize = 2.0;

  v_screenX = pos.x / u_canvasSize.x;
}
