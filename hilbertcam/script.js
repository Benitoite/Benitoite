(() => {
  "use strict";

  const canvases = [...document.querySelectorAll(".curve-canvas")];
  const previewButtons = [...document.querySelectorAll("[data-preview-mode]")];
  const heroCanvas = document.querySelector("#hero-curve");
  const pointCount = document.querySelector("#hero-point-count");
  let renderTimer;

  function signalDarkness(x, y) {
    const face = Math.exp(-(((x - 0.52) / 0.31) ** 2 + ((y - 0.45) / 0.38) ** 2) * 1.55);
    const leftEye = Math.exp(-(((x - 0.41) / 0.065) ** 2 + ((y - 0.39) / 0.04) ** 2) * 2.2);
    const rightEye = Math.exp(-(((x - 0.62) / 0.065) ** 2 + ((y - 0.39) / 0.04) ** 2) * 2.2);
    const nose = Math.exp(-(((x - 0.52) / 0.055) ** 2 + ((y - 0.53) / 0.15) ** 2) * 1.4);
    const mouth = Math.exp(-(((x - 0.52) / 0.16) ** 2 + ((y - 0.66) / 0.035) ** 2) * 2);
    const diagonal = 0.13 * (Math.sin((x * 7.2 + y * 4.1) * Math.PI) + 1);
    return Math.max(0, Math.min(1, 0.2 + face * 0.38 + leftEye * 0.55 + rightEye * 0.55 + nose * 0.18 + mouth * 0.58 + diagonal));
  }

  function adaptiveHilbert(points, x0, y0, xi, xj, yi, yj, depth, mode) {
    const cx = x0 + (xi + yi) * 0.5;
    const cy = y0 + (xj + yj) * 0.5;
    let density = signalDarkness(cx, cy);

    if (mode === 2) {
      density = 1 - density;
    }

    const minimumDepth = 3;
    const maximumDepth = 8;
    const targetDepth = minimumDepth + Math.round(density * (maximumDepth - minimumDepth));

    if (depth >= targetDepth || depth >= maximumDepth) {
      points.push([cx, cy]);
      return;
    }

    adaptiveHilbert(points, x0, y0, yi / 2, yj / 2, xi / 2, xj / 2, depth + 1, mode);
    adaptiveHilbert(points, x0 + xi / 2, y0 + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, depth + 1, mode);
    adaptiveHilbert(points, x0 + xi / 2 + yi / 2, y0 + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, depth + 1, mode);
    adaptiveHilbert(points, x0 + xi / 2 + yi, y0 + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, depth + 1, mode);
  }

  function renderCurve(canvas) {
    const mode = Number(canvas.dataset.mode || 1);
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d", { alpha: false });
    const points = [];
    adaptiveHilbert(points, 0, 0, 1, 0, 0, 1, 0, mode);

    context.fillStyle = mode === 1 ? "#f7f5ee" : "#0c0e0d";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = mode === 1 ? "#111310" : "#f7f5ee";
    context.lineWidth = Math.max(1.15 * dpr, Math.min(width, height) / 560);
    context.lineCap = "square";
    context.lineJoin = "miter";
    context.beginPath();

    const pad = Math.max(12 * dpr, Math.min(width, height) * 0.035);
    const drawWidth = width - pad * 2;
    const drawHeight = height - pad * 2;

    points.forEach(([x, y], index) => {
      const px = pad + x * drawWidth;
      const py = pad + y * drawHeight;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });

    context.stroke();

    if (canvas === heroCanvas && pointCount) {
      pointCount.textContent = `${String(points.length).padStart(5, "0")} PTS`;
    }
  }

  function renderAll() {
    canvases.forEach(renderCurve);
  }

  function selectMode(mode) {
    heroCanvas.dataset.mode = String(mode);
    heroCanvas.setAttribute("aria-label", `Adaptive Hilbert curve demonstration in Mode ${mode}`);

    previewButtons.forEach((button) => {
      const selected = Number(button.dataset.previewMode) === mode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    renderCurve(heroCanvas);
  }

  previewButtons.forEach((button) => {
    button.addEventListener("click", () => selectMode(Number(button.dataset.previewMode)));
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderAll, 100);
  }, { passive: true });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(renderAll, 60);
    });
    canvases.forEach((canvas) => observer.observe(canvas));
  }

  renderAll();
})();
