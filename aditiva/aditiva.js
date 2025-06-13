let context = new (window.AudioContext || window.webkitAudioContext)();
let oscillators = [];
let gains = [];

const analyser = context.createAnalyser();
analyser.fftSize = 1024;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);

const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

document.getElementById("play").addEventListener("click", () => {
  stopOscillators();

  const waveforms = [
    document.getElementById("wave1").value,
    document.getElementById("wave2").value,
    document.getElementById("wave3").value
  ];

  const volumes = [
    parseFloat(document.getElementById("vol1").value),
    parseFloat(document.getElementById("vol2").value),
    parseFloat(document.getElementById("vol3").value)
  ];

  for (let i = 0; i < 3; i++) {
    let osc = context.createOscillator();
    let gain = context.createGain();

    osc.type = waveforms[i];
    osc.frequency.value = 220 * (i + 1);
    gain.gain.value = volumes[i];

    osc.connect(gain).connect(analyser);
    osc.start();

    oscillators.push(osc);
    gains.push(gain);
  }

  analyser.connect(context.destination);
  drawOscilloscope();
});

document.getElementById("stop").addEventListener("click", stopOscillators);

function stopOscillators() {
  oscillators.forEach(osc => osc.stop());
  oscillators = [];
  gains = [];

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = "black";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "lime";

  canvasCtx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    let v = dataArray[i] / 128.0;
    let y = (v * canvas.height) / 2;

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