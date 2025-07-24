




// DARK MODE
const toggle = document.getElementById('darkModeToggle');
const body = document.body;

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    body.classList.add('dark-theme');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    body.classList.remove('dark-theme');
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Para manter o modo após recarregar a página:
window.addEventListener('load', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    toggle.checked = true;
    body.classList.add('dark-theme');
  }
});

// CODIGO DRAG AND DROP
const columns = document.querySelectorAll(".coluna-cards");
let draggedCard = null;

// Início do drag
const dragStart = (event) => {
    draggedCard = event.target.closest(".card");
    draggedCard.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
};

// Fim do drag
const dragEnd = () => {
    if (draggedCard) {
        draggedCard.classList.remove("dragging");
        draggedCard = null;
    }
};

// Permitir soltar
const dragOver = (event) => {
    event.preventDefault();
};

// Quando entra numa coluna
const dragEnter = ({ target }) => {
    const column = target.closest(".coluna-cards");
    if (column) column.classList.add("coluna--highlight");
};

// Quando sai de uma coluna
const dragLeave = ({ target }) => {
    const column = target.closest(".coluna-cards");
    if (column) column.classList.remove("coluna--highlight");
};

// Quando solta o card
const drop = (event) => {
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
        if (button) {
            column.insertBefore(draggedCard, button);
        } else {
            column.appendChild(draggedCard);
        }
    }

    // Salvar o estado dos cards após o drop
    salvarCards();
};


// Criar novo card ao dar duplo clique
const createcard = ({ target }) => {
    const column = target.closest(".coluna-cards");
    if (!column) return;

    const card = document.createElement("div");
    card.className = "card";

    const handle = document.createElement("div");
    handle.className = "drag-handle";
    handle.draggable = true;
    handle.title = "Arraste para mover";
    handle.addEventListener("dragstart", dragStart);
    handle.addEventListener("dragend", dragEnd);

    const content = document.createElement("div");
    content.className = "card-content";
    content.contentEditable = true;
    
    aplicarPasteLimpo(content);

    content.addEventListener("focusout", () => {
        if (!content.textContent.trim()) card.remove();
    });

    card.appendChild(handle);
    card.appendChild(content);

    column.appendChild(card);
    content.focus();
};

// Adicionar eventos para todas as colunas
columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);
    column.addEventListener("dragenter", dragEnter);
    column.addEventListener("dragleave", dragLeave);
    column.addEventListener("drop", drop);
    column.addEventListener("dblclick", createcard);
});

// Adicionar eventos para handles existentes
document.querySelectorAll(".drag-handle").forEach((handle) => {
    handle.addEventListener("dragstart", dragStart);
    handle.addEventListener("dragend", dragEnd);
});

document.querySelectorAll(".add-card-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const column = button.closest(".coluna-cards");
    if (!column) return;

    const card = document.createElement("div");
    card.className = "card";

    const handle = document.createElement("div");
    handle.className = "drag-handle";
    handle.draggable = true;
    handle.title = "Arraste para mover";
    handle.addEventListener("dragstart", dragStart);
    handle.addEventListener("dragend", dragEnd);

    const content = document.createElement("div");
    content.className = "card-content";
    content.contentEditable = true;

    aplicarPasteLimpo(content);

    content.addEventListener("focusout", () => {
      if (!content.textContent.trim()) card.remove();
    });

    card.appendChild(handle);
    card.appendChild(content);

    column.insertBefore(card, button); // adiciona antes do botão
    content.focus();
  });
});

