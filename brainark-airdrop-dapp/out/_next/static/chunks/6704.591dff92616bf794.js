"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6704],{66704:function(o,e,a){a.r(e),a.d(e,{ColorPanels:function(){return eF},Dithering:function(){return es},DotGrid:function(){return on},DotOrbit:function(){return ot},FlutedGlass:function(){return e1},GodRays:function(){return oq},GrainGradient:function(){return ed},ImageDithering:function(){return aa},LiquidMetal:function(){return eA},MeshGradient:function(){return P},Metaballs:function(){return ob},NeuroNoise:function(){return K},PaperTexture:function(){return ej},PerlinNoise:function(){return oU},PulsingBorder:function(){return eS},ShaderMount:function(){return p},SimplexNoise:function(){return od},SmokeRing:function(){return L},Spiral:function(){return o0},StaticMeshGradient:function(){return eW},StaticRadialGradient:function(){return eN},Swirl:function(){return o8},Voronoi:function(){return oW},Warp:function(){return oO},Water:function(){return e6},Waves:function(){return oS},colorPanelsMeta:function(){return eC},colorPanelsPresets:function(){return eU},ditheringPresets:function(){return ei},dotGridPresets:function(){return ol},dotOrbitMeta:function(){return Z},dotOrbitPresets:function(){return oa},flutedGlassPresets:function(){return e0},getShaderColorFromString:function(){return B},godRaysMeta:function(){return oH},godRaysPresets:function(){return oj},grainGradientMeta:function(){return el},grainGradientPresets:function(){return em},imageDitheringPresets:function(){return ae},isPaperShaderElement:function(){return f},liquidMetalPresets:function(){return ex},meshGradientMeta:function(){return V},meshGradientPresets:function(){return T},metaballsMeta:function(){return og},metaballsPresets:function(){return oA},neuroNoisePresets:function(){return J},paperTexturePresets:function(){return eL},perlinNoisePresets:function(){return oR},pulsingBorderMeta:function(){return eb},pulsingBorderPresets:function(){return ey},simplexNoiseMeta:function(){return of},simplexNoisePresets:function(){return om},smokeRingMeta:function(){return Y},smokeRingPresets:function(){return X},spiralPresets:function(){return o$},staticMeshGradientMeta:function(){return ez},staticMeshGradientPresets:function(){return eD},staticRadialGradientMeta:function(){return eM},staticRadialGradientPresets:function(){return eY},swirlMeta:function(){return o1},swirlPresets:function(){return o4},voronoiMeta:function(){return oF},voronoiPresets:function(){return oD},warpMeta:function(){return oM},warpPresets:function(){return oN},waterPresets:function(){return e8},wavesPresets:function(){return oy}});var t=a(67294);let r=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;

uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_objectHelperBox;

out vec2 v_responsiveUV;
out vec2 v_responsiveBoxSize;
out vec2 v_responsiveHelperBox;
out vec2 v_responsiveBoxGivenSize;

out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_patternHelperBox;

out vec2 v_imageUV;

