import { livres } from "./livres.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  filtreActif: "Nouveautés",
};

const elements = {
  grille: $("#grille"),
  filtres: $("#filtres"),
  overlay: $("#modalOverlay"),
  modal: $("#modal"),
};

function getCategories(livresData) {
  const set = new Set(livresData.map((l) => l.categorie));
  if (set.has("Litterature") && !set.has("Littérature")) {
    set.add("Littérature");
    set.delete("Litterature");
  }
  return ["Tous", "Nouveautés", ...[...set].sort()];
}

function renderFiltres() {
  const cats = getCategories(livres);
  elements.filtres.innerHTML = cats
    .map(
      (cat) =>
        `<button class="${
          cat === state.filtreActif ? "active" : ""
        }" data-filtre="${cat}">${cat}</button>`
    )
    .join("");

  elements.filtres.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filtre]");
    if (!btn) return;
    state.filtreActif = btn.dataset.filtre;
    $$(".filtres button").forEach((b) =>
      b.classList.toggle("active", b === btn)
    );
    afficherLivres();
  });
}

function filtrerLivres() {
  const f = state.filtreActif;
  if (f === "Tous") return livres;
  if (f === "Nouveautés") return livres.filter((l) => l.nouveaute === true);
  return livres.filter((l) => l.categorie === f);
}

function carteHTML(livre, index) {
  const { image, titre, prix, auteur, editeur } = livre;
  return `
    <article class="carte" data-index="${index}" tabindex="0" aria-label="${titre}">
      <img src="${image}" alt="Couverture — ${titre}">
      <div class="body">
        <h3>${titre}</h3>
        <div class="meta">${auteur} • ${editeur}</div>
        <div class="prix">${prix.toFixed ? prix.toFixed(2) : prix} $</div>
        <button class="cta" type="button" aria-hidden="true">Ajouter au panier</button>
      </div>
    </article>
  `;
}

function afficherLivres() {
  const data = filtrerLivres();
  elements.grille.innerHTML = data.map((l, i) => carteHTML(l, i)).join("");

  elements.grille.addEventListener("click", onTuile);
  elements.grille.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onTuile(e);
  });
}

function onTuile(e) {
  const tuile = e.target.closest(".carte");
  if (!tuile) return;
  const idxDansFiltre = [...$$(".carte")].indexOf(tuile);
  const livre = filtrerLivres()[idxDansFiltre];
  ouvrirModale(livre);
}

function ouvrirModale(l) {
  const html = `
    <header>
      <img src="${l.image}" alt="Couverture — ${l.titre}">
      <div>
        <h2 id="modalTitle">${l.titre}</h2>
        <div class="muted">${l.auteur} — ${l.editeur} • ${l.pages} pages</div>
        <strong class="prix">${l.prix} $</strong>
        <p class="desc">${l.description}</p>
      </div>
    </header>
  `;
  elements.modal.innerHTML = html;
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("noscroll");

  elements.overlay.onclick = (evt) => {
    if (evt.target === elements.overlay) fermerModale();
  };
  window.addEventListener("keydown", onEscOnce, { once: true });
}
function onEscOnce(e) {
  if (e.key === "Escape") fermerModale();
}

function fermerModale() {
  elements.overlay.classList.remove("open");
  elements.overlay.setAttribute("aria-hidden", "true");
  elements.modal.innerHTML = "";
  document.body.classList.remove("noscroll");
  elements.overlay.onclick = null;
}

// ---------- Init ----------
renderFiltres();
afficherLivres();
