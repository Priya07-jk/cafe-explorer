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

// Optional: Clear search when page loads
window.addEventListener('load', function() {
    searchBar.value = '';
    noResults.style.display = 'none';
});