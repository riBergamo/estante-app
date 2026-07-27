type WorkType = "book" | "manga" | "movie" | "series" | "anime" | "game" | "other";
type WorkStatus = "planned" | "in_progress" | "paused" | "completed";

type Work = {
  id: string;
  title: string;
  type: WorkType;
  image: string;
  description: string;
  status: WorkStatus;
  progress: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "estante-works-v1";

const typeLabels: Record<WorkType, string> = {
  book: "Livro",
  manga: "Manga",
  movie: "Filme",
  series: "Serie",
  anime: "Anime",
  game: "Jogo",
  other: "Outro",
};

const statusLabels: Record<WorkStatus, string> = {
  planned: "Quero ver/ler",
  in_progress: "Em andamento",
  paused: "Pausado",
  completed: "Finalizado",
};

let works: Work[] = loadWorks();
let activeImage = "";

const libraryGrid = getElement<HTMLElement>("#libraryGrid");
const emptyState = getElement<HTMLElement>("#emptyState");
const workCount = getElement<HTMLElement>("#workCount");
const searchInput = getElement<HTMLInputElement>("#searchInput");
const typeFilter = getElement<HTMLSelectElement>("#typeFilter");
const statusFilter = getElement<HTMLSelectElement>("#statusFilter");
const dialog = getElement<HTMLDialogElement>("#workDialog");
const form = getElement<HTMLFormElement>("#workForm");
const dialogTitle = getElement<HTMLElement>("#dialogTitle");
const workId = getElement<HTMLInputElement>("#workId");
const titleInput = getElement<HTMLInputElement>("#titleInput");
const typeInput = getElement<HTMLSelectElement>("#typeInput");
const statusInput = getElement<HTMLSelectElement>("#statusInput");
const imageInput = getElement<HTMLInputElement>("#imageInput");
const imagePreview = getElement<HTMLElement>("#imagePreview");
const descriptionInput = getElement<HTMLTextAreaElement>("#descriptionInput");
const progressInput = getElement<HTMLInputElement>("#progressInput");
const deleteButton = getElement<HTMLButtonElement>("#deleteButton");

getElement<HTMLButtonElement>("#addWorkButton").addEventListener("click", () => openForm());
getElement<HTMLButtonElement>("#emptyAddButton").addEventListener("click", () => openForm());
getElement<HTMLButtonElement>("#closeDialogButton").addEventListener("click", closeForm);
getElement<HTMLButtonElement>("#cancelButton").addEventListener("click", closeForm);

searchInput.addEventListener("input", renderLibrary);
typeFilter.addEventListener("change", renderLibrary);
statusFilter.addEventListener("change", renderLibrary);
form.addEventListener("submit", saveWork);
deleteButton.addEventListener("click", deleteActiveWork);
imageInput.addEventListener("change", previewImage);

renderLibrary();

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento nao encontrado: ${selector}`);
  }

  return element;
}

function isWorkType(value: string): value is WorkType {
  return value in typeLabels;
}

function isWorkStatus(value: string): value is WorkStatus {
  return value in statusLabels;
}

function createEmptyWork(): Work {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "",
    type: "book",
    image: "",
    description: "",
    status: "in_progress",
    progress: "",
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeWork(value: unknown): Work | null {
  if (!value || typeof value !== "object") return null;

  const work = value as Partial<Work>;
  const fallback = createEmptyWork();
  const type = typeof work.type === "string" && isWorkType(work.type) ? work.type : fallback.type;
  const status =
    typeof work.status === "string" && isWorkStatus(work.status) ? work.status : fallback.status;

  return {
    id: typeof work.id === "string" ? work.id : fallback.id,
    title: typeof work.title === "string" ? work.title : "Sem titulo",
    type,
    image: typeof work.image === "string" ? work.image : "",
    description: typeof work.description === "string" ? work.description : "",
    status,
    progress: typeof work.progress === "string" ? work.progress : "",
    createdAt: typeof work.createdAt === "string" ? work.createdAt : fallback.createdAt,
    updatedAt: typeof work.updatedAt === "string" ? work.updatedAt : fallback.updatedAt,
  };
}

function loadWorks(): Work[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeWork).filter((work): work is Work => work !== null);
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
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  libraryGrid.innerHTML = "";
  workCount.textContent = `${visibleWorks.length} ${visibleWorks.length === 1 ? "obra" : "obras"}`;

  visibleWorks.forEach((work) => {
    const card = document.createElement("button");
    card.className = "work-card";
    card.type = "button";
    card.addEventListener("click", () => openForm(work.id));

    card.innerHTML = `
      <div class="cover">
        ${
          work.image
            ? `<img src="${work.image}" alt="Capa de ${escapeHtml(work.title)}" />`
            : `<div class="cover-placeholder">${escapeHtml(work.title)}</div>`
        }
        <span class="status-pill">${statusLabels[work.status]}</span>
      </div>
      <div>
        <div class="card-title">${escapeHtml(work.title)}</div>
        <div class="card-meta">
          <span>${typeLabels[work.type]}</span>
          ${work.progress ? `<span>â€¢ ${escapeHtml(work.progress)}</span>` : ""}
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

function saveWork(event: SubmitEvent) {
  event.preventDefault();

  const now = new Date().toISOString();
  const existingId = workId.value;
  const existingWork = works.find((work) => work.id === existingId);
  const selectedType = isWorkType(typeInput.value) ? typeInput.value : "book";
  const selectedStatus = isWorkStatus(statusInput.value) ? statusInput.value : "in_progress";

  const payload: Work = {
    id: existingId || crypto.randomUUID(),
    title: titleInput.value.trim(),
    type: selectedType,
    image: activeImage,
    description: descriptionInput.value.trim(),
    status: selectedStatus,
    progress: progressInput.value.trim(),
    createdAt: existingWork?.createdAt || now,
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
    activeImage = typeof reader.result === "string" ? reader.result : "";
    renderPreview();
  });
  reader.readAsDataURL(file);
}

function renderPreview() {
  imagePreview.innerHTML = activeImage
    ? `<img src="${activeImage}" alt="Previa da capa escolhida" />`
    : "<span>Previa da capa</span>";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return replacements[character];
  });
}