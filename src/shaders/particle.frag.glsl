#version 300 es

precision highp float;

in float v_screenX;
in float v_screenY;
out vec4 fragColor;

uniform vec2 u_mousePos;
uniform float u_time;

void main() {
  float dist = distance(gl_FragCoord.xy, u_mousePos);
  float alpha = 1.0;
  float t = smoothstep(0.0, 900.0, dist);
  vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.5, 1.0), t);
  float speed = 0.01;
  vec3 animatedColor = vec3(
    sin(u_time * speed + dist * 0.01),
    cos(u_time * speed + dist * 0.01),
    sin(u_time * speed * 0.5)
  );
  animatedColor = mix(color, animatedColor, 0.3);
  fragColor = vec4(animatedColor, alpha);
}
