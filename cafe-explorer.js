// Get DOM elements
const searchBar = document.getElementById("searchBar");
const cafeList = document.getElementById("cafeList");
const cafes = cafeList.getElementsByTagName("li");

// Create a "No cafés found" message element
const noResults = document.createElement("p");
noResults.textContent = "❌ No cafés found";
noResults.style.color = "#a83d6a"; // dark pink
noResults.style.fontWeight = "bold";
noResults.style.display = "none"; // hidden by default
noResults.style.marginTop = "10px";
cafeList.parentNode.appendChild(noResults);

// Search functionality
searchBar.addEventListener("keyup", function () {
  const query = searchBar.value.toLowerCase();
  let found = false;

  for (let cafe of cafes) {
    let cafeName = cafe.textContent.toLowerCase();
    if (cafeName.includes(query)) {
      cafe.style.display = "";
      found = true;
    } else {
      cafe.style.display = "none";
    }
  }

  // Show "no results" message if nothing matches
  noResults.style.display = found ? "none" : "block";
});

// Optional: Sort by rating functionality
const sortDropdown = document.getElementById("sortRating");
if (sortDropdown) {
  sortDropdown.addEventListener("change", function () {
    let cafeArray = Array.from(cafes);

    cafeArray.sort((a, b) => {
      let ratingA = parseFloat(a.getAttribute("data-rating"));
      let ratingB = parseFloat(b.getAttribute("data-rating"));
      return sortDropdown.value === "high"
        ? ratingB - ratingA
        : ratingA - ratingB;
    });

    cafeArray.forEach(cafe => cafeList.appendChild(cafe));
  });
}

