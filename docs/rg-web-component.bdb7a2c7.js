parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"YgXc":[function(require,module,exports) {
module.exports = `#version 100
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 iResolution;
uniform float iTime; // seconds
uniform vec2 iMouse;

#include "fragment.glsl"

void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`
},{}],"yQI2":[function(require,module,exports) {
module.exports = `
float sdSphere( vec3 p, float s ) // s -radius
{
    return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

#define OBJ_CNT 3

vec3 palette(float t) {
    return .5+.5*cos(6.28318*(t+vec3(.3,.416,.557)));
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
    return mix(a, b, h) - k*h*(1.0-h);
}

float sminArr(float values[OBJ_CNT], float k) {
    float result = values[0];

    for (int i = 1; i < OBJ_CNT; i++) {
        result = smin(result, values[i], k);
    }

    return result;
}


mat2 rot2D(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

// Scene distance
float map(vec3 p, out vec3 col1, out vec3 col2, out vec3 col3) {


    //vec3 sp1Pos = vec3(-3.0,.0,.0);
    vec3 boxPos2 = vec3(-1.6,.0,.0);
    vec3 q1 = p;
    q1.xy*=rot2D(iTime*2.);
    float sp1 = sdBox(q1-boxPos2,vec3(.75));


    vec3 cube1Tint = vec3(1.0,.0,.0);
    col1 = cube1Tint * max(0., 1.-sp1);

    vec3 sp2Pos = vec3(sin(iTime*2.4)*1.7,.0,.0);
    //sp2Pos.xy*=rot2D(iTime);
    // vec3 q3 = q2.xy*=rot2D(-iTime*2.);
    // We are moving the origin, not the sphere. THe pixel thinks as if it was placed somewhere else.
    float sp2 = sdSphere(p-sp2Pos, 1.2);
    vec3 spTint = vec3(0.0,1.0,.0);
    col2 = spTint * max(0.,1.-sp2);



    vec3 boxPos = vec3(1.6,0.0,0.);

    vec3 q2 = p;

    //q2.xy*=rot2D(-iTime*2.);

    q2.yz*=rot2D(-iTime*2.);
    float box=sdBox(q2-boxPos,vec3(.75));

    vec3 cube2Tint = vec3(0.0,0.0,1.0);
    col3 = cube2Tint * max(0.,1.-box); // dont go into negative colors

    float objs[OBJ_CNT];
    objs[0]=sp1;
    objs[1]=sp2;
    objs[2]=box;
    float result = sminArr(objs, 0.5);

    return result;
}
float smoothstep3(float edge0, float edge1, float edge2, float x) {
    return clamp((smoothstep(edge0, edge1, x) - smoothstep(edge1, edge2, x)), 0.0, 1.0);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;



    vec2 mouse = (iMouse.xy - 0.5 * iResolution.xy) / (0.5 * iResolution.y);
    vec2 dir = normalize(uv - mouse);
    float d = distance(mouse, uv);
    float p = 0.2 * (1.0 / (d * d));
   // if(length(mouse)<.98){
        uv=+mix(uv, mouse, p);
    uv.xy*=rot2D(iTime);
   // }
    // Initialization

    float fff = 2.2;
    vec3 ro = vec3(0, 0, -3);         // ray origin
    vec3 rd = normalize(vec3(uv*fff, 1)); // ray direction
    vec3 col = vec3(0);               // final pixel color

    float t = 0.; // total distance travelled

    // Raymarching
    vec3 col1,col2,col3;
    for (int i = 0; i < 80; i++) {
        vec3 p = ro + rd * t;     // position along the ray

        float d = map(p, col1, col2, col3);         // current distance to the scene

        t += d;                   // "march" the ray

        if (d < .001) break;      // early stop if close enough
        if (t > 100.) break;      // early stop if too far
    }

    // Coloring
    //col = vec3(t * .2);           // color based on distance
    // t can be very big hence its white
    //col=vec3(1.0);

    //col+=col1*t;
    //col=col1;
    col+=(col1 + col2 + col3)*t*.3;

    vec3 bgTint = vec3(1.);
    vec3 bg = vec3(0.);
    float circR = 1.1;
    float edge0 = 0.45;
    float edgeInner = 0.51;
    float edgeOuter = 0.53;

    //uv+=sin(iTime)*0.1;
    vec3 perimeterTint = vec3(0.506,0.871,0.996);
    float bgVal = 1.-smoothstep(edgeInner,edgeOuter, length(uv)/circR);
    float perimeter = smoothstep3(edge0, edgeInner, edgeOuter, length(uv)/circR);
    perimeter*=abs(0.6+ sin(iTime*2.)*sin(iTime*2.)*1.3);
    //bgVal+=smoothstep(edgeInner,edgeOuter, length(uv)/circR) ;
    bg=bgVal*bgTint * (step(100.,t));//*abs(0.6+ sin(iTime)*sin(iTime)*1.3);
    //bg+=obwod*10.;
    //col+=bg;// * (step(100.,t)); // not hit - show bg
    col+=perimeter * perimeterTint;

    float alpha = 1.;
    alpha = (1.-smoothstep(edgeInner, edgeOuter, length(uv)/circR))* (1.-step(100.,t)) + perimeter; // transparent bg outside circle and inner
    //col += vec3(alpha) *.4;
    //col = vec3(alpha);
    //col = vec3(bgVal);
    //fragColor = vec4(col, 1.);
    //fragColor = vec4(vec3(perimeter), 1.);
    fragColor = vec4(col, alpha);
    //fragColor= vec4(vec3(d),1.);
}
`
},{}],"F2K0":[function(require,module,exports) {
module.exports = `attribute vec2 a_position;

uniform vec2 iResolution;
uniform float iTime; // seconds
uniform vec2 iMouse;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`
},{}],"oVML":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.RgWebComponent=void 0;class e extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){console.log("connected");const e=this.getBoundingClientRect().width,t=this.getBoundingClientRect().height;this.shadowRoot.innerHTML=`\n            <style>\n                :host { display: block; width: 100%; height: 100%; }\n            </style>\n            <canvas id="rg-wgl-loader-canvas" width="${e}px" height="${t}px"></canvas>\n        `,this.mouse={x:0,y:0},this.startTime=Date.now(),this.setupWebGL(),this.setupMouseListeners()}setupWebGL(){const e=this.shadowRoot.getElementById("rg-wgl-loader-canvas"),t=e.getContext("webgl");if(!t)return void console.error("Unable to initialize WebGL. Your browser may not support it.");let o=require("./fragment-main.glsl");o=o.replace('#include "fragment.glsl"',require("./fragment.glsl"));const r=require("./vertex.glsl"),n=o,i=this.compileShader(t,t.VERTEX_SHADER,r),a=this.compileShader(t,t.FRAGMENT_SHADER,n);if(!i||!a)return void console.error("Shader compilation failed.");const s=this.createProgram(t,i,a);if(!s)return void console.error("Shader program linking failed.");const l=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,l);const c=new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,1,1,-1]);t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.useProgram(s);const d=t.getAttribLocation(s,"a_position");if(-1===d)return void console.error("Unable to get attribute location for a_position");t.enableVertexAttribArray(d),t.bindBuffer(t.ARRAY_BUFFER,l),t.vertexAttribPointer(d,2,t.FLOAT,!1,0,0);const g=t.getUniformLocation(s,"iResolution"),h=t.getUniformLocation(s,"iMouse"),u=t.getUniformLocation(s,"iTime");if(null===g||null===u)return void console.error("Unable to get uniform location(s)");t.uniform2f(g,e.width,e.height);const m=()=>{t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.uniform2f(h,this.mouse.x,this.mouse.y),t.uniform1f(u,(Date.now()-this.startTime)/1e3),t.drawArrays(t.TRIANGLES,0,6)},f=()=>{m(),requestAnimationFrame(f)};f()}compileShader(e,t,o){const r=e.createShader(t);return e.shaderSource(r,o),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(`Error compiling shader: ${e.getShaderInfoLog(r)}`),e.deleteShader(r),null)}createProgram(e,t,o){const r=e.createProgram();return e.attachShader(r,t),e.attachShader(r,o),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS)?r:(console.error(`Unable to initialize the shader program: ${e.getProgramInfoLog(r)}`),null)}setupMouseListeners(){const e=this.shadowRoot.getElementById("rg-wgl-loader-canvas");document.addEventListener("mousemove",t=>{const o=e.getBoundingClientRect();this.mouse.x=t.clientX-o.left,this.mouse.y=o.height-(t.clientY-o.top),console.log(this.mouse)})}}exports.RgWebComponent=e,customElements.define("rg-wgl-loader",e);
},{"./fragment-main.glsl":"YgXc","./fragment.glsl":"yQI2","./vertex.glsl":"F2K0"}]},{},["oVML"], null)