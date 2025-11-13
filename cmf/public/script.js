// === Buttons & Elements ===
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const dateBtn = document.getElementById("date");
const loveMessage = document.getElementById("loveMessage");
const brokenMessage = document.getElementById("brokenMessage");
const loveImage = document.getElementById("loveImage");
const dateImage = document.getElementById("dateImage");
const rejectImage = document.getElementById("rejectImage");

// === Audio Files ===
let loveAudio = new Audio("love.mp3");
let rejectAudio = new Audio("reject.mp3");
let dateAudio = new Audio("date.mp3");

// === Vault Section ===
const vaultBtn = document.getElementById("vault");
const vaultSection = document.getElementById("vaultSection");
const vaultImagesDiv = document.getElementById("vaultImages");
const correctPassword = "11112003";

// === Modal Elements ===
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

vaultSection.style.display = "none";

// ✅ dynamic base URL fix for Vercel
const apiBase = window.location.origin;

// === Vault Button Click ===
vaultBtn.addEventListener("click", async () => {
  const confirmOpen = confirm("Do you want to see the personal vault? 💌");
  if (!confirmOpen) return;

  const enteredPassword = prompt("Enter the privacy password 🔐  \n hint: birth date ");
  if (enteredPassword !== correctPassword) {
    alert("Wrong password 😢");
    return;
  }

  alert("Access granted 💞");
  vaultSection.style.display = "block";
  vaultSection.scrollIntoView({ behavior: "smooth" });

  vaultImagesDiv.innerHTML = "<p>Fetching photos from cloud ☁️...</p>";

  try {
    const res = await fetch(`${apiBase}/api/vault`);
    const data = await res.json();

    vaultImagesDiv.innerHTML = "";

    if (data.images?.length > 0 || data.videos?.length > 0) {
      // 🖼️ Display images
      data.images?.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Vault image";
        img.loading = "lazy";
        img.addEventListener("click", () => openImageModal(url));
        vaultImagesDiv.appendChild(img);
      });

      // 🎞️ Display videos
      data.videos?.forEach((url) => {
        const videoContainer = document.createElement("div");
        videoContainer.classList.add("video-container");

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.preload = "metadata";
        video.classList.add("vault-video");

        const fullscreenBtn = document.createElement("button");
        fullscreenBtn.innerHTML = "⬜";
        fullscreenBtn.classList.add("fullscreen-btn");
        fullscreenBtn.title = "Full view";
        fullscreenBtn.addEventListener("click", () => openVideoModal(url));

        videoContainer.appendChild(video);
        videoContainer.appendChild(fullscreenBtn);
        vaultImagesDiv.appendChild(videoContainer);
      });
    } else {
      vaultImagesDiv.innerHTML = "<p>No media found 😢</p>";
    }
  } catch (err) {
    vaultImagesDiv.innerHTML = "<p>Error loading images ⚠️</p>";
    console.error("Vault error:", err);
  }
});

// === Video Fullscreen Modal ===
const videoModal = document.createElement("div");
videoModal.id = "videoModal";
videoModal.className = "image-modal";
videoModal.innerHTML = `
  <span id="closeVideoModal" class="close">&times;</span>
  <video id="modalVideo" class="modal-content" controls></video>
`;
document.body.appendChild(videoModal);

const modalVideo = document.getElementById("modalVideo");
const closeVideoModal = document.getElementById("closeVideoModal");

function openVideoModal(url) {
  modalVideo.src = url;
  videoModal.style.display = "flex";
}

closeVideoModal.addEventListener("click", () => {
  modalVideo.pause();
  videoModal.style.display = "none";
});

videoModal.addEventListener("click", (e) => {
  if (e.target === videoModal) {
    modalVideo.pause();
    videoModal.style.display = "none";
  }
});

// === Image Modal ===
function openImageModal(url) {
  modalImage.src = url;
  imageModal.style.display = "flex";
}

closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
  }
});

