// ⚡ Initialisation correcte de Supabase
const supabase = window.supabase.createClient(
  "https://xswyiwlmxolfbqevqhqu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3lpd2xteG9sZmJxZXZxaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY1MTEsImV4cCI6MjA3MTg4MjUxMX0.scmwfGWUBm9gHVcLDVNzCADYtXsTIAPySxqArZPD0qk"
);

document.addEventListener('DOMContentLoaded', async function () {
  const filtreCategorie = document.getElementById('filtreCategorie');
  const filtrePrix = document.getElementById('filtrePrix');
  const listeProduits = document.getElementById('liste-produits');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');

  let produits = [];
  let produitsFiltres = [];
  const parPage = 4;
  let pageActuelle = 1;

  // 🔽 Charger les produits
  async function chargerProduits() {
    const { data, error } = await supabase.from("produits").select("*");
    if (error) {
      console.error("Erreur:", error.message);
      return [];
    }
    return data;
  }

  // 🔽 Formater le prix
  function formatPrix(code) {
    switch (code) {
      case "moins-100": return "Moins de 100$";
      case "100-300": return "100$ - 300$";
      case "plus-300": return "Plus de 300$";
      default: return "Non spécifié";
    }
  }

  // 🔽 Générer HTML d'un produit
  function genererHTMLProduit(produit) {
    const carrouselId = `carousel-${produit.id}`;
    const imagesHTML = (produit.images || []).map((img, i) => {
      const { data } = supabase.storage.from("produits").getPublicUrl(img);
      const urlImage = data?.publicUrl || "images/placeholder.jpg";
      return `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="${urlImage}" class="d-block w-100" alt="${produit.nom}">
        </div>
      `;
    }).join("");

    const lienWhatsapp = `https://wa.me/50947634103?text=${encodeURIComponent(
      `Bonjour, je suis intéressé par :
- Produit : ${produit.nom}
- Description : ${produit.description}
- Prix : ${formatPrix(produit.prix)}`
    )}`;

    return `
      <div class="row produit mb-4">
        <div class="col-md-6">
          <div id="${carrouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">${imagesHTML}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carrouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carrouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          </div>
        </div>
        <div class="col-md-6 d-flex flex-column justify-content-center">
          <h4>${produit.nom}</h4>
          <p>${produit.description}</p>
          <p><strong>Prix :</strong> ${formatPrix(produit.prix)}</p>
          <a href="${lienWhatsapp}" target="_blank" class="btn btn-success mt-2">Commander via WhatsApp</a>
        </div>
      </div>
      <hr />
    `;
  }

  // 🔽 Afficher produits par page
  function afficherProduits(page) {
    listeProduits.innerHTML = "";
    const start = (page - 1) * parPage;
    const end = start + parPage;
    const pageProduits = produitsFiltres.slice(start, end);

    pageProduits.forEach(produit => {
      listeProduits.innerHTML += genererHTMLProduit(produit);
    });

    genererPagination(page);
  }

  // 🔽 Pagination
  function genererPagination(page) {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(produitsFiltres.length / parPage);
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `
        <li class="page-item ${i === page ? 'active' : ''}">
          <a class="page-link" href="#">${i}</a>
        </li>`;
    }

    document.querySelectorAll('#pagination a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        pageActuelle = parseInt(e.target.textContent);
        afficherProduits(pageActuelle);
      });
    });
  }

  // 🔽 Filtres
  function filtrerProduits() {
    const cat = filtreCategorie.value;
    const prix = filtrePrix.value;
    const searchTerm = searchInput.value.toLowerCase();
    produitsFiltres = produits.filter(p => {
      const matchCat = !cat || p.categorie === cat;
      const matchPrix = !prix || p.prix === prix;
      const matchSearch = p.nom.toLowerCase().includes(searchTerm);
      return matchCat && matchPrix && matchSearch;
    });
    pageActuelle = 1;
    afficherProduits(pageActuelle);
  }

  // 🔽 Écouteurs
  filtreCategorie.addEventListener('change', filtrerProduits);
  filtrePrix.addEventListener('change', filtrerProduits);
  searchInput.addEventListener('input', filtrerProduits);

  // 🔽 Charger au démarrage
  produits = await chargerProduits();
  produitsFiltres = [...produits];
  afficherProduits(pageActuelle);
});

// 🔄 Slider Hero
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  let current = 0;
  function changerImageHero() {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[current].classList.add('active');
    current = (current + 1) % slides.length;
  }
  changerImageHero();
  setInterval(changerImageHero, 5000);
});