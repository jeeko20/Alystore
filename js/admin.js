const supabaseUrl = 'https://VOTRE_PROJECT_URL.supabase.co';
const supabaseKey = 'VOTRE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('form-produit');
const message = document.getElementById('message');
const listeAdmin = document.getElementById('liste-produits-admin');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const produit = {
    nom: document.getElementById('nom').value,
    description: document.getElementById('description').value,
    categorie: document.getElementById('categorie').value,
    prix: document.getElementById('prix').value,
    images: document.getElementById('images').value.split(',').map(s => s.trim())
  };

  const { data, error } = await supabase.from('produits').insert([produit]);
  if (error) message.textContent = "Erreur: " + error.message;
  else {
    message.textContent = "Produit ajouté avec succès!";
    form.reset();
    fetchProduitsAdmin();
  }
});

// Afficher produits dans l'admin
async function fetchProduitsAdmin() {
  const { data, error } = await supabase.from('produits').select('*');
  if (error) console.error(error);
  else {
    listeAdmin.innerHTML = '';
    data.forEach(p => {
      listeAdmin.innerHTML += `
        <div class="mb-2 p-2 border">
          <strong>${p.nom}</strong> - ${p.categorie} - ${p.prix}
          <button onclick="supprimerProduit(${p.id})" class="btn btn-sm btn-danger ms-2">Supprimer</button>
        </div>
      `;
    });
  }
}

async function supprimerProduit(id) {
  if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
  const { error } = await supabase.from('produits').delete().eq('id', id);
  if (error) alert(error.message);
  else fetchProduitsAdmin();
}

// Charger la liste au démarrage
fetchProduitsAdmin();
