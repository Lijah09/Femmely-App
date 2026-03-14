function toggleMenu() {
    var menu = document.getElementById("navLinks");
    menu.classList.toggle("show-menu"); }

    document.addEventListener('DOMContentLoaded', function() {
    const headerElement = document.getElementById('header');
    const displayName = localStorage.getItem('currentDisplayName');

    if (headerElement && displayName) { 
        headerElement.textContent = `How can we help you, ${displayName}?`;
}

    });