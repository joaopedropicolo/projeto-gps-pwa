// ==================== VARIÁVEIS ====================
let lat = null;
let lng = null;

const btnLocalizar = document.getElementById("btnLocalizar");
const btnSalvar = document.getElementById("btnSalvar");
const nomeLugar = document.getElementById("nomeLugar");
const lista = document.getElementById("lista");
const mapa = document.getElementById("mapa");

// ==================== GPS ====================
btnLocalizar.onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;

    // Mapa sem API key — funciona na Vercel
    mapa.src = `https://www.google.com/maps?q=${lat},${lng}&hl=pt-BR&z=15&output=embed`;

    alert(`Localização capturada!\nLatitude: ${lat}\nLongitude: ${lng}`);
  });
};

// ==================== INDEXEDDB ====================
let db;
const request = indexedDB.open("gpsDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("lugares", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = e => {
  db = e.target.result;
  listar();
};

// Salvar coordenadas
btnSalvar.onclick = () => {
  if (!lat || !lng || nomeLugar.value.trim() === "") {
    alert("Capture a localização e informe um nome!");
    return;
  }

  const tx = db.transaction("lugares", "readwrite");
  tx.objectStore("lugares").add({
    nome: nomeLugar.value,
    lat,
    lng
  });

  tx.oncomplete = () => {
    nomeLugar.value = "";
    listar();
  };
};

// ==================== LISTAR ====================
function listar() {
  lista.innerHTML = "";

  const tx = db.transaction("lugares", "readonly");
  const store = tx.objectStore("lugares");

  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (cursor) {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <p><b>${cursor.value.nome}</b></p>
        <p>${cursor.value.lat}, ${cursor.value.lng}</p>
        <button onclick="verMapa(${cursor.value.lat}, ${cursor.value.lng})">Ver no mapa</button>
        <button onclick="remover(${cursor.value.id})">Excluir</button>
      `;

      lista.appendChild(div);
      cursor.continue();
    }
  };
}

// Mostrar lugar no mapa
window.verMapa = (lat, lng) => {
  mapa.src = `https://www.google.com/maps?q=${lat},${lng}&hl=pt-BR&z=15&output=embed`;
};

// Remover
window.remover = (id) => {
  const tx = db.transaction("lugares", "readwrite");
  tx.objectStore("lugares").delete(id);
  tx.oncomplete = listar;
};

// ==================== PWA ====================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}