attribute vec2 a_position;

uniform vec2 iResolution;
uniform float iTime; // seconds
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