function aplicarPasteLimpo(contentEditableDiv) {
    contentEditableDiv.addEventListener('paste', function (e) {
        e.preventDefault();

        const text = (e.clipboardData || window.clipboardData).getData('text/plain');

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
document.addEventListener('DOMContentLoaded', function () {
    const editables = document.querySelectorAll('.card-content');
    editables.forEach(aplicarPasteLimpo);

            // Obter apenas o texto puro
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');

            // Inserir como nó de texto puro
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));

            // Reposiciona o cursor
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        });


// INICIO DO CODIGO DE ABAS EM APARENCIA

  // Variáveis
  const tabs = document.querySelectorAll(".tab-button");

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const previewImage = document.getElementById('previewImage');
  const placeholderText = document.getElementById('placeholderText');
  const removeBtn = document.getElementById('removeBtn');

  // Função para carregar imagem do localStorage e ajustar visual
  function carregarImagemDoLocalStorage() {
    const savedImage = localStorage.getItem('imagemPerfil');
    if (savedImage) {
      previewImage.src = savedImage;
      previewImage.style.display = 'block';
      placeholderText.style.display = 'none';
      removeBtn.style.display = 'flex';
    } else {
      previewImage.src = '';
      previewImage.style.display = 'none';
      placeholderText.style.display = 'flex';
      removeBtn.style.display = 'none';
    }
  }

  // Lógica das abas
  tabs.forEach(tab => tab.addEventListener("click", () => tabClicked(tab)));

  function tabClicked(tab) {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const contents = document.querySelectorAll(".content");
    contents.forEach(content => content.classList.remove("show"));

    const contentId = tab.getAttribute("content-id");
    const content = document.getElementById(contentId);
    content.classList.add("show");

    // Se for aba imagem, carregar imagem salva
    if (contentId === 'imagem') {
      carregarImagemDoLocalStorage();
    }
  }

  // Ao carregar a página, se a aba imagem estiver ativa, carregar imagem
  window.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab && activeTab.getAttribute('content-id') === 'imagem') {
      carregarImagemDoLocalStorage();
    }
  });

  // Abrir seletor de arquivos ao clicar na área
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Ao escolher arquivo, mostrar imagem e salvar base64 no localStorage
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        previewImage.src = base64;
        previewImage.style.display = 'block';
        placeholderText.style.display = 'none';
        removeBtn.style.display = 'flex';

        localStorage.setItem('imagemPerfil', base64);
      };
      reader.readAsDataURL(file);
    }
  });

  // Botão remover imagem
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // evita disparar o click da uploadArea
    fileInput.value = '';
    previewImage.src = '';
    previewImage.style.display = 'none';
    placeholderText.style.display = 'flex';
    removeBtn.style.display = 'none';

    localStorage.removeItem('imagemPerfil');
  });
  // FIM DO SALVAR A IMAGEM --------------------------------------------------------


// COMEÇO DO SCRIPT BACKEND DA FICHA
function atualizarModificadorForça() {
    const attFor = parseInt(document.getElementById("mod-for").value);
    if (!isNaN(attFor)) {
      const mod = Math.floor((attFor - 10) / 2);
      document.getElementById("att-for").value = mod;
    } else {
      document.getElementById("att-for").value = '';
    }
  };
function atualizarModificadorDestreza() {
    const attDez = parseInt(document.getElementById("mod-dez").value);
    if (!isNaN(attDez)) {
      const mod = Math.floor((attDez - 10) / 2);
      document.getElementById("att-dez").value = mod;
    } else {
      document.getElementById("att-dez").value = '';
    }
  };
function atualizarModificadorConstituição() {
    const attCon = parseInt(document.getElementById("mod-con").value);
    if (!isNaN(attCon)) {
      const mod = Math.floor((attCon - 10) / 2);
      document.getElementById("att-con").value = mod;
    } else {
      document.getElementById("att-con").value = '';
    }
  };
function atualizarModificadorInteligencia() {
    const attInt = parseInt(document.getElementById("mod-int").value);
    if (!isNaN(attInt)) {
      const mod = Math.floor((attInt - 10) / 2);
      document.getElementById("att-int").value = mod;
    } else {
      document.getElementById("att-int").value = '';
    }
      atualizarModConjuracao();
      atualizarCDMagia();
       atualizarModificadorAtaqueMagico();
  };
function atualizarModificadorSabedoria() {
    const attSab = parseInt(document.getElementById("mod-sab").value);
    if (!isNaN(attSab)) {
      const mod = Math.floor((attSab - 10) / 2);
      document.getElementById("att-sab").value = mod;
    } else {
      document.getElementById("att-sab").value = '';
    }
      atualizarModConjuracao();
      atualizarCDMagia();
       atualizarModificadorAtaqueMagico();
  };
function atualizarModificadorCarisma() {
    const attCar = parseInt(document.getElementById("mod-car").value);
    if (!isNaN(attCar)) {
      const mod = Math.floor((attCar - 10) / 2);
      document.getElementById("att-car").value = mod;
    } else {
      document.getElementById("att-car").value = '';
    }
      atualizarModConjuracao();
      atualizarCDMagia();
       atualizarModificadorAtaqueMagico();
  };
  
// atualiza automaticamente quando o valor muda

