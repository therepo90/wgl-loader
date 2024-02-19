export class WebComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });


    }
    connectedCallback() {
        console.log('connected');

        // calculate client width and height of this element
        const parentWidth = this.getBoundingClientRect().width;
        const parentHeight = this.getBoundingClientRect().height;
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; height: 100%; }
            </style>
            <canvas id="rg-wgl-loader-canvas" width="${parentWidth}px" height="${parentHeight}px"></canvas>
        `;
        this.mouse = { x: 0, y: 0 };
        this.startTime = Date.now();
        this.setupWebGL();
        this.setupMouseListeners();
    }

    setupWebGL() {
        const canvas = this.shadowRoot.getElementById('rg-wgl-loader-canvas');
        const gl = canvas.getContext('webgl');

        if (!gl) {
            console.error('Unable to initialize WebGL. Your browser may not support it.');
            return;
        }

        let fragmentContent = require('./fragment-main.glsl');
        // replace #include "fragment.glsl" with the actual content of fragment.glsl
        fragmentContent = fragmentContent.replace('#include "fragment.glsl"', require('./fragment.glsl'));
        const vertexShaderSource = require('./vertex.glsl');
        const fragmentShaderSource = fragmentContent;

        // Compile shaders
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            console.error('Shader compilation failed.');
            return;
        }

// Link shaders into a program
        const program = this.createProgram(gl, vertexShader, fragmentShader);

        if (!program) {
            console.error('Shader program linking failed.');
            return;
        }

        // Create buffer and set vertices
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const vertices = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Use program and set attributes and uniforms
        gl.useProgram(program);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        if (positionAttributeLocation === -1) {
            console.error('Unable to get attribute location for a_position');
            return;
        }

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');
        //const mouseUniformLocation = gl.getUniformLocation(program, 'iMouse');
        const timeUniformLocation = gl.getUniformLocation(program, 'iTime');

        if (resolutionUniformLocation === null || timeUniformLocation === null) {
            console.error('Unable to get uniform location(s)');
            return;
        }

        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

        const draw = () => {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            //gl.uniform2f(mouseUniformLocation, this.mouse.x, this.mouse.y);
            gl.uniform1f(timeUniformLocation, (Date.now() - this.startTime) / 1000.0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        const animate = () => {
            draw();
            requestAnimationFrame(animate);
        };

        animate();
    }

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(program)}`);
            return null;
        }

        return program;
    }

    setupMouseListeners() {
        const canvas = this.shadowRoot.getElementById('rg-wgl-loader-canvas');
        canvas.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / canvas.width) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / canvas.height) * 2;
        });
    }
}
