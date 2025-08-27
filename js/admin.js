const supabaseUrl = 'https://VOTRE_PROJECT_URL.supabase.co';
const supabaseKey = 'VOTRE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('form-produit');
const message = document.getElementById('message');
const listeAdmin = document.getElementById('liste-produits-admin');
const btnSubmit = document.getElementById('btn-submit');

let produitsAdmin = [];
let currentEditId = null;

// Upload image vers Supabase Storage
async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('produits').upload(fileName, file);
  if (error) {
    alert("Erreur upload : " + error.message);
    return null;
  }
  const { publicUrl } = supabase.storage.from('produits').getPublicUrl(fileName);
  return publicUrl;
}

// Récupérer les produits pour l'admin
async function fetchProduitsAdmin() {
  const { data, error } = await supabase.from('produits').select('*');
  if (error) console.error(error);
  else {
    produitsAdmin = data;
    listeAdmin.innerHTML = '';
    data.forEach(p => {
      listeAdmin.innerHTML += `
        <div class="mb-2 p-2 border">
          <strong>${p.nom}</strong> - ${p.categorie} - ${p.prix}
          <button onclick="modifierProduit(${p.id})" class="btn btn-sm btn-warning ms-2">Modifier</button>
          <button onclick="supprimerProduit(${p.id})" class="btn btn-sm btn-danger ms-2">Supprimer</button>
        </div>
      `;
    });
  }
}

// Ajouter ou mettre à jour un produit
async function submitProduit(e) {
  e.preventDefault();
  let imageUrl = [];

  const fileInput = document.getElementById('image');
  if (fileInput.files.length > 0) {
    const url = await uploadImage(fileInput.files[0]);
    if (url) imageUrl.push(url);
  }

  const produit = {
    nom: document.getElementById('nom').value,
    description: document.getElementById('description').value,
    categorie: document.getElementById('categorie').value,
    prix: document.getElementById('prix').value,
    images: imageUrl
  };

  if (currentEditId) {
    // Mise à jour
    const { error } = await supabase.from('produits').update(produit).eq('id', currentEditId);
    if (error) message.textContent = "Erreur: " + error.message;
    else {
      message.textContent = "Produit mis à jour avec succès!";
      currentEditId = null;
      btnSubmit.textContent = "Ajouter le produit";
    }
  } else {
    // Ajout
    const { error } = await supabase.from('produits').insert([produit]);
    if (error) message.textContent = "Erreur: " + error.message;
    else message.textContent = "Produit ajouté avec succès!";
  }

  form.reset();
  fetchProduitsAdmin();
}

// Supprimer un produit
async function supprimerProduit(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
  const { error } = await supabase.from('produits').delete().eq('id', id);
  if (error) alert(error.message);
  else fetchProduitsAdmin();
}

// Préparer le formulaire pour modification
function modifierProduit(id) {
  const produit = produitsAdmin.find(p => p.id === id);
  document.getElementById('nom').value = produit.nom;
  document.getElementById('description').value = produit.description;
  document.getElementById('categorie').value = produit.categorie;
  document.getElementById('prix').value = produit.prix;
  currentEditId = id;
  btnSubmit.textContent = "Mettre à jour le produit";
}

// Gestion du submit
form.addEventListener('submit', submitProduit);

// Chargement initial
fetchProduitsAdmin();
