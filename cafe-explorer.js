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


// Replace your existing nearMeBtn event listener with this:
nearMeBtn.addEventListener('click', function() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    nearMeBtn.textContent = '📍 Searching for nearby cafes...';
    nearMeBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            console.log('User location:', userLat, userLng);
            
            // Center map on user location
            map.setView([userLat, userLng], 15);
            
            // Find REAL cafes near user
            await findNearbyCafes(userLat, userLng);
            
            nearMeBtn.textContent = '📍 Find Cafes Near Me';
            nearMeBtn.disabled = false;
        },
        (error) => {
            alert('Error getting location: ' + error.message);
            nearMeBtn.textContent = '📍 Find Cafes Near Me';
            nearMeBtn.disabled = false;
            
            // Fallback to sample data
            initSwipeCards();
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
// ===== REAL CAFE FINDER WITH OPENSTREETMAP (FREE API) =====

async function findNearbyCafes(lat, lng) {
    try {
        console.log('Searching for cafes near:', lat, lng);
        
        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=cafe](around:2000,${lat},${lng});out;`
        );
        
        const data = await response.json();
        console.log('Found cafes:', data.elements);
        
        if (data.elements && data.elements.length > 0) {
            displayRealCafes(data.elements, lat, lng);
        } else {
            // Fallback to sample data if no cafes found
            console.log('No cafes found, using sample data');
            initSwipeCards();
        }
    } catch (error) {
        console.error('Error fetching cafes:', error);
        // Fallback to sample data
        initSwipeCards();
    }
}

function displayRealCafes(cafes, userLat, userLng) {
    const container = document.getElementById('cafeCards');
    const oldList = document.getElementById('cafeList');
    
    // Hide old list, show cards container
    if (oldList) oldList.style.display = 'none';
    container.innerHTML = '';
    container.style.display = 'block';
    
    // Clear existing map markers (keep only base map)
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    // Add user location marker
    L.marker([userLat, userLng]).addTo(map)
        .bindPopup('<b>📍 You are here!</b>')
        .openPopup();

    let cafeCount = 0;
    
    cafes.forEach((cafe, index) => {
        // Skip if cafe doesn't have a name
        if (!cafe.tags || !cafe.tags.name) return;
        
        cafeCount++;
        
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.style.zIndex = cafes.length - index;
        
        // Calculate distance from user
        const distance = calculateDistance(userLat, userLng, cafe.lat, cafe.lon);
        
        // Use different cafe images for variety
        const cafeImages = [
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
        ];
        const randomImage = cafeImages[Math.floor(Math.random() * cafeImages.length)];
        
        card.innerHTML = `
            <img src="${randomImage}" alt="${cafe.tags.name}">
            <h3>${cafe.tags.name}</h3>
            <p>📍 ${distance.toFixed(1)} km away</p>
            <p>${cafe.tags.cuisine || cafe.tags.amenity || 'Cafe'}</p>
            <span class="favorite-btn" data-id="real-${cafe.id}">🤍</span>
            <p><small>Swipe right to save ❤️</small></p>
        `;

        // Add cafe marker to map
        L.marker([cafe.lat, cafe.lon]).addTo(map)
            .bindPopup(`<b>${cafe.tags.name}</b><br>${cafe.tags.cuisine || ''}`);

        // Swipe functionality
        const hammer = new Hammer(card);
        hammer.on('swipeleft', () => {
            card.classList.add('swipe-left');
            setTimeout(() => card.remove(), 600);
        });

        hammer.on('swiperight', () => {
            card.classList.add('swipe-right');
            if (window.favoriteManager) {
                favoriteManager.toggleFavorite("real-" + cafe.id.toString());
            }
            setTimeout(() => card.remove(), 600);
        });

        container.appendChild(card);
    });
    
    if (cafeCount === 0) {
        container.innerHTML = '<p>No cafes found nearby. Try sample cafes instead.</p>';
        initSwipeCards();
    }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}