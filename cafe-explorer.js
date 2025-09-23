 // Cafe Explorer Search Functionality
const searchBar = document.getElementById('searchBar');
const cafeList = document.getElementById('cafeList');
const noResults = document.getElementById('noResults');

searchBar.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const cafes = cafeList.getElementsByTagName('li');
    let found = false;
    
    // Check each cafe against search term
    for (let cafe of cafes) {
        const cafeName = cafe.textContent.toLowerCase();
        
        if (cafeName.includes(searchTerm)) {
            cafe.style.display = 'block';
            found = true;
        } else {
            cafe.style.display = 'none';
        }
    }
    
    // Show/hide "No cafes found" message
    if (found || searchTerm === '') {
        noResults.style.display = 'none';
    } else {
        noResults.style.display = 'block';
    }
});


const nearMeBtn = document.getElementById('nearMeBtn');

nearMeBtn.addEventListener('click', function() {
    console.log('Geolocation started...');
    
    if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
    }
    
    // Simple version - remove loading states
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('Success! Lat:', lat, 'Lng:', lng);
            alert(`Location found! Lat: ${lat}, Lng: ${lng}`);
            
            // Center map (make sure 'map' variable is accessible)
            if (map) {
                map.setView([lat, lng], 15);
            }
        },
        function(error) {
            console.log('Error:', error);
            alert('Location error: ' + error.message);
        }
    );
});
// ❤️ FAVORITE CAFES FEATURE (LocalStorage)
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
        // Update heart icons based on saved favorites
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
        // Click heart to toggle favorite
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                this.toggleFavorite(e.target.getAttribute('data-id'));
            }
        });
    }
    
    toggleFavorite(cafeId) {
        const index = this.favorites.indexOf(cafeId);
        
        if (index > -1) {
            // Remove from favorites
            this.favorites.splice(index, 1);
        } else {
            // Add to favorites
            this.favorites.push(cafeId);
        }
        
        // Save to localStorage (persists after browser closes)
        localStorage.setItem('favoriteCafes', JSON.stringify(this.favorites));
        
        // Update UI
        this.loadFavorites();
        
        // Show confirmation
        console.log('Favorites updated:', this.favorites);
    }
    
    getFavorites() {
        return this.favorites;
    }
}

// Initialize favorites when page loads
const favoriteManager = new FavoriteManager();
// Initialize Leaflet Map
function initMap() {
    let map = L.map('map').setView([40.7128, -74.0060], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Café markers
    const cafes = [
        { name: "Brew & Bean", lat: 40.713, lng: -74.006, rating: 4.5 },
        { name: "Pink Cup Cafe", lat: 40.714, lng: -74.005, rating: 4.0 },
        { name: "Coffee Bloom", lat: 40.712, lng: -74.007, rating: 3.8 },
        { name: "Latte Heaven", lat: 40.715, lng: -74.004, rating: 5.0 }
    ];

    // Add markers to map
    cafes.forEach(cafe => {
        L.marker([cafe.lat, cafe.lng])
            .addTo(map)
            .bindPopup(`<b>${cafe.name}</b><br>⭐ Rating: ${cafe.rating}`);
    });
}

// Initialize map when page loads
window.addEventListener('load', initMap);