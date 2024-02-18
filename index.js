import regl from 'regl';
import './vertex.glsl';
import './fragment.glsl';

const reglInstance = regl();

const drawRect = reglInstance({
    frag: require('./fragment.glsl'),
    vert: require('./vertex.glsl'),
    attributes: {
        position: [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1], // Full-screen rectangle
    },
    count: 6,
});

reglInstance.frame(() => {
    reglInstance.clear({
        color: [0, 0, 0, 1],
    });
    drawRect();
});
