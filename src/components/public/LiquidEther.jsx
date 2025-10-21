
import React, { useRef, useEffect, useMemo } from 'react';

const LiquidEther = (props) => {
  const {
    colors,
    mouseForce,
    cursorSize,
    isViscous,
    viscous,
    iterationsViscous,
    iterationsPoisson,
    resolution,
    isBounce,
    autoDemo,
    autoSpeed,
    autoIntensity,
    takeoverDuration,
    autoResumeDelay,
  } = props;

  const canvasRef = useRef(null);
  const animationFrameId = useRef();
  const lastTime = useRef(0);
  const pointer = useRef({
    x: 0.5 * window.innerWidth,
    y: 0.5 * window.innerHeight,
    dx: 0,
    dy: 0,
    isMoving: false,
    timer: null,
  }).current;
  const autoDemoState = useRef({
    isRunning: autoDemo,
    phase: 0,
    lastSwitchTime: 0,
  }).current;

  const config = useMemo(
    () => ({
      TEXTURE_DOWNSAMPLE: 1,
      DENSITY_DISSIPATION: 0.98,
      VELOCITY_DISSIPATION: 0.99,
      PRESSURE_DISSIPATION: 0.8,
      PRESSURE_ITERATIONS: iterationsPoisson,
      SPLAT_RADIUS: cursorSize / 100,
    }),
    [iterationsPoisson, cursorSize],
  );

  const glRef = useRef(null);
  const extRef = useRef(null);
  const pointersRef = useRef([{ current: pointer, id: -1, isDown: false }]);
  const splatStackRef = useRef([]);

  const normalizeColor = (color) => {
    if (typeof color !== 'string' || color.charAt(0) !== '#') {
        return { r: 0, g: 0, b: 0 };
    }
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const programs = useRef({}).current;
  const uniformLocations = useRef({}).current;
  const doubleFbos = useRef({}).current;
  const colorPalette = useMemo(() => (colors || []).map(normalizeColor), [colors]);

  const getGL = () => glRef.current;
  const getExt = () => extRef.current;

  const getSupportedFormat = (gl, internalFormat, format, type) => {
    if (!gl) return null;
    const ext = getExt();
    if (!ext) return null;

    if (
      !ext.supportLinearFiltering &&
      (type === ext.halfFloatTexType.HALF_FLOAT_OES ||
        type === ext.halfFloatTexType.HALF_FLOAT)
    ) {
      return {
        internalFormat: ext.halfFloatTexType.RGBA,
        format,
        type,
      };
    }
    return { internalFormat, format, type };
  };

  const createFbo = (
    gl,
    w,
    h,
    internalFormat,
    format,
    type,
    param,
  ) => {
    if (!gl) return [null, null, 0, 0];
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return [texture, fbo, w, h];
  };

  const createDoubleFbo = (
    gl,
    w,
    h,
    internalFormat,
    format,
    type,
    param,
  ) => {
    let fbo1 = createFbo(gl, w, h, internalFormat, format, type, param);
    let fbo2 = createFbo(gl, w, h, internalFormat, format, type, param);

    return {
      get read() {
        return fbo1;
      },
      get write() {
        return fbo2;
      },
      swap() {
        [fbo1, fbo2] = [fbo2, fbo1];
      },
    };
  };

  const initFbos = (gl) => {
    if (!gl) return;
    const simWidth = Math.round(gl.canvas.width * resolution);
    const simHeight = Math.round(gl.canvas.height * resolution);
    const dyeWidth = Math.round(gl.canvas.width * resolution);
    const dyeHeight = Math.round(gl.canvas.height * resolution);

    const ext = getExt();
    if (!ext) return;

    const halfFloat = ext.halfFloatTexType.HALF_FLOAT;
    const linear = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    const velocityFormat = ext.formatRGBA ? getSupportedFormat(
      gl,
      ext.formatRGBA.internalFormat,
      ext.formatRGBA.format,
      halfFloat,
    ) : null;
    const dyeFormat = ext.formatRGBA ? getSupportedFormat(
      gl,
      ext.formatRGBA.internalFormat,
      ext.formatRGBA.format,
      halfFloat,
    ) : null;

    if (!velocityFormat || !dyeFormat || !velocityFormat.internalFormat || !dyeFormat.internalFormat) {
      console.error("Failed to get supported texture formats.");
      return;
    }

    doubleFbos.velocity = createDoubleFbo(
      gl,
      simWidth,
      simHeight,
      velocityFormat.internalFormat,
      velocityFormat.format,
      velocityFormat.type,
      linear,
    );
    doubleFbos.density = createDoubleFbo(
      gl,
      dyeWidth,
      dyeHeight,
      dyeFormat.internalFormat,
      dyeFormat.format,
      dyeFormat.type,
      linear,
    );

    if (isViscous) {
      const pressureFormat = ext.formatR ? getSupportedFormat(
        gl,
        ext.formatR.internalFormat,
        ext.formatR.format,
        halfFloat,
      ) : null;
      if (!pressureFormat || !pressureFormat.internalFormat) {
        console.error("Failed to get supported pressure texture format.");
        return;
      }
      doubleFbos.pressure = createDoubleFbo(
        gl,
        simWidth,
        simHeight,
        pressureFormat.internalFormat,
        pressureFormat.format,
        pressureFormat.type,
        gl.NEAREST,
      );
    }
  };

  const blit = (gl, target) => {
    if (!gl) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const compileShader = (gl, type, source) => {
    if (!gl) return null;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const createProgram = (gl, vertexShader, fragmentShader) => {
    if (!gl || !vertexShader || !fragmentShader) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    try {
      glRef.current =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
      console.error('WebGL is not supported.');
      return;
    }
    if (!glRef.current) {
      console.error('Failed to get WebGL context.');
      return;
    }
    const gl = getGL();

    const getHalfFloat = () => {
      const halfFloat = gl.getExtension('OES_texture_half_float');
      if (halfFloat) {
        return {
          HALF_FLOAT_OES: halfFloat.HALF_FLOAT_OES,
          HALF_FLOAT: halfFloat.HALF_FLOAT_OES,
          RGBA: gl.RGBA,
          RG: gl.LUMINANCE_ALPHA,
          R: gl.LUMINANCE,
        };
      }
      return {
        HALF_FLOAT_OES: gl.UNSIGNED_BYTE,
        HALF_FLOAT: gl.UNSIGNED_BYTE,
        RGBA: gl.RGBA,
        RG: gl.LUMINANCE_ALPHA,
        R: gl.LUMINANCE,
      };
    };

    extRef.current = {
      formatRGBA: getSupportedFormat(gl, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE),
      formatR: getSupportedFormat(gl, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE),
      halfFloatTexType: getHalfFloat(),
      supportLinearFiltering: gl.getExtension('OES_texture_float_linear'),
    };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const baseVertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      `
      precision highp float;
      attribute vec2 a_position;
      varying vec2 v_tex_coord;
      void main () {
        v_tex_coord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,
    );

    const splatShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_target;
      uniform float u_aspect_ratio;
      uniform vec3 u_color;
      uniform vec2 u_point;
      uniform float u_radius;
      void main () {
        vec2 p = v_tex_coord - u_point.xy;
        p.x *= u_aspect_ratio;
        vec3 splat = exp(-dot(p, p) / u_radius) * u_color;
        vec3 base = texture2D(u_target, v_tex_coord).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `,
    );
    programs.splat = createProgram(gl, baseVertexShader, splatShader);
    if (programs.splat) {
        uniformLocations.splat = {
          target: gl.getUniformLocation(programs.splat, 'u_target'),
          aspectRatio: gl.getUniformLocation(programs.splat, 'u_aspect_ratio'),
          color: gl.getUniformLocation(programs.splat, 'u_color'),
          point: gl.getUniformLocation(programs.splat, 'u_point'),
          radius: gl.getUniformLocation(programs.splat, 'u_radius'),
        };
    }

    const advectionShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_velocity;
      uniform sampler2D u_source;
      uniform vec2 u_texel_size;
      uniform float u_dt;
      uniform float u_dissipation;
      const float G = ${viscous ? viscous.toFixed(2) : '30.0'};
      const int I = ${iterationsViscous || 32};
      void main () {
        vec2 pos = v_tex_coord - u_dt * texture2D(u_velocity, v_tex_coord).xy;
        vec4 result = texture2D(u_source, pos);
        float div = texture2D(u_velocity, v_tex_coord).z;
        if (${isViscous ? 'true' : 'false'}) {
          for (int i = 0; i < I; i++) {
            pos -= G * result.xy;
            result = texture2D(u_source, pos);
          }
        }
        gl_FragColor = u_dissipation * result;
      }
    `,
    );
    programs.advection = createProgram(gl, baseVertexShader, advectionShader);
    if (programs.advection) {
        uniformLocations.advection = {
          velocity: gl.getUniformLocation(programs.advection, 'u_velocity'),
          source: gl.getUniformLocation(programs.advection, 'u_source'),
          texelSize: gl.getUniformLocation(programs.advection, 'u_texel_size'),
          dt: gl.getUniformLocation(programs.advection, 'u_dt'),
          dissipation: gl.getUniformLocation(programs.advection, 'u_dissipation'),
        };
    }

    const divergenceShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_velocity;
      uniform vec2 u_texel_size;
      void main () {
        float L = texture2D(u_velocity, v_tex_coord - vec2(u_texel_size.x, 0.0)).x;
        float R = texture2D(u_velocity, v_tex_coord + vec2(u_texel_size.x, 0.0)).x;
        float B = texture2D(u_velocity, v_tex_coord - vec2(0.0, u_texel_size.y)).y;
        float T = texture2D(u_velocity, v_tex_coord + vec2(0.0, u_texel_size.y)).y;
        vec2 C = texture2D(u_velocity, v_tex_coord).xy;
        if (${isBounce ? 'true' : 'false'}) {
          float nearL = v_tex_coord.x - u_texel_size.x;
          if (nearL < 0.0) { L = -C.x; }
          float nearR = v_tex_coord.x + u_texel_size.x;
          if (nearR > 1.0) { R = -C.x; }
          float nearB = v_tex_coord.y - u_texel_size.y;
          if (nearB < 0.0) { B = -C.y; }
          float nearT = v_tex_coord.y + u_texel_size.y;
          if (nearT > 1.0) { T = -C.y; }
        }
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }
    `,
    );
    programs.divergence = createProgram(gl, baseVertexShader, divergenceShader);
    if (programs.divergence) {
        uniformLocations.divergence = {
          velocity: gl.getUniformLocation(programs.divergence, 'u_velocity'),
          texelSize: gl.getUniformLocation(programs.divergence, 'u_texel_size'),
        };
    }

    const pressureShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_pressure;
      uniform sampler2D u_divergence;
      uniform vec2 u_texel_size;
      void main () {
        float L = texture2D(u_pressure, v_tex_coord - vec2(u_texel_size.x, 0.0)).x;
        float R = texture2D(u_pressure, v_tex_coord + vec2(u_texel_size.x, 0.0)).x;
        float B = texture2D(u_pressure, v_tex_coord - vec2(0.0, u_texel_size.y)).x;
        float T = texture2D(u_pressure, v_tex_coord + vec2(0.0, u_texel_size.y)).x;
        float C = texture2D(u_pressure, v_tex_coord).x;
        float divergence = texture2D(u_divergence, v_tex_coord).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `,
    );
    programs.pressure = createProgram(gl, baseVertexShader, pressureShader);
    if (programs.pressure) {
        uniformLocations.pressure = {
          pressure: gl.getUniformLocation(programs.pressure, 'u_pressure'),
          divergence: gl.getUniformLocation(programs.pressure, 'u_divergence'),
          texelSize: gl.getUniformLocation(programs.pressure, 'u_texel_size'),
        };
    }

    const gradientSubtractShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_pressure;
      uniform sampler2D u_velocity;
      uniform vec2 u_texel_size;
      void main () {
        float L = texture2D(u_pressure, v_tex_coord - vec2(u_texel_size.x, 0.0)).x;
        float R = texture2D(u_pressure, v_tex_coord + vec2(u_texel_size.x, 0.0)).x;
        float B = texture2D(u_pressure, v_tex_coord - vec2(0.0, u_texel_size.y)).x;
        float T = texture2D(u_pressure, v_tex_coord + vec2(0.0, u_texel_size.y)).x;
        vec2 velocity = texture2D(u_velocity, v_tex_coord).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    );
    programs.gradientSubtract = createProgram(
      gl,
      baseVertexShader,
      gradientSubtractShader,
    );
    if (programs.gradientSubtract) {
        uniformLocations.gradientSubtract = {
          pressure: gl.getUniformLocation(
            programs.gradientSubtract,
            'u_pressure',
          ),
          velocity: gl.getUniformLocation(
            programs.gradientSubtract,
            'u_velocity',
          ),
          texelSize: gl.getUniformLocation(
            programs.gradientSubtract,
            'u_texel_size',
          ),
        };
    }

    const displayShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      varying vec2 v_tex_coord;
      uniform sampler2D u_texture;
      void main () {
        gl_FragColor = texture2D(u_texture, v_tex_coord);
      }
    `,
    );
    programs.display = createProgram(gl, baseVertexShader, displayShader);
    if (programs.display) {
        uniformLocations.display = {
          texture: gl.getUniformLocation(programs.display, 'u_texture'),
        };
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    if (programs.splat) {
        const position = gl.getAttribLocation(programs.splat, 'a_position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }

    initFbos(gl);

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      gl.canvas.width = innerWidth;
      gl.canvas.height = innerHeight;
      initFbos(gl);
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      if (autoDemoState.isRunning) {
        const timeSinceSwitch = Date.now() - autoDemoState.lastSwitchTime;
        if (takeoverDuration && timeSinceSwitch < takeoverDuration * 1000) {
          return;
        }
        autoDemoState.isRunning = false;
      }

      pointer.dx = (e.clientX - pointer.x) * mouseForce;
      pointer.dy = (e.clientY - pointer.y) * mouseForce;
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      clearTimeout(pointer.timer);
      pointer.isMoving = true;
      pointer.timer = setTimeout(() => {
        pointer.isMoving = false;
        if (autoDemo) {
          autoDemoState.lastSwitchTime = Date.now();
          autoDemoState.isRunning = true;
        }
      }, autoResumeDelay);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isViscous,
    viscous,
    iterationsViscous,
    iterationsPoisson,
    resolution,
    isBounce,
    mouseForce,
    autoDemo,
    autoResumeDelay,
    takeoverDuration,
  ]);

  const splat = (gl, x, y, dx, dy, color) => {
    if (!gl || !programs.splat || !doubleFbos.velocity || !doubleFbos.density) return;
    gl.useProgram(programs.splat);
    gl.uniform1i(uniformLocations.splat.target, doubleFbos.velocity.read[0] ? 0 : -1);
    gl.uniform1f(
      uniformLocations.splat.aspectRatio,
      gl.canvas.width / gl.canvas.height,
    );
    gl.uniform2f(uniformLocations.splat.point, x / gl.canvas.width, 1 - y / gl.canvas.height);
    gl.uniform3f(uniformLocations.splat.color, dx, -dy, 1.0);
    gl.uniform1f(uniformLocations.splat.radius, config.SPLAT_RADIUS / 100);
    blit(gl, doubleFbos.velocity.write[1]);
    doubleFbos.velocity.swap();

    gl.uniform1i(uniformLocations.splat.target, doubleFbos.density.read[0] ? 0 : -1);
    gl.uniform3f(uniformLocations.splat.color, color.r, color.g, color.b);
    blit(gl, doubleFbos.density.write[1]);
    doubleFbos.density.swap();
  };

  useEffect(() => {
    const gl = getGL();
    if (!gl) return;

    const animate = (time) => {
      animationFrameId.current = requestAnimationFrame(animate);
      const dt = Math.min((time - lastTime.current) / 1000, 0.016);
      lastTime.current = time;

      if (!doubleFbos.velocity || !doubleFbos.density) return;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      if (splatStackRef.current.length > 0) {
        for (let i = 0; i < splatStackRef.current.length; i++) {
          const { x, y, dx, dy, color } = splatStackRef.current[i];
          splat(gl, x, y, dx, dy, color);
        }
        splatStackRef.current = [];
      }

      if (autoDemoState.isRunning) {
        autoDemoState.phase += (autoSpeed || 0.5) * dt;
        const x = gl.canvas.width * (Math.sin(autoDemoState.phase) * 0.5 + 0.5);
        const y = gl.canvas.height * (Math.cos(autoDemoState.phase * 0.7) * 0.5 + 0.5);
        const dx = Math.sin(autoDemoState.phase * 1.5) * (autoIntensity || 2.2);
        const dy = Math.cos(autoDemoState.phase * 2.2) * (autoIntensity || 2.2);
        if (colorPalette.length > 0) {
            const colorIndex = Math.floor(autoDemoState.phase * 5) % colorPalette.length;
            const color = colorPalette[colorIndex];
            splat(gl, x, y, dx, dy, color);
        }
      }

      for (let i = 0; i < pointersRef.current.length; i++) {
        const p = pointersRef.current[i].current;
        if (p.isMoving && colorPalette.length > 0) {
          const colorIndex = Math.floor(Date.now() / 100) % colorPalette.length;
          splat(gl, p.x, p.y, p.dx, p.dy, colorPalette[colorIndex]);
          p.dx = 0;
          p.dy = 0;
        }
      }

      if (programs.advection) {
          gl.useProgram(programs.advection);
          gl.uniform1i(
            uniformLocations.advection.velocity,
            doubleFbos.velocity.read[0] ? 0 : -1, // Use 0 for texture unit, or -1 if null
          );
          gl.uniform1i(
            uniformLocations.advection.source,
            doubleFbos.velocity.read[0] ? 0 : -1, // Use 0 for texture unit, or -1 if null
          );
          gl.uniform1f(
            uniformLocations.advection.dissipation,
            config.VELOCITY_DISSIPATION,
          );
          gl.uniform1f(uniformLocations.advection.dt, dt);
          gl.uniform2f(
            uniformLocations.advection.texelSize,
            1 / (doubleFbos.velocity.read[2] || 1), // Prevent division by zero
            1 / (doubleFbos.velocity.read[3] || 1), // Prevent division by zero
          );
          blit(gl, doubleFbos.velocity.write[1]);
          doubleFbos.velocity.swap();

          gl.uniform1i(uniformLocations.advection.source, doubleFbos.density.read[0] ? 0 : -1);
          gl.uniform1f(
            uniformLocations.advection.dissipation,
            config.DENSITY_DISSIPATION,
          );
          blit(gl, doubleFbos.density.write[1]);
          doubleFbos.density.swap();
      }

      if (isViscous && programs.divergence && programs.pressure && programs.gradientSubtract && doubleFbos.pressure) {
        gl.useProgram(programs.divergence);
        gl.uniform1i(
          uniformLocations.divergence.velocity,
          doubleFbos.velocity.read[0] ? 0 : -1,
        );
        gl.uniform2f(
          uniformLocations.divergence.texelSize,
          1 / (doubleFbos.velocity.read[2] || 1),
          1 / (doubleFbos.velocity.read[3] || 1),
        );
        blit(gl, doubleFbos.pressure.write[1]);
        doubleFbos.pressure.swap();

        gl.useProgram(programs.pressure);
        gl.uniform1i(
          uniformLocations.pressure.divergence,
          doubleFbos.pressure.read[0] ? 0 : -1,
        );
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
          gl.uniform1i(
            uniformLocations.pressure.pressure,
            doubleFbos.pressure.read[0] ? 0 : -1,
          );
          blit(gl, doubleFbos.pressure.write[1]);
          doubleFbos.pressure.swap();
        }

        gl.useProgram(programs.gradientSubtract);
        gl.uniform1i(
          uniformLocations.gradientSubtract.pressure,
          doubleFbos.pressure.read[0] ? 0 : -1,
        );
        gl.uniform1i(
          uniformLocations.gradientSubtract.velocity,
          doubleFbos.velocity.read[0] ? 0 : -1,
        );
        blit(gl, doubleFbos.velocity.write[1]);
        doubleFbos.velocity.swap();
      }

      if (programs.display) {
          gl.useProgram(programs.display);
          gl.uniform1i(uniformLocations.display.texture, doubleFbos.density.read[0] ? 0 : -1);
          blit(gl, null);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [
    colorPalette,
    config,
    autoSpeed,
    autoIntensity,
    isViscous,
  ]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default LiquidEther;
