
(() => {
  "use strict";

  // --------------------------------------------------
  // 1. Elements and configuration
  // --------------------------------------------------

  const $ = (id) => document.getElementById(id);

  const canvas = $("effect-canvas");
  const errorEl = $("error");
  const statusEl = $("status");

  const controlIds = [
    "freq",
    "octaves",
    "strength",
    "radius",
    "softness",
    "speed",
    "animate",
  ];

  const requiredIds = [
    "effect-canvas",
    "error",
    "status",
    "export",
    "export-bottom",
    "reset",
    ...controlIds,
    "freq-value",
    "octaves-value",
    "strength-value",
    "radius-value",
    "softness-value",
    "speed-value",
  ];

  for (const id of requiredIds) {
    if (!$(id)) {
      console.error(`Missing HTML element: #${id}`);
      return;
    }
  }

  const defaults = Object.fromEntries(
    controlIds.map((id) => [
      id,
      id === "animate" ? $("animate").checked : $(id).value,
    ])
  );

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  if (!gl) {
    showError(
      "WebGL could not be initialized. Try a browser with WebGL enabled."
    );
    return;
  }

  let program;
  let texture;
  let imageReady = false;
  let animationFrame = 0;
  let elapsed = 0;
  let previousTimestamp = null;

  const TAU = Math.PI * 2;

  // --------------------------------------------------
  // 2. GLSL shaders
  // --------------------------------------------------

  const vertexShaderSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    varying vec2 vUv;

    uniform sampler2D uImage;
    uniform vec2 uResolution;

    uniform float uTime;
    uniform float uSpeed;
    uniform float uFrequency;
    uniform float uOctaves;
    uniform float uStrength;
    uniform float uRadius;
    uniform float uSoftness;

    // ------------------------------------------------
    // Smooth procedural value noise
    // ------------------------------------------------

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      // Quintic interpolation creates smoother gradients
      // than the usual cubic smoothstep interpolation.
      f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      float bottom = mix(a, b, f.x);
      float top = mix(c, d, f.x);

      return mix(bottom, top, f.y);
    }

    // ------------------------------------------------
    // Fractal noise with restrained high frequencies
    // ------------------------------------------------

    float fbm(vec2 p) {
      float total = 0.0;
      float amplitude = 0.60;
      float amplitudeTotal = 0.0;

      // Fixed loop bounds are compatible with WebGL 1.
      // The octave slider determines how many layers run.
      for (int i = 0; i < 6; i++) {
        if (float(i) >= uOctaves) {
          break;
        }

        total += noise(p) * amplitude;
        amplitudeTotal += amplitude;

        p *= 2.0;
        amplitude *= 0.42;
      }

      return total / max(amplitudeTotal, 0.0001);
    }

    // ------------------------------------------------
    // Periodic organic animation
    // ------------------------------------------------

    void main() {
      // Base phase completes one full cycle.
      float phase = mod(uTime * uSpeed, 6.28318530718);

      // Small harmonics change the apparent rate of motion.
      // Since these use integer multiples of phase, they loop.
      float driftPhase =
          phase
          + 0.16 * sin(2.0 * phase)
          + 0.06 * sin(3.0 * phase + 0.7);

      float rotation =
          phase
          + 0.30 * sin(2.0 * phase + 0.4)
          + 0.10 * sin(3.0 * phase);

      // Noise coordinates are centered around the image.
      vec2 p = (vUv - 0.5) * uFrequency;

      // Rotate the noise field.
      float c = cos(rotation);
      float s = sin(rotation);

      mat2 rot = mat2(c, -s, s, c);
      p = rot * p;

      // Move the field along a circular path.
      // The periodic phase makes the endpoint match the start.
      vec2 drift = vec2(
        cos(driftPhase),
        sin(driftPhase)
      ) * 0.16;

      p += drift;

      // Sample the softened noise field.
      float n = fbm(p);

      // ------------------------------------------------
      // Radial mask with noise-distorted boundary
      // ------------------------------------------------

      float aspect = uResolution.x / uResolution.y;

      // Aspect correction keeps the radial boundary circular
      // in screen space, even for a portrait image.
      vec2 centered = (vUv - 0.5) * vec2(aspect, 1.0);
      float dist = length(centered);

      float radius = uRadius * 0.5;

      // Keep displacement deliberately restrained.
      // Noise values are centered around zero.
      float displacement = (n - 0.5) * uStrength * 0.12;

      float edge = radius + displacement;

      // The softness slider controls the width of the transition.
      float feather = max(uSoftness * 0.25, 0.001);

      float mask = 1.0 - smoothstep(
        edge - feather,
        edge + feather,
        dist
      );

      // ------------------------------------------------
      // Image output
      // ------------------------------------------------

      vec4 image = texture2D(uImage, vUv);

      // Transparent outside the mask, visible inside.
      gl_FragColor = vec4(
        image.rgb,
        image.a * mask
      );
    }
  `;

  // --------------------------------------------------
  // 3. Shader compilation and program setup
  // --------------------------------------------------

  function compileShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation failed:\n${message}`);
    }

    return shader;
  }

  function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(
      gl.VERTEX_SHADER,
      vertexSource
    );

    const fragmentShader = compileShader(
      gl.FRAGMENT_SHADER,
      fragmentSource
    );

    const result = gl.createProgram();

    gl.attachShader(result, vertexShader);
    gl.attachShader(result, fragmentShader);
    gl.linkProgram(result);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(result);
      gl.deleteProgram(result);
      throw new Error(`Program linking failed:\n${message}`);
    }

    return result;
  }

  let locations = {};

  try {
    program = createProgram(
      vertexShaderSource,
      fragmentShaderSource
    );

    gl.useProgram(program);

    const attribute = gl.getAttribLocation(
      program,
      "aPosition"
    );

    locations = {
      position: attribute,
      image: gl.getUniformLocation(program, "uImage"),
      resolution: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      speed: gl.getUniformLocation(program, "uSpeed"),
      frequency: gl.getUniformLocation(program, "uFrequency"),
      octaves: gl.getUniformLocation(program, "uOctaves"),
      strength: gl.getUniformLocation(program, "uStrength"),
      radius: gl.getUniformLocation(program, "uRadius"),
      softness: gl.getUniformLocation(program, "uSoftness"),
    };

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      vertices,
      gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(
      locations.position,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    // Create a placeholder texture before loading the image.
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([30, 30, 30, 255])
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );

    gl.uniform1i(locations.image, 0);

    gl.uniform2f(
      locations.resolution,
      canvas.width,
      canvas.height
    );

    gl.clearColor(0, 0, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
  } catch (error) {
    showError(error.message);
    return;
  }

  // --------------------------------------------------
  // 4. Read and normalize controls
  // --------------------------------------------------

  function getSettings() {
    const rawFrequency = Number($("freq").value);
    const rawSpeed = Number($("speed").value);

    // Supports either decimal-style frequency values
    // (such as 0.05) or integer-style values (such as 5).
    const frequency =
      rawFrequency > 0 && rawFrequency <= 1
        ? rawFrequency * 100
        : rawFrequency;

    // Supports decimal speed values and percentage-style sliders.
    const speed =
      rawSpeed > 10
        ? rawSpeed / 100
        : rawSpeed;

    return {
      freq: rawFrequency,
      frequency: Math.max(frequency, 0.1),
      octaves: Number($("octaves").value),
      strength: Number($("strength").value) / 100,
      radius: Number($("radius").value) / 100,
      softness: Number($("softness").value) / 100,
      speed: Math.max(speed, 0),
      animate: $("animate").checked,
    };
  }

  function formatValue(value, id) {
    const input = $(id);
    const step = Number(input.step);

    if (Number.isFinite(step) && step > 0 && step < 1) {
      const decimals = Math.min(
        4,
        (String(step).split(".")[1] || "").length
      );

      return Number(value).toFixed(decimals);
    }

    return String(value);
  }

  function updateLabels() {
    const pairs = [
      ["freq", "freq-value"],
      ["octaves", "octaves-value"],
      ["strength", "strength-value"],
      ["radius", "radius-value"],
      ["softness", "softness-value"],
      ["speed", "speed-value"],
    ];

    for (const [inputId, outputId] of pairs) {
      $(outputId).textContent = formatValue(
        $(inputId).value,
        inputId
      );
    }
  }

  function updateUniforms() {
    const settings = getSettings();

    gl.uniform1f(locations.speed, settings.speed);
    gl.uniform1f(locations.frequency, settings.frequency);
    gl.uniform1f(locations.octaves, settings.octaves);
    gl.uniform1f(locations.strength, settings.strength);
    gl.uniform1f(locations.radius, settings.radius);
    gl.uniform1f(locations.softness, settings.softness);

    return settings;
  }

  // --------------------------------------------------
  // 5. Rendering and animation
  // --------------------------------------------------

  function render(timestamp) {
    if (previousTimestamp === null) {
      previousTimestamp = timestamp;
    }

    const delta = Math.min(
      (timestamp - previousTimestamp) / 1000,
      0.05
    );

    previousTimestamp = timestamp;

    const settings = updateUniforms();

    // Pausing stops elapsed time, so resuming continues
    // from the same animation phase instead of jumping.
    if (settings.animate) {
      elapsed += delta;
    }

    gl.uniform1f(locations.time, elapsed);

    gl.clear(gl.COLOR_BUFFER_BIT);

    if (imageReady) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    animationFrame = requestAnimationFrame(render);
  }

  // --------------------------------------------------
  // 6. Load the source image
  // --------------------------------------------------

  function loadImage() {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      try {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Flip the uploaded image to match WebGL's UV orientation.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        imageReady = true;
        errorEl.hidden = true;
        statusEl.textContent =
          "Image loaded. Adjust the settings to refine the mask.";
      } catch (error) {
        showError(`Could not upload image texture: ${error.message}`);
      }
    };

    image.onerror = () => {
      showError(
        "The source image could not be loaded. Check the image URL or try another image."
      );
    };

    image.src = "https://picsum.photos/400/600?random=1";
  }

  // --------------------------------------------------
  // 7. Export settings as JSON
  // --------------------------------------------------

  function exportSettings() {
    const settings = getSettings();

    const exportData = {
      effect: "organic-noise-radial-mask",
      version: 2,
      sourceImage: "https://picsum.photos/400/600?random=1",
      settings: {
        frequency: settings.freq,
        octaves: settings.octaves,
        strength: Number($("strength").value),
        radius: Number($("radius").value),
        softness: Number($("softness").value),
        speed: Number($("speed").value),
        animate: settings.animate,
      },
      animation: {
        path: "circular",
        rotation: "periodically-modulated",
        motion: "periodically-modulated",
        seamlessLoop: true,
      },
    };

    const json = JSON.stringify(exportData, null, 2);

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(json)
        .then(() => {
          statusEl.textContent = "Settings JSON copied to clipboard.";
        })
        .catch(() => downloadJSON(json));
    } else {
      downloadJSON(json);
    }
  }

  function downloadJSON(json) {
    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "noise-mask-settings.json";
    link.click();

    URL.revokeObjectURL(url);

    statusEl.textContent = "Settings JSON downloaded.";
  }

  // --------------------------------------------------
  // 8. Reset controls
  // --------------------------------------------------

  function resetSettings() {
    for (const id of controlIds) {
      if (id === "animate") {
        $(id).checked = Boolean(defaults[id]);
      } else {
        $(id).value = defaults[id];
      }
    }

    elapsed = 0;
    previousTimestamp = null;

    updateLabels();
    updateUniforms();

    statusEl.textContent = "Settings reset to their initial values.";
  }

  // --------------------------------------------------
  // 9. Error handling
  // --------------------------------------------------

  function showError(message) {
    console.error(message);

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    if (statusEl) {
      statusEl.textContent = "Preview could not start.";
    }
  }

  // --------------------------------------------------
  // 10. Wire up the interface
  // --------------------------------------------------

  for (const id of [
    "freq",
    "octaves",
    "strength",
    "radius",
    "softness",
    "speed",
  ]) {
    $(id).addEventListener("input", () => {
      updateLabels();
      updateUniforms();
    });
  }

  $("animate").addEventListener("change", () => {
    statusEl.textContent = $("animate").checked
      ? "Animation playing."
      : "Animation paused.";
  });

  $("export").addEventListener("click", exportSettings);
  $("export-bottom").addEventListener("click", exportSettings);
  $("reset").addEventListener("click", resetSettings);

  // --------------------------------------------------
  // 11. Initialize
  // --------------------------------------------------

  updateLabels();
  updateUniforms();
  loadImage();

  statusEl.textContent = "Initializing preview...";
  animationFrame = requestAnimationFrame(render);
})();
