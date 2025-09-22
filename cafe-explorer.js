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

