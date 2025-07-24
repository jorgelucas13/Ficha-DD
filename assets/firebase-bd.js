import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbCy8oGS55HzdaKrx6CiYzFJ2Lj4uKECw",
  authDomain: "ficharpg-71f97.firebaseapp.com",
  projectId: "ficharpg-71f97",
  storageBucket: "ficharpg-71f97.appspot.com",
  messagingSenderId: "12738790723",
  appId: "1:12738790723:web:35d2799b24db5800821bf6",
  measurementId: "G-Z8K4PFDFJ2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userId = null;
let fichaAtualId = null;

const columns = document.querySelectorAll(".coluna-cards");
const criarFichaBtn = document.getElementById("criarFichaBtn");
const menuDropdown = document.querySelector(".submenu");
const logoutBtn = document.getElementById("logoutBtn");
const nomePersonagemBtn = document.getElementById("nomePersonagemBtn");

// Função utilitária para tratar erros
function mostrarErro(msg, err) {
  console.error(msg, err);
  alert("Ocorreu um erro: " + msg);
}

// Salvar última ficha usada
async function salvarUltimaFichaUsada(id) {
  if (!userId) return;
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { ultimaFichaId: id }, { merge: true });
  } catch (err) {
    mostrarErro('Erro ao salvar a última ficha', err);
  }
}

// Buscar última ficha usada
async function buscarUltimaFichaUsada() {
  if (!userId) return null;
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data().ultimaFichaId : null;
  } catch (err) {
    mostrarErro('Erro ao buscar a última ficha', err);
    return null;
  }
}

// Atualizar nome do personagem no menu
function atualizarNomePersonagem(nome) {
  if (nomePersonagemBtn) nomePersonagemBtn.textContent = nome || "Personagem";
}

// Autenticação e inicialização
onAuthStateChanged(auth, async user => {
  if (!user) return alert("Usuário não autenticado");
  userId = user.uid;
  try {
    let fichas = await carregarFichas();
    let fichaId = await buscarUltimaFichaUsada();
    if (fichas.length === 0) {
      fichaId = await criarFichaPadrao();
      fichas = await carregarFichas();
    }
    fichaAtualId = fichaId && fichas.some(f => f.id === fichaId) ? fichaId : fichas[0].id;
    await carregarFicha(fichaAtualId);
    preencherMenu(fichas);
    iniciarAutoSalvar();
  } catch (err) {
    mostrarErro("Falha ao inicializar", err);
  }
});

// Cria ficha padrão
async function criarFichaPadrao() {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "fichas"), {
      nome: "Personagem 1",
      dados: {},
      cards: []
    });
    await salvarUltimaFichaUsada(docRef.id);
    return docRef.id;
  } catch (err) {
    mostrarErro("Falha ao criar ficha padrão", err);
    return null;
  }
}

// Criação de ficha pelo usuário
criarFichaBtn.addEventListener("click", async () => {
  const nomePersonagem = prompt("Digite o nome do personagem:");
  if (!nomePersonagem) return;

  try {
    const docRef = await addDoc(collection(db, "users", userId, "fichas"), {
      nome: nomePersonagem,
      dados: {},
      cards: []
    });
    fichaAtualId = docRef.id;
    await salvarUltimaFichaUsada(fichaAtualId);
    limparCampos();
    await carregarFicha(fichaAtualId);
    preencherMenu(await carregarFichas());
  } catch (err) {
    mostrarErro("Falha ao criar ficha", err);
  }
});

