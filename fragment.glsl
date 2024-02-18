#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 iResolution;
uniform float iTime; // seconds

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
    fragColor = vec4(uv, 0.0, 1.0);
}

void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);//, vUV * iResolution.xy);
}
