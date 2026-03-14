// 1. Setup the Map
var map = L.map('map').setView([14.566777072862143, 121.01500677903577], 17); 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. State Variables
let isPinningMode = false;
let tempLatLng = null; 
let activeMarkerLayer = null; 

// ui eleemnts
const pinBtn = document.getElementById('pinLocationBtn');
const femCareForm = document.getElementById('FemSafeForm'); // Recommend renaming ID to FemCareForm in HTML
const streetDashboard = document.getElementById('streetDashboard');
const streetDashboardRating = document.getElementById('streetDashboardRating');
const streetDashboardStats = document.getElementById('streetDashboardStats');
const streetDashboardComments = document.getElementById('streetDashboardComments');

const sdFormBtn = document.getElementById('sdFormBtn');
const fcCancelBtn = document.getElementById('fcCancelBtn');
const fcSubmitBtn = document.getElementById('fcSubmitBtn');
const careCategory = document.getElementById('care-category');

let commentCounter = 0;
const sdCommentNone = document.getElementById('sdCommentNone');
const sdComment1 = document.getElementById('sdComment1');

function updateCommentsView() {
    if (commentCounter > 0) {
        sdCommentNone.classList.add("hidden");
        sdComment1.classList.remove("hidden");
    } else {
        sdCommentNone.classList.remove("hidden");
        sdComment1.classList.add("hidden");
    }
}

// ui funcs
// UI STATE FUNCTIONS
function hideDashboard() {
    streetDashboard.style.display = "none";
}

function showDashboard() {
    streetDashboard.style.display = "flex";
}

function showDashboardSections() {
    streetDashboardRating.style.display = "flex";
    streetDashboardStats.style.display = "flex";
    streetDashboardComments.style.display = "flex";
}

function hideDashboardSections() {
    streetDashboardRating.style.display = "none";
    streetDashboardStats.style.display = "none";
    streetDashboardComments.style.display = "none";
}

function openForm() {
    hideDashboardSections();
    femCareForm.style.display = "flex";
}

function closeForm() {
    femCareForm.style.display = "none";
    showDashboardSections();
}

// INITIAL STATE
hideDashboard();
femCareForm.style.display = "none";
hideDashboardSections();

// groups for markers
var tempMarkerGroup = L.featureGroup().addTo(map); 
var savedMarkersGroup = L.layerGroup().addTo(map);

// categories & Colors Configuration
const categories = {
    'initial': { name: 'Initial Pin', color: '#ffffff' }, // Default white pin before rating
    'total': { name: 'Total Fem-care', color: '#a06cd5' },
    'sanitary': { name: 'Sanitary Care', color: '#fffa96' },
    'beauty': { name: 'Beauty', color: '#ffb38a' },
    'services': { name: 'Services', color: '#66ff99' } 
};

