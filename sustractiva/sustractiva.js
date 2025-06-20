const ctx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = ctx.createAnalyser();
const canvas = document.getElementById('oscilloscope');
const canvasCtx = canvas.getContext('2d');

document.getElementById('playNoise').addEventListener('click', () => {
  const type = document.getElementById('noiseType').value;
  const frequency = document.getElementById('filterFreq').value;

  let bufferSize = 2 * ctx.sampleRate;
  let noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  let output = noiseBuffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;

  noise.connect(filter).connect(analyser).connect(ctx.destination);
  noise.start();
  draw();

  setTimeout(() => {
    noise.stop();
  }, 2000);
});

// Osciloscopio
function draw() {
  analyser.fftSize = 2048;
  let bufferLength = analyser.fftSize;
  let dataArray = new Uint8Array(bufferLength);

  function drawFrame() {
    requestAnimationFrame(drawFrame);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "#000";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#ff6699";
    canvasCtx.beginPath();

    let sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = v * canvas.height / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  drawFrame();
}

// Slider update
document.getElementById('filterFreq').addEventListener('input', function () {
  document.getElementById('freq-label').textContent = `${this.value} Hz`;
});
const filterSlider = document.getElementById("filterFreq");
const freqValue = document.getElementById("freqValue");

filterSlider.addEventListener("input", () => {
  freqValue.textContent = `${filterSlider.value} Hz`;
});