// #define ADD_HELPERS

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize, vec2 maxBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(maxBoxSize[0] / boxRatio, maxBoxSize[1]);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(maxBoxSize[0] / boxRatio, maxBoxSize[1]);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  vec2 maxBoxSize = vec2(max(u_resolution.x, givenBoxSize.x), max(u_resolution.y, givenBoxSize.y));
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================
  // Sizing api for graphic objects with fixed ratio
  // (currently supports only ratio = 1)

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize, maxBoxSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  #ifdef ADD_HELPERS
  v_objectHelperBox = uv;
  v_objectHelperBox *= objectWorldScale;
  v_objectHelperBox += boxOrigin * (objectWorldScale - 1.);
  #endif

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;


  // ===================================================


  // ===================================================
  // Sizing api for graphic objects with either givenBoxSize ratio or canvas ratio.
  // Full-screen mode available with u_worldWidth = u_worldHeight = 0

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  v_responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize, maxBoxSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / v_responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================


  // ===================================================
  // Sizing api for patterns
  // (treating graphics as a image u_worldWidth x u_worldHeight size)

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize, maxBoxSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  #ifdef ADD_HELPERS
  v_patternHelperBox = uv;
  v_patternHelperBox *= patternBoxScale;
  v_patternHelperBox += boxOrigin * (patternBoxScale - 1.);
  #endif

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================


  // ===================================================
  // Sizing api for images

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(maxBoxSize.x / u_imageAspectRatio, maxBoxSize.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(maxBoxSize.x / u_imageAspectRatio, maxBoxSize.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  #ifdef ADD_HELPERS
  vec2 imageHelperBox = uv;
  imageHelperBox *= imageBoxScale;
  imageHelperBox += boxOrigin * (imageBoxScale - 1.);
  #endif

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;

  // ===================================================

}`,i=8294400;class s{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;providedUniforms;hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let o=navigator.userAgent.toLowerCase();return o.includes("safari")&&!o.includes("chrome")&&!o.includes("android")})();uniformCache={};textureUnitMap=new Map;constructor(o,e,a,t,r=0,s=0,l=2,f=i){if(o instanceof HTMLElement)this.parentElement=o;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(!document.querySelector("style[data-paper-shader]")){let o=document.createElement("style");o.innerHTML=n,o.setAttribute("data-paper-shader",""),document.head.prepend(o)}let c=document.createElement("canvas");this.canvasElement=c,this.parentElement.prepend(c),this.fragmentShader=e,this.providedUniforms=a,this.currentFrame=s,this.minPixelRatio=l,this.maxPixelCount=f;let u=c.getContext("webgl2",t);if(!u)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=u,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),this.setSpeed(r),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this}initProgram=()=>{let o=function(o,e,a){let t=o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT),r=t?t.precision:null;r&&r<23&&(e=e.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),a=a.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let i=l(o,o.VERTEX_SHADER,e),s=l(o,o.FRAGMENT_SHADER,a);if(!i||!s)return null;let n=o.createProgram();return n?(o.attachShader(n,i),o.attachShader(n,s),o.linkProgram(n),o.getProgramParameter(n,o.LINK_STATUS))?(o.detachShader(n,i),o.detachShader(n,s),o.deleteShader(i),o.deleteShader(s),n):(console.error("Unable to initialize the shader program: "+o.getProgramInfoLog(n)),o.deleteProgram(n),o.deleteShader(i),o.deleteShader(s),null):null}(this.gl,r,this.fragmentShader);o&&(this.program=o)};setupPositionAttribute=()=>{let o=this.gl.getAttribLocation(this.program,"a_position"),e=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(o),this.gl.vertexAttribPointer(o,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let o={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([e,a])=>{if(o[e]=this.gl.getUniformLocation(this.program,e),a instanceof HTMLImageElement){let a=`${e}AspectRatio`;o[a]=this.gl.getUniformLocation(this.program,a)}}),this.uniformLocations=o};renderScale=1;parentWidth=0;parentHeight=0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([o])=>{o?.borderBoxSize[0]&&(this.parentWidth=o.borderBoxSize[0].inlineSize,this.parentHeight=o.borderBoxSize[0].blockSize),this.handleResize()}),this.resizeObserver.observe(this.parentElement),visualViewport?.addEventListener("resize",this.handleVisualViewportChange);let o=this.parentElement.getBoundingClientRect();this.parentWidth=o.width,this.parentHeight=o.height,this.handleResize()};resizeRafId=null;handleVisualViewportChange=()=>{null!==this.resizeRafId&&cancelAnimationFrame(this.resizeRafId),this.resizeRafId=requestAnimationFrame(()=>{this.resizeRafId=requestAnimationFrame(()=>{this.handleResize()})})};handleResize=()=>{null!==this.resizeRafId&&cancelAnimationFrame(this.resizeRafId);let o=visualViewport?.scale??1,e=window.innerWidth-document.documentElement.clientWidth,a=visualViewport?visualViewport.scale*visualViewport.width+e:window.innerWidth,t=Math.round(1e4*window.outerWidth/a)/1e4,r=Math.max(this.isSafari?devicePixelRatio:devicePixelRatio/t,this.minPixelRatio)*t*o,i=this.parentWidth*r,s=this.parentHeight*r,l=r*Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(i*s)),n=Math.round(this.parentWidth*l),f=Math.round(this.parentHeight*l);(this.canvasElement.width!==n||this.canvasElement.height!==f||this.renderScale!==l)&&(this.renderScale=l,this.canvasElement.width=n,this.canvasElement.height=f,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=o=>{if(this.hasBeenDisposed)return;if(null===this.program){console.warn("Tried to render before program or gl was initialized");return}let e=o-this.lastRenderTime;this.lastRenderTime=o,0!==this.speed&&(this.currentFrame+=e*this.speed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.speed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(o,e)=>{if(!e.complete||0===e.naturalWidth)throw Error(`Paper Shaders: image for uniform ${o} must be fully loaded`);let a=this.textures.get(o);a&&this.gl.deleteTexture(a),this.textureUnitMap.has(o)||this.textureUnitMap.set(o,this.textureUnitMap.size);let t=this.textureUnitMap.get(o);this.gl.activeTexture(this.gl.TEXTURE0+t);let r=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,r),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,e);let i=this.gl.getError();if(i!==this.gl.NO_ERROR||null===r){console.error("Paper Shaders: WebGL error when uploading texture:",i);return}this.textures.set(o,r);let s=this.uniformLocations[o];if(s){this.gl.uniform1i(s,t);let a=`${o}AspectRatio`,r=this.uniformLocations[a];if(r){let o=e.naturalWidth/e.naturalHeight;this.gl.uniform1f(r,o)}}};areUniformValuesEqual=(o,e)=>o===e||!!(Array.isArray(o)&&Array.isArray(e))&&o.length===e.length&&o.every((o,a)=>this.areUniformValuesEqual(o,e[a]));setUniformValues=o=>{this.gl.useProgram(this.program),Object.entries(o).forEach(([o,e])=>{let a=e;if(e instanceof HTMLImageElement&&(a=`${e.src.slice(0,200)}|${e.naturalWidth}x${e.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[o],a))return;this.uniformCache[o]=a;let t=this.uniformLocations[o];if(!t){console.warn(`Uniform location for ${o} not found`);return}if(e instanceof HTMLImageElement)this.setTextureUniform(o,e);else if(Array.isArray(e)){let a=null,r=null;if(void 0!==e[0]&&Array.isArray(e[0])){let t=e[0].length;if(e.every(o=>o.length===t))a=e.flat(),r=t;else{console.warn(`All child arrays must be the same length for ${o}`);return}}else r=(a=e).length;switch(r){case 2:this.gl.uniform2fv(t,a);break;case 3:this.gl.uniform3fv(t,a);break;case 4:this.gl.uniform4fv(t,a);break;case 9:this.gl.uniformMatrix3fv(t,!1,a);break;case 16:this.gl.uniformMatrix4fv(t,!1,a);break;default:console.warn(`Unsupported uniform array length: ${r}`)}}else"number"==typeof e?this.gl.uniform1f(t,e):"boolean"==typeof e?this.gl.uniform1i(t,e?1:0):console.warn(`Unsupported uniform type for ${o}: ${typeof e}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=o=>{this.currentFrame=o,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(o=1)=>{this.speed=o,null===this.rafId&&0!==o&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===o&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(o=i)=>{this.maxPixelCount=o,this.handleResize()};setMinPixelRatio=(o=2)=>{this.minPixelRatio=o,this.handleResize()};setUniforms=o=>{this.setUniformValues(o),this.providedUniforms={...this.providedUniforms,...o},this.render(performance.now())};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(o=>{this.gl.deleteTexture(o)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.uniformLocations={},this.parentElement.paperShaderMount=void 0}}function l(o,e,a){let t=o.createShader(e);return t?(o.shaderSource(t,a),o.compileShader(t),o.getShaderParameter(t,o.COMPILE_STATUS))?t:(console.error("An error occurred compiling the shaders: "+o.getShaderInfoLog(t)),o.deleteShader(t),null):null}let n=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}`;function f(o){return"paperShaderMount"in o}var c=a(85893);async function u(o){let e={},a=[],t=o=>{try{if(o.startsWith("/"))return!0;return new URL(o),!0}catch{return!1}},r=o=>{try{if(o.startsWith("/"))return!1;return new URL(o,window.location.origin).origin!==window.location.origin}catch{return!1}};return Object.entries(o).forEach(([o,i])=>{if("string"==typeof i){if(!t(i)){console.warn(`Uniform "${o}" has invalid URL "${i}". Skipping image loading.`);return}let s=new Promise((a,t)=>{let s=new Image;r(i)&&(s.crossOrigin="anonymous"),s.onload=()=>{e[o]=s,a()},s.onerror=()=>{console.error(`Could not set uniforms. Failed to load image at ${i}`),t()},s.src=i});a.push(s)}else e[o]=i}),await Promise.all(a),e}let p=(0,t.forwardRef)(function({fragmentShader:o,uniforms:e,webGlContextAttributes:a,speed:r=0,frame:i=0,minPixelRatio:l,maxPixelCount:n,...f},p){let[m,d]=(0,t.useState)(!1),g=(0,t.useRef)(null),h=(0,t.useRef)(null);(0,t.useEffect)(()=>((async()=>{let t=await u(e);g.current&&!h.current&&(h.current=new s(g.current,o,t,a,r,i,l,n),d(!0))})(),()=>{h.current?.dispose(),h.current=null}),[o,a]),(0,t.useEffect)(()=>{(async()=>{let o=await u(e);h.current?.setUniforms(o)})()},[e,m]),(0,t.useEffect)(()=>{h.current?.setSpeed(r)},[r,m]),(0,t.useEffect)(()=>{h.current?.setMaxPixelCount(n)},[n,m]),(0,t.useEffect)(()=>{h.current?.setMinPixelRatio(l)},[l,m]),(0,t.useEffect)(()=>{h.current?.setFrame(i)},[i,m]);let v=function(o){let e=t.useRef(void 0),a=t.useCallback(e=>{let a=o.map(o=>{if(null!=o){if("function"==typeof o){let a=o(e);return"function"==typeof a?a:()=>{o(null)}}return o.current=e,()=>{o.current=null}}});return()=>{a.forEach(o=>o?.())}},o);return t.useMemo(()=>o.every(o=>null==o)?null:o=>{e.current&&(e.current(),e.current=void 0),null!=o&&(e.current=a(o))},o)}([g,p]);return(0,c.jsx)("div",{ref:v,...f})});function m(o,e){for(let a in o){if("colors"===a){let a=Array.isArray(o.colors),t=Array.isArray(e.colors);if(!a||!t){if(!1===Object.is(o.colors,e.colors))return!1;continue}if(o.colors?.length!==e.colors?.length||!o.colors?.every((o,a)=>o===e.colors?.[a]))return!1;continue}if(!1===Object.is(o[a],e[a]))return!1}return!0}p.displayName="ShaderMount";let d=`
in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_patternUV;
in vec2 v_imageUV;`,g=`
in vec2 v_objectBoxSize;
in vec2 v_objectHelperBox;
in vec2 v_responsiveBoxSize;
in vec2 v_responsiveHelperBox;
in vec2 v_patternBoxSize;
in vec2 v_patternHelperBox;`,h=`
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;`,v=`

  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  #ifdef USE_PIXELIZATION
    float pxSize = u_pxSize * u_pixelRatio;
    vec2 pxSizeUv = gl_FragCoord.xy;
    pxSizeUv -= .5 * u_resolution;
    pxSizeUv /= pxSize;
    uv = floor(pxSizeUv) * pxSize / u_resolution.xy;    
    uv += .5;
  #endif
  uv -= .5;

  
  // ===================================================
  // sizing params shared between objects and patterns
  
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  vec2 maxBoxSize = vec2(max(u_resolution.x, givenBoxSize.x), max(u_resolution.y, givenBoxSize.y));
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  
  // ===================================================
  // Sizing api for objects (graphics with fixed ratio)

  #ifdef USE_OBJECT_SIZING
    float fixedRatio = 1.;
    vec2 fixedRatioBoxGivenSize = vec2(
      (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
      (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 objectBoxSize = vec2(0.);
    // fit = none
    objectBoxSize.x = fixedRatio * min(fixedRatioBoxGivenSize.x / fixedRatio, fixedRatioBoxGivenSize.y);
    if (u_fit == 1.) { // fit = contain
      objectBoxSize.x = fixedRatio * min(maxBoxSize.x / fixedRatio, maxBoxSize.y);
    } else if (u_fit == 2.) {  // fit = cover
      objectBoxSize.x = fixedRatio * max(maxBoxSize.x / fixedRatio, maxBoxSize.y);
    }
    objectBoxSize.y = objectBoxSize.x / fixedRatio;
    vec2 objectWorldScale = u_resolution.xy / objectBoxSize;
  
    #ifdef ADD_HELPERS
      vec2 objectHelperBox = gl_FragCoord.xy / u_resolution.xy;
      objectHelperBox -= .5;
      objectHelperBox *= objectWorldScale;
      objectHelperBox += boxOrigin * (objectWorldScale - 1.);  
    #endif
  
    vec2 objectUV = uv;
    objectUV *= objectWorldScale;
    objectUV += boxOrigin * (objectWorldScale - 1.);
    objectUV += vec2(-u_offsetX, u_offsetY);
    objectUV /= u_scale;
    objectUV = graphicRotation * objectUV;
  #endif
  
  // ===================================================
 
  // ===================================================
  // Sizing api for patterns (graphics respecting u_worldWidth / u_worldHeight ratio)
  
  #ifdef USE_PATTERN_SIZING
    float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
    vec2 patternBoxGivenSize = vec2(
      (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
      (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
    );
    vec2 patternBoxSize = vec2(0.);
    // fit = none
    patternBoxSize.x = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
    float patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u_fit == 1.) {  // fit = contain
      patternBoxSize.x = patternBoxRatio * min(maxBoxSize.x / patternBoxRatio, maxBoxSize.y);
    } else if (u_fit == 2.) {  // fit = cover
      patternBoxSize.x = patternBoxRatio * max(maxBoxSize.x / patternBoxRatio, maxBoxSize.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    vec2 patternWorldScale = u_resolution.xy / patternBoxSize;
  
    #ifdef ADD_HELPERS  
      vec2 patternHelperBox = gl_FragCoord.xy / u_resolution.xy;
      patternHelperBox -= .5;
      patternHelperBox *= patternWorldScale;
      patternHelperBox += boxOrigin * (patternWorldScale - 1.);  
    #endif
  
    vec2 patternUV = uv;
    patternUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
    patternUV += boxOrigin;
    patternUV -= boxOrigin / patternWorldScale;
    patternUV *= u_resolution.xy;
    patternUV /= u_pixelRatio;
    if (u_fit > 0.) {
      patternUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    patternUV /= u_scale;
    patternUV = graphicRotation * patternUV;
    patternUV += boxOrigin / patternWorldScale;
    patternUV -= boxOrigin;
    patternUV += .5;
  #endif
    
  // ===================================================
 
  // ===================================================
  // Sizing api for image filters
  
  #ifdef USE_IMAGE_SIZING

    vec2 imageBoxSize;
    if (u_fit == 1.) { // contain
      imageBoxSize.x = min(maxBoxSize.x / u_imageAspectRatio, maxBoxSize.y) * u_imageAspectRatio;
    } else if (u_fit == 2.) { // cover
      imageBoxSize.x = max(maxBoxSize.x / u_imageAspectRatio, maxBoxSize.y) * u_imageAspectRatio;
    } else {
      imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
    }
    imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
    vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

    #ifdef ADD_HELPERS
      vec2 imageHelperBox = uv;
      imageHelperBox *= imageBoxScale;
      imageHelperBox += boxOrigin * (imageBoxScale - 1.);
    #endif

    vec2 imageUV = uv;
    imageUV *= imageBoxScale;
    imageUV += boxOrigin * (imageBoxScale - 1.);
    imageUV += graphicOffset;
    imageUV /= u_scale;
    imageUV.x *= u_imageAspectRatio;
    imageUV = graphicRotation * imageUV;
    imageUV.x /= u_imageAspectRatio;
    
    imageUV += .5;
    imageUV.y = 1. - imageUV.y;
  #endif
`,_=`
  vec2 worldBoxDist = abs(helperBox);
  float boxStroke = (step(max(worldBoxDist.x, worldBoxDist.y), .5) - step(max(worldBoxDist.x, worldBoxDist.y), .495));
  color.rgb = mix(color.rgb, vec3(1., 0., 0.), boxStroke);
  opacity += boxStroke;

  vec2 boxOriginCopy = vec2(.5 - u_originX, u_originY - .5);
  vec2 boxOriginDist = helperBox + boxOriginCopy;
  boxOriginDist.x *= (boxSize.x / boxSize.y);
  float boxOriginPoint = 1. - smoothstep(0., .05, length(boxOriginDist));
  
  vec2 graphicOriginPointDist = helperBox + vec2(-u_offsetX, u_offsetY);
  graphicOriginPointDist.x *= (boxSize.x / boxSize.y);
  float graphicOriginPoint = 1. - smoothstep(0., .05, length(graphicOriginPointDist));
  
  color.rgb = mix(color.rgb, vec3(0., 1., 0.), boxOriginPoint);
  opacity += boxOriginPoint;
  color.rgb = mix(color.rgb, vec3(0., 0., 1.), graphicOriginPoint);
  opacity += graphicOriginPoint;
`,x={fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},A={fit:"none",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},b={none:0,contain:1,cover:2};function B(o){if(Array.isArray(o))return 4===o.length?o:3===o.length?[...o,1]:y;if("string"!=typeof o)return y;let e,a,t,r=1;if(o.startsWith("#"))[e,a,t,r]=function(o){3===(o=o.replace(/^#/,"")).length&&(o=o.split("").map(o=>o+o).join("")),6===o.length&&(o+="ff");let e=parseInt(o.slice(0,2),16)/255;return[e,parseInt(o.slice(2,4),16)/255,parseInt(o.slice(4,6),16)/255,parseInt(o.slice(6,8),16)/255]}(o);else if(o.startsWith("rgb"))[e,a,t,r]=function(o){let e=o.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return e?[parseInt(e[1]??"0")/255,parseInt(e[2]??"0")/255,parseInt(e[3]??"0")/255,void 0===e[4]?1:parseFloat(e[4])]:[0,0,0,1]}(o);else{if(!o.startsWith("hsl"))return console.error("Unsupported color format",o),y;[e,a,t,r]=function(o){let e,a,t;let[r,i,s,l]=o,n=r/360,f=i/100,c=s/100;if(0===i)e=a=t=c;else{let o=(o,e,a)=>(a<0&&(a+=1),a>1&&(a-=1),a<1/6)?o+(e-o)*6*a:a<.5?e:a<2/3?o+(e-o)*(2/3-a)*6:o,r=c<.5?c*(1+f):c+f-c*f,i=2*c-r;e=o(i,r,n+1/3),a=o(i,r,n),t=o(i,r,n-1/3)}return[e,a,t,l]}(function(o){let e=o.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return e?[parseInt(e[1]??"0"),parseInt(e[2]??"0"),parseInt(e[3]??"0"),void 0===e[4]?1:parseFloat(e[4])]:[0,0,0,1]}(o))}return[w(e,0,1),w(a,0,1),w(t,0,1),w(r,0,1)]}let w=(o,e,a)=>Math.min(Math.max(o,e),a),y=[0,0,0,1],S=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,C=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,k=`
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`,R=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,U=`
  float randomR(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).r;
  }
`,F=`
  vec2 randomGB(vec2 p) {
    vec2 uv = floor(p) / 100. + .5;
    return texture(u_noiseTexture, fract(uv)).gb;
  }
`,z=`
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`,E=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,I=`
float fiberRandom(vec2 p) {
  vec2 uv = floor(p) / 100.;
  return texture(u_noiseTexture, fract(uv)).b;
}

float fiberValueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = fiberRandom(i);
  float b = fiberRandom(i + vec2(1.0, 0.0));
  float c = fiberRandom(i + vec2(0.0, 1.0));
  float d = fiberRandom(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float fiberNoiseFbm(in vec2 n, vec2 seedOffset) {
  float total = 0.0, amplitude = 1.;
  for (int i = 0; i < 4; i++) {
    n = rotate(n, .7);
    total += fiberValueNoise(n + seedOffset) * amplitude;
    n *= 2.;
    amplitude *= 0.6;
  }
  return total;
}

float fiberNoise(vec2 uv, vec2 seedOffset) {
  float epsilon = 0.001;
  float n1 = fiberNoiseFbm(uv + vec2(epsilon, 0.0), seedOffset);
  float n2 = fiberNoiseFbm(uv - vec2(epsilon, 0.0), seedOffset);
  float n3 = fiberNoiseFbm(uv + vec2(0.0, epsilon), seedOffset);
  float n4 = fiberNoiseFbm(uv - vec2(0.0, epsilon), seedOffset);
  return length(vec2(n1 - n2, n3 - n4)) / (2.0 * epsilon);
}
`,V={maxColorCount:10},D=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${V.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;

${d}

out vec4 fragColor;

${S}
${C}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + mod(float(i), 3.) * .3;
  float c = .8 + mod(float(i + 1), 4.) * 0.25;

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 shape_uv = v_objectUV;

  shape_uv += .5;

  float t = .5 * u_time;

  float radius = smoothstep(0., 1., length(shape_uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    shape_uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., shape_uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., shape_uv.y));
    shape_uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., shape_uv.x));
  }

  vec2 uvRotated = shape_uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${V.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t);
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= totalWeight;
  opacity /= totalWeight;

  ${z}

  fragColor = vec4(color, opacity);
}
`,W={name:"Default",params:{...x,speed:1,frame:0,colors:["#e0eaff","#241d9a","#f75092","#9f50d3"],distortion:.8,swirl:.1}},M={name:"Purple",params:{...x,speed:.6,frame:0,colors:["#aaa7d7","#3c2b8e"],distortion:1,swirl:1}},Q={name:"Beach",params:{...x,speed:.1,frame:0,colors:["#bcecf6","#00aaff","#00f7ff","#ffd447"],distortion:.8,swirl:.35}},T=[W,{name:"Ink",params:{...x,speed:1,frame:0,colors:["#ffffff","#000000"],distortion:1,swirl:.2,rotation:90}},M,Q],P=(0,t.memo)(function({speed:o=W.params.speed,frame:e=W.params.frame,colors:a=W.params.colors,distortion:t=W.params.distortion,swirl:r=W.params.swirl,fit:i=W.params.fit,rotation:s=W.params.rotation,scale:l=W.params.scale,originX:n=W.params.originX,originY:f=W.params.originY,offsetX:u=W.params.offsetX,offsetY:m=W.params.offsetY,worldWidth:d=W.params.worldWidth,worldHeight:g=W.params.worldHeight,...h}){let v={u_colors:a.map(B),u_colorsCount:a.length,u_distortion:t,u_swirl:r,u_fit:b[i],u_rotation:s,u_scale:l,u_offsetX:u,u_offsetY:m,u_originX:n,u_originY:f,u_worldWidth:d,u_worldHeight:g};return(0,c.jsx)(p,{...h,speed:o,frame:e,fragmentShader:D,uniforms:v})},m);function G(){if("undefined"==typeof window){console.warn("Paper Shaders: can’t create a texture on the server");return}let o=new Image;return o.src="data:image/png;base64,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",o}let Y={maxColorCount:10,maxNoiseIterations:8},N=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${Y.maxColorCount}];
uniform float u_colorsCount;

uniform float u_thickness;
uniform float u_radius;
uniform float u_innerShape;
uniform float u_noiseScale;
uniform float u_noiseIterations;

${d}

out vec4 fragColor;

${S}
${U}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(in vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < ${Y.maxNoiseIterations}; i++) {
    if (i >= int(u_noiseIterations)) break;
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}

float getNoise(vec2 uv, vec2 pUv, float t) {
  float noiseLeft = fbm(pUv + .03 * t);
  pUv.x = mod(pUv.x, u_noiseScale * TWO_PI);
  float noiseRight = fbm(pUv + .03 * t);
  return mix(noiseRight, noiseLeft, smoothstep(-.25, .25, uv.x));
}

float getRingShape(vec2 uv) {
  float radius = u_radius;
  float thickness = u_thickness;

  float distance = length(uv);
  float ringValue = 1. - smoothstep(radius, radius + thickness, distance);
  ringValue *= smoothstep(radius - pow(u_innerShape, 3.) * thickness, radius, distance);

  return ringValue;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = u_time;

  float cycleDuration = 3.;
  float localTime1 = mod(.1 * t + cycleDuration, 2. * cycleDuration);
  float localTime2 = mod(.1 * t, 2. * cycleDuration);
  float timeBlend = .5 + .5 * sin(.1 * t * PI / cycleDuration - .5 * PI);

  float atg = atan(shape_uv.y, shape_uv.x) + .001;
  float l = length(shape_uv);
  vec2 polar_uv1 = vec2(atg, localTime1 - (.5 * l) + 1. / pow(l, .5));
  polar_uv1 *= u_noiseScale;
  float noise1 = getNoise(shape_uv, polar_uv1, t);

  vec2 polar_uv2 = vec2(atg, localTime2 - (.5 * l) + 1. / pow(l, .5));
  polar_uv2 *= u_noiseScale;
  float noise2 = getNoise(shape_uv, polar_uv2, t);

  float noise = mix(noise1, noise2, timeBlend);

  shape_uv *= (.8 + 1.2 * noise);

  float ringShape = getRingShape(shape_uv);

  float mixer = pow(ringShape, 3.) * (u_colorsCount - 1.);
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${Y.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0., 1.);
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * ringShape;
  float opacity = gradient.a * ringShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,O={name:"Default",params:{...x,speed:.4,frame:0,colorBack:"#121212",colors:["#ffffff"],noiseScale:3,noiseIterations:8,radius:.25,thickness:.65,innerShape:.7}},H={name:"Poison",params:{...x,speed:1,frame:0,colorBack:"#003d00",colors:["#d4ff00","#077d52","#aaff00"],noiseScale:3.3,noiseIterations:3,radius:.4,thickness:.2,innerShape:4}},X=[O,{name:"Line",params:{...x,frame:0,colorBack:"#000000",colors:["#1fe8ff","#4540a4"],noiseScale:1.1,noiseIterations:2,radius:.38,thickness:.01,innerShape:.88,speed:4}},H,{name:"Cloud",params:{...x,frame:0,colorBack:"#3b9bff",colors:["#ffffff"],noiseScale:3,noiseIterations:10,radius:.5,thickness:.65,innerShape:.85,speed:.5,scale:.8}}],L=(0,t.memo)(function({speed:o=O.params.speed,frame:e=O.params.frame,colorBack:a=O.params.colorBack,colors:t=O.params.colors,noiseScale:r=O.params.noiseScale,thickness:i=O.params.thickness,radius:s=O.params.radius,innerShape:l=O.params.innerShape,noiseIterations:n=O.params.noiseIterations,fit:f=O.params.fit,scale:u=O.params.scale,rotation:m=O.params.rotation,originX:d=O.params.originX,originY:g=O.params.originY,offsetX:h=O.params.offsetX,offsetY:v=O.params.offsetY,worldWidth:_=O.params.worldWidth,worldHeight:x=O.params.worldHeight,...A}){let w={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_noiseScale:r,u_thickness:i,u_radius:s,u_innerShape:l,u_noiseIterations:n,u_noiseTexture:G(),u_fit:b[f],u_scale:u,u_rotation:m,u_offsetX:h,u_offsetY:v,u_originX:d,u_originY:g,u_worldWidth:_,u_worldHeight:x};return(0,c.jsx)(p,{...A,speed:o,frame:e,fragmentShader:N,uniforms:w})},m),j=`#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorMid;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_contrast;


${d}

out vec4 fragColor;

${C}

float neuroShape(vec2 uv, float t) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;

  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer);
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .13;

  float t = .5 * u_time;

  float noise = neuroShape(shape_uv, t);

  noise = (1. + u_brightness) * pow(noise, 2.);
  noise = pow(noise, .7 + 6. * u_contrast);
  noise = min(1.4, noise);

  float blend = smoothstep(0.7, 1.4, noise);

  vec4 frontC = u_colorFront;
  frontC.rgb *= frontC.a;
  vec4 midC = u_colorMid;
  midC.rgb *= midC.a;
  vec4 blendFront = mix(midC, frontC, blend);

  float safeNoise = max(noise, 0.0);
  vec3 color = blendFront.rgb * safeNoise;
  float opacity = clamp(blendFront.a * safeNoise, 0., 1.);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,q={name:"Default",params:{...A,speed:1,frame:0,colorFront:"#ffffff",colorMid:"#00a2ff",colorBack:"#000000",brightness:.05,contrast:.3}},J=[q,{name:"Sensation",params:{...A,speed:1,frame:0,colorFront:"#00c8ff",colorMid:"#fbff00",colorBack:"#8b42ff",brightness:.19,contrast:.12,scale:3}},{name:"Bloodstream",params:{...A,speed:1,frame:0,colorFront:"#ff0000",colorMid:"#ff0000",colorBack:"#ffffff",brightness:.24,contrast:.17,scale:.7}},{name:"Ghost",params:{...A,speed:1,frame:0,colorFront:"#ffffff",colorMid:"#000000",colorBack:"#ffffff",brightness:0,contrast:1,scale:.55}}],K=(0,t.memo)(function({speed:o=q.params.speed,frame:e=q.params.frame,colorFront:a=q.params.colorFront,colorMid:t=q.params.colorMid,colorBack:r=q.params.colorBack,brightness:i=q.params.brightness,contrast:s=q.params.contrast,fit:l=q.params.fit,scale:n=q.params.scale,rotation:f=q.params.rotation,originX:u=q.params.originX,originY:m=q.params.originY,offsetX:d=q.params.offsetX,offsetY:g=q.params.offsetY,worldWidth:h=q.params.worldWidth,worldHeight:v=q.params.worldHeight,..._}){let x={u_colorFront:B(a),u_colorMid:B(t),u_colorBack:B(r),u_brightness:i,u_contrast:s,u_fit:b[l],u_scale:n,u_rotation:f,u_offsetX:d,u_offsetY:g,u_originX:u,u_originY:m,u_worldWidth:h,u_worldHeight:v};return(0,c.jsx)(p,{..._,speed:o,frame:e,fragmentShader:j,uniforms:x})},m),Z={maxColorCount:10},$=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${Z.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_size;
uniform float u_sizeRange;
uniform float u_spreading;

${d}

out vec4 fragColor;

${S}
${C}
${U}
${F}


vec3 voronoiShape(vec2 uv, float time) {
  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  float spreading = .25 * clamp(u_spreading, 0., 1.);

  float minDist = 1.;
  vec2 randomizer = vec2(0.);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tileOffset = vec2(float(x), float(y));
      vec2 rand = randomGB(i_uv + tileOffset);
      vec2 cellCenter = vec2(.5 + 1e-4);
      cellCenter += spreading * cos(time + TWO_PI * rand);
      cellCenter -= .5;
      cellCenter = rotate(cellCenter, randomR(vec2(rand.x, rand.y)) + .1 * time);
      cellCenter += .5;
      float dist = length(tileOffset + cellCenter - f_uv);
      if (dist < minDist) {
        minDist = dist;
        randomizer = rand;
      }
      minDist = min(minDist, dist);
    }
  }

  return vec3(minDist, randomizer);
}

void main() {

  vec2 shape_uv = v_patternUV;
  shape_uv *= 1.5;

  float t = u_time - 10.;

  vec3 voronoi = voronoiShape(shape_uv, t) + 1e-4;

  float radius = .25 * clamp(u_size, 0., 1.) - .5 * clamp(u_sizeRange, 0., 1.) * voronoi[2];
  float dist = voronoi[0];
  float edgeWidth = fwidth(dist);
  float dots = smoothstep(radius + edgeWidth, radius - edgeWidth, dist);

  float shape = voronoi[1];

  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${Z.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
      localT = round(localT * steps) / steps;
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
    float localT = mixer + 1.;
    if (mixer > (u_colorsCount - 1.)) {
      localT = mixer - (u_colorsCount - 1.);
    }
    localT = round(localT * steps) / steps;
    vec4 cFst = u_colors[0];
    cFst.rgb *= cFst.a;
    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
    cLast.rgb *= cLast.a;
    gradient = mix(cLast, cFst, localT);
  }

  vec3 color = gradient.rgb * dots;
  float opacity = gradient.a * dots;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`,oo={name:"Default",params:{...A,speed:2,frame:0,colorBack:"#000000",colors:["#ff6f00","#610000","#0f0000","#ffdfa8"],size:1,sizeRange:0,spreading:1,stepsPerColor:4}},oe={name:"Shine",params:{...A,speed:.1,frame:0,colors:["#ffffff","#006aff","#fff675"],colorBack:"#000000",stepsPerColor:4,size:.3,sizeRange:.2,spreading:1,scale:.4}},oa=[oo,{name:"Bubbles",params:{...A,speed:.4,frame:0,colors:["#29b9e0"],colorBack:"#009494",stepsPerColor:2,size:.9,sizeRange:.7,spreading:1,scale:1.64}},oe,{name:"Hallucinatory",params:{...A,speed:5,frame:0,colors:["#000000"],colorBack:"#ffe500",stepsPerColor:2,size:.65,sizeRange:0,spreading:.3,scale:.5}}],ot=(0,t.memo)(function({speed:o=oo.params.speed,frame:e=oo.params.frame,colorBack:a=oo.params.colorBack,colors:t=oo.params.colors,size:r=oo.params.size,sizeRange:i=oo.params.sizeRange,spreading:s=oo.params.spreading,stepsPerColor:l=oo.params.stepsPerColor,fit:n=oo.params.fit,scale:f=oo.params.scale,rotation:u=oo.params.rotation,originX:m=oo.params.originX,originY:d=oo.params.originY,offsetX:g=oo.params.offsetX,offsetY:h=oo.params.offsetY,worldWidth:v=oo.params.worldWidth,worldHeight:_=oo.params.worldHeight,...x}){let A={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_size:r,u_sizeRange:i,u_spreading:s,u_stepsPerColor:l,u_noiseTexture:G(),u_fit:b[n],u_scale:f,u_rotation:u,u_offsetX:g,u_offsetY:h,u_originX:m,u_originY:d,u_worldWidth:v,u_worldHeight:_};return(0,c.jsx)(p,{...x,speed:o,frame:e,fragmentShader:$,uniforms:A})},m),or=`#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colorFill;
uniform vec4 u_colorStroke;
uniform float u_dotSize;
uniform float u_gapX;
uniform float u_gapY;
uniform float u_strokeWidth;
uniform float u_sizeRange;
uniform float u_opacityRange;
uniform float u_shape;

${d}

out vec4 fragColor;

${S}
${E}

float polygon(vec2 p, float N, float rot) {
  float a = atan(p.x, p.y) + rot;
  float r = TWO_PI / float(N);

  return cos(floor(.5 + a / r) * r - a) * length(p);
}

void main() {

  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  vec2 shape_uv = 100. * v_patternUV;

  vec2 grid = fract(shape_uv / vec2(u_gapX, u_gapY)) + 1e-4;
  vec2 grid_idx = floor(shape_uv / vec2(u_gapX, u_gapY));
  float sizeRandomizer = .5 + .8 * snoise(2. * vec2(grid_idx.x * 100., grid_idx.y));
  float opacity_randomizer = .5 + .7 * snoise(2. * vec2(grid_idx.y, grid_idx.x));

  vec2 center = vec2(0.5) - 1e-3;
  vec2 p = (grid - center) * vec2(u_gapX, u_gapY);

  float baseSize = u_dotSize * (1. - sizeRandomizer * u_sizeRange);
  float strokeWidth = u_strokeWidth * (1. - sizeRandomizer * u_sizeRange);

  float dist;
  if (u_shape < 0.5) {
    // Circle
    dist = length(p);
  } else if (u_shape < 1.5) {
    // Diamond
    strokeWidth *= 1.5;
    dist = polygon(1.5 * p, 4., .25 * PI);
  } else if (u_shape < 2.5) {
    // Square
    dist = polygon(1.03 * p, 4., 1e-3);
  } else {
    // Triangle
    strokeWidth *= 1.5;
    p = p * 2. - 1.;
    p *= .9;
    p.y = 1. - p.y;
    p.y -= .75 * baseSize;
    dist = polygon(p, 3., 1e-3);
  }

  float edgeWidth = fwidth(dist);
  float shapeOuter = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist - strokeWidth);
  float shapeInner = smoothstep(baseSize + edgeWidth, baseSize - edgeWidth, dist);
  float stroke = shapeOuter - shapeInner;

  float dotOpacity = max(0., 1. - opacity_randomizer * u_opacityRange);
  stroke *= dotOpacity;
  shapeInner *= dotOpacity;

  stroke *= u_colorStroke.a;
  shapeInner *= u_colorFill.a;

  vec3 color = vec3(0.);
  color += stroke * u_colorStroke.rgb;
  color += shapeInner * u_colorFill.rgb;
  color += (1. - shapeInner - stroke) * u_colorBack.rgb * u_colorBack.a;

  float opacity = 0.;
  opacity += stroke;
  opacity += shapeInner;
  opacity += (1. - opacity) * u_colorBack.a;

  fragColor = vec4(color, opacity);
}
`,oi={circle:0,diamond:1,square:2,triangle:3},os={name:"Default",params:{...A,colorBack:"#000000",colorFill:"#ffffff",colorStroke:"#ffaa00",size:2,gapX:32,gapY:32,strokeWidth:0,sizeRange:0,opacityRange:0,shape:"circle"}},ol=[os,{name:"Triangles",params:{...A,colorBack:"#ffffff",colorFill:"#ffffff",colorStroke:"#808080",size:5,gapX:32,gapY:32,strokeWidth:1,sizeRange:0,opacityRange:0,shape:"triangle"}},{name:"Tree line",params:{...A,colorBack:"#f4fce7",colorFill:"#052e19",colorStroke:"#000000",size:8,gapX:20,gapY:90,strokeWidth:0,sizeRange:1,opacityRange:.6,shape:"circle"}},{name:"Wallpaper",params:{...A,colorBack:"#204030",colorFill:"#000000",colorStroke:"#bd955b",size:9,gapX:32,gapY:32,strokeWidth:1,sizeRange:0,opacityRange:0,shape:"diamond"}}],on=(0,t.memo)(function({colorBack:o=os.params.colorBack,colorFill:e=os.params.colorFill,colorStroke:a=os.params.colorStroke,size:t=os.params.size,gapX:r=os.params.gapX,gapY:i=os.params.gapY,strokeWidth:s=os.params.strokeWidth,sizeRange:l=os.params.sizeRange,opacityRange:n=os.params.opacityRange,shape:f=os.params.shape,fit:u=os.params.fit,scale:m=os.params.scale,rotation:d=os.params.rotation,originX:g=os.params.originX,originY:h=os.params.originY,offsetX:v=os.params.offsetX,offsetY:_=os.params.offsetY,worldWidth:x=os.params.worldWidth,worldHeight:A=os.params.worldHeight,maxPixelCount:w=20358144,...y}){let S={u_colorBack:B(o),u_colorFill:B(e),u_colorStroke:B(a),u_dotSize:t,u_gapX:r,u_gapY:i,u_strokeWidth:s,u_sizeRange:l,u_opacityRange:n,u_shape:oi[f],u_fit:b[u],u_scale:m,u_rotation:d,u_offsetX:v,u_offsetY:_,u_originX:g,u_originY:h,u_worldWidth:x,u_worldHeight:A};return(0,c.jsx)(p,{...y,maxPixelCount:w,fragmentShader:or,uniforms:S})},m),of={maxColorCount:10},oc=`#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_scale;

uniform vec4 u_colors[${of.maxColorCount}];
uniform float u_colorsCount;
uniform float u_stepsPerColor;
uniform float u_softness;

${d}

out vec4 fragColor;

${E}

float getNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

float steppedSmooth(float m, float steps, float softness) { 
  float stepT = floor(m * steps) / steps;
  float f = m * steps - floor(m * steps);
  float smoothed = smoothstep(.5 - softness, .5 + softness, f);
  return stepT + smoothed / steps;
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= .1;

  float t = .2 * u_time;

  float shape = .5 + .5 * getNoise(shape_uv, t);

  bool u_extraSides = true;

  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }

  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${of.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;

      float localM = clamp(mixer - float(i - 1), 0., 1.);
      localM = steppedSmooth(localM, steps, .5 * u_softness + steps * fwidth(localM));

      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localM);
  }

  if (u_extraSides == true) {
   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     float localM = mixer + 1.;
     if (mixer > (u_colorsCount - 1.)) {
       localM = mixer - (u_colorsCount - 1.);
     }
     localM = steppedSmooth(localM, steps, .5 * u_softness + steps * fwidth(localM));
     vec4 cFst = u_colors[0];
     cFst.rgb *= cFst.a;
     vec4 cLast = u_colors[int(u_colorsCount - 1.)];
     cLast.rgb *= cLast.a;
     gradient = mix(cLast, cFst, localM);
   }
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${z}

  fragColor = vec4(color, opacity);
}
`,ou={name:"Default",params:{...A,speed:.5,frame:0,colors:["#4449CF","#FFD1E0","#F94446","#FFD36B","#FFFFFF"],stepsPerColor:3,softness:0}},op={name:"Bubblegum",params:{...A,speed:2,frame:0,colors:["#ffffff","#ff9e9e","#5f57ff","#00f7ff"],stepsPerColor:1,softness:1,scale:1.6}},om=[ou,{name:"Spots",params:{...A,speed:.6,frame:0,colors:["#ff7b00","#f9ffeb","#320d82"],stepsPerColor:1,softness:0,scale:1}},{name:"First contact",params:{...A,speed:2,frame:0,colors:["#e8cce6","#120d22","#442c44","#e6baba","#fff5f5"],stepsPerColor:2,softness:0,scale:.2}},op],od=(0,t.memo)(function({speed:o=ou.params.speed,frame:e=ou.params.frame,colors:a=ou.params.colors,stepsPerColor:t=ou.params.stepsPerColor,softness:r=ou.params.softness,fit:i=ou.params.fit,scale:s=ou.params.scale,rotation:l=ou.params.rotation,originX:n=ou.params.originX,originY:f=ou.params.originY,offsetX:u=ou.params.offsetX,offsetY:m=ou.params.offsetY,worldWidth:d=ou.params.worldWidth,worldHeight:g=ou.params.worldHeight,...h}){let v={u_colors:a.map(B),u_colorsCount:a.length,u_stepsPerColor:t,u_softness:r,u_fit:b[i],u_scale:s,u_rotation:l,u_offsetX:u,u_offsetY:m,u_originX:n,u_originY:f,u_worldWidth:d,u_worldHeight:g};return(0,c.jsx)(p,{...h,speed:o,frame:e,fragmentShader:oc,uniforms:v})},m),og={maxColorCount:8,maxBallsCount:20},oh=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${og.maxColorCount}];
uniform float u_colorsCount;
uniform float u_size;
uniform float u_sizeRange;
uniform float u_count;

${d}

out vec4 fragColor;

${S}
${U}
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  vec2 p0 = vec2(i, 0.0);
  vec2 p1 = vec2(i + 1.0, 0.0);
  return mix(randomR(p0), randomR(p1), u);
}

float getBallShape(vec2 uv, vec2 c, float p) {
  float s = .5 * length(uv - c);
  s = 1. - clamp(s, 0., 1.);
  s = pow(s, p);
  return s;
}

void main() {
  vec2 shape_uv = v_objectUV;

  shape_uv += .5;

  float t = .2 * u_time + 500.;

  vec3 totalColor = vec3(0.);
  float totalShape = 0.;
  float totalOpacity = 0.;

  for (int i = 0; i < ${og.maxBallsCount}; i++) {
    if (i >= int(ceil(u_count))) break;

    float idxFract = float(i) / float(${og.maxBallsCount});
    float angle = TWO_PI * idxFract;

    float speed = 1. - .2 * idxFract;
    float noiseX = noise(angle * 10. + float(i) + t * speed);
    float noiseY = noise(angle * 20. + float(i) - t * speed);

    vec2 pos = vec2(.5) + 1e-4 + .9 * (vec2(noiseX, noiseY) - .5);

    int safeIndex = i % int(u_colorsCount + 0.5);
    vec4 ballColor = u_colors[safeIndex];
    ballColor.rgb *= ballColor.a;

    float sizeFrac = 1.;
    if (float(i) > floor(u_count - 1.)) {
      sizeFrac *= fract(u_count);
    }

    float shape = getBallShape(shape_uv, pos, 45. - 30. * u_size * sizeFrac);
    shape *= pow(u_size, .2);
    shape = smoothstep(0., 1., shape);

    totalColor += ballColor.rgb * shape;
    totalShape += shape;
    totalOpacity += ballColor.a * shape;
  }

  totalColor /= max(totalShape, 1e-4);
  totalOpacity /= max(totalShape, 1e-4);

  float edge_width = fwidth(totalShape);
  float finalShape = smoothstep(.4, .4 + edge_width, totalShape);

  vec3 color = totalColor * finalShape;
  float opacity = totalOpacity * finalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,ov={name:"Default",params:{...x,scale:1,speed:1,frame:0,colorBack:"#121212",colors:["#6e33cc","#ff5500","#ffc105","#ffc800","#f585ff"],count:10,size:.83}},o_={name:"Ink Drops",params:{...x,scale:1,speed:2,frame:0,colorBack:"#ffffff00",colors:["#000000"],count:18,size:.1}},ox={name:"Background",params:{...x,speed:.5,frame:0,colors:["#ae00ff","#00ff95","#ffc105"],colorBack:"#2a273f",count:13,size:.81,scale:4,rotation:0,offsetX:-.3}},oA=[ov,o_,{name:"Solar",params:{...x,speed:1,frame:0,colors:["#ffc800","#ff5500","#ffc105"],colorBack:"#102f84",count:7,size:.75,scale:1}},ox],ob=(0,t.memo)(function({speed:o=ov.params.speed,frame:e=ov.params.frame,colorBack:a=ov.params.colorBack,colors:t=ov.params.colors,size:r=ov.params.size,count:i=ov.params.count,fit:s=ov.params.fit,rotation:l=ov.params.rotation,scale:n=ov.params.scale,originX:f=ov.params.originX,originY:u=ov.params.originY,offsetX:m=ov.params.offsetX,offsetY:d=ov.params.offsetY,worldWidth:g=ov.params.worldWidth,worldHeight:h=ov.params.worldHeight,...v}){let _={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_size:r,u_count:i,u_noiseTexture:G(),u_fit:b[s],u_rotation:l,u_scale:n,u_offsetX:m,u_offsetY:d,u_originX:f,u_originY:u,u_worldWidth:g,u_worldHeight:h};return(0,c.jsx)(p,{...v,speed:o,frame:e,fragmentShader:oh,uniforms:_})},m),oB=`#version 300 es
precision mediump float;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_shape;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_spacing;
uniform float u_proportion;
uniform float u_softness;

${d}

out vec4 fragColor;

${S}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= 4.;

  float wave = .5 * cos(shape_uv.x * u_frequency * TWO_PI);
  float zigzag = 2. * abs(fract(shape_uv.x * u_frequency) - .5);
  float irregular = sin(shape_uv.x * .25 * u_frequency * TWO_PI) * cos(shape_uv.x * u_frequency * TWO_PI);
  float irregular2 = .75 * (sin(shape_uv.x * u_frequency * TWO_PI) + .5 * cos(shape_uv.x * .5 * u_frequency * TWO_PI));

  float offset = mix(zigzag, wave, smoothstep(0., 1., u_shape));
  offset = mix(offset, irregular, smoothstep(1., 2., u_shape));
  offset = mix(offset, irregular2, smoothstep(2., 3., u_shape));
  offset *= 2. * u_amplitude;

  float spacing = (.001 + u_spacing);
  float shape = .5 + .5 * sin((shape_uv.y + offset) * PI / spacing);

  float aa = .0001 + fwidth(shape);
  float dc = 1. - clamp(u_proportion, 0., 1.);
  float res = smoothstep(dc - u_softness - aa, dc + u_softness + aa, shape);
  
  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`,ow={name:"Default",params:{...A,scale:2,colorFront:"#ffbb00",colorBack:"#000000",shape:0,frequency:.5,amplitude:.5,spacing:1,proportion:.1,softness:0}},oy=[ow,{name:"Groovy",params:{...A,scale:5,rotation:90,colorFront:"#fcfcee",colorBack:"#ff896b",shape:3,frequency:.2,amplitude:.25,spacing:1.17,proportion:.57,softness:0}},{name:"Tangled up",params:{...A,scale:.5,rotation:0,colorFront:"#133a41",colorBack:"#c2d8b6",shape:2.07,frequency:.44,amplitude:.57,spacing:1.05,proportion:.75,softness:0}},{name:"Ride the wave",params:{...A,scale:1.7,rotation:0,colorFront:"#fdffe6",colorBack:"#1f1f1f",shape:2.25,frequency:.2,amplitude:1,spacing:1.25,proportion:1,softness:0}}],oS=(0,t.memo)(function({colorFront:o=ow.params.colorFront,colorBack:e=ow.params.colorBack,shape:a=ow.params.shape,frequency:t=ow.params.frequency,amplitude:r=ow.params.amplitude,spacing:i=ow.params.spacing,proportion:s=ow.params.proportion,softness:l=ow.params.softness,fit:n=ow.params.fit,scale:f=ow.params.scale,rotation:u=ow.params.rotation,offsetX:m=ow.params.offsetX,offsetY:d=ow.params.offsetY,originX:g=ow.params.originX,originY:h=ow.params.originY,worldWidth:v=ow.params.worldWidth,worldHeight:_=ow.params.worldHeight,maxPixelCount:x=20358144,...A}){let w={u_colorFront:B(o),u_colorBack:B(e),u_shape:a,u_frequency:t,u_amplitude:r,u_spacing:i,u_proportion:s,u_softness:l,u_fit:b[n],u_scale:f,u_rotation:u,u_offsetX:m,u_offsetY:d,u_originX:g,u_originY:h,u_worldWidth:v,u_worldHeight:_};return(0,c.jsx)(p,{...A,fragmentShader:oB,uniforms:w})},m),oC=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_proportion;
uniform float u_softness;
uniform float u_octaveCount;
uniform float u_persistence;
uniform float u_lacunarity;

${d}

out vec4 fragColor;

${S}

float hash11(float p) {
  p = fract(p * 0.3183099) + 0.1;
  p *= p + 19.19;
  return fract(p * p);
}

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float hash31(vec3 p) {
  p = fract(p * 0.3183099) + 0.1;
  p += dot(p, p.yzx + 19.19);
  return fract(p.x * (p.y + p.z));
}

vec3 hash33(vec3 p) {
  p = fract(p * 0.3183099) + 0.1;
  p += dot(p, p.yzx + 19.19);
  return fract(vec3(p.x * p.y, p.y * p.z, p.z * p.x));
}

vec3 gradientSafe(vec3 p) {
  vec3 h = hash33(p) * 2.0 - 1.;
  return normalize(h + 0.001);
}

vec3 gradientPredefined(float hash) {
  int idx = int(hash * 12.0) % 12;

  if (idx == 0) return vec3(1, 1, 0);
  if (idx == 1) return vec3(-1, 1, 0);
  if (idx == 2) return vec3(1, -1, 0);
  if (idx == 3) return vec3(-1, -1, 0);
  if (idx == 4) return vec3(1, 0, 1);
  if (idx == 5) return vec3(-1, 0, 1);
  if (idx == 6) return vec3(1, 0, -1);
  if (idx == 7) return vec3(-1, 0, -1);
  if (idx == 8) return vec3(0, 1, 1);
  if (idx == 9) return vec3(0, -1, 1);
  if (idx == 10) return vec3(0, 1, -1);
  return vec3(0, -1, -1);// idx == 11
}

float interpolateSafe(float v000, float v001, float v010, float v011,
float v100, float v101, float v110, float v111, vec3 t) {
  t = clamp(t, 0.0, 1.0);

  float v00 = mix(v000, v100, t.x);
  float v01 = mix(v001, v101, t.x);
  float v10 = mix(v010, v110, t.x);
  float v11 = mix(v011, v111, t.x);

  float v0 = mix(v00, v10, t.y);
  float v1 = mix(v01, v11, t.y);

  return mix(v0, v1, t.z);
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec3 position, float seed) {
  position += vec3(seed * 127.1, seed * 311.7, seed * 74.7);

  vec3 i = floor(position);
  vec3 f = fract(position);
  float h000 = hash31(i);
  float h001 = hash31(i + vec3(0, 0, 1));
  float h010 = hash31(i + vec3(0, 1, 0));
  float h011 = hash31(i + vec3(0, 1, 1));
  float h100 = hash31(i + vec3(1, 0, 0));
  float h101 = hash31(i + vec3(1, 0, 1));
  float h110 = hash31(i + vec3(1, 1, 0));
  float h111 = hash31(i + vec3(1, 1, 1));
  vec3 g000 = gradientPredefined(h000);
  vec3 g001 = gradientPredefined(h001);
  vec3 g010 = gradientPredefined(h010);
  vec3 g011 = gradientPredefined(h011);
  vec3 g100 = gradientPredefined(h100);
  vec3 g101 = gradientPredefined(h101);
  vec3 g110 = gradientPredefined(h110);
  vec3 g111 = gradientPredefined(h111);
  float v000 = dot(g000, f - vec3(0, 0, 0));
  float v001 = dot(g001, f - vec3(0, 0, 1));
  float v010 = dot(g010, f - vec3(0, 1, 0));
  float v011 = dot(g011, f - vec3(0, 1, 1));
  float v100 = dot(g100, f - vec3(1, 0, 0));
  float v101 = dot(g101, f - vec3(1, 0, 1));
  float v110 = dot(g110, f - vec3(1, 1, 0));
  float v111 = dot(g111, f - vec3(1, 1, 1));

  vec3 u = fade(f);
  return interpolateSafe(v000, v001, v010, v011, v100, v101, v110, v111, u);
}

float p_noise(vec3 position, int octaveCount, float persistence, float lacunarity) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 10.0;
  float maxValue = 0.0;
  octaveCount = clamp(octaveCount, 1, 8);

  for (int i = 0; i < octaveCount; i++) {
    float seed = float(i) * 0.7319;
    value += perlinNoise(position * frequency, seed) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value;
}

float get_max_amp(float persistence, float octaveCount) {
  persistence = clamp(persistence * 0.999, 0.0, 0.999);
  octaveCount = clamp(octaveCount, 1.0, 8.0);

  if (abs(persistence - 1.0) < 0.001) {
    return octaveCount;
  }

  return (1.0 - pow(persistence, octaveCount)) / (1.0 - persistence);
}

void main() {
  vec2 uv = v_patternUV;
  uv *= .5;
  
  float t = .2 * u_time;

  vec3 p = vec3(uv, t);

  float octCount = clamp(floor(u_octaveCount), 1.0, 8.0);
  float persistence = clamp(u_persistence, 0., 1.);
  float noise = p_noise(p, int(octCount), persistence, u_lacunarity);

  float max_amp = get_max_amp(persistence, octCount);
  float noise_normalized = clamp((noise + max_amp) / (2. * max_amp) + (u_proportion - .5), 0.0, 1.0);
  float sharpness = clamp(u_softness, 0., 1.);
  float smooth_w = 0.5 * max(fwidth(noise_normalized), 0.001);
  float res = smoothstep(
    .5 - .5 * sharpness - smooth_w,
    .5 + .5 * sharpness + smooth_w,
    noise_normalized
  );

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,ok={name:"Default",params:{...A,speed:.5,frame:0,colorBack:"#632ad5",colorFront:"#fccff7",proportion:.35,softness:.1,octaveCount:1,persistence:1,lacunarity:1.5}},oR=[ok,{name:"Nintendo Water",params:{...A,scale:5,speed:.4,frame:0,colorBack:"#2d69d4",colorFront:"#d1eefc",proportion:.42,softness:0,octaveCount:2,persistence:.55,lacunarity:1.8}},{name:"Moss",params:{...A,scale:1/.15,speed:.02,frame:0,colorBack:"#05ff4a",colorFront:"#262626",proportion:.65,softness:.35,octaveCount:6,persistence:1,lacunarity:2.55}},{name:"Worms",params:{...A,scale:.9,speed:0,frame:0,colorBack:"#ffffff",colorFront:"#595959",proportion:.5,softness:0,octaveCount:1,persistence:1,lacunarity:1.5}}],oU=(0,t.memo)(function({speed:o=ok.params.speed,frame:e=ok.params.frame,colorFront:a=ok.params.colorFront,colorBack:t=ok.params.colorBack,proportion:r=ok.params.proportion,softness:i=ok.params.softness,octaveCount:s=ok.params.octaveCount,persistence:l=ok.params.persistence,lacunarity:n,fit:f=ok.params.fit,worldWidth:u=ok.params.worldWidth,worldHeight:m=ok.params.worldHeight,scale:d=ok.params.scale,rotation:g=ok.params.rotation,originX:h=ok.params.originX,originY:v=ok.params.originY,offsetX:_=ok.params.offsetX,offsetY:x=ok.params.offsetY,...A}){let w={u_colorBack:B(t),u_colorFront:B(a),u_proportion:r,u_softness:i??ok.params.softness,u_octaveCount:s??ok.params.octaveCount,u_persistence:l??ok.params.persistence,u_lacunarity:n??ok.params.lacunarity,u_fit:b[f],u_scale:d,u_rotation:g,u_offsetX:_,u_offsetY:x,u_originX:h,u_originY:v,u_worldWidth:u,u_worldHeight:m};return(0,c.jsx)(p,{...A,speed:o,frame:e,fragmentShader:oC,uniforms:w})},m),oF={maxColorCount:5},oz=`#version 300 es
precision mediump float;

uniform float u_time;

uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${oF.maxColorCount}];
uniform float u_colorsCount;

uniform float u_stepsPerColor;
uniform vec4 u_colorGlow;
uniform vec4 u_colorGap;
uniform float u_distortion;
uniform float u_gap;
uniform float u_glow;

${d}

out vec4 fragColor;

${S}
${F}

vec4 voronoi(vec2 x, float t) {
  vec2 ip = floor(x);
  vec2 fp = fract(x);

  vec2 mg, mr;
  float md = 8.;
  float rand = 0.;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      float raw_hash = o.x;
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
        rand = raw_hash;
      }
    }
  }

  md = 8.;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      if (dot(mr - r, mr - r) > .00001) {
        md = min(md, dot(.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  return vec4(md, mr, rand);
}

void main() {
  vec2 shape_uv = v_patternUV;
  shape_uv *= 1.25;

  float t = u_time;

  vec4 voronoiRes = voronoi(shape_uv, t);

  float shape = clamp(voronoiRes.w, 0., 1.);
  float mixer = shape * (u_colorsCount - 1.);
  mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  float steps = max(1., u_stepsPerColor);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${oF.maxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
      localT = round(localT * steps) / steps;
      vec4 c = u_colors[i];
      c.rgb *= c.a;
      gradient = mix(gradient, c, localT);
  }

  if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
    float localT = mixer + 1.;
    if (mixer > (u_colorsCount - 1.)) {
      localT = mixer - (u_colorsCount - 1.);
    }
    localT = round(localT * steps) / steps;
    vec4 cFst = u_colors[0];
    cFst.rgb *= cFst.a;
    vec4 cLast = u_colors[int(u_colorsCount - 1.)];
    cLast.rgb *= cLast.a;
    gradient = mix(cLast, cFst, localT);
  }

  vec3 cellColor = gradient.rgb;
  float cellOpacity = gradient.a;

  float glows = length(voronoiRes.yz * u_glow);
  glows = pow(glows, 1.5);

  vec3 color = mix(cellColor, u_colorGlow.rgb * u_colorGlow.a, u_colorGlow.a * glows);
  float opacity = cellOpacity + u_colorGlow.a * glows;

  float edge = voronoiRes.x;
  float smoothEdge = .02 / (2. * u_scale) * (1. + .5 * u_gap);
  edge = smoothstep(u_gap - smoothEdge, u_gap + smoothEdge, edge);

  color = mix(u_colorGap.rgb * u_colorGap.a, color, edge);
  opacity = mix(u_colorGap.a, opacity, edge);

  fragColor = vec4(color, opacity);
}
`,oE={name:"Default",params:{...A,speed:.5,frame:0,colors:["#ff8247","#ffe53d"],stepsPerColor:3,colorGlow:"#ffffff",colorGap:"#2e0000",distortion:.4,gap:.06,glow:0,scale:.5}},oI={name:"Cells",params:{...A,scale:.5,speed:.5,frame:0,colors:["#ffffff"],stepsPerColor:1,colorGlow:"#ffffff",colorGap:"#000000",distortion:.5,gap:.03,glow:.8}},oV={name:"Bubbles",params:{...A,scale:.75,speed:.5,frame:0,colors:["#83c9fb"],stepsPerColor:1,colorGlow:"#ffffff",colorGap:"#ffffff",distortion:.4,gap:0,glow:1}},oD=[oE,{name:"Lights",params:{...A,scale:3.3,speed:.5,frame:0,colors:["#fffffffc","#bbff00","#00ffff"],colorGlow:"#ff00d0",colorGap:"#ff00d0",stepsPerColor:2,distortion:.38,gap:0,glow:1}},oI,oV],oW=(0,t.memo)(function({speed:o=oE.params.speed,frame:e=oE.params.frame,colors:a=oE.params.colors,stepsPerColor:t=oE.params.stepsPerColor,colorGlow:r=oE.params.colorGlow,colorGap:i=oE.params.colorGap,distortion:s=oE.params.distortion,gap:l=oE.params.gap,glow:n=oE.params.glow,fit:f=oE.params.fit,scale:u=oE.params.scale,rotation:m=oE.params.rotation,originX:d=oE.params.originX,originY:g=oE.params.originY,offsetX:h=oE.params.offsetX,offsetY:v=oE.params.offsetY,worldWidth:_=oE.params.worldWidth,worldHeight:x=oE.params.worldHeight,...A}){let w={u_colors:a.map(B),u_colorsCount:a.length,u_stepsPerColor:t,u_colorGlow:B(r),u_colorGap:B(i),u_distortion:s,u_gap:l,u_glow:n,u_noiseTexture:G(),u_fit:b[f],u_scale:u,u_rotation:m,u_offsetX:h,u_offsetY:v,u_originX:d,u_originY:g,u_worldWidth:_,u_worldHeight:x};return(0,c.jsx)(p,{...A,speed:o,frame:e,fragmentShader:oz,uniforms:w})},m),oM={maxColorCount:10},oQ=`#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_scale;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colors[${oM.maxColorCount}];
uniform float u_colorsCount;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;

${d}

out vec4 fragColor;

${S}
${C}
float randomG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomG(i);
  float b = randomG(i + vec2(1.0, 0.0));
  float c = randomG(i + vec2(0.0, 1.0));
  float d = randomG(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}


void main() {
  vec2 uv = v_patternUV;
  uv *= .5;

  float t = 0.0625 * u_time;

  float n1 = valueNoise(uv * 1. + t);
  float n2 = valueNoise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float swirl = u_swirl;
  for (int i = 1; i <= 20; i++) {
    if (i >= int(u_swirlIterations)) break;
    float iFloat = float(i);
//    swirl *= (1. - smoothstep(.0, .25, length(fwidth(uv))));
    uv.x += swirl / iFloat * cos(t + iFloat * 1.5 * uv.y);
    uv.y += swirl / iFloat * cos(t + iFloat * 1. * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);

  float shape = 0.;
  if (u_shape < .5) {
    vec2 checksShape_uv = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checksShape_uv.x) * cos(checksShape_uv.y);
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripesShape_uv = uv * (2. * u_shapeScale);
    float f = fract(stripesShape_uv.y);
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    shape += .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float shapeScaling = 5. * (1. - u_shapeScale);
    shape = smoothstep(.45 - shapeScaling, .55 + shapeScaling, 1. - uv.y + .3 * (proportion - .5));
  }

  float mixer = shape * (u_colorsCount - 1.);
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  float aa = fwidth(shape);
  for (int i = 1; i < ${oM.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;
    float m = clamp(mixer - float(i - 1), 0.0, 1.0);

    float localMixerStart = floor(m);
    float softness = .5 * u_softness + fwidth(m);
    float smoothed = smoothstep(max(0., .5 - softness - aa), min(1., .5 + softness + aa), m - localMixerStart);
    float stepped = localMixerStart + smoothed;

    m = mix(stepped, m, u_softness);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb;
  float opacity = gradient.a;

  ${z}

  fragColor = vec4(color, opacity);
}
`,oT={checks:0,stripes:1,edge:2},oP={name:"Default",params:{...A,rotation:0,speed:1,frame:0,colors:["#121212","#9470ff","#121212","#8838ff"],proportion:.45,softness:1,distortion:.25,swirl:.8,swirlIterations:10,shapeScale:.1,shape:"checks"}},oG={name:"Cauldron Pot",params:{...A,scale:.9,rotation:160,speed:10,frame:0,colors:["#a7e58b","#324472","#0a180d"],proportion:.64,softness:1.5,distortion:.2,swirl:.86,swirlIterations:7,shapeScale:.6,shape:"edge"}},oY={name:"Live Ink",params:{...A,scale:1.2,rotation:44,offsetY:-.3,speed:2.5,frame:0,colors:["#111314","#9faeab","#f3fee7","#f3fee7"],proportion:.05,softness:0,distortion:.25,swirl:.8,swirlIterations:10,shapeScale:.28,shape:"checks"}},oN=[oP,oG,oY,{name:"Kelp",params:{...A,scale:.8,rotation:50,speed:20,frame:0,colors:["#dbff8f","#404f3e","#091316"],proportion:.67,softness:0,distortion:0,swirl:.2,swirlIterations:3,shapeScale:1,shape:"stripes"}},{name:"Nectar",params:{...A,scale:2,offsetY:.6,rotation:0,speed:4.2,frame:0,colors:["#151310","#d3a86b","#f0edea"],proportion:.24,softness:1,distortion:.21,swirl:.57,swirlIterations:10,shapeScale:.75,shape:"edge"}},{name:"Passion",params:{...A,scale:2.5,rotation:1.35,speed:3,frame:0,colors:["#3b1515","#954751","#ffc085"],proportion:.5,softness:1,distortion:.09,swirl:.9,swirlIterations:6,shapeScale:.25,shape:"checks"}}],oO=(0,t.memo)(function({speed:o=oP.params.speed,frame:e=oP.params.frame,colors:a=oP.params.colors,proportion:t=oP.params.proportion,softness:r=oP.params.softness,distortion:i=oP.params.distortion,swirl:s=oP.params.swirl,swirlIterations:l=oP.params.swirlIterations,shapeScale:n=oP.params.shapeScale,shape:f=oP.params.shape,fit:u=oP.params.fit,scale:m=oP.params.scale,rotation:d=oP.params.rotation,originX:g=oP.params.originX,originY:h=oP.params.originY,offsetX:v=oP.params.offsetX,offsetY:_=oP.params.offsetY,worldWidth:x=oP.params.worldWidth,worldHeight:A=oP.params.worldHeight,...w}){let y={u_colors:a.map(B),u_colorsCount:a.length,u_proportion:t,u_softness:r,u_distortion:i,u_swirl:s,u_swirlIterations:l,u_shapeScale:n,u_shape:oT[f],u_noiseTexture:G(),u_scale:m,u_rotation:d,u_fit:b[u],u_offsetX:v,u_offsetY:_,u_originX:g,u_originY:h,u_worldWidth:x,u_worldHeight:A};return(0,c.jsx)(p,{...w,speed:o,frame:e,fragmentShader:oQ,uniforms:y})},m),oH={maxColorCount:5},oX=`#version 300 es
precision mediump float;

uniform float u_time;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colorBloom;
uniform vec4 u_colors[${oH.maxColorCount}];
uniform float u_colorsCount;

uniform float u_density;
uniform float u_spotty;
uniform float u_midSize;
uniform float u_midIntensity;
uniform float u_intensity;
uniform float u_bloom;

${d}

out vec4 fragColor;

${S}
${C}
${U}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

${k}

float raysShape(vec2 uv, float r, float freq, float intensity, float radius) {
  float a = atan(uv.y, uv.x);
  vec2 left = vec2(a * freq, r);
  vec2 right = vec2(mod(a, TWO_PI) * freq, r);
  float n_left = pow(valueNoise(left), intensity);
  float n_right = pow(valueNoise(right), intensity);
  float shape = mix(n_right, n_left, smoothstep(-.15, .15, uv.x));
  return shape;
}

void main() {
  vec2 shape_uv = v_objectUV;

  float t = .2 * u_time;

  float radius = length(shape_uv);
  float spots = 6.5 * abs(u_spotty);

  float intensity = 4. - 3. * clamp(u_intensity, 0., 1.);

  float delta = 1. - smoothstep(0., 1., radius);

  float midSize = 10. * abs(u_midSize);
  float middleShape = pow(u_midIntensity, .3) * smoothstep(midSize, 0.02 * midSize, 3.0 * radius);
  middleShape = pow(middleShape, 5.0);

  vec3 accumColor = vec3(0.0);
  float accumAlpha = 0.0;

  for (int i = 0; i < ${oH.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 rotatedUV = rotate(shape_uv, float(i) + 1.0);

    float r1 = radius * (1.0 + 0.4 * float(i)) - 3.0 * t;
    float r2 = 0.5 * radius * (1.0 + spots) - 2.0 * t;
    float density = 6. * u_density + step(.5, u_density) * pow(4.5 * (u_density - .5), 4.);
    float f = mix(1.0, 3.0 + 0.5 * float(i), hash11(float(i) * 15.)) * density;

    float ray = raysShape(rotatedUV, r1, 5.0 * f, intensity, radius);
    ray *= raysShape(rotatedUV, r2, 4.0 * f, intensity, radius);
    ray += (1. + 4. * ray) * middleShape;
    ray = clamp(ray, 0.0, 1.0);

    float srcAlpha = u_colors[i].a * ray;
    vec3 srcColor = u_colors[i].rgb * srcAlpha;

    vec3 alphaBlendColor = accumColor + (1.0 - accumAlpha) * srcColor;
    float alphaBlendAlpha = accumAlpha + (1.0 - accumAlpha) * srcAlpha;

    vec3 addBlendColor = accumColor + srcColor;
    float addBlendAlpha = accumAlpha + srcAlpha;

    accumColor = mix(alphaBlendColor, addBlendColor, u_bloom);
    accumAlpha = mix(alphaBlendAlpha, addBlendAlpha, u_bloom);
  }

  float overlayAlpha = u_colorBloom.a;
  vec3 overlayColor = u_colorBloom.rgb * overlayAlpha;

  vec3 colorWithOverlay = accumColor + accumAlpha * overlayColor;
  accumColor = mix(accumColor, colorWithOverlay, u_bloom);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;

  vec3 color = accumColor + (1. - accumAlpha) * bgColor;
  float opacity = accumAlpha + (1. - accumAlpha) * u_colorBack.a;
  color = clamp(color, 0., 1.);
  opacity = clamp(opacity, 0., 1.);

  ${z}

  fragColor = vec4(color, opacity);
}
`,oL={name:"Default",params:{...x,offsetX:0,offsetY:-.55,colorBack:"#000000",colorBloom:"#0000ff",colors:["#a600ff6e","#6200fff0","#ffffff","#33fff5"],density:.3,spotty:.3,midIntensity:.4,midSize:.2,intensity:.8,bloom:.4,speed:.75,frame:0}},oj=[oL,{name:"Warp",params:{...x,colorBack:"#000000",colorBloom:"#222288",colors:["#ff00c4","#ff8c00","#ffffff"],density:.45,spotty:.15,midIntensity:.4,midSize:.33,intensity:.79,bloom:.4,speed:2,frame:0}},{name:"Linear",params:{...x,offsetX:.2,offsetY:-.8,colorBack:"#000000",colorBloom:"#eeeeee",colors:["#ffffff1f","#ffffff3d","#ffffff29"],density:.41,spotty:.25,midSize:.1,midIntensity:.75,intensity:.79,bloom:1,speed:.5,frame:0}},{name:"Ether",params:{...x,offsetX:-.6,colorBack:"#090f1d",colorBloom:"#ffffff",colors:["#148effa6","#c4dffebe","#232a47"],density:.03,spotty:.77,midSize:.1,midIntensity:.6,intensity:.6,bloom:.6,speed:1,frame:0}}],oq=(0,t.memo)(function({speed:o=oL.params.speed,frame:e=oL.params.frame,colorBloom:a=oL.params.colorBloom,colorBack:t=oL.params.colorBack,colors:r=oL.params.colors,density:i=oL.params.density,spotty:s=oL.params.spotty,midIntensity:l=oL.params.midIntensity,midSize:n=oL.params.midSize,intensity:f=oL.params.intensity,bloom:u=oL.params.bloom,fit:m=oL.params.fit,scale:d=oL.params.scale,rotation:g=oL.params.rotation,originX:h=oL.params.originX,originY:v=oL.params.originY,offsetX:_=oL.params.offsetX,offsetY:x=oL.params.offsetY,worldWidth:A=oL.params.worldWidth,worldHeight:w=oL.params.worldHeight,...y}){let S={u_colorBloom:B(a),u_colorBack:B(t),u_colors:r.map(B),u_colorsCount:r.length,u_density:i,u_spotty:s,u_midIntensity:l,u_midSize:n,u_intensity:f,u_bloom:u,u_noiseTexture:G(),u_fit:b[m],u_scale:d,u_rotation:g,u_offsetX:_,u_offsetY:x,u_originX:h,u_originY:v,u_worldWidth:A,u_worldHeight:w};return(0,c.jsx)(p,{...y,speed:o,frame:e,fragmentShader:oX,uniforms:S})},m),oJ=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_density;
uniform float u_distortion;
uniform float u_strokeWidth;
uniform float u_strokeCap;
uniform float u_strokeTaper;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_softness;

${d}

out vec4 fragColor;

${S}
${E}

void main() {
  vec2 uv = 2. * v_patternUV;
  
  float t = u_time;
  float l = length(uv);
  float density = clamp(u_density, 0., 1.);
  l = pow(l, density);
  float angle = atan(uv.y, uv.x) - t;
  float angleNormalised = angle / TWO_PI;

  angleNormalised += .125 * u_noise * snoise(16. * pow(u_noiseFrequency, 3.) * uv);

  float offset = l + angleNormalised;
  offset -= u_distortion * (sin(4. * l - .5 * t) * cos(PI + l + .5 * t));
  float stripe = fract(offset);
  
  float shape = 2. * abs(stripe - .5);
  float width = 1. - clamp(u_strokeWidth, .005 * u_strokeTaper, 1.);


  float wCap = mix(width, (1. - stripe) * (1. - step(.5, stripe)), (1. - clamp(l, 0., 1.)));
  width = mix(width, wCap, u_strokeCap);
  width *= (1. - clamp(u_strokeTaper, 0., 1.) * l);

  float fw = fwidth(offset);
  float fwMult = 4. - 3. * (smoothstep(.05, .4, 2. * u_strokeWidth) * smoothstep(.05, .4, 2. * (1. - u_strokeWidth)));
  float pixelSize = mix(fwMult * fw, fwidth(shape), clamp(fw, 0., 1.));
  pixelSize = mix(pixelSize, .002, u_strokeCap * (1. - clamp(l, 0., 1.)));

  float res = smoothstep(width - pixelSize - u_softness, width + pixelSize + u_softness, shape);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,oK={name:"Default",params:{...A,scale:1.3,colorBack:"#001429",colorFront:"#79D1FF",density:1,distortion:0,strokeWidth:.5,strokeTaper:0,strokeCap:0,noise:0,noiseFrequency:0,softness:0,speed:1,frame:0}},oZ={name:"Droplet",params:{...A,colorBack:"#effafe",colorFront:"#bf40a0",density:.9,distortion:0,strokeWidth:.75,strokeTaper:.18,strokeCap:1,noise:.74,noiseFrequency:.33,softness:.02,speed:1,frame:0}},o$=[oK,{name:"Jungle",params:{...A,scale:1.3,density:.5,colorBack:"#a0ef2a",colorFront:"#288b18",distortion:0,strokeWidth:.5,strokeTaper:0,strokeCap:0,noise:1,noiseFrequency:.25,softness:0,speed:.75,frame:0}},oZ,{name:"Swirl",params:{...A,scale:.45,colorBack:"#b3e6d9",colorFront:"#1a2b4d",density:.2,distortion:0,strokeWidth:.5,strokeTaper:0,strokeCap:0,noise:0,noiseFrequency:.3,softness:.5,speed:1,frame:0}}],o0=(0,t.memo)(function({speed:o=oK.params.speed,frame:e=oK.params.frame,colorBack:a=oK.params.colorBack,colorFront:t=oK.params.colorFront,density:r=oK.params.density,distortion:i=oK.params.distortion,strokeWidth:s=oK.params.strokeWidth,strokeTaper:l=oK.params.strokeTaper,strokeCap:n=oK.params.strokeCap,noiseFrequency:f=oK.params.noiseFrequency,noise:u=oK.params.noise,softness:m=oK.params.softness,fit:d=oK.params.fit,rotation:g=oK.params.rotation,scale:h=oK.params.scale,originX:v=oK.params.originX,originY:_=oK.params.originY,offsetX:x=oK.params.offsetX,offsetY:A=oK.params.offsetY,worldWidth:w=oK.params.worldWidth,worldHeight:y=oK.params.worldHeight,...S}){let C={u_colorBack:B(a),u_colorFront:B(t),u_density:r,u_distortion:i,u_strokeWidth:s,u_strokeTaper:l,u_strokeCap:n,u_noiseFrequency:f,u_noise:u,u_softness:m,u_fit:b[d],u_scale:h,u_rotation:g,u_offsetX:x,u_offsetY:A,u_originX:v,u_originY:_,u_worldWidth:w,u_worldHeight:y};return(0,c.jsx)(p,{...S,speed:o,frame:e,fragmentShader:oJ,uniforms:C})},m),o1={maxColorCount:10},o2=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${o1.maxColorCount}];
uniform float u_colorsCount;
uniform float u_bandCount;
uniform float u_twist;
uniform float u_softness;
uniform float u_noise;
uniform float u_noiseFrequency;

${d}

out vec4 fragColor;

${S}
${E}
${C}

void main() {
  vec2 shape_uv = v_objectUV;

  float l = length(shape_uv);

  float t = u_time;

  float angle = ceil(u_bandCount) * atan(shape_uv.y, shape_uv.x) + t;
  float angle_norm = angle / TWO_PI;

  float twist = 3. * clamp(u_twist, 0., 1.);
  float offset = pow(l, -twist) + angle_norm;

  float shape = fract(offset);
  shape = 1. - abs(2. * shape - 1.);
  shape += u_noise * snoise(15. * pow(u_noiseFrequency, 2.) * shape_uv);

  float mid = smoothstep(.2, .4, pow(l, twist));
  shape = mix(0., shape, mid);

  float mixer = shape * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  
  float outerShape = 0.;
  for (int i = 1; i < ${o1.maxColorCount+1}; i++) {
    if (i > int(u_colorsCount)) break;

    float m = clamp(mixer - float(i - 1), 0., 1.);
    float aa = fwidth(m);
    m = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, m);

    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,o5={name:"Default",params:{...x,speed:.32,frame:0,colorBack:"#330000",colors:["#ffd1d1","#ff8a8a","#660000"],bandCount:4,twist:.1,softness:0,noiseFrequency:.4,noise:.2}},o3={name:"Opening",params:{...x,offsetX:-.4,offsetY:.86,speed:.6,frame:0,colorBack:"#8b2e5f",colors:["#ce5d43","#f7c251","#f9f871"],bandCount:3,twist:.3,softness:0,noiseFrequency:.5,noise:0}},o4=[o5,{name:"007",params:{...x,speed:1,frame:0,colorBack:"#000000",colors:["#2e2e2e","#ffffff"],bandCount:4,twist:.4,softness:0,noiseFrequency:.5,noise:0}},o3,{name:"Candy",params:{...x,speed:1,frame:0,colorBack:"#ffcd66",colors:["#6bbceb","#d7b3ff","#ff9fff"],bandCount:2,twist:.15,softness:1,noiseFrequency:.5,noise:0}}],o8=(0,t.memo)(function({speed:o=o5.params.speed,frame:e=o5.params.frame,colorBack:a=o5.params.colorBack,colors:t=o5.params.colors,bandCount:r=o5.params.bandCount,twist:i=o5.params.twist,softness:s=o5.params.softness,noiseFrequency:l=o5.params.noiseFrequency,noise:n=o5.params.noise,fit:f=o5.params.fit,rotation:u=o5.params.rotation,scale:m=o5.params.scale,originX:d=o5.params.originX,originY:g=o5.params.originY,offsetX:h=o5.params.offsetX,offsetY:v=o5.params.offsetY,worldWidth:_=o5.params.worldWidth,worldHeight:x=o5.params.worldHeight,...A}){let w={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_bandCount:r,u_twist:i,u_softness:s,u_noiseFrequency:l,u_noise:n,u_fit:b[f],u_scale:m,u_rotation:u,u_offsetX:h,u_offsetY:v,u_originX:d,u_originY:g,u_worldWidth:_,u_worldHeight:x};return(0,c.jsx)(p,{...A,speed:o,frame:e,fragmentShader:o2,uniforms:w})},m),o6=`#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

${h}

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;
uniform float u_pxSize;

out vec4 fragColor;

${E}
${S}
${k}
${R}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10,
 12,  4, 14,  6,
  3, 11,  1,  9,
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {
  float t = .5 * u_time;

  #define USE_PATTERN_SIZING
  #define USE_OBJECT_SIZING
  #define USE_PIXELIZATION
  // #define ADD_HELPERS

  ${v}

  vec2 dithering_uv = pxSizeUv;
  vec2 ditheringNoise_uv = uv * u_resolution;
  vec2 shape_uv = objectUV;
  if (u_shape < 3.5) {
    shape_uv = patternUV;
  }

  float shape = 0.;
  if (u_shape < 1.5) {
    // Simplex noise
    shape_uv *= .001;

    shape = 0.5 + 0.5 * getSimplexNoise(shape_uv, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u_shape < 2.5) {
    // Warp
    shape_uv *= .003;

    for (float i = 1.0; i < 6.0; i++) {
      shape_uv.x += 0.6 / i * cos(i * 2.5 * shape_uv.y + t);
      shape_uv.y += 0.6 / i * cos(i * 1.5 * shape_uv.x + t);
    }

    shape = .15 / abs(sin(t - shape_uv.y - shape_uv.x));
    shape = smoothstep(0.02, 1., shape);

  } else if (u_shape < 3.5) {
    // Dots
    shape_uv *= .05;

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx * 10.);
    rand = sign(rand - .5) * pow(.1 + abs(rand), .4);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(abs(shape), 6.);

  } else if (u_shape < 4.5) {
    // Sine wave
    shape_uv *= 4.;

    float wave = cos(.5 * shape_uv.x - 2. * t) * sin(1.5 * shape_uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 5.5) {
    // Ripple

    float dist = length(shape_uv);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Swirl

    float l = length(shape_uv);
    float angle = 6. * atan(shape_uv.y, shape_uv.x) + 4. * t;
    float twist = 1.2;
    float offset = pow(l, -twist) + angle / TWO_PI;
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);

  } else {
    // Sphere
    shape_uv *= 2.;

    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(d));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }


  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoise_uv), shape);
    } break;
    case 2:
      dithering = getBayerValue(dithering_uv, 2);
      break;
    case 3:
      dithering = getBayerValue(dithering_uv, 4);
      break;
    default:
      dithering = getBayerValue(dithering_uv, 8);
      break;
  }

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  #ifdef ADD_HELPERS
    vec2 helperBox = objectHelperBox;
    vec2 boxSize = objectBoxSize;
    if (u_shape < 3.5) {
      helperBox = patternHelperBox;
      boxSize = patternBoxSize;
    }
    ${_}
  #endif

  fragColor = vec4(color, opacity);
}
`,o9={simplex:1,warp:2,dots:3,wave:4,ripple:5,swirl:6,sphere:7},o7={random:1,"2x2":2,"4x4":3,"8x8":4},eo={name:"Default",params:{...A,speed:1,frame:0,colorBack:"#000000",colorFront:"#00b2ff",shape:"sphere",type:"4x4",pxSize:2}},ee={name:"Sine Wave",params:{...A,speed:1,frame:0,colorBack:"#730d54",colorFront:"#00becc",shape:"wave",type:"4x4",pxSize:11,scale:1.2}},ea={name:"Bugs",params:{...A,speed:1,frame:0,colorBack:"#000000",colorFront:"#008000",shape:"dots",type:"random",pxSize:9}},et={name:"Ripple",params:{...x,speed:1,frame:0,colorBack:"#603520",colorFront:"#c67953",shape:"ripple",type:"2x2",pxSize:3}},er={name:"Swirl",params:{...x,speed:1,frame:0,colorBack:"#000000",colorFront:"#89a7b8",shape:"swirl",type:"8x8",pxSize:2}},ei=[eo,{name:"Warp",params:{...x,speed:1,frame:0,colorBack:"#301c2a",colorFront:"#56ae6c",shape:"warp",type:"4x4",pxSize:2.5}},ee,et,ea,er],es=(0,t.memo)(function({speed:o=eo.params.speed,frame:e=eo.params.frame,colorBack:a=eo.params.colorBack,colorFront:t=eo.params.colorFront,shape:r=eo.params.shape,type:i=eo.params.type,pxSize:s=eo.params.pxSize,fit:l=eo.params.fit,scale:n=eo.params.scale,rotation:f=eo.params.rotation,originX:u=eo.params.originX,originY:m=eo.params.originY,offsetX:d=eo.params.offsetX,offsetY:g=eo.params.offsetY,worldWidth:h=eo.params.worldWidth,worldHeight:v=eo.params.worldHeight,..._}){let x={u_colorBack:B(a),u_colorFront:B(t),u_shape:o9[r],u_type:o7[i],u_pxSize:s,u_fit:b[l],u_scale:n,u_rotation:f,u_offsetX:d,u_offsetY:g,u_originX:u,u_originY:m,u_worldWidth:h,u_worldHeight:v};return(0,c.jsx)(p,{..._,speed:o,frame:e,fragmentShader:o6,uniforms:x})}),el={maxColorCount:7},en=`#version 300 es
precision lowp float;

uniform mediump float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;

uniform sampler2D u_noiseTexture;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${el.maxColorCount}];
uniform float u_colorsCount;
uniform float u_softness;
uniform float u_intensity;
uniform float u_noise;
uniform float u_shape;

uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

${d}
${g}

out vec4 fragColor;

${S}
${E}
${C}
${R}
${U}

float valueNoiseR(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbmR(vec2 n) {
  float total = 0.;
  float amplitude = .2;
  for (int i = 0; i < 3; i++) {
    n = rotate(n, .3);
    total += valueNoiseR(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.6;
  }
  return total;
}

${k}

vec2 truchet(vec2 uv, float idx){
    idx = fract(((idx - .5) * 2.));
    if (idx > 0.75) {
        uv = vec2(1.0) - uv;
    } else if (idx > 0.5) {
        uv = vec2(1.0 - uv.x, uv.y);
    } else if (idx > 0.25) {
        uv = 1.0 - vec2(1.0 - uv.x, uv.y);
    }
    return uv;
}

void main() {

  float t = .1 * u_time;

  vec2 shape_uv = vec2(0.);
  vec2 grain_uv = vec2(0.);

  if (u_shape > 3.5) {
    shape_uv = v_objectUV;
    grain_uv = shape_uv;

    // apply inverse transform to grain_uv so it respects the originXY
    float r = u_rotation * 3.14159265358979323846 / 180.;
    mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
    vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u_scale;
    grain_uv -= graphicOffset;
    grain_uv *= v_objectBoxSize;
    grain_uv *= .7;
  } else {
    shape_uv = .5 * v_patternUV;
    grain_uv = 100. * v_patternUV;

    // apply inverse transform to grain_uv so it respects the originXY
    float r = u_rotation * 3.14159265358979323846 / 180.;
    mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
    vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
    grain_uv = transpose(graphicRotation) * grain_uv;
    grain_uv *= u_scale;
    if (u_fit > 0.) {
      vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
      givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
      float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
      vec2 patternBoxGivenSize = vec2(
        (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
        (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
      );
      patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
      float patternBoxNoFitBoxWidth = patternBoxRatio * min(patternBoxGivenSize.x / patternBoxRatio, patternBoxGivenSize.y);
      grain_uv /= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
    }
    vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
    grain_uv -= graphicOffset / patternBoxScale;
    grain_uv *= 1.6;
  }


  float shape = 0.;

  if (u_shape < 1.5) {
    // Sine wave

    float wave = cos(.5 * shape_uv.x - 4. * t) * sin(1.5 * shape_uv.x + 2. * t) * (.75 + .25 * cos(6. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 2.5) {
    // Grid (dots)

    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx + 2.);
    rand = sign(rand - .5) * pow(.2 + abs(rand), .3);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(shape, 4.);

  } else if (u_shape < 3.5) {
    // Truchet pattern

    float n2 = valueNoiseR(shape_uv * .4 - 3.75 * t);
    shape_uv.x += 10.;
    shape_uv *= .6;

    vec2 tile = truchet(fract(shape_uv), randomR(floor(shape_uv)));

    float distance1 = length(tile);
    float distance2 = length(tile - vec2(1.));

    n2 -= .5;
    n2 *= .1;
    shape = smoothstep(.2, .55, distance1 + n2) * smoothstep(.8, .45, distance1 - n2);
    shape += smoothstep(.2, .55, distance2 + n2) * smoothstep(.8, .45, distance2 - n2);

    shape = pow(shape, 1.5);

  } else if (u_shape < 4.5) {
    // Corners

    shape_uv *= .6;
    vec2 outer = vec2(.5);

    vec2 bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * sin(5.25 * t)));
    vec2 tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape = 1. - bl.x * bl.y * tr.x * tr.y;

    shape_uv = -shape_uv;
    bl = smoothstep(vec2(0.), outer, shape_uv + vec2(.1 + .1 * sin(3. * t), .2 - .1 * cos(5.25 * t)));
    tr = smoothstep(vec2(0.), outer, 1. - shape_uv);
    shape -= bl.x * bl.y * tr.x * tr.y;

    shape = 1. - smoothstep(0., 1., shape);

  } else if (u_shape < 5.5) {
    // Ripple

    shape_uv *= 2.;
    float dist = length(.4 * shape_uv);
    float waves = sin(pow(dist, 1.2) * 5. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Blob

    t *= 2.;

    vec2 f1_traj = .25 * vec2(1.3 * sin(t), .2 + 1.3 * cos(.6 * t + 4.));
    vec2 f2_traj = .2 * vec2(1.2 * sin(-t), 1.3 * sin(1.6 * t));
    vec2 f3_traj = .25 * vec2(1.7 * cos(-.6 * t), cos(-1.6 * t));
    vec2 f4_traj = .3 * vec2(1.4 * cos(.8 * t), 1.2 * sin(-.6 * t - 3.));

    shape = .5 * pow(1. - clamp(0., 1., length(shape_uv + f1_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f2_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f3_traj)), 5.);
    shape += .5 * pow(1. - clamp(0., 1., length(shape_uv + f4_traj)), 5.);

    shape = smoothstep(.0, .9, shape);
    float edge = smoothstep(.25, .3, shape);
    shape = mix(.0, shape, edge);

  } else {
    // Sphere

    shape_uv *= 2.;
    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(d));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }

  float simplex = snoise(grain_uv * .5);
  float grainDist = simplex * snoise(grain_uv * .2) - fbmR(.002 * grain_uv + 10.) - fbmR(.003 * grain_uv);
  float rawNoise = .6 * simplex - fbmR(rotate(.4 * grain_uv, 2.)) - fbmR(.001 * grain_uv);
  float noise = clamp(rawNoise, 0., 1.);

  shape += u_intensity * 2. / u_colorsCount * (grainDist + .5);
  shape += u_noise * 10. / u_colorsCount * noise;

  float aa = fwidth(shape);

  shape = clamp(shape - .5 / u_colorsCount, 0., 1.);
  float totalShape = smoothstep(0., u_softness + 2. * aa, clamp(shape * u_colorsCount, 0., 1.));
  float mixer = shape * (u_colorsCount - 1.);

  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  for (int i = 1; i < ${el.maxColorCount}; i++) {
    if (i > int(u_colorsCount) - 1) break;

    float localT = clamp(mixer - float(i - 1), 0., 1.);
    localT = smoothstep(.5 - .5 * u_softness - aa, .5 + .5 * u_softness + aa, localT);

    vec4 c = u_colors[i];
    c.rgb *= c.a;
    gradient = mix(gradient, c, localT);
  }

  vec3 color = gradient.rgb * totalShape;
  float opacity = gradient.a * totalShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  fragColor = vec4(color, opacity);
}
`,ef={wave:1,dots:2,truchet:3,corners:4,ripple:5,blob:6,sphere:7},ec={name:"Default",params:{...x,speed:1,frame:0,colorBack:"#000000",colors:["#7300ff","#eba8ff","#00bfff","#2a00ff"],softness:.5,intensity:.5,noise:1,shape:"corners"}},eu={name:"Wave",params:{...A,speed:1,frame:0,colorBack:"#000a0f",colors:["#c4730b","#bdad5f","#d8ccc7"],softness:.7,intensity:.15,noise:.5,shape:"wave"}},ep={name:"Dots",params:{...A,scale:.6,speed:1,frame:0,colorBack:"#0a0000",colors:["#6f0000","#0080ff","#f2ebc9","#33cc33"],softness:1,intensity:1,noise:.7,shape:"dots"}},em=[ec,eu,ep,{name:"Truchet",params:{...A,speed:1,frame:0,colorBack:"#0a0000",colors:["#6f2200","#eabb7c","#39b523"],softness:0,intensity:.2,noise:1,shape:"truchet"}},{name:"Ripple",params:{...x,scale:.5,speed:1,frame:0,colorBack:"#140a00",colors:["#6f2d00","#88ddae","#2c0b1d"],softness:.5,intensity:.5,noise:.5,shape:"ripple"}},{name:"Blob",params:{...x,scale:1.3,speed:1,frame:0,colorBack:"#0f0e18",colors:["#3e6172","#a49b74","#568c50"],softness:0,intensity:.15,noise:.5,shape:"blob"}}],ed=(0,t.memo)(function({speed:o=ec.params.speed,frame:e=ec.params.frame,colorBack:a=ec.params.colorBack,colors:t=ec.params.colors,softness:r=ec.params.softness,intensity:i=ec.params.intensity,noise:s=ec.params.noise,shape:l=ec.params.shape,fit:n=ec.params.fit,scale:f=ec.params.scale,rotation:u=ec.params.rotation,originX:m=ec.params.originX,originY:d=ec.params.originY,offsetX:g=ec.params.offsetX,offsetY:h=ec.params.offsetY,worldWidth:v=ec.params.worldWidth,worldHeight:_=ec.params.worldHeight,...x}){let A={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_softness:r,u_intensity:i,u_noise:s,u_shape:ef[l],u_noiseTexture:G(),u_fit:b[n],u_scale:f,u_rotation:u,u_offsetX:g,u_offsetY:h,u_originX:m,u_originY:d,u_worldWidth:v,u_worldHeight:_};return(0,c.jsx)(p,{...x,speed:o,frame:e,fragmentShader:en,uniforms:A})}),eg=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_shape;

${d}

out vec4 fragColor;

${S}
${C}
${E}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {
  
  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));
  
  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

void main() {

  float t = .1 * u_time;

  vec2 uv = v_objectUV;
  uv += .5;
  uv.y = 1. - uv.y;

  float cycleWidth = .5 * u_repetition;

  float mask = 1.;
  float contOffset = 1.;

  if (u_shape < 1.) {

    vec2 borderUV = v_responsiveUV + .5;
    float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
    vec2 edge = min(borderUV, 1. - borderUV);
    vec2 pixel_thickness = 250. / v_responsiveBoxGivenSize;
    float maskX = smoothstep(0.0, pixel_thickness.x, edge.x);
    float maskY = smoothstep(0.0, pixel_thickness.y, edge.y);
    maskX = pow(maskX, .25);
    maskY = pow(maskY, .25);
    mask = clamp(1. - maskX * maskY, 0., 1.);

    uv = v_responsiveUV;
    if (ratio > 1.) {
      uv.y /= ratio;
    } else {
      uv.x *= ratio;
    }
    uv += .5;
    uv.y = 1. - uv.y;

    cycleWidth *= 2.;
    contOffset = 1.5;

  } else if (u_shape < 2.) {
    vec2 shapeUV = uv - .5;
    shapeUV *= .67;
    mask = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
  } else if (u_shape < 3.) {
    vec2 shapeUV = uv - .5;
    shapeUV *= 1.68;

    float r = length(shapeUV) * 2.;
    float a = atan(shapeUV.y, shapeUV.x) + .2;
    r *= (1. + .05 * sin(3. * a + 2. * t));
    float f = abs(cos(a * 3.));
    mask = smoothstep(f, f + .7, r);
    mask = pow(mask, 2.);

    uv *= .8;
    cycleWidth *= 1.6;

  } else if (u_shape < 4.) {
    vec2 shapeUV = uv - .5;
    shapeUV *= 1.3;
    mask = 0.;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float speed = 4.5 + 2. * sin(fi * 12.345);
      float angle = -fi * 1.5;
      vec2 dir1 = vec2(cos(angle), sin(angle));
      vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
      vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
      float d = length(shapeUV + traj);
      mask += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
    }
    mask = 1. - smoothstep(.65, .9, mask);
    mask = pow(mask, 4.);
  }

  float opacity = 1. - smoothstep(.82 - 2. * fwidth(mask), .82, mask);

  float ridge = .15 * (smoothstep(.0, .15, uv.y) * smoothstep(.4, .15, uv.y));
  ridge += .05 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
  mask += ridge;

  float diagBLtoTR = uv.x - uv.y;
  float diagTLtoBR = uv.x + uv.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  mask += (1. - mask) * u_distortion * noise;

  direction += diagBLtoTR;

  float contour = u_contour * smoothstep(0., contOffset + .01, mask) * smoothstep(contOffset + .01, 0., mask);
  direction -= 14. * noise * contour;

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - mask) * bump);
  direction *= smoothstep(1., .2, mask);


  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  float dispersionRed = colorDispersion;
  dispersionRed += bump * noise;
  float dispersionBlue = colorDispersion;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = u_softness / 15. + .3 * contour;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., mask + bump);
  float stripe_r = mod(direction + dispersionRed, 1.);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r), bump, u_colorTint.r);
  float stripe_g = mod(direction, 1.);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g), bump, u_colorTint.g);
  float stripe_b = mod(direction - dispersionBlue, 1.);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,eh={none:0,circle:1,daisy:2,metaballs:3},ev={name:"Default",params:{...x,scale:.7,speed:1,frame:8e3,colorBack:"#000000",colorTint:"#ffffff",softness:.3,repetition:4,shiftRed:.3,shiftBlue:.3,distortion:.1,contour:1,shape:"circle"}},e_={name:"Drops",params:{...x,speed:1,frame:0,colorBack:"#ffffff00",colorTint:"#ffffff",softness:.3,repetition:3,shiftRed:.3,shiftBlue:.3,distortion:.3,contour:.88,shape:"metaballs"}},ex=[ev,{name:"Contained",params:{...x,speed:1,frame:0,colorBack:"#ffffff00",colorTint:"#ffffff",softness:.3,repetition:3,shiftRed:.3,shiftBlue:.3,distortion:.07,contour:0,shape:"none",worldWidth:0,worldHeight:0}},e_,{name:"Full Screen",params:{...x,scale:2.2,speed:1,frame:0,colorBack:"#00042e",colorTint:"#5b4dc7",softness:.45,repetition:4,shiftRed:-.5,shiftBlue:-1,distortion:.1,contour:1,shape:"none"}}],eA=(0,t.memo)(function({colorBack:o=ev.params.colorBack,colorTint:e=ev.params.colorTint,speed:a=ev.params.speed,frame:t=ev.params.frame,softness:r=ev.params.softness,repetition:i=ev.params.repetition,shiftRed:s=ev.params.shiftRed,shiftBlue:l=ev.params.shiftBlue,distortion:n=ev.params.distortion,contour:f=ev.params.contour,shape:u=ev.params.shape,fit:m=ev.params.fit,scale:d=ev.params.scale,rotation:g=ev.params.rotation,originX:h=ev.params.originX,originY:v=ev.params.originY,offsetX:_=ev.params.offsetX,offsetY:x=ev.params.offsetY,worldWidth:A=ev.params.worldWidth,worldHeight:w=ev.params.worldHeight,...y}){let S={u_colorBack:B(o),u_colorTint:B(e),u_softness:r,u_repetition:i,u_shiftRed:s,u_shiftBlue:l,u_distortion:n,u_contour:f,u_shape:eh[u],u_fit:b[m],u_scale:d,u_rotation:g,u_offsetX:_,u_offsetY:x,u_originX:h,u_originY:v,u_worldWidth:A,u_worldHeight:w};return(0,c.jsx)(p,{...y,speed:a,frame:t,fragmentShader:eg,uniforms:S})},m),eb={maxColorCount:5,maxSpots:4},eB=`#version 300 es
precision lowp float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${eb.maxColorCount}];
uniform float u_colorsCount;
uniform float u_roundness;
uniform float u_thickness;
uniform float u_softness;
uniform float u_intensity;
uniform float u_bloom;
uniform float u_spotSize;
uniform float u_spots;
uniform float u_pulse;
uniform float u_smoke;
uniform float u_smokeSize;

uniform sampler2D u_noiseTexture;

${d}

out vec4 fragColor;

${S}

float beat(float time) {
  float first = pow(sin(time * TWO_PI), 10.);
  float second = pow(sin((time - 0.15) * TWO_PI), 10.);

  return clamp(first + 0.6 * second, 0.0, 1.0);
}

float roundedBox(vec2 uv, float distance) {
  float thickness = .5 * u_thickness;
  float borderDistance = abs(distance);
  float border = 1. - smoothstep(-u_softness * thickness - 2. * fwidth(borderDistance), .5 * u_softness * thickness, borderDistance - .5 * thickness);
  border = pow(border, 2.);

  return border;
}

float roundedBoxSmoke(vec2 uv, float distance, float size) {
  float borderDistance = abs(distance);
  float border = 1. - smoothstep(-.75 * size, .75 * size, borderDistance);
  border *= border;
  return border;
}

${F}

float randomG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomG(i);
  float b = randomG(i + vec2(1.0, 0.0));
  float c = randomG(i + vec2(0.0, 1.0));
  float d = randomG(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float linearstep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  float t = 1.2 * u_time;

  vec2 borderUV = v_responsiveUV;

  float angle = atan(borderUV.y, borderUV.x) / TWO_PI;

  float pulse = u_pulse * beat(.18 * u_time);

  float borderRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  borderUV.x *= borderRatio;
  vec2 halfSize = vec2(.5);
  halfSize.x *= borderRatio;
  float radius = min(.5 * u_roundness, halfSize.x);
  vec2 d = abs(borderUV) - halfSize + radius;
  float outsideDistance = length(max(d, 0.)) - radius;
  float insideDistance = min(max(d.x, d.y), 0.0);
  float distance = outsideDistance + insideDistance;

  float border = roundedBox(borderUV, distance);

  vec2 v0 = borderUV + halfSize;
  vec2 v1 = borderUV - vec2(-halfSize.x, halfSize.y);
  vec2 v2 = borderUV - vec2(halfSize.x, -halfSize.y);
  vec2 v3 = borderUV - halfSize;

  float cornerFade = 1. - abs(v0.x - v0.y);
  cornerFade = max(cornerFade, 1. - abs(v1.x + v1.y));
  cornerFade = max(cornerFade, 1. - abs(v2.x + v2.y));
  cornerFade = max(cornerFade, 1. - abs(v3.x - v3.y));
  cornerFade = .75 * pow(cornerFade, 20.);

  float cornerFadeMask = 0.;
  float maskR = (.35 * u_thickness - .25 * radius);
  float maskHL = linearstep(halfSize.x - .25 * u_thickness, halfSize.x, borderUV.x);
  float maskHR = linearstep(halfSize.x - .25 * u_thickness, halfSize.x, -borderUV.x);
  float maskVT = linearstep(halfSize.y - .25 * u_thickness, halfSize.y, -borderUV.y);
  float maskVB = linearstep(halfSize.y - .25 * u_thickness, halfSize.y, borderUV.y);
  float maskOffset = .25 * (u_thickness + radius);
  {
    float m = maskHR;
    m *= maskVT;
    m *= (1. - clamp(length((v0 - maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHR;
    m *= maskVB;
    m *= (1. - clamp(length((v1 - vec2(1., -1.) * maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHL;
    m *= maskVT;
    m *= (1. - clamp(length((v2 - vec2(-1., 1.) * maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }
  {
    float m = maskHL;
    m *= maskVB;
    m *= (1. - clamp(length((v3 + maskOffset) / maskR), 0., 1.));
    cornerFadeMask += m;
  }

  cornerFade *= cornerFadeMask;
  border += cornerFade;

  vec2 smokeUV = .2 * u_smokeSize * v_patternUV;
  float smoke = clamp(3. * valueNoise(2.7 * smokeUV + .5 * t), 0., 1.);
  smoke -= valueNoise(3.4 * smokeUV - .5 * t);
  smoke *= roundedBoxSmoke(borderUV, distance, u_smoke);
  smoke = 30. * pow(smoke, 2.);
  smoke += cornerFadeMask;
  smoke *= u_smoke;
  smoke *= mix(1., pulse, u_pulse);
  smoke = clamp(smoke, 0., 1.);

  border += smoke;
  border = clamp(border, 0., 1.);

  vec3 blendColor = vec3(0.);
  float blendAlpha = 0.0;
  vec3 addColor = vec3(0.);
  float addAlpha = 0.0;

  float bloom = 4. * u_bloom;
  float intensity = 1. + 4. * u_intensity;

  for (int colorIdx = 0; colorIdx < ${eb.maxColorCount}; colorIdx++) {
    if (colorIdx >= int(u_colorsCount)) break;
    float colorIdxF = float(colorIdx);

    vec3 c = u_colors[colorIdx].rgb * u_colors[colorIdx].a;
    float a = u_colors[colorIdx].a;

    for (int spotIdx = 0; spotIdx < ${eb.maxSpots}; spotIdx++) {
      if (spotIdx >= int(u_spots)) break;
      float spotIdxF = float(spotIdx);

      vec2 randVal = randomGB(vec2(spotIdxF * 10. + 2., 40. + colorIdxF));

      float time = (.1 + .15 * abs(sin(spotIdxF * (2. + colorIdxF)) * cos(spotIdxF * (2. + 2.5 * colorIdxF)))) * t + randVal.x * 3.;
      time *= mix(1., -1., step(.5, randVal.y));

      float mask = .5 + .5 * mix(
        sin(t + spotIdxF * (5. - 1.5 * colorIdxF)),
        cos(t + spotIdxF * (3. + 1.3 * colorIdxF)),
        step(mod(colorIdxF, 2.), .5)
      );

      float p = clamp(2. * u_pulse - randVal.x, 0., 1.);
      mask = mix(mask, pulse, p);

      float atg1 = fract(angle + time);
      float spotSize = .05 + .6 * pow(u_spotSize, 2.) + .05 * randVal.x;
      spotSize = mix(spotSize, .1, p);
      float sector = smoothstep(.5 - spotSize, .5, atg1) * smoothstep(.5 + spotSize, .5, atg1);

      sector *= mask;
      sector *= border;
      sector *= intensity;
      sector = clamp(sector, 0., 1.);

      vec3 srcColor = c * sector;
      float srcAlpha = a * sector;

      blendColor += ((1. - blendAlpha) * srcColor);
      blendAlpha = blendAlpha + (1. - blendAlpha) * srcAlpha;
      addColor += srcColor;
      addAlpha += srcAlpha;
    }
  }

  vec3 accumColor = mix(blendColor, addColor, bloom);
  float accumAlpha = mix(blendAlpha, addAlpha, bloom);
  accumAlpha = clamp(accumAlpha, 0., 1.);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  vec3 color = accumColor + (1. - accumAlpha) * bgColor;
  float opacity = accumAlpha + (1. - accumAlpha) * u_colorBack.a;

  ${z}

  fragColor = vec4(color, opacity);
}`,ew={name:"Default",params:{...x,scale:.5,speed:1,frame:0,colorBack:"#000000",colors:["#f22652","#4da6e6","#ffa600"],roundness:.25,thickness:.2,softness:.75,intensity:.2,bloom:.45,spots:3,spotSize:.4,pulse:.2,smoke:.35,smokeSize:.6}},ey=[ew,{name:"Circle",params:{...x,worldWidth:400,worldHeight:400,scale:.6,speed:1,frame:0,colorBack:"#110222",colors:["#ffdd33","#ff0000","#00ffff"],roundness:1,thickness:.4,softness:1,intensity:.8,bloom:.8,spots:2,spotSize:.45,pulse:0,smoke:.25,smokeSize:.62}},{name:"Northern lights",params:{...x,speed:.18,frame:0,colors:["#3426f2","#156ba8","#126964","#0affba","#4733cc"],colorBack:"#002942",roundness:0,thickness:1,softness:1,intensity:0,bloom:.5,spots:4,spotSize:0,pulse:0,smoke:.7,smokeSize:.7}},{name:"Solid line",params:{...x,speed:2,frame:0,colors:["#759717","#ff0073","#00ffb3"],colorBack:"#000000",roundness:.05,thickness:.03,softness:0,intensity:0,bloom:.15,spots:4,spotSize:.28,pulse:0,smoke:0,smokeSize:.63}}],eS=(0,t.memo)(function({speed:o=ew.params.speed,frame:e=ew.params.frame,colors:a=ew.params.colors,colorBack:t=ew.params.colorBack,roundness:r=ew.params.roundness,thickness:i=ew.params.thickness,softness:s=ew.params.softness,bloom:l=ew.params.bloom,intensity:n=ew.params.intensity,spots:f=ew.params.spots,spotSize:u=ew.params.spotSize,pulse:m=ew.params.pulse,smoke:d=ew.params.smoke,smokeSize:g=ew.params.smokeSize,fit:h=ew.params.fit,rotation:v=ew.params.rotation,scale:_=ew.params.scale,originX:x=ew.params.originX,originY:A=ew.params.originY,offsetX:w=ew.params.offsetX,offsetY:y=ew.params.offsetY,worldWidth:S=ew.params.worldWidth,worldHeight:C=ew.params.worldHeight,...k}){let R={u_colorBack:B(t),u_colors:a.map(B),u_colorsCount:a.length,u_roundness:r,u_thickness:i,u_softness:s,u_intensity:n,u_bloom:l,u_spots:f,u_spotSize:u,u_pulse:m,u_smoke:d,u_smokeSize:g,u_noiseTexture:G(),u_fit:b[h],u_rotation:v,u_scale:_,u_offsetX:w,u_offsetY:y,u_originX:x,u_originY:A,u_worldWidth:S,u_worldHeight:C};return(0,c.jsx)(p,{...k,speed:o,frame:e,fragmentShader:eB,uniforms:R})},m),eC={maxColorCount:7},ek=`#version 300 es
precision lowp float;

uniform float u_time;
uniform mediump float u_scale;

uniform vec4 u_colors[${eC.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform float u_density;
uniform float u_angle1;
uniform float u_angle2;
uniform float u_length;
uniform bool u_edges;
uniform float u_blur;
uniform float u_fadeIn;
uniform float u_fadeOut;
uniform float u_gradient;

${d}

out vec4 fragColor;

${S}

const float zLimit = .5;

vec2 getPanel(float angle, vec2 uv, float invLength, float aa) {
  float sinA = sin(angle);
  float cosA = cos(angle);

  float denom = sinA - uv.y * cosA;
  if (abs(denom) < .01) return vec2(0.);
  
  float z = uv.y / denom;

  if (z <= 0. || z > zLimit) return vec2(0.);

  float zRatio = z / zLimit;
  float panelMap = 1. - zRatio;
  float x = uv.x * (cosA * z + 1.) * invLength;

  float zOffset = zRatio - .5;
  float left = -.5 + zOffset * u_angle1;
  float right = .5 - zOffset * u_angle2;
  float blurX = aa + panelMap * u_blur;

  float leftEdge1 = left - .5 * blurX;
  float leftEdge2 = left + blurX;
  float rightEdge1 = right - blurX;
  float rightEdge2 = right + .5 * blurX;

  float panel = smoothstep(leftEdge1, leftEdge2, x) * (1.0 - smoothstep(rightEdge1, rightEdge2, x));
  panel *= mix(0., panel, smoothstep(0., .01 / u_scale, panelMap));

  float midScreen = abs(sinA);
  if (u_edges == true) {
    panelMap = mix(.99, panelMap, panel * clamp(panelMap / (.15 * (1. - pow(midScreen, .1))), 0.0, 1.0));
  } else if (midScreen < .07) {
    panel *= (midScreen * 15.);
  }
  
  return vec2(panel, panelMap);
}

vec4 blendColor(vec4 colorA, float panelMask, float panelMap) {
  float fade = smoothstep(1., .97 - .97 * u_fadeIn, panelMap);
  fade *= smoothstep(-.2 * (1. - u_fadeOut), u_fadeOut, panelMap);

  vec3 blendedRGB = mix(vec3(0.), colorA.rgb, fade);
  float blendedAlpha = mix(0., colorA.a, fade);

  return vec4(blendedRGB, blendedAlpha) * panelMask;
}

void main() {
  vec2 uv = v_objectUV;
  uv *= 1.25;

  float t = .02 * u_time;
  t = fract(t);
  bool reverseTime = (t < 0.5);

  vec3 color = vec3(0.);
  float opacity = 0.;

  float aa = .005 / u_scale;
  int colorsCount = int(u_colorsCount);

  vec4 premultipliedColors[${eC.maxColorCount}];
  for (int i = 0; i < ${eC.maxColorCount}; i++) {
    if (i >= colorsCount) break;
    vec4 c = u_colors[i];
    c.rgb *= c.a;
    premultipliedColors[i] = c;
  }

  float invLength = 1.5 / (u_length + 0.001);

  float totalColorWeight = 0.;
  int panelsNumber = 12;

  float densityNormalizer = 1.;
  if (colorsCount == 4) {
    panelsNumber = 16;
    densityNormalizer = 1.34;
  } else if (colorsCount == 5) {
    panelsNumber = 20;
    densityNormalizer = 1.67;
  } else if (colorsCount == 7) {
    panelsNumber = 14;
    densityNormalizer = 1.17;
  }

  float fPanelsNumber = float(panelsNumber);

  float totalPanelsShape = 0.;
  float panelGrad = 1. - clamp(u_gradient, 0., 1.);

  for (int set = 0; set < 2; set++) {
    bool isForward = (set == 0 && !reverseTime) || (set == 1 && reverseTime);
    if (!isForward) continue;

    for (int i = 0; i <= 20; i++) {
      if (i >= panelsNumber) break;

      int idx = panelsNumber - 1 - i;

      float offset = float(idx) / fPanelsNumber;
      if (set == 1) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(t + offset);
      float angleNorm = densityFract / u_density;
      if (densityFract >= .5 || angleNorm >= .3) continue;

      float smoothDensity = clamp((.5 - densityFract) / .1, 0., 1.) * clamp(densityFract / .01, 0., 1.);
      float smoothAngle = clamp((.3 - angleNorm) / .05, 0., 1.);
      if (smoothDensity * smoothAngle < .001) continue;

      if (angleNorm > .5) {
        angleNorm = 0.5;
      }
      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength, aa);
      if (panel[0] <= .001) continue;
      float panelMask = panel[0] * smoothDensity * smoothAngle;
      float panelMap = panel[1];

      int colorIdx = idx % colorsCount;
      int nextColorIdx = (idx + 1) % colorsCount;

      vec4 colorA = premultipliedColors[colorIdx];
      vec4 colorB = premultipliedColors[nextColorIdx];

      colorA = mix(colorA, colorB, max(0., smoothstep(.0, .45, panelMap) - panelGrad));
      vec4 blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1. - blended.a);
      opacity = blended.a + opacity * (1. - blended.a);
    }


    for (int i = 0; i <= 20; i++) {
      if (i >= panelsNumber) break;

      int idx = panelsNumber - 1 - i;

      float offset = float(idx) / fPanelsNumber;
      if (set == 0) {
        offset += .5;
      }

      float densityFract = densityNormalizer * fract(-t + offset);
      float angleNorm = -densityFract / u_density;
      if (densityFract >= .5 || angleNorm < -.3) continue;

      float smoothDensity = clamp((.5 - densityFract) / .1, 0., 1.) * clamp(densityFract / .01, 0., 1.);
      float smoothAngle = clamp((angleNorm + .3) / .05, 0., 1.);
      if (smoothDensity * smoothAngle < .001) continue;

      vec2 panel = getPanel(angleNorm * TWO_PI + PI, uv, invLength, aa);
      float panelMask = panel[0] * smoothDensity * smoothAngle;
      if (panelMask <= .001) continue;
      float panelMap = panel[1];

      int colorIdx = (colorsCount - (idx % colorsCount)) % colorsCount;
      if (colorIdx < 0) colorIdx += colorsCount;
      int nextColorIdx = (colorIdx + 1) % colorsCount;

      vec4 colorA = premultipliedColors[colorIdx];
      vec4 colorB = premultipliedColors[nextColorIdx];

      colorA = mix(colorA, colorB, max(0., smoothstep(.0, .45, panelMap) - panelGrad));
      vec4 blended = blendColor(colorA, panelMask, panelMap);
      color = blended.rgb + color * (1. - blended.a);
      opacity = blended.a + opacity * (1. - blended.a);
    }
  }

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  ${z}

  fragColor = vec4(color, opacity);
}
`,eR={name:"Default",params:{...x,speed:.5,frame:0,colors:["#ff9d00","#fd4f30","#809bff","#6d2eff","#333aff","#f15cff","#ffd557"],colorBack:"#080808",angle1:0,angle2:0,length:1.1,edges:!0,blur:0,fadeIn:1,fadeOut:.3,gradient:0,density:3}},eU=[eR,{name:"Glass",params:{...x,rotation:112,speed:1,frame:0,colors:["#00cfff","#ff2d55","#34c759","#af52de"],colorBack:"#ffffff",angle1:.3,angle2:.3,length:1,edges:!0,blur:.25,fadeIn:.85,fadeOut:.3,gradient:0,density:1.6}},{name:"Gradient",params:{...x,speed:.5,frame:0,colors:["#f2ff00","#00000000","#00000000","#5a0283","#005eff"],colorBack:"#8ffff2",angle1:.4,angle2:.4,length:3,edges:!1,blur:.5,fadeIn:1,fadeOut:.39,gradient:.78,density:1.65,scale:1.72,rotation:270,offsetX:.18}},{name:"Opening",params:{...x,speed:2,frame:0,colors:["#00ffff"],colorBack:"#570044",angle1:-1,angle2:-1,length:.52,edges:!1,blur:0,fadeIn:0,fadeOut:1,gradient:0,density:2.21,scale:2.32,rotation:360,offsetX:-.3,offsetY:.6}}],eF=(0,t.memo)(function({speed:o=eR.params.speed,frame:e=eR.params.frame,colors:a=eR.params.colors,colorBack:t=eR.params.colorBack,angle1:r=eR.params.angle1,angle2:i=eR.params.angle2,length:s=eR.params.length,edges:l=eR.params.edges,blur:n=eR.params.blur,fadeIn:f=eR.params.fadeIn,fadeOut:u=eR.params.fadeOut,density:m=eR.params.density,gradient:d=eR.params.gradient,fit:g=eR.params.fit,scale:h=eR.params.scale,rotation:v=eR.params.rotation,originX:_=eR.params.originX,originY:x=eR.params.originY,offsetX:A=eR.params.offsetX,offsetY:w=eR.params.offsetY,worldWidth:y=eR.params.worldWidth,worldHeight:S=eR.params.worldHeight,...C}){let k={u_colors:a.map(B),u_colorsCount:a.length,u_colorBack:B(t),u_angle1:r,u_angle2:i,u_length:s,u_edges:l,u_blur:n,u_fadeIn:f,u_fadeOut:u,u_density:m,u_gradient:d,u_fit:b[g],u_scale:h,u_rotation:v,u_offsetX:A,u_offsetY:w,u_originX:_,u_originY:x,u_worldWidth:y,u_worldHeight:S};return(0,c.jsx)(p,{...C,speed:o,frame:e,fragmentShader:ek,uniforms:k})},m),ez={maxColorCount:10},eE=`#version 300 es
precision mediump float;

uniform vec4 u_colors[${ez.maxColorCount}];
uniform float u_colorsCount;

uniform float u_positions;
uniform float u_waveX;
uniform float u_waveXShift;
uniform float u_waveY;
uniform float u_waveYShift;
uniform float u_mixing;
uniform float u_grainMixer;
uniform float u_grainOverlay;

uniform sampler2D u_noiseTexture;

${d}
${h}

out vec4 fragColor;

${S}
${C}
${I}


vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + mod(float(i), 3.) * .3;
  float c = .8 + mod(float(i + 1), 4.) * 0.25;

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += .5;

  vec2 grainUV = v_objectUV * 120.;
  float grain = fiberNoise(grainUV, vec2(0.));
  float mixerGrain = .2 * u_grainMixer * (grain - .5);

  float radius = smoothstep(0., 1., length(uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    uv.x += u_waveX * center / i * cos(TWO_PI * u_waveXShift + i * 2. * smoothstep(.0, 1., uv.y));
    uv.y += u_waveY * center / i * cos(TWO_PI * u_waveYShift + i * 2. * smoothstep(.0, 1., uv.x));
  }
  
  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;
  float positionSeed = 25. + .33 * u_positions;

  for (int i = 0; i < ${ez.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, positionSeed) + mixerGrain;
    float dist = length(uv - pos);
    dist = length(uv - pos);

    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float power = 4.;
    if (u_mixing > .5) {
      power = mix(power, .75, 2. * (u_mixing - .5));
    }
    dist = pow(dist, power);

    float w = 1. / (dist + 1e-3);
    if (u_mixing < .5) {
      w = pow(w, mix(mix(.01, 5., clamp(w, 0., 1.)), 1., 2. * u_mixing));
    }
    color += colorFraction * w;
    opacity += opacityFraction * w;
    totalWeight += w;
  }

  color /= totalWeight;
  opacity /= totalWeight;

  float rr = fiberNoise(rotate(grainUV, 1.), vec2(3.));
  float gg = fiberNoise(rotate(grainUV, 2.) + 10., vec2(-1.));
  float bb = fiberNoise(grainUV - 2., vec2(5.));
  vec3 grainColor = vec3(rr, gg, bb) - 1.;
  color = mix(color, grainColor, .2 * u_grainOverlay);
  
  ${z}

  fragColor = vec4(color, opacity);
}
`,eI={name:"Default",params:{...x,speed:0,frame:0,colors:["#ffad0a","#6200ff","#e2a3ff","#ff99fd"],positions:2,waveX:1,waveXShift:.6,waveY:1,waveYShift:.21,mixing:.93,grainMixer:0,grainOverlay:0}},eV={name:"Sea",params:{...x,speed:0,frame:0,colors:["#013b65","#03738c","#a3d3ff","#f2faef"],positions:0,waveX:.53,waveXShift:0,waveY:.95,waveYShift:.64,mixing:.5,grainMixer:0,grainOverlay:0}},eD=[eI,{name:"1960s",params:{...x,speed:0,frame:0,colors:["#000000","#082400","#b1aa91","#8e8c15"],positions:42,waveX:.45,waveXShift:0,waveY:1,waveYShift:0,mixing:0,grainMixer:.37,grainOverlay:.78}},{name:"Sunset",params:{...x,speed:0,frame:0,colors:["#264653","#9c2b2b","#f4a261","#ffffff"],positions:0,waveX:.6,waveXShift:.7,waveY:.7,waveYShift:.7,mixing:.5,grainMixer:0,grainOverlay:0}},eV],eW=(0,t.memo)(function({speed:o=eI.params.speed,frame:e=eI.params.frame,colors:a=eI.params.colors,positions:t=eI.params.positions,waveX:r=eI.params.waveX,waveXShift:i=eI.params.waveXShift,waveY:s=eI.params.waveY,waveYShift:l=eI.params.waveYShift,mixing:n=eI.params.mixing,grainMixer:f=eI.params.grainMixer,grainOverlay:u=eI.params.grainOverlay,fit:m=eI.params.fit,rotation:d=eI.params.rotation,scale:g=eI.params.scale,originX:h=eI.params.originX,originY:v=eI.params.originY,offsetX:_=eI.params.offsetX,offsetY:x=eI.params.offsetY,worldWidth:A=eI.params.worldWidth,worldHeight:w=eI.params.worldHeight,...y}){let S={u_colors:a.map(B),u_colorsCount:a.length,u_positions:t,u_waveX:r,u_waveXShift:i,u_waveY:s,u_waveYShift:l,u_mixing:n,u_grainMixer:f,u_grainOverlay:u,u_noiseTexture:G(),u_fit:b[m],u_rotation:d,u_scale:g,u_offsetX:_,u_offsetY:x,u_originX:h,u_originY:v,u_worldWidth:A,u_worldHeight:w};return(0,c.jsx)(p,{...y,speed:o,frame:e,fragmentShader:eE,uniforms:S})},m),eM={maxColorCount:10},eQ=`#version 300 es
precision mediump float;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${eM.maxColorCount}];
uniform float u_colorsCount;

uniform float u_radius;
uniform float u_focalDistance;
uniform float u_focalAngle;
uniform float u_falloff;
uniform float u_mixing;
uniform float u_distortion;
uniform float u_distortionShift;
uniform float u_distortionFreq;
uniform float u_grainMixer;
uniform float u_grainOverlay;

uniform sampler2D u_noiseTexture;

${d}
${h}

out vec4 fragColor;

${S}
${C}
${I}

void main() {
  vec2 uv = 2. * v_objectUV;


  vec2 center = vec2(0.);
  float angleRad = radians(u_focalAngle - 90.);
  vec2 focalPoint = vec2(cos(angleRad), sin(angleRad)) * u_focalDistance;
  float radius = u_radius;
  
  vec2 c_to_uv = uv - center;
  vec2 f_to_uv = uv - focalPoint;
  vec2 f_to_c = center - focalPoint;
  float r = length(c_to_uv);
  
  float fragAngle = atan(c_to_uv.y, c_to_uv.x);
  float angleDiff = fragAngle - angleRad;
  angleDiff = mod(angleDiff + PI, TWO_PI) - PI;
  
  float halfAngle = acos(clamp(radius / u_focalDistance, 0.0, 1.0));
  float isInSector = 1.0 - smoothstep(.6 * PI, halfAngle, abs(angleDiff));
  
  float a = dot(f_to_uv, f_to_uv);
  float b = -2.0 * dot(f_to_uv, f_to_c);
  float c = dot(f_to_c, f_to_c) - radius * radius;

  float discriminant = b * b - 4.0 * a * c;
  float t = 1.0;

  if (discriminant >= 0.0) {
    float sqrtD = sqrt(discriminant);
    float t0 = (-b - sqrtD) / (2.0 * a);
    float t1 = (-b + sqrtD) / (2.0 * a);
    t = max(t0, t1);
    if (t < 0.0) t = 0.0;
  }

  float dist = length(f_to_uv);
  float normalized = dist / (length(f_to_uv * t));
  float shape = clamp(normalized, 0.0, 1.0);

  float falloffMapped = mix(.2 + .8 * max(0., u_falloff + 1.), mix(1., 15., pow(u_falloff, 2.)), step(.0, u_falloff));
  
  float falloffExp = mix(falloffMapped, 1., shape);
  shape = pow(shape, falloffExp);
  shape = 1. - clamp(shape, 0., 1.);


  float outerMask = .002;
  float outer = smoothstep(radius + outerMask, radius - outerMask, r);
  outer = mix(outer, 1., isInSector);
  
  shape = mix(0., shape, outer);
  shape *= smoothstep(radius, radius - .01, r);

  float angle = atan(f_to_uv.y, f_to_uv.x);
  shape -= pow(u_distortion, 2.) * shape * pow(sin(PI * clamp(length(f_to_uv) - .2 + u_distortionShift, 0., 1.)), 4.) * (sin(u_distortionFreq * angle) + cos(floor(.65 * u_distortionFreq) * angle));

  vec2 grainUV = v_objectUV * 120.;
  float grain = fiberNoise(grainUV, vec2(0.));
  float mixerGrain = .2 * u_grainMixer * (grain - 1.);

  float mixer = shape * u_colorsCount + mixerGrain;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  
  float outerShape = 0.;
  for (int i = 1; i < ${eM.maxColorCount+1}; i++) {
    if (i > int(u_colorsCount)) break;
    float mLinear = clamp(mixer - float(i - 1), 0.0, 1.0);
    
    float m = 0.;
    float mixing = u_mixing * 3.;
    if (mixing > 2.) {
      float tt = pow(mLinear, 2.);
      m = mix(mLinear, tt, .5 * clamp((mixing - 2.), 0., 1.));
    } else if (mixing > 1.) {
      m = mix(smoothstep(0., 1., mLinear), mLinear, clamp((mixing - 1.), 0., 1.));
    } else {
      float aa = fwidth(mLinear);
      m = smoothstep(.5 - .5 * mixing - aa, .5 + .5 * mixing + aa, mLinear);
    }
    
    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  float rr = fiberNoise(rotate(grainUV, 1.), vec2(3.));
  float gg = fiberNoise(rotate(grainUV, 2.) + 10., vec2(-1.));
  float bb = fiberNoise(grainUV - 2., vec2(5.));
  vec3 grainColor = vec3(rr, gg, bb) - 1.;
  color = mix(color, grainColor, .2 * u_grainOverlay);
  opacity += u_grainOverlay * grain;
  
  ${z}

  fragColor = vec4(color, opacity);
}
`,eT={name:"Default",params:{...x,scale:1,speed:0,frame:0,colorBack:"#121212",colors:["#00bbff","#00ffe1","#ffffff"],radius:.7,focalDistance:.99,focalAngle:0,falloff:.24,mixing:.35,distortion:0,distortionShift:0,distortionFreq:12,grainMixer:0,grainOverlay:0}},eP={name:"Cross Section",params:{...x,scale:1,speed:0,frame:0,colorBack:"#3d348b",colors:["#7678ed","#f7b801","#f18701","#37a066"],radius:1,focalDistance:0,focalAngle:0,falloff:0,mixing:0,distortion:1,distortionShift:0,distortionFreq:12,grainMixer:0,grainOverlay:0}},eG={name:"Radial",params:{...x,scale:1,speed:0,frame:0,colorBack:"#264653",colors:["#9c2b2b","#f4a261","#ffffff"],radius:1,focalDistance:0,focalAngle:0,falloff:0,mixing:.7,distortion:0,distortionShift:0,distortionFreq:12,grainMixer:0,grainOverlay:0}},eY=[eT,{name:"Lo-Fi",params:{...x,speed:0,frame:0,colorBack:"#2e1f27",colors:["#d72638","#3f88c5","#f49d37"],radius:1,focalDistance:0,focalAngle:0,falloff:.9,mixing:.5,distortion:0,distortionShift:0,distortionFreq:12,grainMixer:1,grainOverlay:.5}},eP,eG],eN=(0,t.memo)(function({speed:o=eT.params.speed,frame:e=eT.params.frame,colorBack:a=eT.params.colorBack,colors:t=eT.params.colors,radius:r=eT.params.radius,focalDistance:i=eT.params.focalDistance,focalAngle:s=eT.params.focalAngle,falloff:l=eT.params.falloff,grainMixer:n=eT.params.grainMixer,mixing:f=eT.params.mixing,distortion:u=eT.params.distortion,distortionShift:m=eT.params.distortionShift,distortionFreq:d=eT.params.distortionFreq,grainOverlay:g=eT.params.grainOverlay,fit:h=eT.params.fit,rotation:v=eT.params.rotation,scale:_=eT.params.scale,originX:x=eT.params.originX,originY:A=eT.params.originY,offsetX:w=eT.params.offsetX,offsetY:y=eT.params.offsetY,worldWidth:S=eT.params.worldWidth,worldHeight:C=eT.params.worldHeight,...k}){let R={u_colorBack:B(a),u_colors:t.map(B),u_colorsCount:t.length,u_radius:r,u_focalDistance:i,u_focalAngle:s,u_falloff:l,u_mixing:f,u_distortion:u,u_distortionShift:m,u_distortionFreq:d,u_grainMixer:n,u_grainOverlay:g,u_noiseTexture:G(),u_fit:b[h],u_rotation:v,u_scale:_,u_offsetX:w,u_offsetY:y,u_originX:x,u_originY:A,u_worldWidth:S,u_worldHeight:C};return(0,c.jsx)(p,{...k,speed:o,frame:e,fragmentShader:eQ,uniforms:R})},m),eO=`#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_contrast;
uniform float u_roughness;
uniform float u_fiber;
uniform float u_fiberScale;
uniform float u_crumples;
uniform float u_crumplesScale;
uniform float u_folds;
uniform float u_foldsNumber;
uniform float u_drops;
uniform float u_seed;
uniform float u_blur;

uniform sampler2D u_noiseTexture;

${d}

out vec4 fragColor;

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right  = smoothstep(1., 1. - aax, uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = smoothstep(1., 1. - aay, uv.y);

  return left * right * bottom * top;
}

${S}
${C}
${U}
float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = randomR(i);
  float b = randomR(i + vec2(1.0, 0.0));
  float c = randomR(i + vec2(0.0, 1.0));
  float d = randomR(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}
float fbm(vec2 n) {
  float total = 0.0, amplitude = .4;
  for (int i = 0; i < 3; i++) {
    total += valueNoise(n) * amplitude;
    n *= 1.99;
    amplitude *= 0.65;
  }
  return total;
}


float randomG(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).g;
}
float roughness(vec2 p) {
  p *= .1;
  float o = 0.;
  for (float i = 0.; ++i < 4.; p *= 2.1) {
    vec4 w = vec4(floor(p), ceil(p));
    vec2 f = fract(p);
    o += mix(
      mix(randomG(w.xy), randomG(w.xw), f.y),
      mix(randomG(w.zy), randomG(w.zw), f.y),
      f.x);
    o += .2 / exp(2. * abs(sin(.2 * p.x + .5 * p.y)));
  }
  return o / 3.;
}

${I}

vec2 randomGB(vec2 p) {
  vec2 uv = floor(p) / 50. + .5;
  return texture(u_noiseTexture, fract(uv)).gb;
}
float crumpledNoise(vec2 t, float pw) {
  vec2 p = floor(t);
  float wsum = 0.;
  float cl = 0.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 b = vec2(float(x), float(y));
      vec2 q = b + p;
      vec2 q2 = q - floor(q / 8.) * 8.;
      vec2 c = q + randomGB(q2);
      vec2 r = c - t;
      float w = pow(smoothstep(0., 1., 1. - abs(r.x)), pw) * pow(smoothstep(0., 1., 1. - abs(r.y)), pw);
      cl += (.5 + .5 * sin((q2.x + q2.y * 5.) * 8.)) * w;
      wsum += w;
    }
  }
  return pow(cl / wsum, .5) * 2.;
}
float crumplesShape(vec2 uv) {
  return crumpledNoise(uv * .25, 16.) * crumpledNoise(uv * .5, 2.);
}


vec2 folds(vec2 uv) {
    vec3 pp = vec3(0.);
    float l = 9.;
    for (float i = 0.; i < 15.; i++) {
      if (i >= u_foldsNumber) break;
      vec2 rand = randomGB(vec2(i, i * u_seed));
      float an = rand.x * TWO_PI;
      vec2 p = vec2(cos(an), sin(an)) * rand.y;
      float dist = distance(uv, p);
      l = min(l, dist);
      
      if (l == dist) {
        pp.xy = (uv - p.xy);
        pp.z = dist;
      }
    }
    return mix(pp.xy, vec2(0.), pow(pp.z, .25));
}

float drops(vec2 uv) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 offset = randomGB(iDropsUV + neighbor);
      offset = .5 + .5 * sin(10. * u_seed + TWO_PI * offset);
      vec2 pos = neighbor + offset - fDropsUV;
      float dist = length(pos);
      dropsMinDist = min(dropsMinDist, dropsMinDist*dist);
    }
  }
  return 1. - smoothstep(.05, .09, pow(dropsMinDist, .5));
}

void main() {

  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = 5. * (patternUV * vec2(u_imageAspectRatio, 1.));

  vec2 roughnessUv = 1.5 * (gl_FragCoord.xy - .5 * u_resolution) / u_pixelRatio;
  float roughness = roughness(roughnessUv + vec2(1., 0.)) - roughness(roughnessUv - vec2(1., 0.));

  vec2 crumplesUV = fract(patternUV * .1 * u_crumplesScale - u_seed) * 32.;
  float crumples = u_crumples * (crumplesShape(crumplesUV + vec2(.05, 0.)) - crumplesShape(crumplesUV));

  vec2 fiberUV = 10. * u_fiberScale * patternUV;
  float fiber = fiberNoise(fiberUV, vec2(0.));
  fiber = .5 * u_fiber * (fiber - 1.);

  vec2 normal = vec2(0.);
  vec2 normalImage = vec2(0.);

  vec2 foldsUV = patternUV * .12;
  foldsUV = rotate(foldsUV, 4. * u_seed);
  vec2 w = folds(foldsUV);
  foldsUV = rotate(foldsUV + .007 * cos(u_seed), .01 * sin(u_seed));
  vec2 w2 = folds(foldsUV);

  float drops = u_drops * drops(patternUV * 2.);
  
  normal.xy += u_folds * min(5. * u_contrast, 1.) * 4. * max(vec2(0.), w + w2);
  normalImage.xy += u_folds * 2. * w;

  normal.xy += crumples;
  normalImage.xy += 1.5 * crumples;

  normal.xy += 3. * drops;
  normalImage.xy += .2 * drops;

  float blur = u_blur * smoothstep(0., 1., fbm(.17 * patternUV + 10. * u_seed));
  normal *= (1. - 2. * blur);
  fiber *= (1. - blur);

  normal.xy += u_roughness * 1.5 * roughness;
  normal.xy += fiber;
  
  normalImage += u_roughness * .75 * roughness;
  normalImage += .2 * fiber;

  vec3 lightPos = vec3(1., 2., 1.);
  float res = clamp(dot(normalize(vec3(normal, 9.5 - 9. * pow(u_contrast, .1))), normalize(lightPos)), 0., 1.);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);
  
  color -= .007 * drops;

  imageUV += .02 * normalImage;
  vec4 image = texture(u_image, imageUV);
  image.rgb += .5 * (res - .6);

  float frame = getUvFrame(imageUV);
  color.rgb = mix(color, image.rgb, min(.8 * frame, image.a));

  fragColor = vec4(color, opacity);
}
`,eH={name:"Default",params:{...x,scale:.6,speed:0,frame:0,colorFront:"#9fadbc",colorBack:"#ffffff",image:"/images/image-filters/0018.webp",contrast:.3,roughness:.4,fiber:.3,fiberScale:1,crumples:.3,crumplesScale:.6,folds:.65,foldsNumber:5,blur:0,drops:.2,seed:5.8}},eX={name:"Abstract",params:{...x,speed:0,frame:0,scale:.6,colorFront:"#00eeff",colorBack:"#ff0a81",image:"/images/image-filters/0018.webp",contrast:.85,roughness:0,fiber:.1,fiberScale:1,crumples:0,crumplesScale:1,folds:1,foldsNumber:3,blur:0,drops:.2,seed:2.2}},eL=[eH,{name:"Cardboard",params:{...x,speed:0,frame:0,scale:.6,colorFront:"#c98e26",colorBack:"#573b0a",image:"/images/image-filters/0018.webp",contrast:.4,roughness:0,fiber:.35,fiberScale:2,crumples:.7,crumplesScale:.6,folds:0,foldsNumber:1,blur:0,drops:.1,seed:1.6}},eX,{name:"Details",params:{...x,speed:0,frame:0,fit:"cover",scale:3,colorFront:"#00000000",colorBack:"#ffffff",image:"/images/image-filters/0018.webp",contrast:0,roughness:1,fiber:.27,fiberScale:2,crumples:1,crumplesScale:3,folds:1,foldsNumber:15,blur:0,drops:0,seed:6}}],ej=(0,t.memo)(function({speed:o=eH.params.speed,frame:e=eH.params.frame,colorFront:a=eH.params.colorFront,colorBack:t=eH.params.colorBack,image:r=eH.params.image,contrast:i=eH.params.contrast,roughness:s=eH.params.roughness,fiber:l=eH.params.fiber,fiberScale:n=eH.params.fiberScale,crumples:f=eH.params.crumples,crumplesScale:u=eH.params.crumplesScale,foldsNumber:m=eH.params.foldsNumber,folds:d=eH.params.folds,blur:g=eH.params.blur,drops:h=eH.params.drops,seed:v=eH.params.seed,fit:_=eH.params.fit,scale:x=eH.params.scale,rotation:A=eH.params.rotation,originX:w=eH.params.originX,originY:y=eH.params.originY,offsetX:S=eH.params.offsetX,offsetY:C=eH.params.offsetY,worldWidth:k=eH.params.worldWidth,worldHeight:R=eH.params.worldHeight,...U}){let F="undefined"!=typeof window&&{u_noiseTexture:G()},z={u_image:r,u_colorFront:B(a),u_colorBack:B(t),u_contrast:i,u_roughness:s,u_fiber:l,u_fiberScale:n,u_crumples:f,u_crumplesScale:u,u_foldsNumber:m,u_folds:d,u_blur:g,u_drops:h,u_seed:v,...F,u_fit:b[_],u_scale:x,u_rotation:A,u_offsetX:S,u_offsetY:C,u_originX:w,u_originY:y,u_worldWidth:k,u_worldHeight:R};return(0,c.jsx)(p,{...U,speed:o,frame:e,fragmentShader:eO,uniforms:z})},m),eq=`#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_count;
uniform float u_angle;
uniform float u_highlights;
uniform float u_shape;
uniform float u_distortion;
uniform float u_distortionShape;
uniform float u_shift;
uniform float u_blur;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;

${d}

out vec4 fragColor;

${S}
${C}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right  = smoothstep(1., 1. - aax, uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = smoothstep(1., 1. - aay, uv.y);

  return left * right * bottom * top;
}

const int MAX_RADIUS = 50;

vec4 getBlur(sampler2D tex, vec2 uv, vec2 texelSize, vec2 dir, float sigma) {
  if (sigma <= .5) return texture(tex, uv);
  int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));

  float twoSigma2 = 2.0 * sigma * sigma;
  float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

  vec4 sum = texture(tex, uv) * gaussianNorm;
  float weightSum = gaussianNorm;

  for (int i = 1; i <= MAX_RADIUS; i++) {
    if (i > radius) break;

    float x = float(i);
    float w = exp(-(x * x) / twoSigma2) * gaussianNorm;

    vec2 offset = dir * texelSize * x;
    vec4 s1 = texture(tex, uv + offset);
    vec4 s2 = texture(tex, uv - offset);

    sum += (s1 + s2) * w;
    weightSum += 2.0 * w;
  }

  return sum / weightSum;
}

void main() {
  vec2 imageUV = v_imageUV;
  
  vec2 uv = imageUV;
  float frame = getUvFrame(imageUV);
  if (frame < .05) discard;

  float gridNumber = u_count * u_imageAspectRatio;

  vec2 sw = vec2(.005 * u_distortion) * vec2(1., u_imageAspectRatio);
  float maskOuter =
    smoothstep(u_marginLeft - sw.x, u_marginLeft, imageUV.x + sw.x) *
    smoothstep(u_marginRight - sw.x, u_marginRight, 1.0 - imageUV.x + sw.x) *
    smoothstep(u_marginTop - sw.y, u_marginTop, imageUV.y + sw.y) *
    smoothstep(u_marginBottom - sw.y, u_marginBottom, 1.0 - imageUV.y + sw.y);
  float mask =
    smoothstep(u_marginLeft, u_marginLeft + sw.x, imageUV.x + sw.x) *
    smoothstep(u_marginRight, u_marginRight + sw.x, 1.0 - imageUV.x + sw.x) *
    smoothstep(u_marginTop, u_marginTop + sw.y, imageUV.y + sw.y) *
    smoothstep(u_marginBottom, u_marginBottom + sw.y, 1.0 - imageUV.y + sw.y);
  float stroke = (1. - mask) * maskOuter;

  float patternRotation = u_angle * PI / 180.;
  uv = rotate(uv - vec2(.5), patternRotation);
  uv *= gridNumber;
  
  float curve = 0.;
  if (u_shape > 4.5) {
    // pattern
    curve = .5 + .5 * sin(1.5 * uv.x) * cos(1.5 * uv.y);
  } else if (u_shape > 3.5) {
    // zigzag
    curve = 10. * abs(fract(.1 * uv.y) - .5);
  } else if (u_shape > 2.5) {
    // wave
    curve = 4. * sin(.23 * uv.y);
  } else if (u_shape > 1.5) {
    // lines irregular
    curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
    curve = .2 * gridNumber / u_imageAspectRatio;
  }

  vec2 uvOrig = uv;
  uv += curve;

  vec2 fractUV = fract(uv);
  vec2 floorUV = floor(uv);

  vec2 fractOrigUV = fract(uvOrig);
  vec2 floorOrigUV = floor(uvOrig);

  float highlights = smoothstep(.85, .95, fractUV.x);
  highlights *= mask;

  float xDistortion = 0.;
  if (u_distortionShape == 1.) {
    xDistortion = -pow(1.5 * fractUV.x, 3.) + (.5 + u_shift);
  } else if (u_distortionShape == 2.) {
    xDistortion = 2. * pow(fractUV.x, 2.) - (.5 + u_shift);
  } else if (u_distortionShape == 3.) {
    xDistortion = pow(2. * (fractUV.x - .5), 6.) + .5 - .5 + u_shift;
  } else if (u_distortionShape == 4.) {
    xDistortion = sin((fractUV.x + .25 + u_shift) * TWO_PI);
    xDistortion *= .5;
  } else if (u_distortionShape == 5.) {
    xDistortion += (.5 + u_shift);
    xDistortion -= pow(abs(fractUV.x), .2) * fractUV.x;
    xDistortion *= .33;
  }

  xDistortion *= 3. * u_distortion;

  uv = (floorOrigUV + fractOrigUV) / gridNumber;
  uv.x += xDistortion / gridNumber;
  uv += pow(stroke, 4.);
  uv.y = mix(uv.y, .0, .4 * u_highlights * highlights);
  
  uv = rotate(uv, -patternRotation) + vec2(.5);

  uv = mix(imageUV, uv, mask);
  float blur = mix(0., u_blur, mask);
  
  vec4 color = getBlur(u_image, uv, 1. / u_resolution / u_pixelRatio, vec2(0., 1.), blur);

  float opacity = color.a;
  fragColor = vec4(color.rgb, opacity);
}
`,eJ={lines:1,linesIrregular:2,wave:3,zigzag:4,pattern:5},eK={prism:1,lens:2,сontour:3,сascade:4,facete:5},eZ={name:"Default",params:{...x,speed:0,frame:0,image:"/images/image-filters/0018.webp",count:80,angle:0,distortionShape:"lens",shape:"lines",distortion:.5,shift:0,blur:3,highlights:0,marginLeft:0,marginRight:0,marginTop:0,marginBottom:0}},e$={name:"Waves",params:{...x,speed:0,frame:0,image:"/images/image-filters/0018.webp",count:20,angle:0,distortionShape:"сontour",shape:"wave",distortion:.3,shift:0,blur:0,highlights:0,marginLeft:0,marginRight:0,marginTop:0,marginBottom:0}},e0=[eZ,{name:"Irregular lines",params:{...x,scale:4,speed:0,frame:0,image:"/images/image-filters/0018.webp",count:32,angle:150,distortionShape:"facete",shape:"linesIrregular",distortion:1,shift:0,blur:25,highlights:1,marginLeft:0,marginRight:0,marginTop:0,marginBottom:0}},e$,{name:"Folds",params:{...x,speed:0,frame:0,image:"/images/image-filters/0018.webp",count:50,angle:0,distortionShape:"сascade",shape:"lines",distortion:.75,shift:0,blur:0,highlights:0,marginLeft:.15,marginRight:.15,marginTop:.15,marginBottom:.15}}],e1=(0,t.memo)(function({speed:o=eZ.params.speed,frame:e=eZ.params.frame,image:a=eZ.params.image,count:t=eZ.params.count,angle:r=eZ.params.angle,distortion:i=eZ.params.distortion,distortionShape:s=eZ.params.distortionShape,shape:l=eZ.params.shape,shift:n=eZ.params.shift,blur:f=eZ.params.blur,marginLeft:u=eZ.params.marginLeft,marginRight:m=eZ.params.marginRight,marginTop:d=eZ.params.marginTop,marginBottom:g=eZ.params.marginBottom,highlights:h=eZ.params.highlights,fit:v=eZ.params.fit,scale:_=eZ.params.scale,rotation:x=eZ.params.rotation,originX:A=eZ.params.originX,originY:B=eZ.params.originY,offsetX:w=eZ.params.offsetX,offsetY:y=eZ.params.offsetY,worldWidth:S=eZ.params.worldWidth,worldHeight:C=eZ.params.worldHeight,...k}){let R={u_image:a,u_count:t,u_angle:r,u_distortion:i,u_shift:n,u_blur:f,u_highlights:h,u_distortionShape:eK[s],u_shape:eJ[l],u_marginLeft:u,u_marginRight:m,u_marginTop:d,u_marginBottom:g,u_fit:b[v],u_scale:_,u_rotation:x,u_offsetX:w,u_offsetY:y,u_originX:A,u_originY:B,u_worldWidth:S,u_worldHeight:C};return(0,c.jsx)(p,{...k,speed:o,frame:e,fragmentShader:eq,uniforms:R})}),e2=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_highlightColor;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_effectScale;
uniform float u_highlights;
uniform float u_layering;
uniform float u_edges;
uniform float u_caustic;
uniform float u_waves;

