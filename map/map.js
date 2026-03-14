// 1. Setup the Makati/Taguig View
var map = L.map('map').setView([14.5485, 121.0375], 18); 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var tempLatLng; 
var marker;

// 2. Click to select the spot
map.on('click', function(e) {
    tempLatLng = e.latlng;
    
    if (marker) { map.removeLayer(marker); }
    
    marker = L.circleMarker(e.latlng, { 
        radius: 10, 
        color: '#000',
        fillColor: '#fff',
        fillOpacity: 0.5 
    }).addTo(map);
    
    marker.bindPopup("Spot selected! Now enter a name in the form.").openPopup();

    // CHANGE: We clear the input instead of putting coordinates
    document.getElementById('location').value = ""; 
    document.getElementById('location').placeholder = "Enter Location Name (e.g. BGC)...";
    document.getElementById('location').focus(); // Automatically clicks into the box for them
});

// 3. Submit to "save" the name to the map
document.getElementById('FemSafeForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    if (!tempLatLng) {
        alert("Please click a location on the map first!");
        return;
    }

    // Capture the USER'S typed name
    const typedName = document.getElementById('location').value || "Unnamed Spot";
    const locComment = document.getElementById('comment').value;
    
    let selectedRating = "No rating";
    const ratings = document.querySelectorAll('.rating');
    ratings.forEach(radio => {
        if (radio.checked) selectedRating = radio.value;
    });

    // 4. Update the "Big Hotspot"
    marker.setStyle({
        radius: 30,
        fillColor: "#00ead3",
        color: "#000",
        weight: 3,
        fillOpacity: 0.9
    });

    marker.bindPopup(`
        <div style="font-family: Arial;">
            <b style="font-size: 14px; color: #008b8b;">${typedName}</b><br>
            <hr style="margin: 5px 0; border: 0.5px solid #eee;">
            <b>Rating:</b> ${selectedRating} / 5 ⭐<br>
            <b>Note:</b> ${locComment}
        </div>
    `).openPopup();
});
