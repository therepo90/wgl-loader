import regl from "regl";
//import regl from "https://npmcdn.com/regl@2.1.0/dist/regl.min.js"; // todo for prod use this in index.prod html
// currently its 30kb minified. Could be reduced.

export class ReglComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'}); //todo check mode

        const width = "800px"; // @TODO parametrize
        const height = "600px";

        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; height: 100%;  }
        /*#regl-canvas { width: 100%; height: 100%; }*/
      </style>
      <canvas id="regl-canvas" width="${width}" height="${height}"></canvas> 
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
                iMouse: ({}, props, batchId) => [this.mouse.x, this.mouse.y],
                iTime: ({ time }) => time//(time - this.startTime) / 1000.0, // Time in seconds
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
