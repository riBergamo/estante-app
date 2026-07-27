const STORAGE_KEY = "estante-works-v1";

const typeLabels = {
  book: "Livro",
  manga: "Mangá",
  movie: "Filme",
  series: "Série",
  anime: "Anime",
  game: "Jogo",
  other: "Outro",
};

const statusLabels = {
  planned: "Quero ver/ler",
  in_progress: "Em andamento",
  paused: "Pausado",
  completed: "Finalizado",
};

let works = loadWorks();
let activeImage = "";

const libraryGrid = document.querySelector("#libraryGrid");
const emptyState = document.querySelector("#emptyState");
const workCount = document.querySelector("#workCount");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const statusFilter = document.querySelector("#statusFilter");
const dialog = document.querySelector("#workDialog");
const form = document.querySelector("#workForm");
const dialogTitle = document.querySelector("#dialogTitle");
const workId = document.querySelector("#workId");
const titleInput = document.querySelector("#titleInput");
const typeInput = document.querySelector("#typeInput");
const statusInput = document.querySelector("#statusInput");
const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");
const descriptionInput = document.querySelector("#descriptionInput");
const progressInput = document.querySelector("#progressInput");
const deleteButton = document.querySelector("#deleteButton");

document.querySelector("#addWorkButton").addEventListener("click", () => openForm());
document.querySelector("#emptyAddButton").addEventListener("click", () => openForm());
document.querySelector("#closeDialogButton").addEventListener("click", closeForm);
document.querySelector("#cancelButton").addEventListener("click", closeForm);

searchInput.addEventListener("input", renderLibrary);
typeFilter.addEventListener("change", renderLibrary);
statusFilter.addEventListener("change", renderLibrary);
form.addEventListener("submit", saveWork);
deleteButton.addEventListener("click", deleteActiveWork);
imageInput.addEventListener("change", previewImage);

renderLibrary();

function loadWorks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function persistWorks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}

function renderLibrary() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const status = statusFilter.value;

  const visibleWorks = works
    .filter((work) => type === "all" || work.type === type)
    .filter((work) => status === "all" || work.status === status)
    .filter((work) => {
      const haystack = `${work.title} ${work.description} ${work.progress}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  libraryGrid.innerHTML = "";
  workCount.textContent = `${visibleWorks.length} ${visibleWorks.length === 1 ? "obra" : "obras"}`;

  visibleWorks.forEach((work) => {
    const card = document.createElement("button");
    card.className = "work-card";
    card.type = "button";
    card.addEventListener("click", () => openForm(work.id));

    card.innerHTML = `
      <div class="cover">
        ${work.image ? `<img src="${work.image}" alt="Capa de ${escapeHtml(work.title)}" />` : `<div class="cover-placeholder">${escapeHtml(work.title)}</div>`}
        <span class="status-pill">${statusLabels[work.status]}</span>
      </div>
      <div>
        <div class="card-title">${escapeHtml(work.title)}</div>
        <div class="card-meta">
          <span>${typeLabels[work.type]}</span>
          ${work.progress ? `<span>• ${escapeHtml(work.progress)}</span>` : ""}
        </div>
        ${work.description ? `<p class="card-description">${escapeHtml(work.description)}</p>` : ""}
      </div>
    `;

    libraryGrid.appendChild(card);
  });

  emptyState.style.display = visibleWorks.length ? "none" : "block";
}

function openForm(id = "") {
  const work = works.find((item) => item.id === id);
  activeImage = work?.image || "";

  dialogTitle.textContent = work ? "Editar obra" : "Adicionar obra";
  workId.value = work?.id || "";
  titleInput.value = work?.title || "";
  typeInput.value = work?.type || "book";
  statusInput.value = work?.status || "in_progress";
  descriptionInput.value = work?.description || "";
  progressInput.value = work?.progress || "";
  imageInput.value = "";
  deleteButton.style.visibility = work ? "visible" : "hidden";
  renderPreview();
  dialog.showModal();
  titleInput.focus();
}

function closeForm() {
  form.reset();
  dialog.close();
}

function saveWork(event) {
  event.preventDefault();

  const now = new Date().toISOString();
  const existingId = workId.value;
  const payload = {
    id: existingId || crypto.randomUUID(),
    title: titleInput.value.trim(),
    type: typeInput.value,
    image: activeImage,
    description: descriptionInput.value.trim(),
    status: statusInput.value,
    progress: progressInput.value.trim(),
    createdAt: works.find((work) => work.id === existingId)?.createdAt || now,
    updatedAt: now,
  };

  if (existingId) {
    works = works.map((work) => (work.id === existingId ? payload : work));
  } else {
    works = [payload, ...works];
  }

  persistWorks();
  closeForm();
  renderLibrary();
}

function deleteActiveWork() {
  if (!workId.value) return;

  const confirmed = confirm("Remover esta obra da sua biblioteca?");
  if (!confirmed) return;

  works = works.filter((work) => work.id !== workId.value);
  persistWorks();
  closeForm();
  renderLibrary();
}

function previewImage() {
  const file = imageInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    activeImage = reader.result;
    renderPreview();
  });
  reader.readAsDataURL(file);
}

function renderPreview() {
  imagePreview.innerHTML = activeImage
    ? `<img src="${activeImage}" alt="Prévia da capa escolhida" />`
    : "<span>Prévia da capa</span>";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return replacements[character];
  });
}