// === "No" Button Floating Logic ===
document.addEventListener("mousemove", (e) => {
  const rect = noBtn.getBoundingClientRect();
  const distance = Math.hypot(
    e.clientX - (rect.left + rect.width / 2),
    e.clientY - (rect.top + rect.height / 2)
  );
  if (distance < 100) {
    const parentRect = noBtn.parentElement.getBoundingClientRect();
    const maxX = parentRect.width - rect.width - 10;
    const maxY = parentRect.height - rect.height - 10;
    noBtn.style.left = `${Math.random() * maxX}px`;
    noBtn.style.top = `${Math.random() * maxY}px`;
  }
});

// === Yes Button ===
yesBtn.addEventListener("click", () => {
  rejectAudio.pause();
  dateAudio.pause();
  loveMessage.style.display = "block";
  brokenMessage.style.display = "none";
  loveImage.classList.add("show");
  dateImage.classList.remove("show");
  rejectImage.classList.remove("show");
  loveAudio.currentTime = 0;
  loveAudio.play();
  createBurstHearts();
  showFloatingNames();
});

// === No Button ===
noBtn.addEventListener("click", () => {
  loveAudio.pause();
  dateAudio.pause();
  loveMessage.style.display = "none";
  brokenMessage.style.display = "block";
  loveImage.classList.remove("show");
  dateImage.classList.remove("show");
  rejectImage.classList.add("show");
  rejectAudio.currentTime = 0;
  rejectAudio.play();
  createBrokenHearts();
});

// === Date Button ===
dateBtn.addEventListener("click", () => {
  loveAudio.pause();
  rejectAudio.pause();
  loveMessage.style.display = "none";
  brokenMessage.style.display = "none";
  loveImage.classList.remove("show");
  rejectImage.classList.remove("show");
  dateImage.classList.add("show");
  dateAudio.currentTime = 0;
  dateAudio.play();
  createBurstHearts();
  showFloatingNames("Let's Go on a Date 💑");
});

// === Floating Hearts ===
function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.innerHTML = "💗";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 3 + 3 + "s";
  heart.style.fontSize = Math.random() * 20 + 10 + "px";
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 6000);
}
setInterval(createHeart, 200);

function createBurstHearts() {
  for (let i = 0; i < 100; i++) setTimeout(createHeart, i * 100);
}

function showFloatingNames(textMessage = "T ❤️ Y") {
  const text = document.createElement("div");
  text.classList.add("floating-text");
  text.innerText = textMessage;
  document.body.appendChild(text);
  setTimeout(() => text.remove(), 5000);
}

function createBrokenHearts() {
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement("div");
    heart.classList.add("broken-heart");
    heart.innerHTML = "💔";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 2 + 2 + "s";
    heart.style.fontSize = Math.random() * 20 + 15 + "px";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 3000);
  }
}

// === Songs Section ===
const songsBtn = document.getElementById("songs");
const songsSection = document.getElementById("songsSection");
const songsListDiv = document.getElementById("songsList");
const songPlayer = document.getElementById("songPlayer");

songsSection.style.display = "none";

songsBtn.addEventListener("click", async () => {
  const confirmOpen = confirm("Want to listen to our favorite songs? 🎶");
  if (!confirmOpen) return;

  alert("Loading songs from the cloud ☁️");
  songsSection.style.display = "block";
  songsSection.scrollIntoView({ behavior: "smooth" });
  songsListDiv.innerHTML = "<p>Fetching songs from cloud ☁️...</p>";

  try {
    let res = await fetch(`${apiBase}/api/vault`);
    let data = await res.json();

    if (!data.songs || data.songs.length === 0) {
      res = await fetch(`${apiBase}/api/songs`);
      data = await res.json();
    }

    if (!data.songs || data.songs.length === 0) {
      songsListDiv.innerHTML = "<p>No songs found 😢</p>";
      return;
    }

    songsListDiv.innerHTML = "";
    data.songs.forEach((item) => {
      const url = item.url || item;
      const songName = decodeURIComponent(item.name || url.split("/").pop());
      const btn = document.createElement("button");
      btn.textContent = `▶️ ${songName}`;
      btn.classList.add("song-btn");
      btn.addEventListener("click", () => {
        songPlayer.src = url;
        songPlayer.style.display = "block";
        songPlayer.play();
      });
      songsListDiv.appendChild(btn);
    });
  } catch (err) {
    console.error("Error loading songs:", err);
    songsListDiv.innerHTML = "<p>Failed to load songs ⚠️</p>";
  }
});
