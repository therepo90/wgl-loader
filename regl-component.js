import regl from "regl";
//import regl from "https://npmcdn.com/regl@2.1.0/dist/regl.min.js"; // todo for prod use this in index.prod html
// currently its 30kb minified. Could be reduced.

export class ReglComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}); //todo check mode

        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        /*canvas { width: 800px; height: 600px; }*/
        canvas {border: 1px solid black; margin: 0 auto;display: block;}
      </style>
      <canvas id="regl-canvas" width="800px" height="600px"></canvas> 
    `; // @TODO widths etc
        this.mouse = { x: 0, y: 0 }; // Initial mouse position
        this.startTime = Date.now();
        this.setupRegl();
        this.setupMouseListeners();
    }

    setupRegl() {
        const canvas = this.shadowRoot.getElementById('regl-canvas');
        const reglInstance = regl(canvas);

        const vertexShaderSource = require('./vertex.glsl');

        const fragmentShaderSource = require('./fragment.glsl');

        const drawRect = reglInstance({
            frag: fragmentShaderSource,
            vert: vertexShaderSource,
            attributes: {
                position: [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1], // Full-screen rectangle

            },
            uniforms: {
                iResolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
                mouse: ({}, props, batchId) => [this.mouse.x, this.mouse.y],
                iTime: ({ time }) => (time - this.startTime) / 1000.0, // Time in seconds
            },
            count: 6,
        });

        reglInstance.frame(({time, drawingBufferWidth, drawingBufferHeight}) => {
            reglInstance.clear({
                color: [0, 0, 0, 1],
            });

            // Set the mouse coordinates as a prop for the shader
            drawRect();
        });
    }
    setupMouseListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX / window.innerWidth;
            this.mouse.y = 1.0 - event.clientY / window.innerHeight;
        });
    }
}