document.getElementById("mod-for").addEventListener("input", atualizarModificadorForça);
document.getElementById("mod-dez").addEventListener("input", atualizarModificadorDestreza);
document.getElementById("mod-con").addEventListener("input", atualizarModificadorConstituição);
document.getElementById("mod-sab").addEventListener("input", atualizarModificadorSabedoria);
document.getElementById("mod-car").addEventListener("input", atualizarModificadorCarisma);
document.getElementById("mod-int").addEventListener("input", atualizarModificadorInteligencia);

// Calcular percepção passiva
function atualizarPercepcaoPassiva() {
  const modSab = parseInt(document.getElementById("att-sab").value);
  const percepcao = document.getElementById("percepção");

  if (!isNaN(modSab)) {
    percepcao.value = 10 + modSab;
  } else {
    percepcao.value = '';
  }
}
document.getElementById("mod-sab").addEventListener("input", () => {
  atualizarModificadorSabedoria();
  atualizarPercepcaoPassiva();
});

// Calcular salvaguardas
function calcularModificador(valor) {
  return Math.floor((valor - 10) / 2);
}

function atualizarModificadorEAposSalvar(attr) {
  const entrada = parseInt(document.getElementById(`mod-${attr}`).value);
  const campoMod = document.getElementById(`att-${attr}`);
  if (!isNaN(entrada)) {
    campoMod.value = calcularModificador(entrada);
  } else {
    campoMod.value = '';
  }

  atualizarSalvaguarda(attr);
}

