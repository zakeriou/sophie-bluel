// Déclaration des constantes pour les URL, éléments DOM et autres variables
const url = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";
const loginElement = document.querySelector(".login");
const logoutElement = document.querySelector(".logout");
const modalContainer = document.querySelector(".modal-container");
const closeModalBtns = document.querySelectorAll(".close-modal");
const addWorkForm = document.getElementById("addWorkForm");
const workCategorySelect = document.getElementById("workCategory");
const galleryModal = document.querySelector('.gallery-modal');
const modalBtn = document.querySelector(".button-modifier");
const filtersContainer = document.querySelector('.filters');

// Fonction pour récupérer tous les travaux depuis l'API
async function getWorks() {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Fonction pour afficher les travaux dans la galerie, avec possibilité de filtrer par catégorie
async function displayWorks(categoryId) {
    const container = document.querySelector('.gallery');
    container.innerHTML = "";
    
    let elements = await getWorks();

    if (categoryId && categoryId !== 'all') {
        elements = elements.filter(element => element.categoryId == categoryId);
    }

    elements.forEach(element => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = element.imageUrl;
        img.alt = element.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = element.title;

        figure.dataset.category = element.categoryId;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        container.appendChild(figure);
    });
}

displayWorks();

// Fonction pour filtrer les travaux selon la catégorie sélectionnée
async function filtersWorks(event) {
    const button = event.target;
    const categoryId = button.dataset.category;
    displayWorks(categoryId);
}

// Fonction pour récupérer toutes les catégories depuis l'API
async function getCategories() {
    const response = await fetch(categoriesUrl);
    const data = await response.json();
    return data;
}

// Fonction pour configurer les filtres basés sur les catégories
async function setupFilters() {
    const categories = await getCategories();

    const allButton = document.createElement('button');
    allButton.textContent = "Tous";
    allButton.dataset.category = "all";
    allButton.classList.add('active');
    filtersContainer.appendChild(allButton);
    allButton.addEventListener("click", filtersWorks);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.dataset.category = category.id;
        filtersContainer.appendChild(button);
        button.addEventListener("click", filtersWorks);
    });
}

setupFilters();

// Vérification si l'utilisateur est connecté en vérifiant la présence d'un token dans le localStorage
function isConnected() {
    const token = localStorage.getItem("token");
    return !!token;
}

// Mise à jour de l'affichage en fonction de la connexion de l'utilisateur
if (isConnected()) {
    loginElement.classList.add("hidden");
    logoutElement.classList.remove("hidden");
    modalBtn.style.display = "block";
    filtersContainer.style.display = "none";
} else {
    modalBtn.style.display = "none";
    filtersContainer.style.display = "flex";
}

// Fonction de déconnexion de l'utilisateur
function logout() {
    localStorage.removeItem("token");
    loginElement.classList.remove("hidden");
    logoutElement.classList.add("hidden");
    modalBtn.style.display = "none";
    modalContainer.style.display = "none";
    filtersContainer.style.display = "block";
}

logoutElement.addEventListener("click", logout);

// Affichage des travaux dans le modal (galerie) et configuration des interactions (ajouter un travail, supprimer un travail)
async function displayWorksInModal() {
    const works = await getWorks();
    galleryModal.innerHTML = "";
    const modalWorks = document.querySelector("#modal-works");
    const modalForm = document.querySelector("#modal-form");
    modalWorks.style.display = "flex";
    modalForm.style.display = "none";
    works.forEach(work => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
        img.style.width = '79px';
        img.style.height = '118px';
        const deleteIcon = document.createElement('button');
        deleteIcon.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteIcon.classList.add('delete-icon');
        deleteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWork(work.id);
            imgContainer.remove();
        });
        imgContainer.appendChild(deleteIcon);
        imgContainer.appendChild(img);
        galleryModal.appendChild(imgContainer);
    });

    const addWorkBtn = document.querySelector(".add-work-btn");
    addWorkBtn.addEventListener("click", () => {
        modalWorks.style.display = "none";
        modalForm.style.display = "flex";
    });
}

