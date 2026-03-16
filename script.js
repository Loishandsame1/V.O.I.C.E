
const video=document.getElementById("video");
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

const statusText=document.getElementById("status");
const objectText=document.getElementById("objectText");
const personCountText=document.getElementById("personCount");

let model=null;
let stream=null;
let detecting=false;

async function startCamera(mode){

if(stream){
stream.getTracks().forEach(t=>t.stop());
}

try{

stream=await navigator.mediaDevices.getUserMedia({
video:{facingMode:mode},
audio:false
});

video.srcObject=stream;
await video.play();

statusText.innerText="Kamera aktif";

}catch(e){

statusText.innerText="Gagal akses kamera";

}

}

async function loadModel(){

statusText.innerText="Loading AI...";

model=await cocoSsd.load();

statusText.innerText="AI siap";

}

function speak(text){

if(!window.speechSynthesis) return;

const msg=new SpeechSynthesisUtterance(text);
msg.lang="id-ID";

speechSynthesis.cancel();
speechSynthesis.speak(msg);

}

async function detect(){

if(!detecting) return;

const predictions=await model.detect(video);

canvas.width=video.videoWidth;
canvas.height=video.videoHeight;

ctx.clearRect(0,0,canvas.width,canvas.height);

const persons=predictions.filter(p=>p.class==="person");
const objects=predictions.filter(p=>p.class!=="person");

personCountText.innerText="Jumlah orang: "+persons.length;

let holdingObjects=[];

persons.forEach(person=>{

const [x,y,w,h]=person.bbox;

ctx.strokeStyle="red";
ctx.lineWidth=3;
ctx.strokeRect(x,y,w,h);

objects.forEach(obj=>{

const [ox,oy,ow,oh]=obj.bbox;

const centerX=ox+ow/2;
const centerY=oy+oh/2;

if(
centerX>x &&
centerX<x+w &&
centerY>y &&
centerY<y+h
){

holdingObjects.push(obj.class);

}

});

});

objects.forEach(obj=>{

const [ox,oy,ow,oh]=obj.bbox;

ctx.strokeStyle="#4da6ff";
ctx.lineWidth=2;
ctx.strokeRect(ox,oy,ow,oh);

ctx.fillStyle="#4da6ff";
ctx.font="14px Arial";
ctx.fillText(obj.class,ox,oy>10?oy-5:10);

});

let text="-";

if(holdingObjects.length>0){
text=holdingObjects.join(", ");
speak("terdeteksi "+text);
}

objectText.innerText="Sedang memegang: "+text;

requestAnimationFrame(detect);

}

document.getElementById("btnBack").onclick=async()=>{

await startCamera("environment");
if(!model) await loadModel();

};

document.getElementById("btnFront").onclick=async()=>{

await startCamera("user");
if(!model) await loadModel();

};

document.getElementById("btnDetect").onclick=()=>{

if(!model || !stream){
alert("nyalakan kamera dulu");
return;
}

detecting=true;
detect();

};

document.getElementById("btnStop").onclick=()=>{

detecting=false;

ctx.clearRect(0,0,canvas.width,canvas.height);

objectText.innerText="Sedang memegang: -";
personCountText.innerText="Jumlah orang: 0";

statusText.innerText="Deteksi berhenti";

};
