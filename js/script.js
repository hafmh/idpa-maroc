// ========== VARIABLES GLOBALES ==========
let cart = [];
let products = [];           // ← maintenant chargé depuis le backend
let currentFilter = 'tous';

// ========== INITIALISATION AU CHARGEMENT DE LA PAGE ==========
window.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    loadProductsFromBackend();   // ← NOUVEAU : charge les produits depuis la base
    updateCartUI();
    initializeEventListeners();
});

// CHARGEMENT DES PRODUITS DEPUIS LE BACKEND
function loadProductsFromBackend() {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            products = data;
            displayProducts();
            console.log("Produits chargés depuis la base de données :", products.length);
        })
        .catch(err => {
            console.error("Erreur chargement produits :", err);
            // En cas d'erreur, on garde les produits statiques comme secours
            products = originalProducts;
            displayProducts();
        });
}

// ========== PRODUITS STATIQUES DE SECOURS (au cas où le backend ne répond pas) ==========
const originalProducts = [
    // (tout ton ancien tableau de produits – je le remets ici au cas où)
    { id: 1, name: 'Pare-choc Avant', category: 'carrosserie', price: 2000, description: 'Pare-choc avant compatible avec plusieurs modèles de véhicules', image: 'images/pare-choc.jpg' },
    { id: 2, name: 'Pare-choc Arrière', category: 'carrosserie', price: 1800, description: 'Pare-choc arrière de qualité supérieure', image: 'images/pare-choc-arriere.jpg' },
    { id: 3, name: 'Aile Avant Droite', category: 'carrosserie', price: 1200, description: 'Aile avant droite en acier de haute qualité', image: 'images/aile-droite.jpg' },
    { id: 4, name: 'Aile Avant Gauche', category: 'carrosserie', price: 1200, description: 'Aile avant gauche en acier de haute qualité', image: 'images/aile-gauche.jpg' },
    { id: 5, name: 'Porte Avant Droite', category: 'carrosserie', price: 2500, description: 'Porte complète avec mécanisme et serrure', image: 'images/door.jpg' },
    { id: 6, name: 'Porte Avant Gauche', category: 'carrosserie', price: 2500, description: 'Porte complète avec mécanisme et serrure', image: 'images/door.jpg' },
    { id: 7, name: 'Capot Moteur', category: 'carrosserie', price: 1500, description: 'Capot moteur en excellent état', image: 'images/capot.jpg' },
    { id: 8, name: 'Hayon Arrière', category: 'carrosserie', price: 1800, description: 'Hayon arrière complet avec mécanisme', image: 'images/hayon.jpg' },
    { id: 9, name: 'Moteur Complet', category: 'moteur', price: 15000, description: 'Moteur complet reconditionné avec garantie', image: 'images/moteur.jpg' },
    { id: 10, name: 'Radiateur', category: 'moteur', price: 800, description: 'Radiateur de refroidissement haute performance', image: 'images/radiateur.jpg' },
    { id: 11, name: 'Support Radiateur', category: 'moteur', price: 1000, description: 'Support de radiateur robuste et durable', image: 'images/radiator-support.jpg' },
    { id: 12, name: 'Crossmember', category: 'moteur', price: 500, description: 'Traverse de support moteur renforcée', image: 'images/crossmember.jpg' },
    { id: 13, name: 'Alternateur', category: 'moteur', price: 1200, description: 'Alternateur reconditionné avec garantie', image: 'images/alternateur.jpg' },
    { id: 14, name: 'Démarreur', category: 'moteur', price: 900, description: 'Démarreur haute qualité pour tous véhicules', image: 'images/demarreur.jpg' },
    { id: 15, name: 'Phare Avant Droit', category: 'eclairage', price: 400, description: 'Phare avant droit avec technologie LED', image: 'images/head-lamp.jpg' },
    { id: 16, name: 'Phare Avant Gauche', category: 'eclairage', price: 400, description: 'Phare avant gauche avec technologie LED', image: 'images/head-lamp.jpg' },
    { id: 17, name: 'Feu Arrière Droit', category: 'eclairage', price: 350, description: 'Feu arrière droit compatible plusieurs modèles', image: 'images/feu-arriere.jpg' },
    { id: 18, name: 'Feu Arrière Gauche', category: 'eclairage', price: 350, description: 'Feu arrière gauche compatible plusieurs modèles', image: 'images/feu-arriere.jpg' },
    { id: 19, name: 'Feux Anti-Brouillard', category: 'eclairage', price: 450, description: 'Paire de feux anti-brouillard avant', image: 'images/antibrouillard.jpg' },
    { id: 20, name: 'Rétroviseur Droit', category: 'autres', price: 300, description: 'Rétroviseur extérieur droit avec réglage électrique', image: 'images/retroviseur.jpg' },
    { id: 21, name: 'Rétroviseur Gauche', category: 'autres', price: 300, description: 'Rétroviseur extérieur gauche avec réglage électrique', image: 'images/retroviseur.jpg' },
    { id: 22, name: 'Pare-brise', category: 'autres', price: 1200, description: 'Pare-brise avant avec pose disponible', image: 'images/parebrise.jpg' },
    { id: 23, name: 'Essuie-glaces', category: 'autres', price: 150, description: 'Paire d\'essuie-glaces toutes tailles', image: 'images/essuieglace.jpg' },
    { id: 24, name: 'Batterie', category: 'autres', price: 800, description: 'Batterie 12V haute performance', image: 'images/batterie.jpg' }
];