// Custom Icon Generator
function createPinIcon(color, isSaved = false) {
    // If it's saved, make the border transparent. Otherwise, keep it white.
    const borderStyle = isSaved ? '2px solid transparent' : '2px solid rgb(255, 255, 255)';
    
    return L.divIcon({
        className: 'custom-pin-container', 
        html: `<div class="custom-pin-icon" style="background-color: ${color}; border: ${borderStyle};"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24], 
        popupAnchor: [0, -24] 
    });
}

// 5. Toggle Pinning Mode
pinBtn.addEventListener('click', () => {

    isPinningMode = !isPinningMode;

    if (isPinningMode) {

        pinBtn.classList.add('active');
        pinBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel Pinning';
        map.getContainer().style.cursor = 'crosshair';

    } else {

        pinBtn.classList.remove('active');
        pinBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i> Pin a Fem-care Location';
        map.getContainer().style.cursor = '';

        tempMarkerGroup.clearLayers();
        hideDashboard();
        closeForm();
    }

});

// 6. Map Click Logic
map.on('click', async function(e) {
    if (!isPinningMode) {
        hideDashboard();
        closeForm();
        return;
    }

    document.getElementById('mapTip').style.display = 'none';
    
    tempLatLng = e.latlng;
    tempMarkerGroup.clearLayers(); 
    
    // Drop pin
    activeMarkerLayer = L.marker(tempLatLng, { icon: createPinIcon(categories['initial'].color) });
    tempMarkerGroup.addLayer(activeMarkerLayer);
    
    let loadingPopup = L.popup()
        .setLatLng(tempLatLng)
        .setContent("Finding location details...")
        .openOn(map);

    const lat = tempLatLng.lat;
    const lng = tempLatLng.lng;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];way["highway"]["name"](around:20, ${lat}, ${lng});out tags;`)}`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
    let streetName = "Unnamed Location";
    let cityName = "Unknown City";
    let provinceName = "";

    try {
        try {
            const overpassRes = await fetch(overpassUrl);
            if (overpassRes.ok) {
                const data = await overpassRes.json();
                if (data.elements && data.elements.length > 0) {
                    streetName = data.elements[0].tags.name || "Unnamed Street";
                }
            }
        } catch (opErr) {
            console.warn("Overpass API failed:", opErr);
        }
        try {
            const nominatimRes = await fetch(nominatimUrl, {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    // 'User-Agent': 'FemmelyApp/1.0 (your@email.com)' // Uncomment and add your email in production
                }
            });
            
            if (nominatimRes.ok) {
                const addressData = await nominatimRes.json();
                const addr = addressData.address || {};
                
                // If Overpass didn't find a street, try Nominatim's guess
                if (streetName === "Unnamed Location" || streetName === "Unnamed Street") {
                    streetName = addr.road || addr.pedestrian || addr.neighbourhood || "Unnamed Location";
                }
                
                cityName = addr.city || addr.town || addr.municipality || "Unknown City";
                provinceName = addr.province || addr.region || addr.state || "";
            }
        } catch (nomErr) {
            console.warn("Nominatim API failed:", nomErr);
        }

        // --- 3. Update UI Dashboard ---
        document.getElementById('sd-street').textContent = streetName;
        document.getElementById('sd-city').textContent = `${cityName}${provinceName ? ', ' + provinceName : ''}`;

        map.closePopup(loadingPopup);
        activeMarkerLayer.bindPopup("Location pinned! Give it a fem-care rating.").openPopup();

        commentCounter = 0;
        updateCommentsView();

        // Show dashboard ready for input
        showDashboard();
        closeForm();

        // Show dashboard ready for input
        showDashboard();
        closeForm();

    } catch (error) {
        // This catch block will only hit if something fundamentally breaks
        console.error("Critical Error fetching location:", error);
        loadingPopup.setContent("Could not load address data. Please try again.");
    }
});

// 7. Update Pin Color when Dropdown changes
careCategory.addEventListener('change', function() {
    if (activeMarkerLayer) {
        const selectedColor = categories[this.value].color;
        activeMarkerLayer.setIcon(createPinIcon(selectedColor));
    }
});

// 8. Open Form
sdFormBtn.addEventListener('click', openForm);

// 9. Cancel Form
fcCancelBtn.addEventListener('click', function(e) {
    e.preventDefault();

    closeForm();
    femCareForm.reset();

    // Reset the visual slider UI
    ratingText.textContent = "Slide to rate...";
    ratingText.style.color = "#ffffff";
    ratingHeart.style.color = "#333";
});


// 10. Submit & Save Pin
femCareForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    if (!tempLatLng || !activeMarkerLayer) return;

    const typedName = document.getElementById('sd-street').textContent;
    const locComment = document.getElementById('fc-comment').value;
    
    // Get the rating and color from the SLIDER
    const sliderVal = document.getElementById('care-slider').value;
    const finalRating = ratings[sliderVal];
    const ratingLabel = finalRating.name;

    activeMarkerLayer.setIcon(createPinIcon(finalRating.color, true));

    // Remove from temp group, add to permanent saved group
    tempMarkerGroup.clearLayers(); 
    savedMarkersGroup.addLayer(activeMarkerLayer);

    // Set permanent popup content
    activeMarkerLayer.bindPopup(`
    <div class="popup-content">
    <b style="font-size:14px;color:#A06CD5;">${typedName}</b><br>
    <hr style="margin:5px 0;border:0.5px solid #eee;">
    <b>Care Rating:</b> ${ratingLabel}<br>
    <b>Note:</b> ${locComment}
    </div>
    `).openPopup(); // Opens it instantly so they see it saved!

    // Update the Dashboard Comments UI
    commentCounter++;
    document.getElementById('sd-comment-name').textContent = "You"; 
    document.getElementById('sd-comment-rating').textContent = `Rated ${ratingLabel}`;
    document.getElementById('sd-comment-content').textContent = locComment;

    updateCommentsView();

    // Reset UI for next pin
    activeMarkerLayer = null;
    tempLatLng = null;
    isPinningMode = false;
    pinBtn.classList.remove('active');
    pinBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i> Pin a Fem-care Location';
    map.getContainer().style.cursor = '';
    
    // Notice we DO NOT hideDashboard() here, so they can see their comment!
    closeForm(); 
    femCareForm.reset();

    // Reset Slider UI
    ratingText.textContent = "Slide to rate...";
    ratingText.style.color = "#ffffff";
    ratingHeart.style.color = "#333";
});

// Grab the slider and UI elements
const safetySlider = document.getElementById('care-slider');
const ratingHeart = document.getElementById('rating-heart');
const ratingText = document.getElementById('rating-text');

// Listen for the slider being dragged
safetySlider.addEventListener('input', function() {
    const currentValue = this.value;
    
    // Get the rating data based on the slider's value
    const currentRating = ratings[currentValue];

    if (currentRating) {
        // 1. Update the UI text and heart color
        ratingText.textContent = currentRating.name;
        ratingText.style.color = currentRating.color;
        ratingHeart.style.color = currentRating.color;

        // 2. Update the map pin color dynamically!
        if (activeMarkerLayer) {
            activeMarkerLayer.setIcon(createPinIcon(currentRating.color, false));
        }
    }
});

const ratings = {
    1: { name: "Sanitary", color: "#fffa96" },
    2: { name: "Beauty", color: "#ffb38a" },
    3: { name: "Services", color: "#8aff8a" },
    4: { name: "Total Fem-Care", color: "#a06cd5" }
};