function atualizarSalvaguarda(attr) {
  const mod = parseInt(document.getElementById(`att-${attr}`).value);
  const prof = parseInt(document.getElementById("prof").value);
  const checkbox = document.getElementById(`check-sg-${attr}`);
  const campoFinal = document.getElementById(`sg-${attr}`);

  if (!campoFinal) return; // segurança: pode não ter salvaguarda pra tudo

  if (isNaN(mod)) {
    campoFinal.value = '';
    return;
  }

  if (checkbox?.checked && !isNaN(prof)) {
    campoFinal.value = mod + prof;
  } else {
    campoFinal.value = mod;
  }
}
// Quando a base de Força muda, calcula o modificador e a salvaguarda
document.getElementById("mod-for").addEventListener("input", () => atualizarModificadorEAposSalvar("for"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("for"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-for").addEventListener("change", () => atualizarSalvaguarda("for"));


// Quando a base de Destreza muda, calcula o modificador e a salvaguarda
document.getElementById("mod-dez").addEventListener("input", () => atualizarModificadorEAposSalvar("dez"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("dez"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-dez").addEventListener("change", () => atualizarSalvaguarda("dez"));


// Quando a base de Constituição muda, calcula o modificador e a salvaguarda
document.getElementById("mod-con").addEventListener("input", () => atualizarModificadorEAposSalvar("con"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("con"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-con").addEventListener("change", () => atualizarSalvaguarda("con"));


// Quando a base de Destreza muda, calcula o modificador e a salvaguarda
document.getElementById("mod-int").addEventListener("input", () => atualizarModificadorEAposSalvar("int"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("int"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-int").addEventListener("change", () => atualizarSalvaguarda("int"));


// Quando a base de Destreza muda, calcula o modificador e a salvaguarda
document.getElementById("mod-sab").addEventListener("input", () => atualizarModificadorEAposSalvar("sab"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("sab"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-sab").addEventListener("change", () => atualizarSalvaguarda("sab"));


// Quando a base de Destreza muda, calcula o modificador e a salvaguarda
document.getElementById("mod-car").addEventListener("input", () => atualizarModificadorEAposSalvar("car"));

// Quando a proficiência muda, atualiza a salvaguarda
document.getElementById("prof").addEventListener("input", () => atualizarSalvaguarda("car"));

// Quando o checkbox muda, atualiza a salvaguarda
document.getElementById("check-sg-car").addEventListener("change", () => atualizarSalvaguarda("car"));


// PERICIAS
  function calcularModificador(valor) {
    return Math.floor((valor - 10) / 2);
  }

  // Atualiza o modificador de força e, depois, a perícia relacionada
  function atualizarModificadorForca() {
    const entrada = parseInt(document.getElementById("mod-for").value);
    const campoMod = document.getElementById("att-for");

    if (!isNaN(entrada)) {
      campoMod.value = calcularModificador(entrada);
    } else {
      campoMod.value = '';
    }

    atualizarPericia("atletismo", "for");
  }

  // Atualiza a perícia (ex: atletismo) com base em um atributo
  function atualizarPericia(periciaId, atributoBase) {
    const mod = parseInt(document.getElementById(`att-${atributoBase}`).value);
    const prof = parseInt(document.getElementById("prof").value);
    const check = document.getElementById(`check-${periciaId}`);
    const campoFinal = document.getElementById(periciaId);

    if (!campoFinal) return;

    if (isNaN(mod)) {
      campoFinal.value = '';
      return;
    }

    if (check?.checked && !isNaN(prof)) {
      campoFinal.value = mod + prof;
    } else {
      campoFinal.value = mod;
    }
  }

  // Eventos
  document.getElementById("mod-for").addEventListener("input", atualizarModificadorForca);
  document.getElementById("prof").addEventListener("input", () => atualizarPericia("atletismo", "for"));
  document.getElementById("check-atletismo").addEventListener("change", () => atualizarPericia("atletismo", "for"));

 // acrobacia
  document.getElementById("mod-dez").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-dez").value);
  const campoMod = document.getElementById("att-dez");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("acrobacia", "dez");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("acrobacia", "dez"));
document.getElementById("check-acrobacia").addEventListener("change", () => atualizarPericia("acrobacia", "dez"));

 // furtividade
  document.getElementById("mod-dez").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-dez").value);
  const campoMod = document.getElementById("att-dez");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("furtividade", "dez");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("furtividade", "dez"));
document.getElementById("check-furtividade").addEventListener("change", () => atualizarPericia("furtividade", "dez"));

// prestidigitacao
  document.getElementById("mod-dez").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-dez").value);
  const campoMod = document.getElementById("att-dez");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("prestidigitacao", "dez");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("prestidigitacao", "dez"));
document.getElementById("check-prestidigitacao").addEventListener("change", () => atualizarPericia("prestidigitacao", "dez"));

// arcanismo
  document.getElementById("mod-int").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-int").value);
  const campoMod = document.getElementById("att-int");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("arcanismo", "int");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("arcanismo", "int"));
document.getElementById("check-arcanismo").addEventListener("change", () => atualizarPericia("arcanismo", "int"));

// historia
  document.getElementById("mod-int").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-int").value);
  const campoMod = document.getElementById("att-int");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("historia", "int");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("historia", "int"));
document.getElementById("check-historia").addEventListener("change", () => atualizarPericia("historia", "int"));

// investigacao
  document.getElementById("mod-int").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-int").value);
  const campoMod = document.getElementById("att-int");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("investigacao", "int");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("investigacao", "int"));
document.getElementById("check-investigacao").addEventListener("change", () => atualizarPericia("investigacao", "int"));

// natureza
  document.getElementById("mod-int").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-int").value);
  const campoMod = document.getElementById("att-int");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("natureza", "int");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("natureza", "int"));
document.getElementById("check-natureza").addEventListener("change", () => atualizarPericia("natureza", "int"));

// religiao
  document.getElementById("mod-int").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-int").value);
  const campoMod = document.getElementById("att-int");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("religiao", "int");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("religiao", "int"));
document.getElementById("check-religiao").addEventListener("change", () => atualizarPericia("religiao", "int"));

// intuicao
  document.getElementById("mod-sab").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-sab").value);
  const campoMod = document.getElementById("att-sab");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("intuicao", "sab");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("intuicao", "sab"));
document.getElementById("check-intuicao").addEventListener("change", () => atualizarPericia("intuicao", "sab"));

// lidar com animais
  document.getElementById("mod-sab").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-sab").value);
  const campoMod = document.getElementById("att-sab");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("animais", "sab");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("animais", "sab"));
document.getElementById("check-animais").addEventListener("change", () => atualizarPericia("animais", "sab"));

// medicina
  document.getElementById("mod-sab").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-sab").value);
  const campoMod = document.getElementById("att-sab");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("medicina", "sab");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("medicina", "sab"));
document.getElementById("check-medicina").addEventListener("change", () => atualizarPericia("medicina", "sab"));

// percepcao
  document.getElementById("mod-sab").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-sab").value);
  const campoMod = document.getElementById("att-sab");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("percepcao", "sab");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("percepcao", "sab"));
document.getElementById("check-percepcao").addEventListener("change", () => atualizarPericia("percepcao", "sab"));

// sobrevivencia
  document.getElementById("mod-sab").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-sab").value);
  const campoMod = document.getElementById("att-sab");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("sobrevivencia", "sab");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("sobrevivencia", "sab"));
document.getElementById("check-sobrevivencia").addEventListener("change", () => atualizarPericia("sobrevivencia", "sab"));

// atuacao
  document.getElementById("mod-car").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-car").value);
  const campoMod = document.getElementById("att-car");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("atuacao", "car");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("atuacao", "car"));
document.getElementById("check-atuacao").addEventListener("change", () => atualizarPericia("atuacao", "car"));

// enganacao
  document.getElementById("mod-car").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-car").value);
  const campoMod = document.getElementById("att-car");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("enganacao", "car");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("enganacao", "car"));
