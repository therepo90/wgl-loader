# Webgl loader

This is a fancy webgl loader web component. Its only 9kb.

Be aware that your grandpa mobile browser probably won't see it. 

# Usage
Include js
```<script src="https://github.com/therepo90/wgl-loader/blob/main/rg-web-component.[hash].js" ></script>```

Or just download the file and

```<script src="rg-web-component.js" ></script>```

Add 
```
rg-wgl-loader {
            display: block;
            width: 100%;
            height: 100%;
        }
```
to your styles
and then add anywhere
```
<rg-wgl-loader></rg-wgl-loader>
```

## Example
See index.html

Its using the fragment shader code from https://www.shadertoy.com/view/tscBz8

Its using raymarching and sdfs techniques and raw opengl.

### Customizing loader
You can use your own loader shader - just copy-paste the shadertoy code to fragment.glsl

Preview:

![](https://github.com/therepo90/wgl-loader/blob/main/demo.gif)
