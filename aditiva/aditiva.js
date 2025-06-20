const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
let gainNodes = [];
let oscNodes = [];
let lfoNodes = [];

const waveTypes = ["sine", "square", "sawtooth", "triangle"];

// Crear 3 osciladores
for (let i = 0; i < 3; i++) {
  createOscillatorCard(i + 1);
}

function createOscillatorCard(index) {
  const container = document.getElementById("osc-container");

  const card = document.createElement("div");
  card.className = "osc-card";
  card.innerHTML = `
    <h2>Oscilador ${index}</h2>

    <label>Tipo de onda:
      <select id="wave-${index}">
        ${waveTypes.map(w => `<option value="${w}">${w}</option>`).join("")}
      </select>
    </label>

    <label>Frecuencia:
      <input type="range" min="100" max="1000" value="440" id="freq-${index}">
    </label>

    <label>Amplitud:
      <input type="range" min="0" max="1" step="0.01" value="0.5" id="gain-${index}">
    </label>

    <label>LFO (Hz):
      <input type="range" min="0" max="20" step="0.1" value="0" id="lfo-${index}">
    </label>
  `;
  container.appendChild(card);
}

document.getElementById("startBtn").addEventListener("click", () => {
  stopAll(); // reinicio

  for (let i = 1; i <= 3; i++) {
    const freq = document.getElementById(`freq-${i}`).value;
    const gain = document.getElementById(`gain-${i}`).value;
    const wave = document.getElementById(`wave-${i}`).value;
    const lfoFreq = document.getElementById(`lfo-${i}`).value;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    osc.type = wave;
    osc.frequency.value = freq;
    gainNode.gain.value = gain;

    lfo.frequency.value = lfoFreq;
    lfoGain.gain.value = 50; // cuánto afecta el LFO a la frecuencia

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    osc.start();
    lfo.start();

    gainNodes.push(gainNode);
    oscNodes.push(osc);
    lfoNodes.push(lfo);
  }

  drawScope();
});

document.getElementById("stopBtn").addEventListener("click", stopAll);

function stopAll() {
  oscNodes.forEach(osc => osc.stop());
  lfoNodes.forEach(lfo => lfo.stop());
  gainNodes = [];
  oscNodes = [];
  lfoNodes = [];
}

function drawScope() {
  const canvas = document.getElementById("oscilloscope");
  const ctx = canvas.getContext("2d");

  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ffcc";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = v * canvas.height / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  draw();
}
