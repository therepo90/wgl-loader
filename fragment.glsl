precision mediump float;

uniform vec2 resolution;
uniform vec2 mouse;

void main() {
    // Use resolution and mouse uniforms for your calculations
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 color = vec3(uv, 0.0);
    // Use mouse position to modify color
    color += vec3(mouse, 0.0);
    gl_FragColor = vec4(color, 1.0);
}
