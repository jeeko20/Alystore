// --- Supabase ---
const supabaseUrl = 'https://xswyiwlmxolfbqevqhqu.supabase.co'; // ton URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3lpd2xteG9sZmJxZXZxaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY1MTEsImV4cCI6MjA3MTg4MjUxMX0.scmwfGWUBm9gHVcLDVNzCADYtXsTIAPySxqArZPD0qk'; // clé anonyme
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- DOM ---
const formProduit = document.getElementById('form-produit');
const nomInput = document.getElementById('nom');
const descriptionInput = document.getElementById('description');
const prixInput = document.getElementById('prix');
const categorieInput = document.getElementById('categorie');
const imageInput = document.getElementById('image');
const listeProduitsAdmin = document.getElementById('liste-produits-admin');

// --- Upload image ---
async function uploadImage(file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('produits') // bucket
      .upload(fileName, file);

    console.log("Upload Data:", data);
    console.log("Upload Error:", error);

    if (error) throw error;

    const { publicUrl } = supabase.storage.from('produits').getPublicUrl(fileName);
    return publicUrl;
  } catch (err) {
    console.error("Erreur upload image:", err.message);
    return null;
  }
}

// --- Ajouter produit ---
formProduit.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!nomInput.value || !descriptionInput.value || !prixInput.value || !categorieInput.value) {
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

  try {
    const { data, error } = await supabase.from('produits').insert([{
      nom: nomInput.value,
      description: descriptionInput.value,
      prix: prixInput.value,
      categorie: categorieInput.value,
      images: urlsImages
    }]);

    if (error) throw error;

    alert("Produit ajouté avec succès !");
    formProduit.reset();
    fetchProduitsAdmin();
  } catch (err) {
    console.error("Erreur ajout produit:", err.message);
    alert("Erreur lors de l'ajout du produit");
  }
});

// --- Afficher produits admin ---
async function fetchProduitsAdmin() {
  try {
    const { data, error } = await supabase.from('produits').select('*');
    if (error) throw error;

    listeProduitsAdmin.innerHTML = "";

    data.forEach(produit => {
      const div = document.createElement('div');
      div.classList.add('admin-produit', 'mb-2', 'p-2', 'border', 'rounded');
      div.innerHTML = `
        <strong>${produit.nom}</strong> - ${produit.description} - ${produit.categorie} - ${produit.prix}
        <button class="btn btn-danger btn-sm ms-2" data-id="${produit.id}">Supprimer</button>
      `;
      listeProduitsAdmin.appendChild(div);

      // Supprimer produit
      div.querySelector('button').addEventListener('click', async () => {
        if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
          const { error } = await supabase.from('produits').delete().eq('id', produit.id);
          if (error) console.error("Erreur suppression:", error);
          fetchProduitsAdmin();
        }
      });
    });
  } catch (err) {
    console.error("Erreur fetch produits admin:", err.message);
  }
}

// --- Initialisation ---
fetchProduitsAdmin();
