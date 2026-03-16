const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const objectText = document.getElementById("objectText");

let stream = null;
let model = null;
let detecting = false;
let lastSpoken = "";

const objectDictionary = {
  bottle: "botol",
  cup: "gelas",
  cellphone: "ponsel",
  mobile_phone: "ponsel",
  laptop: "laptop",
  book: "buku",
  backpack: "tas",
  handbag: "tas tangan",
  mouse: "mouse",
  keyboard: "keyboard",
  remote: "remote",
  scissors: "gunting",
  spoon: "sendok",
  fork: "garpu",
  knife: "pisau",
  bowl: "mangkuk",
  banana: "pisang",
  apple: "apel",
  orange: "jeruk",
  sandwich: "roti",
  pizza: "pizza",
  chair: "kursi",
  tie: "dasi",
  person: "orang"
};

function speak(text) {
  if (text === lastSpoken) return;
  lastSpoken = text;

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "id-ID";
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}

async function startCamera() {
  if (stream) return;

  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });

  video.srcObject = stream;
  statusText.innerText = "Kamera aktif";
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  detecting = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  statusText.innerText = "Kamera mati";
  objectText.innerText = "Sedang memegang: -";
}

async function loadModel() {
  model = await cocoSsd.load();
  statusText.innerText = "Model AI siap";
}

async function detectLoop() {
  if (!detecting) return;

  const predictions = await model.detect(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const persons = predictions.filter(p => p.class === "person");
  const objects = predictions.filter(p => p.class !== "person");

  let detectedObject = "-";

  persons.forEach(person => {

    let [x, y, w, h] = person.bbox;
    x += w * 0.15;
    y += h * 0.15;
    w *= 0.7;
    h *= 0.7;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    objects.forEach(obj => {
      const [ox, oy, ow, oh] = obj.bbox;

      const overlap =
        ox < x + w &&
        ox + ow > x &&
        oy < y + h &&
        oy + oh > y;

      if (overlap) {
        detectedObject =
          objectDictionary[obj.class] || obj.class;

        ctx.strokeStyle = "#4da6ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, ow, oh);

        ctx.fillStyle = "#4da6ff";
        ctx.font = "14px Arial";
        ctx.fillText(detectedObject, ox + 4, oy - 4);
      }
    });
  });

  statusText.innerText = `Terdeteksi ${persons.length} orang`;
  objectText.innerText = `Sedang memegang: ${detectedObject}`;

  if (persons.length > 0 && detectedObject !== "-") {
    speak(`Seseorang sedang memegang ${detectedObject}`);
  }

  requestAnimationFrame(detectLoop);
}

document.getElementById("btnOn").onclick = async () => {
  await startCamera();
  if (!model) await loadModel();
};

document.getElementById("btnOff").onclick = stopCamera;

document.getElementById("btnDetect").onclick = () => {
  if (!stream || !model) {
    alert("Nyalakan kamera dulu");
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  detecting = true;
  detectLoop();
};

document.getElementById("btnStop").onclick = () => {
  detecting = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  statusText.innerText = "Deteksi dihentikan";
  objectText.innerText = "Sedang memegang: -";
};