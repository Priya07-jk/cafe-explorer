<<<<<<< HEAD
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
=======
// Search functionality
const searchBar = document.getElementById("searchBar");
const cafeList = document.getElementById("cafeList");
const cafes = cafeList.getElementsByTagName("li");

searchBar.addEventListener("keyup", function () {
  const query = searchBar.value.toLowerCase();
  for (let cafe of cafes) {
    let cafeName = cafe.textContent.toLowerCase();
    cafe.style.display = cafeName.includes(query) ? "" : "none";
  }
});

>>>>>>> 855e5dd0d164b81c634bc1cb401906d279f7f585
