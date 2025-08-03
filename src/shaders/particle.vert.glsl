attribute vec2 position;

void main() {
  gl_PointSize = 10.0;
  gl_Position = vec4(position, 0, 1);
}
