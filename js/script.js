document.addEventListener('DOMContentLoaded', function () {
  const filtreCategorie = document.getElementById('filtreCategorie');
  const filtrePrix = document.getElementById('filtrePrix');
  const listeProduits = document.getElementById('liste-produits');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-input');

  // Exemple de produits
  const produits = [
    { id: 1, nom: "Samsung A12", categorie: "telephone", prix: "100-300", images: ["IMG-20250806-WA0001.jpg", "IMG-20250806-WA0002.jpg"], description: "Téléphone 64Go" },
    { id: 2, nom: "iPhone 11", categorie: "telephone", prix: "plus-300", images: ["IMG-20250806-WA0002.jpg", "IMG-20250806-WA0006.jpg"], description: "iPhone original" },
    { id: 3, nom: "Casque JBL", categorie: "casque", prix: "moins-100", images: ["casque1.jpg"], description: "Son de qualité JBL" },
    { id: 4, nom: "Chargeur Samsung", categorie: "chargeur", prix: "moins-100", images: ["IMG-20250806-WA0003.jpg"], description: "Charge rapide 25W" },
    { id: 5, nom: "iPad Mini", categorie: "tablette", prix: "plus-300", images: ["IMG-20250806-WA0001.jpg"], description: "Tablette compacte" },
    { id: 6, nom: "Tablette Lenovo", categorie: "tablette", prix: "100-300", images: ["IMG-20250806-WA0004.jpg"], description: "Écran 10.1'' HD" },
    { id: 7, nom: "Xiaomi Redmi", categorie: "telephone", prix: "100-300", images: ["IMG-20250806-WA0002.jpg"], description: "Excellent rapport qualité/prix" },
    { id: 8, nom: "Chargeur Infinix", categorie: "chargeur", prix: "moins-100", images: ["IMG-20250806-WA0006.jpg"], description: "Chargeur original" }
  ];

  let produitsFiltres = [...produits];
  const parPage = 4;
  let pageActuelle = 1;

  function formatPrix(code) {
    switch (code) {
      case "moins-100": return "Moins de 100$";
      case "100-300": return "100$ - 300$";
      case "plus-300": return "Plus de 300$";
      default: return "";
    }
  }

  function genererHTMLProduit(produit) {
    const carrouselId = `carousel-${produit.id}`;
    const imagesHTML = produit.images.map((img, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img src="images/produits/${img}" class="d-block w-100" alt="${produit.nom}">
      </div>`).join("");

    const lienWhatsapp = `https://wa.me/50941234567?text=${encodeURIComponent(`Bonjour, je suis intéressé par :\n- Produit : ${produit.nom}\n- Description : ${produit.description}\n- Prix : ${formatPrix(produit.prix)}`)}`;

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

  afficherProduits(pageActuelle);
});


// Slider Hero en background
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