// ========== GESTION DU MENU MOBILE ==========
function initializeEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterProducts(category, e.target);
        });
    });

    document.getElementById('cartIcon').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    document.getElementById('cartModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('cartModal')) toggleCart();
    });

    document.getElementById('contactForm').addEventListener('submit', handleContactForm);

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
}

// ========== AFFICHAGE DES PRODUITS ==========
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const filtered = currentFilter === 'tous' ? products : products.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#666;grid-column:1/-1;">Aucun produit dans cette catégorie</p>';
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card fade-in">
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='Car'">
            </div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-description">${p.description}</div>
                <div class="product-price">${p.price} DH</div>
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Ajouter au panier</button>
            </div>
        </div>
    `).join('');
}

function filterProducts(category, button) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    displayProducts();
}

// ========== PANIER ==========
function loadCartFromStorage() {
    const saved = localStorage.getItem('idpaCart');
    if (saved) cart = JSON.parse(saved);
}

function saveCartToStorage() {
    localStorage.setItem('idpaCart', JSON.stringify(cart));
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });

    saveCartToStorage();
    updateCartUI();
    showNotification(`${product.name} ajouté au panier !`);
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(id);
    else { saveCartToStorage(); updateCartUI(); }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('cartCount').textContent = count;

    const itemsDiv = document.getElementById('cartItems');
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    if (cart.length === 0) {
        itemsDiv.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
    } else {
        itemsDiv.innerHTML = cart.map(i => `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${i.image}" onerror="this.style.display='none'; this.parentElement.innerHTML='Car'"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${i.name}</div>
                    <div class="cart-item-price">${i.price} DH</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${i.id}, -1)">-</button>
                        <span>${i.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${i.id}, 1)">+</button>
                    </div>
                </div>
                <div class="remove-item" onclick="removeFromCart(${i.id})">Remove</div>
            </div>
        `).join('');
    }
    document.getElementById('cartTotal').textContent = total + ' DH';
}

function toggleCart() {
    document.getElementById('cartModal').classList.toggle('active');
}

// ========== NOUVELLE FONCTION CHECKOUT (ouvre le beau formulaire) ==========
function checkout() {
    if (cart.length === 0) return showNotification("Panier vide !");

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    document.getElementById('finalTotal').textContent = total + ' DH';
    document.getElementById('checkoutModal').classList.add('active');
}

// ========== ENVOI RÉEL DE LA COMMANDE SUR WHATSAPP ==========
function sendOrder() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const city = document.getElementById('customerCity').value;
    const address = document.getElementById('customerAddress').value.trim();

    if (!name || !phone || !city || !address) {
        alert("Tous les champs sont obligatoires !");
        return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, city, address, items: cart, total })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            window.open(data.whatsappURL, '_blank');
            alert(`Commande #${data.orderId} envoyée avec succès !`);
            cart = [];
            saveCartToStorage();
            updateCartUI();
            document.getElementById('checkoutModal').classList.remove('active');
        }
    })
    .catch(err => alert("Erreur d'envoi. Réessayez."));
}

// ========== LE RESTE (contact, notifications, smooth scroll) ==========
function handleContactForm(e) {
    e.preventDefault();
    const nom = document.getElementById('nom').value;
    alert(`Merci ${nom} ! Votre message a été envoyé.`);
    e.target.reset();
}

function showNotification(message) {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:100px;right:20px;background:#DC143C;color:white;padding:1rem 2rem;border-radius:5px;box-shadow:0 4px 8px rgba(0,0,0,0.3);z-index:3000;animation:slideIn 0.3s ease-out;font-weight:bold;`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => n.remove(), 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from {transform:translateX(400px);opacity:0} to {transform:translateX(0);opacity:1} }
    @keyframes slideOut { from {transform:translateX(0);opacity:1} to {transform:translateX(400px);opacity:0} }
`;
document.head.appendChild(style);

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});