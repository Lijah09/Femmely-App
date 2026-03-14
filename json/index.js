function toggleMenu() {
    
    var menu = document.getElementById("navLinks");
    menu.classList.toggle("show-menu");

}

const user = JSON.parse(localStorage.getItem("user"));
const isLoggedIn = false;

