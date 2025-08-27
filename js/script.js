document.addEventListener('DOMContentLoaded', async function () {
  const filtreCategorie = document.getElementById('filtreCategorie');
  const filtrePrix = document.getElementById('filtrePrix');
  const listeProduits = document.getElementById('liste-produits');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');

  // --- Supabase ---
  const supabaseUrl = 'https://xswyiwlmxolfbqevqhqu.supabase.co'; // <-- remplace par ton URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3lpd2xteG9sZmJxZXZxaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY1MTEsImV4cCI6MjA3MTg4MjUxMX0.scmwfGWUBm9gHVcLDVNzCADYtXsTIAPySxqArZPD0qk';
                      // <-- remplace par ta clé
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  let produits = [];
  let produitsFiltres = [];
  const parPage = 3; // nombre de produits par page
  let pageActuelle = 1;

  // --- Récupérer les produits depuis Supabase ---
  async function fetchProduits() {
    const { data, error } = await supabase.from('produits').select('*');
    if (error) {
      console.error(error);
      listeProduits.innerHTML = "<p>Impossible de charger les produits.</p>";
      return;
    }
    produits = data.map(p => ({
      ...p,
      images: p.images || [] // s'assurer que images est un tableau
    }));
    produitsFiltres = [...produits];
    afficherProduits(pageActuelle);
  }

  // --- Formatage du prix ---
  function formatPrix(code) {
    switch (code) {
      case "moins-100": return "Moins de 100$";
      case "100-300": return "100$ - 300$";
      case "plus-300": return "Plus de 300$";
      default: return code || "";
    }
  }

  // --- Générer le HTML pour chaque produit ---
  function genererHTMLProduit(produit) {
    const carrouselId = `carousel-${produit.id}`;
    const imagesHTML = produit.images.map((img, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img src="${img}" class="d-block w-100" alt="${produit.nom}">
      </div>`).join("");

    const lienWhatsapp = `https://wa.me/50947634103?text=${encodeURIComponent(`Bonjour, je suis intéressé par :\n- Produit : ${produit.nom}\n- Description : ${produit.description}\n- Prix : ${formatPrix(produit.prix)}`)}`;

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

  // --- Afficher les produits filtrés avec pagination ---
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

  // --- Générer la pagination ---
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

  // --- Filtrage produits ---
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

  filtreCategorie.addEventListener('change', filtrerProduits);
  filtrePrix.addEventListener('change', filtrerProduits);
  searchInput.addEventListener('input', filtrerProduits);

  // --- Slider Hero ---
  const slides = document.querySelectorAll('.hero-slide');
  let current = 0;
  function changerImageHero() {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[current].classList.add('active');
    current = (current + 1) % slides.length;
  }
  changerImageHero();
  setInterval(changerImageHero, 5000);

  // --- Initialisation ---
  fetchProduits();
});
