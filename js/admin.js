// --- Supabase ---
const supabaseUrl = 'https://xswyiwlmxolfbqevqhqu.supabase.co'; // ton URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3lpd2xteG9sZmJxZXZxaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY1MTEsImV4cCI6MjA3MTg4MjUxMX0.scmwfGWUBm9gHVcLDVNzCADYtXsTIAPySxqArZPD0qk';
                       // clé anonyme
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- Sélection des éléments du DOM ---
const formProduit = document.getElementById('form-produit');
const nomInput = document.getElementById('nom');
const descriptionInput = document.getElementById('description');
const prixSelect = document.getElementById('prix');
const categorieSelect = document.getElementById('categorie');
const imageInput = document.getElementById('image');
const listeProduitsAdmin = document.getElementById('liste-produits-admin');

// --- Fonction pour uploader une image ---
async function uploadImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('produits') // nom du bucket
    .upload(fileName, file);

  if (error) {
    console.error(error);
    return null;
  }
  // Retourne l'URL publique de l'image
  const { publicUrl } = supabase.storage.from('produits').getPublicUrl(fileName);
  return publicUrl;
}

// --- Ajouter un produit ---
formProduit.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!nomInput.value || !descriptionInput.value || !prixSelect.value || !categorieSelect.value) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  let urlsImages = [];
  if (imageInput.files.length > 0) {
    for (let i = 0; i < imageInput.files.length; i++) {
      const url = await uploadImage(imageInput.files[i]);
      if (url) urlsImages.push(url);
    }
  }

  const { data, error } = await supabase.from('produits').insert([{
    nom: nomInput.value,
    description: descriptionInput.value,
    prix: prixSelect.value,
    categorie: categorieSelect.value,
    images: urlsImages
  }]);

  if (error) {
    console.error(error);
    alert("Erreur lors de l'ajout du produit");
  } else {
    alert("Produit ajouté avec succès !");
    formProduit.reset();
    fetchProduitsAdmin();
  }
});

// --- Récupérer tous les produits pour l'admin ---
async function fetchProduitsAdmin() {
  const { data, error } = await supabase.from('produits').select('*');
  if (error) {
    console.error(error);
    return;
  }

  listeProduitsAdmin.innerHTML = "";
  data.forEach(produit => {
    const div = document.createElement('div');
    div.classList.add('admin-produit');
    div.innerHTML = `
      <strong>${produit.nom}</strong> - ${produit.description} - ${produit.categorie} - ${produit.prix}
      <button class="btn btn-danger btn-sm" data-id="${produit.id}">Supprimer</button>
    `;
    listeProduitsAdmin.appendChild(div);

    // Bouton supprimer
    div.querySelector('button').addEventListener('click', async () => {
      if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
        const { error } = await supabase.from('produits').delete().eq('id', produit.id);
        if (error) console.error(error);
        else fetchProduitsAdmin();
      }
    });
  });
}

// --- Initialisation ---
fetchProduitsAdmin();
