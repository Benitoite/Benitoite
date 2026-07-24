const experience = document.querySelector("#synth-experience");
const powerButton = document.querySelector("#power-button");
const powerLabel = document.querySelector("#power-label");
const fieldStatus = document.querySelector("#field-status");
const frequencyControl = document.querySelector("#frequency-control");
const orbitControl = document.querySelector("#orbit-control");
const fmControl = document.querySelector("#fm-control");
const noiseControl = document.querySelector("#noise-control");
const frequencyOutput = document.querySelector("#frequency-output");
const orbitOutput = document.querySelector("#orbit-output");
const fmOutput = document.querySelector("#fm-output");
const noiseOutput = document.querySelector("#noise-output");
const voiceFrequency = document.querySelector("#voice-frequency");
const frequencyMarker = document.querySelector("#frequency-marker");
const noiseField = document.querySelector("#noise-field");
const waveform = document.querySelector("#waveform");
const noteButtons = [...document.querySelectorAll("[data-note-hz]")];

let playing = true;

function setSliderFill(control) {
  const min = Number(control.min);
  const max = Number(control.max);
  const value = Number(control.value);
  const fill = ((value - min) / (max - min)) * 100;
  control.style.setProperty("--fill", `${fill}%`);
}

function updateFrequency(value) {
  const frequency = Number(value);
  const display = `${frequency.toFixed(1)} Hz`;
  frequencyControl.value = String(frequency);
  frequencyOutput.textContent = display;
  voiceFrequency.textContent = display;
  setSliderFill(frequencyControl);

  const frequencyPercent =
    ((Math.log(frequency) - Math.log(20)) /
      (Math.log(20000) - Math.log(20))) *
    100;
  frequencyMarker.style.left = `${frequencyPercent}%`;

  noteButtons.forEach((button) => {
    const noteFrequency = Number(button.dataset.noteHz);
    button.classList.toggle("active", Math.abs(frequency - noteFrequency) < 0.2);
  });
}

function updateOrbit() {
  const orbit = Number(orbitControl.value);
  const duration = Math.max(2.8, 14 - orbit * 1.55);
  orbitOutput.textContent = `${orbit.toFixed(1)} rev/s`;
  experience.style.setProperty("--orbit-duration", `${duration}s`);
  setSliderFill(orbitControl);
}

function renderWaveform() {
  const fm = Number(fmControl.value);
  waveform.replaceChildren();

  for (let index = 0; index < 58; index += 1) {
    const x = index / 57;
    const envelope = Math.sin(x * Math.PI);
    const y =
      Math.sin(index * (0.48 + fm * 0.52)) *
      envelope *
      (11 + fm * 22);
    const point = document.createElement("i");
    point.style.left = `${(x * 100).toFixed(4)}%`;
    point.style.transform = `translateY(${y.toFixed(4)}px)`;
    waveform.append(point);
  }
}

function updateFm() {
  const fm = Number(fmControl.value);
  fmOutput.textContent = fm.toFixed(2);
  setSliderFill(fmControl);
  renderWaveform();
}

function updateNoise() {
  const noise = Number(noiseControl.value);
  noiseOutput.textContent = `${Math.round(noise * 100)}%`;
  noiseField.style.opacity = String(noise);
  experience.style.setProperty("--wave-opacity", String(1 - noise * 0.55));
  setSliderFill(noiseControl);
}

powerButton.addEventListener("click", () => {
  playing = !playing;
  experience.classList.toggle("is-playing", playing);
  experience.classList.toggle("is-paused", !playing);
  powerButton.setAttribute("aria-pressed", String(playing));
  powerLabel.textContent = playing ? "ON" : "OFF";
  fieldStatus.textContent = playing
    ? "Spatial field active"
    : "Voice suspended";
});

frequencyControl.addEventListener("input", (event) => {
  updateFrequency(event.currentTarget.value);
});

orbitControl.addEventListener("input", updateOrbit);
fmControl.addEventListener("input", updateFm);
noiseControl.addEventListener("input", updateNoise);

noteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateFrequency(button.dataset.noteHz);
  });
});

updateFrequency(frequencyControl.value);
updateOrbit();
updateFm();
updateNoise();