${d}

out vec4 fragColor;

${S}
${C}
${E}

float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);

  float left   = smoothstep(0., aax, uv.x);
  float right  = smoothstep(1., 1. - aax, uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = smoothstep(1., 1. - aay, uv.y);

  return left * right * bottom * top;
}

mat2 rotate2D(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float getCausticNoise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 6; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.1;
  }
  return (N.x + N.y + 1.);
}

void main() {
  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = 10. * u_effectScale * (patternUV * vec2(u_imageAspectRatio, 1.));
  
  float t = u_time;
  
  float wavesNoise = snoise((.3 + .1 * sin(t)) * .1 * patternUV + vec2(0., .4 * t));

  float causticNoise = getCausticNoise(patternUV + u_waves * vec2(1., -1.) * wavesNoise, 2. * t, 1.5);

  causticNoise += u_layering * getCausticNoise(patternUV + 2. * u_waves * vec2(1., -1.) * wavesNoise, 1.5 * t, 2.);
  causticNoise = pow(causticNoise, 2.);
  
  float edgesDistortion = smoothstep(0., .1, imageUV.x);
  edgesDistortion *= smoothstep(0., .1, imageUV.y);
  edgesDistortion *= (smoothstep(1., 1.1, imageUV.x) + smoothstep(.95, .8, imageUV.x));
  edgesDistortion *= smoothstep(1., .9, imageUV.y);
  edgesDistortion = mix(edgesDistortion, 1., u_edges);
  
  float causticNoiseDistortion = .02 * causticNoise * edgesDistortion;
  
  float wavesDistortion = .1 * u_waves * wavesNoise;
  
  imageUV += vec2(wavesDistortion, -wavesDistortion);
  imageUV += (u_caustic * causticNoiseDistortion);

  float frame = getUvFrame(imageUV);

  vec4 image = texture(u_image, imageUV);
  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;
  
  vec3 color = mix(backColor.rgb, image.rgb, image.a * frame);
  float opacity = backColor.a + image.a * frame;

  causticNoise = max(-.2, causticNoise);
  
  float hightlight = .025 * u_highlights * causticNoise;
  hightlight *= u_highlightColor.a;
  color = mix(color, u_highlightColor.rgb, .05 * u_highlights * causticNoise);
  opacity += hightlight;
  
  color += hightlight * (.5 + .5 * wavesNoise);
  opacity += hightlight * (.5 + .5 * wavesNoise);
  
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,e5={name:"Default",params:{...x,scale:.9,speed:1,frame:0,colorBack:"#132a3a",highlightColor:"#ffffff",image:"/images/image-filters/0018.webp",highlights:.07,layering:.5,edges:.8,waves:.3,caustic:.1,effectScale:1}},e3={name:"Abstract",params:{...x,fit:"cover",scale:3,speed:1,frame:0,colorBack:"#ffffff",highlightColor:"#ffffff",image:"/images/image-filters/0018.webp",highlights:0,layering:0,edges:1,waves:1,caustic:.4,effectScale:4}},e4={name:"Streaming",params:{...x,fit:"contain",scale:.4,speed:2,frame:0,colorBack:"#ffffff00",highlightColor:"#ffffff",image:"/images/image-filters/0018.webp",highlights:0,layering:0,edges:0,waves:.5,caustic:0,effectScale:3}},e8=[e5,{name:"Slow Mo",params:{...x,fit:"cover",scale:1,speed:.1,frame:0,colorBack:"#ffffff00",highlightColor:"#ffffff",image:"/images/image-filters/0018.webp",highlights:.4,layering:0,edges:0,waves:0,caustic:.2,effectScale:2}},e3,e4],e6=(0,t.memo)(function({speed:o=e5.params.speed,frame:e=e5.params.frame,colorBack:a=e5.params.colorBack,highlightColor:t=e5.params.highlightColor,image:r=e5.params.image,highlights:i=e5.params.highlights,layering:s=e5.params.layering,waves:l=e5.params.waves,edges:n=e5.params.edges,caustic:f=e5.params.caustic,effectScale:u=e5.params.effectScale,fit:m=e5.params.fit,scale:d=e5.params.scale,rotation:g=e5.params.rotation,originX:h=e5.params.originX,originY:v=e5.params.originY,offsetX:_=e5.params.offsetX,offsetY:x=e5.params.offsetY,worldWidth:A=e5.params.worldWidth,worldHeight:w=e5.params.worldHeight,...y}){let S={u_image:r,u_colorBack:B(a),u_highlightColor:B(t),u_highlights:i,u_layering:s,u_waves:l,u_edges:n,u_caustic:f,u_effectScale:u,u_fit:b[m],u_rotation:g,u_scale:d,u_offsetX:_,u_offsetY:x,u_originX:h,u_originY:v,u_worldWidth:A,u_worldHeight:w};return(0,c.jsx)(p,{...y,speed:o,frame:e,fragmentShader:e2,uniforms:S})},m),e9=`#version 300 es
precision lowp float;

uniform float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
uniform mediump float u_originX;
uniform mediump float u_originY;
uniform mediump float u_worldWidth;
uniform mediump float u_worldHeight;
uniform mediump float u_fit;

uniform mediump float u_scale;
uniform mediump float u_rotation;
uniform mediump float u_offsetX;
uniform mediump float u_offsetY;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform mediump float u_imageAspectRatio;

uniform float u_type;
uniform float u_pxSize;
uniform bool u_originalColors;
uniform float u_colorSteps;

out vec4 fragColor;

float getUvFrame(vec2 uv, vec2 px) {
  float left   = step(-px.x, uv.x);
  float right  = step(uv.x, 1.);
  float bottom = step(-px.y, uv.y);
  float top    = step(uv.y, 1. + px.y);

  return left * right * bottom * top;
}

${R}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10,
 12,  4, 14,  6,
  3, 11,  1,  9,
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {

  #define USE_IMAGE_SIZING
  #define USE_PIXELIZATION
  ${v}

  vec2 dithering_uv = pxSizeUv;
  vec2 ditheringNoise_uv = u_resolution * uv;
  vec4 image = texture(u_image, imageUV);
  float frame = getUvFrame(imageUV, pxSize / u_resolution.xy);

  int type = int(floor(u_type));
  float dithering = 0.0;

  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoise_uv), lum);
    } break;
    case 2:
      dithering = getBayerValue(dithering_uv, 2);
      break;
    case 3:
      dithering = getBayerValue(dithering_uv, 4);
      break;
    default:
      dithering = getBayerValue(dithering_uv, 8);
      break;
  }


  float steps = max(floor(u_colorSteps), 1.);
  float ditherAmount = 1.0 / (steps);
  
  vec3 color = vec3(0.0);
  float opacity = 1.;

  dithering -= .5;
  float brightness = clamp(lum + dithering * ditherAmount, 0.0, 1.0);
  brightness = mix(0.0, brightness, frame);
  float quantLum = floor(brightness * steps + 0.5) / steps;

  if (u_originalColors == true) {
    vec3 normColor = image.rgb / max(lum, 0.001);
    color = normColor * quantLum;

    float quantAlpha = floor(image.a * steps + 0.5) / steps;
    opacity = mix(quantLum, 1., quantAlpha);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;
    vec3 hlColor = u_colorHighlight.rgb * u_colorHighlight.a;
    float hlOpacity = u_colorHighlight.a;

    fgColor = mix(fgColor, hlColor, step(1.02 - .02 * u_colorSteps, brightness));
    fgOpacity = mix(fgOpacity, hlOpacity, step(1.02 - .02 * u_colorSteps, brightness));

    color = fgColor * quantLum;
    opacity = fgOpacity * quantLum;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }


  fragColor = vec4(color, opacity);
}
`,e7={name:"Default",params:{...x,speed:0,frame:0,colorFront:"#94ffaf",colorBack:"#000c38",colorHighlight:"#eaff94",image:"/images/image-filters/0018.webp",type:"8x8",pxSize:2,colorSteps:2,originalColors:!1}},ao={name:"Retro",params:{...x,speed:0,frame:0,colorFront:"#eeeeee",colorBack:"#5452ff",colorHighlight:"#eeeeee",image:"/images/image-filters/0018.webp",type:"2x2",pxSize:3,colorSteps:1,originalColors:!0}},ae=[e7,{name:"Noise",params:{...x,speed:0,frame:0,colorFront:"#a2997c",colorBack:"#000000",colorHighlight:"#ededed",image:"/images/image-filters/0018.webp",type:"random",pxSize:1,colorSteps:1,originalColors:!1}},ao,{name:"Natural",params:{...x,speed:0,frame:0,colorFront:"#ffffff",colorBack:"#000000",colorHighlight:"#ffffff",image:"/images/image-filters/0018.webp",type:"8x8",pxSize:2,colorSteps:5,originalColors:!0}}],aa=(0,t.memo)(function({speed:o=e7.params.speed,frame:e=e7.params.frame,colorFront:a=e7.params.colorFront,colorBack:t=e7.params.colorBack,colorHighlight:r=e7.params.colorHighlight,image:i=e7.params.image,type:s=e7.params.type,pxSize:l=e7.params.pxSize,colorSteps:n=e7.params.colorSteps,originalColors:f=e7.params.originalColors,fit:u=e7.params.fit,scale:m=e7.params.scale,rotation:d=e7.params.rotation,originX:g=e7.params.originX,originY:h=e7.params.originY,offsetX:v=e7.params.offsetX,offsetY:_=e7.params.offsetY,worldWidth:x=e7.params.worldWidth,worldHeight:A=e7.params.worldHeight,...w}){let y={u_image:i,u_colorFront:B(a),u_colorBack:B(t),u_colorHighlight:B(r),u_type:o7[s],u_pxSize:l,u_colorSteps:n,u_originalColors:f,u_fit:b[u],u_rotation:d,u_scale:m,u_offsetX:v,u_offsetY:_,u_originX:g,u_originY:h,u_worldWidth:x,u_worldHeight:A};return(0,c.jsx)(p,{...w,speed:o,frame:e,fragmentShader:e9,uniforms:y})},m)}}]);