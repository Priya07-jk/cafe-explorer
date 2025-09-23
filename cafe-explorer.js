 // =========================
// ☕ Cafe Explorer
// =========================

// ===== SEARCH FUNCTIONALITY =====
const searchBar = document.getElementById('searchBar');
const cafeList = document.getElementById('cafeList');
const noResults = document.getElementById('noResults');

searchBar.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const cafes = cafeList.getElementsByTagName('li');
    let found = false;

    for (let cafe of cafes) {
        const cafeName = cafe.textContent.toLowerCase();
        if (cafeName.includes(searchTerm)) {
            cafe.style.display = 'block';
            found = true;
        } else {
            cafe.style.display = 'none';
        }
    }

    noResults.style.display = (found || searchTerm === '') ? 'none' : 'block';
});


// ===== "NEAR ME" BUTTON =====
const nearMeBtn = document.getElementById('nearMeBtn');
let map;

nearMeBtn.addEventListener('click', function () {
    console.log('Geolocation started...');
    if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('Success! Lat:', lat, 'Lng:', lng);
            alert(`Location found! Lat: ${lat}, Lng: ${lng}`);

            if (map) {
                map.setView([lat, lng], 15);
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("📍 You are here")
                    .openPopup();
            }
        },
        function (error) {
            console.log('Error:', error);
            alert('Location error: ' + error.message);
        }
    );
});


// ===== FAVORITE CAFES FEATURE (LocalStorage) =====
class FavoriteManager {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favoriteCafes')) || [];
        this.init();
    }

    init() {
        this.loadFavorites();
        this.setupEventListeners();
    }

    loadFavorites() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const cafeId = btn.getAttribute('data-id');
            if (this.favorites.includes(cafeId)) {
                btn.textContent = '❤️';
                btn.classList.add('active');
            } else {
                btn.textContent = '🤍';
                btn.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                this.toggleFavorite(e.target.getAttribute('data-id'));
            }
        });
    }

    toggleFavorite(cafeId) {
        const index = this.favorites.indexOf(cafeId);
        if (index > -1) this.favorites.splice(index, 1);
        else this.favorites.push(cafeId);

        localStorage.setItem('favoriteCafes', JSON.stringify(this.favorites));
        this.loadFavorites();
        console.log('Favorites updated:', this.favorites);
    }

    getFavorites() {
        return this.favorites;
    }
}

const favoriteManager = new FavoriteManager();


// ===== LEAFLET MAP =====
function initMap() {
    map = L.map('map').setView([40.7128, -74.0060], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const cafes = [
        { name: "Brew & Bean", lat: 40.713, lng: -74.006, rating: 4.5 },
        { name: "Pink Cup Cafe", lat: 40.714, lng: -74.005, rating: 4.0 },
        { name: "Coffee Bloom", lat: 40.712, lng: -74.007, rating: 3.8 },
        { name: "Latte Heaven", lat: 40.715, lng: -74.004, rating: 5.0 }
    ];

    cafes.forEach(cafe => {
        L.marker([cafe.lat, cafe.lng])
            .addTo(map)
            .bindPopup(`<b>${cafe.name}</b><br>⭐ Rating: ${cafe.rating}`);
    });
}


// ===== SWIPE CARDS (Hammer.js + Manual Swipe) =====
function initSwipeCards() {
    const cafes = [
        { name: "Brew & Bean", rating: 4.5, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop", id: 1 },
        { name: "Pink Cup Cafe", rating: 4.0, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop", id: 2 },
        { name: "Coffee Bloom", rating: 3.8, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", id: 3 },
        { name: "Latte Heaven", rating: 5.0, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", id: 4 }
    ];

    const container = document.getElementById('cafeCards');
    if (!container) return;
    container.innerHTML = '';

    cafes.forEach((cafe, index) => {
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.style.zIndex = cafes.length - index;
        card.style.transition = "transform 0.3s ease, opacity 0.3s ease";

        card.innerHTML = `
            <img src="${cafe.image}" alt="${cafe.name}">
            <h3>${cafe.name}</h3>
            <p>⭐ ${cafe.rating}</p>
            <span class="favorite-btn" data-id="${cafe.id}">🤍</span>
            <p><small>Swipe right to save ❤️</small></p>
        `;

        // Hammer.js swipe
        const hammer = new Hammer(card);
        hammer.on('swipeleft', () => removeCard(card, -1));
        hammer.on('swiperight', () => removeCard(card, 1, cafe.id));

        // Manual mouse/touch swipe
        let startX = 0;
        const start = (e) => {
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        };
        const end = (e) => {
            const endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
            const diff = endX - startX;
            if (diff > 100) removeCard(card, 1, cafe.id);
            else if (diff < -100) removeCard(card, -1);
        };
        card.addEventListener('mousedown', start);
        card.addEventListener('mouseup', end);
        card.addEventListener('touchstart', start);
        card.addEventListener('touchend', end);

        container.appendChild(card);
    });

    const oldList = document.getElementById('cafeList');
    if (oldList) oldList.style.display = 'none';
    container.style.display = 'block';
}

// Helper to animate & remove card
function removeCard(card, direction, cafeId) {
    if (direction === 1 && cafeId) favoriteManager.toggleFavorite(cafeId.toString());
    card.style.transform = `translateX(${direction * 500}px) rotate(${direction * 20}deg)`;
    card.style.opacity = 0;
    setTimeout(() => card.remove(), 300);
}


// ===== PAGE LOAD INITIALIZATION =====
window.addEventListener('load', () => {
    initMap();
    initSwipeCards();
});