// Affichage du modal lors du clic sur le bouton "modifier"
modalBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
    displayWorksInModal();
});

// Fermeture du modal lorsque l'on clique sur le bouton de fermeture ou à l'extérieur du modal
closeModalBtns.forEach(btn => btn.addEventListener("click", () => {
    modalContainer.style.display = "none";
}));

window.addEventListener("click", (e) => {
    if (e.target === modalContainer) {
        modalContainer.style.display = "none";
    }
});

// Fonction pour connecter l'utilisateur et afficher les travaux dans le modal
function loginUser() {
    localStorage.setItem("token", "your_token");
    loginElement.classList.add("hidden");
    logoutElement.classList.remove("hidden");
    modalContainer.style.display = 'flex';
    displayWorksInModal();
}

// Fonction pour supprimer un travail de la galerie (via l'API)
async function deleteWork(workId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            }
        });

        if (response.ok) {
            console.log(`Travail avec ID ${workId} supprimé avec succès`);
            await displayWorks();
        } else {
            console.error('Erreur lors de la suppression du travail');
            alert('Erreur lors de la suppression du travail.');
        }
    } catch (error) {
        console.error('Erreur de connexion au serveur :', error);
        alert('Une erreur de connexion est survenue.');
    }
}

// Fonction pour réinitialiser le formulaire d'ajout de travail
function resetForm() {
    addWorkForm.reset();
    photoPreview.src = '';
    photoPreviewContainer.classList.add("hidden");
    addPhotoBtn.classList.remove("image-selected");
}

// Fonction pour ajouter un travail à la galerie (via l'API)
async function addWork(event) {
    event.preventDefault();

    const formData = new FormData(addWorkForm);

    const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
        }
    });

    if (response.ok) {
        const newWork = await response.json();
        console.log('Nouveau travail ajouté', newWork);
        addWorkToGallery(newWork);
        modalContainer.style.display = "none";
        resetForm();
    } else {
        console.error('Erreur lors de l\'ajout du travail');
        alert('Erreur lors de l\'ajout du travail.');
    }
}

// Ajout d'un nouveau travail à la galerie après l'ajout réussi
function addWorkToGallery(newWork) {
    const container = document.querySelector('.gallery');

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = newWork.imageUrl;
    img.alt = newWork.title;

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = newWork.title;

    figure.dataset.category = newWork.categoryId;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    container.appendChild(figure);
}

// Fonction pour charger les catégories et les afficher dans le formulaire d'ajout de travail
async function loadCategories() {
    workCategorySelect.innerHTML = '';
    const categories = await (await fetch(categoriesUrl)).json();
    workCategorySelect.innerHTML = '<option value=""></option>';
    workCategorySelect.innerHTML += categories.map(category => 
        `<option value="${category.id}">${category.name}</option>`
    ).join('');
}

// Affichage du formulaire modal et chargement des catégories
modalBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
    loadCategories();
    displayWorksInModal();
});

// Gestion de l'aperçu de la photo pour l'ajout de travail
const photoInput = document.getElementById("photo-input");
const photoPreviewContainer = document.getElementById("photo-preview-container");
const photoPreview = document.getElementById("photo-preview");
const addPhotoBtn = document.querySelector('.add-photo-btn');

photoInput.addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            photoPreview.src = e.target.result;
            photoPreviewContainer.classList.remove("hidden");
            addPhotoBtn.classList.add("image-selected");
        };

        reader.readAsDataURL(file);
    } else {
        photoPreviewContainer.classList.add("hidden");
        addPhotoBtn.classList.remove("image-selected");
    }
});

// Fonction pour basculer l'affichage en mode édition en fonction de la connexion de l'utilisateur
function toggleModeEdition() {
    const modeEditionElement = document.getElementById("mode-edition");

    if (isConnected()) {
        modeEditionElement.style.display = "flex";
    } else {
        modeEditionElement.style.display = "none";
    }
}

toggleModeEdition();

// Écouteur d'événements pour l'envoi du formulaire d'ajout de travail
addWorkForm.addEventListener('submit', addWork);