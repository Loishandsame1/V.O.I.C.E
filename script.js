const angpao = document.getElementById("angpao");
const popup = document.getElementById("popup");
const tutupbtn = document.getElementById("tutupbtn");

angpao.addEventListener("click", () => {
    popup.style.display = "flex";
});

tutupbtn.addEventListener("click", () => {
    popup.style.display = "none";
});

const confettiContainer = document.querySelector(".confetti-container");

function createConfetti() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = (2 + Math.random() * 3) + "s";
    confettiContainer.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 5000);
}

setInterval(createConfetti, 200);