// Carrega todas as fichas do usuário
async function carregarFichas() {
  try {
    const snap = await getDocs(collection(db, "users", userId, "fichas"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    mostrarErro("Erro ao buscar fichas", err);
    return [];
  }
}

// Preenche menu lateral
function preencherMenu(fichas) {
  const submenu = document.querySelector('.submenu');
  const criarFichaBtn = document.getElementById("criarFichaBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Limpa o submenu e recoloca botões fixos
  submenu.innerHTML = "";
  submenu.appendChild(criarFichaBtn);
  submenu.appendChild(logoutBtn);

  fichas.forEach(ficha => {
    // Container inline
    const container = document.createElement("div");
    container.className = "menu-ficha-inline";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "4px";
    container.style.marginBottom = "4px";

    // Botão para trocar de ficha
    const btnFicha = document.createElement("button");
    btnFicha.textContent = ficha.nome;
    btnFicha.style.flex = "1";
    btnFicha.style.textAlign = "left";
    btnFicha.style.paddingRight = "8px";
    btnFicha.className = "btn-ficha";
    btnFicha.addEventListener("click", async () => {
      fichaAtualId = ficha.id;
      await carregarFicha(fichaAtualId);
      await salvarUltimaFichaUsada(fichaAtualId);
    });

    // Ícone renomear
    const btnRenomear = document.createElement("button");
    btnRenomear.innerHTML = "✎";
    btnRenomear.title = "Renomear";
    btnRenomear.className = "icon-btn";
    btnRenomear.style.border = "none";
    btnRenomear.style.background = "transparent";
    btnRenomear.style.cursor = "pointer";
    btnRenomear.style.padding = "2px";
    btnRenomear.addEventListener("click", async (e) => {
      e.stopPropagation();
      const novoNome = prompt("Novo nome do personagem:", ficha.nome);
      if (!novoNome || novoNome === ficha.nome) return;
      try {
        const ref = doc(db, "users", userId, "fichas", ficha.id);
        await updateDoc(ref, { nome: novoNome });
        if (ficha.id === fichaAtualId) atualizarNomePersonagem(novoNome);
        preencherMenu(await carregarFichas());
      } catch (err) {
        mostrarErro("Erro ao renomear ficha", err);
      }
    });

    // Ícone apagar
    const btnApagar = document.createElement("button");
    btnApagar.innerHTML = "🗑";
    btnApagar.title = "Apagar";
    btnApagar.className = "icon-btn";
    btnApagar.style.border = "none";
    btnApagar.style.background = "transparent";
    btnApagar.style.cursor = "pointer";
    btnApagar.style.padding = "2px";
    btnApagar.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Tem certeza que deseja apagar "${ficha.nome}"? Essa ação não pode ser desfeita.`)) return;
      try {
        const ref = doc(db, "users", userId, "fichas", ficha.id);
        await ref.delete ? ref.delete() : await deleteDoc(ref);
        let novasFichas = await carregarFichas();
        // Se apagou a ficha em uso, troca para outra
        if (ficha.id === fichaAtualId && novasFichas.length > 0) {
          fichaAtualId = novasFichas[0].id;
          await carregarFicha(fichaAtualId);
          await salvarUltimaFichaUsada(fichaAtualId);
        } else if (novasFichas.length === 0) {
          limparCampos();
          atualizarNomePersonagem("Personagem");
          fichaAtualId = null;
          await salvarUltimaFichaUsada(null);
        }
        preencherMenu(novasFichas);
      } catch (err) {
        mostrarErro("Erro ao apagar ficha", err);
      }
    });

    // Adiciona ao container
    container.appendChild(btnFicha);
    container.appendChild(btnRenomear);
    container.appendChild(btnApagar);

    // Adiciona ao submenu antes dos botões fixos
    submenu.insertBefore(container, criarFichaBtn);
  });
}

// Carrega dados da ficha
async function carregarFicha(id) {
  try {
    // Limpa todos os campos antes de preencher
    limparCampos();

    const ref = doc(db, "users", userId, "fichas", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();

    // Campos comuns e selects
    for (const campoId in data.dados) {
      const campo = document.getElementById(campoId);
      if (!campo) continue;
      if (campo.hasAttribute("contenteditable")) campo.innerHTML = data.dados[campoId];
      else if (campo.type === "checkbox") campo.checked = data.dados[campoId];
      else if (campo.tagName === "SELECT") campo.value = data.dados[campoId];
      else campo.value = data.dados[campoId];
    }

    // Atualiza nome do personagem
    atualizarNomePersonagem(data.nome);

    // Cards
    columns.forEach(col => {
      const btn = col.querySelector(".add-card-btn");
      col.querySelectorAll(".card").forEach(c => c.remove());
      if (btn) col.appendChild(btn);
    });

    const cards = data.cards || [];
    cards.sort((a, b) => a.order - b.order).forEach(({ content, columnId }) => {
      const coluna = [...columns].find(c => c.id === columnId) || columns[0];
      const card = criarCard(content);
      const btn = coluna.querySelector(".add-card-btn");
      btn ? coluna.insertBefore(card, btn) : coluna.appendChild(card);
    });
  } catch (err) {
    mostrarErro("Falha ao carregar ficha", err);
  }

  atualizarModificadorForça();
    atualizarModificadorDestreza();
    atualizarModificadorConstituição();
    atualizarModificadorInteligencia();
    atualizarModificadorSabedoria();
    atualizarModificadorCarisma();
    atualizarPercepcaoPassiva();
    atualizarModificadorEAposSalvar("for");
    atualizarModificadorEAposSalvar("dez");
    atualizarModificadorEAposSalvar("con");
    atualizarModificadorEAposSalvar("int");
    atualizarModificadorEAposSalvar("sab");
    atualizarModificadorEAposSalvar("car");
    atualizarModificadorForca();
    atualizarPericia("acrobacia", "dez");
    atualizarPericia("furtividade", "dez");
    atualizarPericia("arcanismo", "int");
    atualizarPericia("historia", "int");
    atualizarPericia("investigacao", "int");
    atualizarPericia("natureza", "int");
    atualizarPericia("religiao", "int");
    atualizarPericia("intuicao", "sab");
    atualizarPericia("animais", "sab");
    atualizarPericia("medicina", "sab");
    atualizarPericia("percepcao", "sab");
    atualizarPericia("sobrevivencia", "sab");
    atualizarPericia("atuacao", "car");
    atualizarPericia("enganacao", "car");
    atualizarPericia("intimidacao", "car");
    atualizarPericia("persuasao", "car");
}

function limparCampos() {
  document.querySelectorAll("input, textarea, [contenteditable=true], select").forEach(campo => {
    if (campo.type === "checkbox") campo.checked = false;
    else if (campo.hasAttribute("contenteditable")) campo.innerHTML = "";
    else if (campo.tagName === "SELECT") campo.selectedIndex = 0;
    else campo.value = "";
  });

  columns.forEach(coluna => {
    const btn = coluna.querySelector(".add-card-btn");
    coluna.querySelectorAll(".card").forEach(c => c.remove());
    if (btn) coluna.appendChild(btn);
  });
}

// Salvar campos comuns e select
function iniciarAutoSalvar() {
  const campos = document.querySelectorAll("input, textarea, [contenteditable='true'], select");
  campos.forEach(campo => {
    campo.addEventListener("input", () => salvarCampo(campo));
    campo.addEventListener("change", () => salvarCampo(campo));
  });
}

async function salvarCampo(campo) {
  if (!fichaAtualId) return;
  let valor;
  if (campo.hasAttribute("contenteditable")) {
    valor = campo.innerHTML;
  } else if (campo.type === "checkbox") {
    valor = campo.checked;
  } else if (campo.tagName === "SELECT") {
    valor = campo.value;
  } else {
    valor = campo.value;
  }
  try {
    const ref = doc(db, "users", userId, "fichas", fichaAtualId);
    const snap = await getDoc(ref);
    const dadosAtuais = snap.exists() ? snap.data().dados || {} : {};
    await updateDoc(ref, {
      dados: { ...dadosAtuais, [campo.id]: valor }
    });
  } catch (err) {
    mostrarErro("Falha ao salvar campo", err);
  }
}

// === DRAG & DROP ===

let draggedCard = null;

const dragStart = (event) => {
  draggedCard = event.target.closest(".card");
  draggedCard.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
};

const dragEnd = () => {
  if (draggedCard) {
    draggedCard.classList.remove("dragging");
    draggedCard = null;
  }
};

const dragOver = (event) => event.preventDefault();

const dragEnter = ({ target }) => {
  const column = target.closest(".coluna-cards");
  if (column) column.classList.add("coluna--highlight");
};

const dragLeave = ({ target }) => {
  const column = target.closest(".coluna-cards");
  if (column) column.classList.remove("coluna--highlight");
};

const drop = async (event) => {
  event.preventDefault();
  const column = event.target.closest(".coluna-cards");
  if (!column || !draggedCard) return;

  column.classList.remove("coluna--highlight");

  const button = column.querySelector(".add-card-btn");
  const cardsInColumn = [...column.querySelectorAll(".card:not(.dragging)")];

  let inserted = false;
  for (const card of cardsInColumn) {
    const rect = card.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    if (offset < rect.height / 2) {
      column.insertBefore(draggedCard, card);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    button ? column.insertBefore(draggedCard, button) : column.appendChild(draggedCard);
  }

  await salvarCards();
  dragEnd();
};

function aplicarPasteLimpo(div) {
  div.addEventListener("paste", function (e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

function criarCard(content = "") {
  const card = document.createElement("div");
  card.className = "card";

  const handle = document.createElement("div");
  handle.className = "drag-handle";
  handle.draggable = true;
  handle.title = "Arraste para mover";
  handle.addEventListener("dragstart", dragStart);
  handle.addEventListener("dragend", dragEnd);

  const contentDiv = document.createElement("div");
  contentDiv.className = "card-content";
  contentDiv.contentEditable = true;
  contentDiv.innerHTML = content;

  aplicarPasteLimpo(contentDiv);
  contentDiv.addEventListener("input", salvarCards);
  contentDiv.addEventListener("focusout", () => {
    if (!contentDiv.textContent.trim()) {
      card.remove();
      salvarCards();
    }
  });

  card.appendChild(handle);
  card.appendChild(contentDiv);

  return card;
}

function adicionarNovoCard(column) {
  const button = column.querySelector(".add-card-btn");
  if (!button) return;
  const novoCard = criarCard("Nova habilidade");
  column.insertBefore(novoCard, button);
  novoCard.querySelector(".card-content").focus();
  salvarCards();
}

document.querySelectorAll(".add-card-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const coluna = e.target.closest(".coluna-cards");
    adicionarNovoCard(coluna);
  });
});

columns.forEach((column) => {
  column.addEventListener("dragover", dragOver);
  column.addEventListener("dragenter", dragEnter);
  column.addEventListener("dragleave", dragLeave);
  column.addEventListener("drop", drop);
  column.addEventListener("dblclick", (e) => {
    if (!e.target.closest(".card")) {
      adicionarNovoCard(column);
    }
  });
});

async function salvarCards() {
  if (!fichaAtualId) return;

  const allCardsData = [];

  columns.forEach((column) => {
    const columnId = column.id || null;
    const cards = [...column.querySelectorAll(".card")];
    cards.forEach((card, index) => {
      const content = card.querySelector(".card-content")?.innerHTML || "";
      allCardsData.push({ content, columnId, order: index });
    });
  });

  try {
    const ref = doc(db, "users", userId, "fichas", fichaAtualId);
    await updateDoc(ref, { cards: allCardsData });
  } catch (err) {
    mostrarErro("Falha ao salvar cards", err);
  }
}

// Logout opcional
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      mostrarErro("Erro ao fazer logout", err);
    }
  });
}