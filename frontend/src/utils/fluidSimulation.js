/**
 * WebGL Fluid Simulation
 * Pixel-accurate reverse-engineered implementation from aaabadcode.com
 * Handles colorful pastel fluid smoke swirls responding to mouse and touch interactions.
 */

export function initFluidSimulation(canvas) {
  if (!canvas || typeof window === 'undefined') return () => {};

  let isDestroyed = false;
  let animId = null;

  try {
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      DENSITY_DISSIPATION: 0.5,
      VELOCITY_DISSIPATION: 3,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10
    };

    class Pointer {
      constructor() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = [0, 0, 0];
      }
    }

    const pointers = [new Pointer()];

    const glParams = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    };

    let gl = canvas.getContext('webgl2', glParams);
    const isWebGL2 = Boolean(gl);
    if (!isWebGL2) {
      gl = canvas.getContext('webgl', glParams) || canvas.getContext('experimental-webgl', glParams);
    }
    if (!gl) {
      console.warn('WebGL not supported for fluid simulation');
      return () => {};
    }

    let halfFloatTexType;
    let supportLinearFiltering;

    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      const halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      halfFloatTexType = halfFloat ? halfFloat.HALF_FLOAT_OES : null;
    }

    gl.clearColor(0, 0, 0, 1);

    const halfFloatType = isWebGL2 ? gl.HALF_FLOAT : halfFloatTexType;

    function checkSupport(internalFormat, format, type) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }

    function getSupportedFormat(internalFormat, format, type) {
      if (!checkSupport(internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F:
            return getSupportedFormat(gl.RG16F, gl.RG, type);
          case gl.RG16F:
            return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl.RGBA16F, gl.RGBA, halfFloatType);
      formatRG = getSupportedFormat(gl.RG16F, gl.RG, halfFloatType);
      formatR = getSupportedFormat(gl.R16F, gl.RED, halfFloatType);
    } else {
      formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatType);
      formatRG = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatType);
      formatR = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatType);
    }

    const ext = {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType: halfFloatType,
      supportLinearFiltering
    };

    if (!supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    class Material {
      constructor(vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
      }
      setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) {
          const str = keywords[i];
          for (let j = 0; j < str.length; j++) {
            hash = (hash << 5) - hash + str.charCodeAt(j) | 0;
          }
        }
        let prog = this.programs[hash];
        if (!prog) {
          const fs = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          prog = createProgram(this.vertexShader, fs);
          this.programs[hash] = prog;
        }
        if (prog !== this.activeProgram) {
          this.uniforms = getUniforms(prog);
          this.activeProgram = prog;
        }
      }
      bind() {
        gl.useProgram(this.activeProgram);
      }
    }

    class Program {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        gl.useProgram(this.program);
      }
    }

    function createProgram(vertexShader, fragmentShader) {
      const prog = gl.createProgram();
      gl.attachShader(prog, vertexShader);
      gl.attachShader(prog, fragmentShader);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn(gl.getProgramInfoLog(prog));
      }
      return prog;
    }

    function getUniforms(prog) {
      const uniforms = [];
      const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(prog, i).name;
        uniforms[name] = gl.getUniformLocation(prog, name);
      }
      return uniforms;
    }

    function compileShader(type, source, keywords) {
      if (keywords) {
        let defs = '';
        keywords.forEach((k) => { defs += '#define ' + k + '\n'; });
        source = defs + source;
      }
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const copyShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `);

    const clearShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    const splatShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const curlShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    // Screen Quad Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target, clear = false) {
      if (!target) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

    const displayMaterial = new Material(baseVertexShader, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;

      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `);

    let dye, velocity, divergenceFbo, curlFbo, pressure;

    function createFBO(w, h, internalFormat, format, type, filter) {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture: tex,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach: (id) => {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          return id;
        }
      };
    }

    function createDoubleFBO(w, h, internalFormat, format, type, filter) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
      let fbo2 = createFBO(w, h, internalFormat, format, type, filter);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1; },
        set read(v) { fbo1 = v; },
        get write() { return fbo2; },
        set write(v) { fbo2 = v; },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        }
      };
    }

    function resizeFBO(target, w, h, internalFormat, format, type, filter) {
      if (target.width === w && target.height === h) return target;
      const newFBO = createFBO(w, h, internalFormat, format, type, filter);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.read.attach(0));
      blit(newFBO);
      target.read = newFBO;
      target.write = createFBO(w, h, internalFormat, format, type, filter);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function getResolution(resolution) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
    }

    function scaleByPixelRatio(input) {
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);
      const type = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      gl.disable(gl.BLEND);

      dye = !dye
        ? createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filter)
        : resizeFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filter);

      velocity = !velocity
        ? createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, type, filter)
        : resizeFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, type, filter);

      divergenceFbo = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      curlFbo = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, type, gl.NEAREST);
    }

    if (config.SHADING) {
      displayMaterial.setKeywords(['SHADING']);
    } else {
      displayMaterial.setKeywords([]);
    }

    function resizeCanvas() {
      const width = scaleByPixelRatio(canvas.clientWidth || window.innerWidth);
      const height = scaleByPixelRatio(canvas.clientHeight || window.innerHeight);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    resizeCanvas();
    initFramebuffers();

    // Generates delicate pastel rainbow colors matching reference site
    function generateColor() {
      const h = Math.random();
      const s = 1.0;
      const v = 1.0;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      let r, g, b;
      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: r = v; g = t; b = p;
      }
      return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
    }

    function splat(x, y, dx, dy, color) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      let radius = config.SPLAT_RADIUS / 100;
      if (canvas.width / canvas.height > 1) {
        radius *= canvas.width / canvas.height;
      }
      gl.uniform1f(splatProgram.uniforms.radius, radius);
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.color ? color.color.b : color.b);
      blit(dye.write);
      dye.swap();
    }

    function pointerDown(ptr, id, x, y) {
      ptr.id = id;
      ptr.down = true;
      ptr.moved = false;
      ptr.texcoordX = x / canvas.width;
      ptr.texcoordY = 1.0 - y / canvas.height;
      ptr.prevTexcoordX = ptr.texcoordX;
      ptr.prevTexcoordY = ptr.texcoordY;
      ptr.deltaX = 0;
      ptr.deltaY = 0;
      ptr.color = generateColor();
    }

    function pointerMove(ptr, x, y, color) {
      ptr.prevTexcoordX = ptr.texcoordX;
      ptr.prevTexcoordY = ptr.texcoordY;
      ptr.texcoordX = x / canvas.width;
      ptr.texcoordY = 1.0 - y / canvas.height;
      let dx = ptr.texcoordX - ptr.prevTexcoordX;
      let dy = ptr.texcoordY - ptr.prevTexcoordY;
      const aspect = canvas.width / canvas.height;
      if (aspect < 1) dx *= aspect;
      if (aspect > 1) dy /= aspect;
      ptr.deltaX = dx;
      ptr.deltaY = dy;
      ptr.moved = Math.abs(ptr.deltaX) > 0 || Math.abs(ptr.deltaY) > 0;
      ptr.color = color || ptr.color;
    }

    // Step the fluid physics simulation
    function stepSimulation(dt) {
      gl.disable(gl.BLEND);

      // 1. Curl
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFbo);

      // 2. Vorticity
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curlFbo.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      // 3. Divergence
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergenceFbo);

      // 4. Pressure clear
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      // 5. Pressure Poisson solve
      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergenceFbo.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      // 6. Subtract gradient
      gradSubtractProgram.bind();
      gl.uniform2f(gradSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(gradSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // 7. Advect velocity
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      }
      const velSource = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velSource);
      gl.uniform1i(advectionProgram.uniforms.uSource, velSource);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      // 8. Advect dye
      if (!ext.supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      }
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    let lastTime = Date.now();
    let colorTimer = 0;

    function renderLoop() {
      if (isDestroyed) return;

      const now = Date.now();
      let dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;

      if (resizeCanvas()) {
        initFramebuffers();
      }

      colorTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorTimer >= 1) {
        colorTimer = colorTimer % 1;
        pointers.forEach((p) => { p.color = generateColor(); });
      }

      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          const sX = p.deltaX * config.SPLAT_FORCE;
          const sY = p.deltaY * config.SPLAT_FORCE;
          splat(p.texcoordX, p.texcoordY, sX, sY, p.color);
        }
      });

      stepSimulation(dt);

      // Render to screen canvas with alpha blending over white HTML background
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);

      displayMaterial.bind();
      if (config.SHADING) {
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
      }
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(null);

      animId = requestAnimationFrame(renderLoop);
    }

    // Global cursor event listeners on window (colors only appear when cursor moves or touches screen)
    const onMouseDown = (e) => {
      const ptr = pointers[0];
      pointerDown(ptr, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
      const col = generateColor();
      col.r *= 10; col.g *= 10; col.b *= 10;
      const sX = 10 * (Math.random() - 0.5);
      const sY = 30 * (Math.random() - 0.5);
      splat(ptr.texcoordX, ptr.texcoordY, sX, sY, col);
    };

    const onMouseMove = (e) => {
      const ptr = pointers[0];
      const x = scaleByPixelRatio(e.clientX);
      const y = scaleByPixelRatio(e.clientY);
      pointerMove(ptr, x, y, ptr.color);
    };

    const onTouchStart = (e) => {
      const touches = e.targetTouches;
      const ptr = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const x = scaleByPixelRatio(touches[i].clientX);
        const y = scaleByPixelRatio(touches[i].clientY);
        pointerDown(ptr, touches[i].identifier, x, y);
      }
    };

    const onTouchMove = (e) => {
      const touches = e.targetTouches;
      const ptr = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const x = scaleByPixelRatio(touches[i].clientX);
        const y = scaleByPixelRatio(touches[i].clientY);
        pointerMove(ptr, x, y, ptr.color);
      }
    };

    const onTouchEnd = () => {
      pointers[0].down = false;
    };

    const onResize = () => {
      resizeCanvas();
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    // Kick off animation loop
    renderLoop();

    return () => {
      isDestroyed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
    };
  } catch (err) {
    console.warn('Fluid simulation initialization error:', err);
    return () => {};
  }
}