document.getElementById("check-enganacao").addEventListener("change", () => atualizarPericia("enganacao", "car"));

// intimidacao
  document.getElementById("mod-car").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-car").value);
  const campoMod = document.getElementById("att-car");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("intimidacao", "car");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("intimidacao", "car"));
document.getElementById("check-intimidacao").addEventListener("change", () => atualizarPericia("intimidacao", "car"));

// persuasao
  document.getElementById("mod-car").addEventListener("input", () => {
  const entrada = parseInt(document.getElementById("mod-car").value);
  const campoMod = document.getElementById("att-car");
  if (!isNaN(entrada)) {
    campoMod.value = Math.floor((entrada - 10) / 2);
  } else {
    campoMod.value = '';
  }
  atualizarPericia("persuasao", "car");
});

document.getElementById("prof").addEventListener("input", () => atualizarPericia("persuasao", "car"));
document.getElementById("check-persuasao").addEventListener("change", () => atualizarPericia("persuasao", "car"));

// ATRIBUTO DE CONJURACAO
function atualizarModConjuracao() {
  const seletor = document.getElementById("atributo-conjuracao").value;
  const campoResultado = document.getElementById("mod-conjuracao");

  let valor = 0;

  if (seletor === "inteligencia") {
    valor = parseInt(document.getElementById("att-int").value);
  } else if (seletor === "sabedoria") {
    valor = parseInt(document.getElementById("att-sab").value);
  } else if (seletor === "carisma") {
    valor = parseInt(document.getElementById("att-car").value);
  }

  campoResultado.value = isNaN(valor) ? 0 : valor;
}
document.getElementById("atributo-conjuracao").addEventListener("change", atualizarModConjuracao);

// CD PARA EVITAR MAGIAS
function atualizarCDMagia() {
  const seletor = document.getElementById("atributo-conjuracao").value;
  const prof = parseInt(document.getElementById("prof").value);
  const campoResultado = document.getElementById("cd-evita-magia"); // ID atualizado
  const base = 8;
  let mod = 0;

  if (seletor === "inteligencia") {
    mod = parseInt(document.getElementById("att-int").value);
  } else if (seletor === "sabedoria") {
    mod = parseInt(document.getElementById("att-sab").value);
  } else if (seletor === "carisma") {
    mod = parseInt(document.getElementById("att-car").value);
  }

  if (!isNaN(mod) && !isNaN(prof)) {
    campoResultado.value = base + mod + prof;
  } else {
    campoResultado.value = 0;
  }
}
document.getElementById("atributo-conjuracao").addEventListener("change", () => {
  atualizarModConjuracao();
  atualizarCDMagia();
});

document.getElementById("prof").addEventListener("input", atualizarCDMagia);

// MODIFICADOR DE ATAQUE MAGICO
function atualizarModificadorAtaqueMagico() {
  const seletor = document.getElementById("atributo-conjuracao").value;
  const prof = parseInt(document.getElementById("prof").value);
  const campoResultado = document.getElementById("mod-atq-magico");
  let mod = 0;

  if (seletor === "inteligencia") {
    mod = parseInt(document.getElementById("att-int").value);
  } else if (seletor === "sabedoria") {
    mod = parseInt(document.getElementById("att-sab").value);
  } else if (seletor === "carisma") {
    mod = parseInt(document.getElementById("att-car").value);
  }

  if (!isNaN(mod) && !isNaN(prof)) {
    campoResultado.value = mod + prof;
  } else {
    campoResultado.value = 0;
  }
}
document.getElementById("atributo-conjuracao").addEventListener("change", () => {
  atualizarModConjuracao();      // Atualiza o modificador de conjuração
  atualizarCDMagia();            // Atualiza a CD de magia
  atualizarModificadorAtaqueMagico(); // Atualiza o ataque mágico
});

document.getElementById("prof").addEventListener("input", () => {
  atualizarCDMagia();
  atualizarModificadorAtaqueMagico();
});

// criar nova ficha:

