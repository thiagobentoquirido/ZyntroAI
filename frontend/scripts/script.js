const chat = document.getElementById("chat");
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");

let selectedImage = null;
let isWaitingResponse = false;
let imageLocked = false;

/* =========================
    AUTO-RESIZE DO INPUT
========================= */
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

/* =========================
     FUNÇÃO PREVIEW COM BOTÃO PREMIUM
========================= */
function createImagePreview(file) {
  const preview = document.createElement("div");
  preview.className = "block question preview-area premium-preview";
  preview.id = "image-preview";

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  /* Qualidade máxima */
  img.style.maxWidth = "420px";
  img.style.borderRadius = "14px";
  img.style.display = "block";
  img.style.transition = "all .35s ease";
  img.style.imageRendering = "auto";
  img.style.objectFit = "contain";

  /* BOTÃO FLUTUANTE */
  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "🗑️";
  removeBtn.className = "remove-float-btn";

  removeBtn.onclick = () => {
    if (imageLocked) return;

    const ok = confirm("Deseja remover a imagem?");
    if (!ok) return;

    selectedImage = null;
    preview.style.opacity = "0";
    preview.style.transform = "scale(0.95)";

    setTimeout(() => preview.remove(), 250);
  };

 
  preview.appendChild(img);
  preview.appendChild(removeBtn);
  chat.appendChild(preview);
  chat.scrollTop = chat.scrollHeight;
}

/* =========================
     CONTROL + V (COLAR IMAGEM)
========================= */
document.addEventListener("paste", (event) => {
  if (imageLocked) return;

  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith("image")) {
      const file = item.getAsFile();
      if (!file) return;

      selectedImage = file;
      createImagePreview(file);
      break;
    }
  }
});

/* =========================
   PREVIEW VIA INPUT FILE
========================= */
fileInput.addEventListener("change", () => {
  if (imageLocked) return;

  const file = fileInput.files[0];
  if (!file) return;

  selectedImage = file;
  createImagePreview(file);
});
/*------------STREAMING FUNC----------------------*/
async function processStream(file, prompt) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);
  const res = await fetch("http://127.0.0.1:8000/process-stream", {
    method: "POST",
    body: formData,
  });

  return res;
};


async function streamResponse(url, options, el) {
  const res = await fetch(url, options);
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  el.textContent = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    el.textContent += decoder.decode(value);
    chat.scrollTop = chat.scrollHeight;
  }
}

/* =========================
   BOTÃO 📎
========================= */
function sendFile() {
  if (isWaitingResponse) return;
  fileInput.click();
}

/* =========================
   ENVIAR MENSAGEM
========================= */
async function send() {
  if (isWaitingResponse) return;

  const text = input.value.trim();
  if (!text && !selectedImage) return;
  if (selectedImage && !text) return;

  isWaitingResponse = true;
  imageLocked = true;

  input.disabled = true;
  input.placeholder = "ZyntroAI está pensando... 🤖✨";

  const preview = document.getElementById("image-preview");
  if (preview) preview.remove();

  /* ---------- BLOCO DA PERGUNTA ---------- */
  const block = document.createElement("div");
  block.className = "block";

  const question = document.createElement("div");
  question.className = "question sending";
  question.textContent = text;

  if (selectedImage) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(selectedImage);
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    img.style.marginTop = "8px";
    question.appendChild(img);
  }

  block.appendChild(question);

  /* ---------- BLOCO DA RESPOSTA ---------- */
  const answer = document.createElement("div");
  answer.className = "answer";

  const loader = document.createElement("div");
  loader.className = "text-loader";
  loader.innerHTML = `
    Pensando
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  answer.appendChild(loader);
  block.appendChild(answer);
  chat.appendChild(block);
  chat.scrollTop = chat.scrollHeight;

  input.value = "";
  input.style.height = "auto";

  try {
    /* =========================
       CHAT DE TEXTO
    ========================= */
    if (!selectedImage) {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      answer.innerHTML = "";
      typeWriter(answer, data.response);
    }

    /* =========================
       IMAGEM + TEXTO
    ========================= */
    else {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("prompt", text);

      const res = await fetch("http://127.0.0.1:8000/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
    answer.innerHTML = "";

    const responseText = data.text || data.response;

    if (responseText) {
      const t = document.createElement("div");
      typeWriter(t, responseText);
      answer.appendChild(t);
    } else {
      answer.textContent = "⚠️ A ZyntroAI não retornou resposta.";
    }

      if (data.image) {
        const img = document.createElement("img");
        img.src = "data:image/png;base64," + data.image;
        img.style.maxWidth = "320px";
        img.style.borderRadius = "12px";
        img.style.marginTop = "12px";

        const download = document.createElement("a");
        download.href = img.src;
        download.download = "zyntroai-image.png";
        download.textContent = "⬇️ Baixar imagem";
        download.className = "download-btn";

        answer.appendChild(img);
        answer.appendChild(download);
      }
    }
  } catch {
    answer.textContent = "❌ Erro ao conectar com o servidor.";
  }

  isWaitingResponse = false;
  imageLocked = false;
  input.disabled = false;
  input.placeholder = "Pergunte qualquer coisa...";
  input.focus();

  selectedImage = null;
  fileInput.value = "";
}

/* =========================
   ANIMAÇÃO DE DIGITAÇÃO
========================= */
function typeWriter(el, text, speed = 18) {
  if (!text) {
    el.textContent = "⚠️ A ZyntroAI não retornou resposta.";
    return;
  }

  el.textContent = "";
  let i = 0;

  const interval = setInterval(() => {
    el.textContent += text[i++];
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

/* =========================
   ENTER PARA ENVIAR
========================= */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
/* =========================
   FIM DO SCRIPT.JS
========================= */