(() => {
  const canvas = document.querySelector("#scope-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const signalButtons = [...document.querySelectorAll(".signal-button")];
  const motionButton = document.querySelector("#motion-button");
  const frequencyReadout = document.querySelector("#frequency-readout");
  const noteReadout = document.querySelector("#note-readout");
  const centsReadout = document.querySelector("#cents-readout");
  const dialNeedle = document.querySelector("#dial-needle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const signals = {
    tone: { frequency: 440, note: "A", wobble: 0.7, harmonics: 0.04, drift: 0.18 },
    voice: { frequency: 196, note: "G", wobble: 3.6, harmonics: 0.22, drift: 0.5 },
    strings: { frequency: 329.63, note: "E", wobble: 1.7, harmonics: 0.13, drift: 0.34 },
  };

  let activeSignal = "tone";
  let paused = reducedMotion.matches;
  let elapsed = 0;
  let previousTime = performance.now();
  let animationFrame;

  function sizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawGrid(width, height, ratio) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.425;

    context.fillStyle = "#020503";
    context.fillRect(0, 0, width, height);

    context.lineWidth = ratio;
    context.strokeStyle = "rgba(125, 164, 133, 0.16)";
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(width, centerY);
    context.moveTo(centerX, 0);
    context.lineTo(centerX, height);
    context.stroke();

    context.strokeStyle = "rgba(125, 164, 133, 0.2)";
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "rgba(0, 62, 15, 0.1)";
    context.beginPath();
    context.rect(0, 0, width, height);
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    context.fill("evenodd");
  }

  function phasePoint(index, count, time, settings, width, height) {
    const angle = (index / count) * Math.PI * 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.385;

    const shimmer =
      settings.harmonics * Math.sin(angle * 7 + time * settings.wobble) +
      settings.harmonics * 0.55 * Math.sin(angle * 13 - time * 0.8);
    const radial = 0.82 + shimmer;
    const phaseShift = 0.07 * Math.sin(time * settings.drift);
    const x =
      Math.sin(angle) * radial +
      settings.harmonics * 0.7 * Math.sin(angle * 3 + time * 0.9);
    const y =
      Math.cos(angle + phaseShift) * (0.92 - shimmer * 0.24) +
      settings.harmonics * 0.45 * Math.cos(angle * 5 - time * 0.65);

    return {
      x: centerX + x * radius,
      y: centerY + y * radius,
      energy: (Math.sin(angle * 1.25 + time * 0.7) + 1) / 2,
    };
  }

  function traceColor(energy, alpha) {
    if (energy < 0.33) {
      return `rgba(82, 164, 255, ${alpha})`;
    }
    if (energy > 0.72) {
      return `rgba(255, 173, 74, ${alpha})`;
    }
    return `rgba(121, 255, 120, ${alpha})`;
  }

  function drawTrace(width, height, ratio, time) {
    const settings = signals[activeSignal];
    const pointCount = 360;
    const trails = activeSignal === "tone" ? 5 : 8;

    context.lineCap = "round";
    context.lineJoin = "round";

    for (let trail = trails - 1; trail >= 0; trail -= 1) {
      const trailTime = time - trail * 0.035;
      const alpha = 0.08 + ((trails - trail) / trails) * 0.34;
      const lineWidth = (trail === 0 ? 1.55 : 1.05) * ratio;
      let previous = phasePoint(0, pointCount, trailTime, settings, width, height);

      for (let index = 1; index <= pointCount; index += 1) {
        const point = phasePoint(index, pointCount, trailTime, settings, width, height);
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.lineWidth = lineWidth;
        context.strokeStyle = traceColor(point.energy, alpha);
        context.shadowBlur = trail === 0 ? 7 * ratio : 2 * ratio;
        context.shadowColor = traceColor(point.energy, 0.55);
        context.stroke();
        previous = point;
      }
    }

    context.shadowBlur = 0;
  }

  function updateReadout(time) {
    const settings = signals[activeSignal];
    const cents = Math.sin(time * settings.wobble * 0.45) * settings.wobble;
    const frequency = settings.frequency * 2 ** (cents / 1200);

    frequencyReadout.textContent = frequency.toFixed(2);
    noteReadout.textContent = settings.note;
    centsReadout.textContent = `${cents >= 0 ? "+" : ""}${cents.toFixed(1)} cents`;
    dialNeedle.style.transform = `rotate(${cents * 0.62}deg)`;
  }

  function draw(time) {
    sizeCanvas();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    drawGrid(canvas.width, canvas.height, ratio);
    drawTrace(canvas.width, canvas.height, ratio, time);
    updateReadout(time);
  }

  function animate(now) {
    const delta = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    if (!paused) elapsed += delta;
    draw(elapsed);
    animationFrame = requestAnimationFrame(animate);
  }

  signalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeSignal = button.dataset.signal;
      signalButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      draw(elapsed);
    });
  });

  motionButton.addEventListener("click", () => {
    paused = !paused;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.textContent = paused ? "Resume motion" : "Pause motion";
  });

  reducedMotion.addEventListener("change", (event) => {
    paused = event.matches;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.textContent = paused ? "Resume motion" : "Pause motion";
  });

  window.addEventListener("resize", () => draw(elapsed), { passive: true });
  animationFrame = requestAnimationFrame(animate);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
  });
})();
