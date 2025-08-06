#version 300 es

precision highp float;

in float v_screenX;
in float v_screenY;
in float z;
out vec4 fragColor;

uniform vec2 u_mousePos;
uniform float u_time;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  float alpha = mix(0.4, 1.0, z);

  float off = rand(vec2(gl_FragCoord.x, gl_FragCoord.y));
  float r   = mix(0.8, 1.0, off);
  float g = mix(0.8, 1.0, fract(off * 1.3));
  float b  = mix(0.8, 1.0, fract(off * 2.1));

  vec3 color = vec3(r, g, b);
  fragColor = vec4(color, alpha);
}
