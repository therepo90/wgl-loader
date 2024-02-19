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



mat2 rot2D(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

// Scene distance
float map(vec3 p, out vec3 col1, out vec3 col2, out vec3 col3) {


    //vec3 sp1Pos = vec3(-3.0,.0,.0);
    vec3 boxPos2 = vec3(-1.8,.0,.0);
    vec3 q1 = p;
    // q1.xy*=rot2D(iTime*2.);
    float sp1 = sdBox(q1-boxPos2,vec3(.75));


    vec3 cube1Tint = vec3(1.0,.0,.0);
    col1 = cube1Tint * max(0., 1.-sp1);

    vec3 sp2Pos = vec3(sin(iTime*2.4)*2.1,.0,.0);
    //sp2Pos.xy*=rot2D(iTime);
    // vec3 q3 = q2.xy*=rot2D(-iTime*2.);
    // We are moving the origin, not the sphere. THe pixel thinks as if it was placed somewhere else.
    float sp2 = sdSphere(p-sp2Pos, 1.2);
    vec3 spTint = vec3(0.0,1.0,.0);
    col2 = spTint * max(0.,1.-sp2);



    vec3 boxPos = vec3(1.8,0.0,0.);

    vec3 q2 = p;

    //q2.xy*=rot2D(-iTime*2.);

    //q2.yz*=rot2D(-iTime*2.);
    float box=sdBox(q2-boxPos,vec3(.75));

    vec3 cube2Tint = vec3(0.0,0.0,1.0);
    col3 = cube2Tint * max(0.,1.-box); // dont go into negative colors

    //float[OBJ_CNT] objs;
    //objs[0]=sp1;
    //objs[1]=sp2;
    //objs[2]=box;
    float result = smin(smin(sp1, sp2, 0.5), box, 0.5);

    return result;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;

    // Initialization

    float fff = 1.9;
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

    col+=vec3(0.85) * step(100.,t); // not hit - show bg

    //col*=3.0;
    //float zz = min(0.,t);
    //col+=vec3(1.0)*step(0.,zz);
    //col=vec3(1.-zz);
    //col+=vec3(1.0)*(1.-zz);
    //col*=3.0;
    //col=min(
    //col+=vec3(t * .2)*0.04;

    //col /= palette(t);
    // col = vec3(t * .2);
    fragColor = vec4(col, 1);
}
