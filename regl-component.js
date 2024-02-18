import regl from "regl";

export class ReglComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        canvas { width: 100%; height: 100%; }
      </style>
      <canvas id="regl-canvas"></canvas>
    `;
        this.mouse = { x: 0, y: 0 }; // Initial mouse position
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
