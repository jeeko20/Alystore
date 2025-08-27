// --- Supabase ---
const supabaseUrl = 'https://xswyiwlmxolfbqevqhqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3lpd2xteG9sZmJxZXZxaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDY1MTEsImV4cCI6MjA3MTg4MjUxMX0.scmwfGWUBm9gHVcLDVNzCADYtXsTIAPySxqArZPD0qk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- DOM ---
const formProduit = document.getElementById('form-produit');
const nomInput = document.getElementById('nom');
const descriptionInput = document.getElementById('description');
const prixInput = document.getElementById('prix');
const categorieInput = document.getElementById('categorie');
const imageInput = document.getElementById('image');
const listeProduitsAdmin = document.getElementById('liste-produits-admin');
const messageDiv = document.getElementById('message') || (() => {
  const div = document.createElement('div');
  div.id = 'message';
  formProduit.parentNode.insertBefore(div, formProduit.nextSibling);
  return div;
})();

// --- Upload image ---
async function uploadImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('produits') // bucket "produits"
    .upload(fileName, file);

  if (error) {
    console.error("❌ Erreur upload:", error.message);
    return null;
  }

  // ✅ Récupérer l'URL publique
  const { data: publicData } = supabase.storage
    .from('produits')
    .getPublicUrl(fileName);

  return publicData.publicUrl; // retourne l'URL
}

// --- Ajouter produit ---
formProduit.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageDiv.style.display = 'block';
  messageDiv.className = 'alert alert-info';
  messageDiv.textContent = '📤 Envoi en cours...';

  if (!nomInput.value || !descriptionInput.value || !prixInput.value || !categorieInput.value) {
    messageDiv.className = 'alert alert-danger';
    messageDiv.textContent = '❌ Veuillez remplir tous les champs.';
    return;
  }

  let urlsImages = [];

  if (imageInput.files.length > 0) {
    for (let file of imageInput.files) {
      const url = await uploadImage(file);
      if (url) {
        urlsImages.push(url);
      }
    }
  }

  // ✅ Insérer dans la table
  const { data, error } = await supabase
    .from('produits')
    .insert([
      {
        nom: nomInput.value,
        description: descriptionInput.value,
        prix: prixInput.value,
        categorie: categorieInput.value,
        images: urlsImages,
      }
    ]);

  if (error) {
    console.error("❌ Erreur Supabase:", error);
    messageDiv.className = 'alert alert-danger';
    messageDiv.textContent = `❌ Échec: ${error.message}`;
  } else {
    messageDiv.className = 'alert alert-success';
    messageDiv.textContent = '✅ Produit ajouté avec succès !';
    formProduit.reset();
    fetchProduitsAdmin(); // rafraîchit la liste
  }
});

// --- Afficher produits admin ---
async function fetchProduitsAdmin() {
  try {
    const { data, error } = await supabase.from('produits').select('*');
    if (error) throw error;

    listeProduitsAdmin.innerHTML = '';

    if (data.length === 0) {
      listeProduitsAdmin.innerHTML = '<p>Aucun produit disponible.</p>';
      return;
    }

    data.forEach(produit => {
      const div = document.createElement('div');
      div.classList.add('admin-produit', 'mb-2', 'p-2', 'border', 'rounded', 'bg-light');
      div.innerHTML = `
        <strong>${produit.nom}</strong> - ${produit.categorie} - ${produit.prix}
        <button class="btn btn-danger btn-sm float-end" data-id="${produit.id}">🗑️ Supprimer</button>
      `;
      listeProduitsAdmin.appendChild(div);

      div.querySelector('button').addEventListener('click', async () => {
        if (confirm("Supprimer ce produit ?")) {
          const { error } = await supabase.from('produits').delete().eq('id', produit.id);
          if (error) {
            alert("Erreur suppression: " + error.message);
          } else {
            fetchProduitsAdmin();
          }
        }
      });
    });
  } catch (err) {
    console.error("❌ Erreur fetch:", err.message);
    listeProduitsAdmin.innerHTML = '<p>Erreur de chargement.</p>';
  }
}

// --- Initialisation ---
fetchProduitsAdmin();