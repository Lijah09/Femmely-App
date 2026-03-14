// 1. Setup the Makati/Taguig View
var map = L.map('map').setView([14.566777072862143, 121.01500677903577], 17); 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var tempLatLng; 
// Create a group to hold our multi-layered street (border + inner line)
var selectedStreetGroup = L.featureGroup().addTo(map); 
var activeStreetLayer; // We'll keep a reference to the inner line for popups

const femSafeForm = document.getElementById('FemSafeForm');
const streetDashboard = document.getElementById('streetDashboard');
const streetDashboardRating = document.getElementById('streetDashboardRating');
const streetDashboardStats = document.getElementById('streetDashboardStats');
const streetDashboardComments = document.getElementById('streetDashboardComments');

femSafeForm.style.display = 'none';
streetDashboard.style.display = 'none';
streetDashboardRating.style.display = 'none';
streetDashboardStats.style.display = 'none';
streetDashboardComments.style.display = 'none';

//comment function>sdsd
let commentCounter = 0;
const sdCommentNone = document.getElementById('sdCommentNone');
const sdComment1 = document.getElementById('sdComment1');

//fomr buttons
const sdFormBtn = document.getElementById('sdFormBtn');
const fsCancelBtn = document.getElementById('fsCancelBtn');
const fsSubmitBtn = document.getElementById('fsSubmitBtn');

//saving the segments from form submission
var savedStreetsGroup = L.layerGroup().addTo(map);


//  select the street
map.on('click', async function(e) {
    femSafeForm.style.display = 'none';
    streetDashboard.style.display = 'none';
    streetDashboardRating.style.display = 'flex';
    streetDashboardStats.style.display = 'flex';
    streetDashboardComments.style.display = 'flex'; 
    
    tempLatLng = e.latlng;
    
    // clear previously selected street (removes both border and inner line instantly)
    selectedStreetGroup.clearLayers();
    
    // temp loading popup
    let loadingPopup = L.popup()
        .setLatLng(tempLatLng)
        .setContent("Finding nearest street...")
        .openOn(map);

    const lat = tempLatLng.lat;
    const lng = tempLatLng.lng;

    // QUERY 1: Overpass (For the Street Lines)
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];way["highway"]["name"](around:20, ${lat}, ${lng});out geom;`)}`;
    
    // QUERY 2: Nominatim (For City and Province)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
try {
        // Fetch both at the same time for speed
        const [overpassRes, nominatimRes] = await Promise.all([
            fetch(overpassUrl),
            fetch(nominatimUrl)
        ]);
        
        const data = await overpassRes.json();
        const addressData = await nominatimRes.json();

        if (data.elements && data.elements.length > 0) {
            femSafeForm.style.display = 'none';
            streetDashboard.style.display = 'block';
            streetDashboardRating.style.display = 'flex';
            streetDashboardStats.style.display = 'flex';
            streetDashboardComments.style.display = 'flex'; 

            const way = data.elements[0];
            const latlngs = way.geometry.map(geom => [geom.lat, geom.lon]);

            map.closePopup(loadingPopup);
            // Street Drawing Logic
            const selectedStreet = L.polyline(latlngs, {
                color: '#ffffff', 
                weight: 12, opacity: 1, 
                lineCap: 'round', 
                lineJoin: 'round'
            });

            activeStreetLayer = L.polyline(latlngs, {
                color: '#0b0b0b',
                weight: 11, 
                opacity: 1, 
                lineCap: 'round', 
                lineJoin: 'round'
            });

            selectedStreetGroup.addLayer(selectedStreet);
            selectedStreetGroup.addLayer(activeStreetLayer);
            
            // Extract Address Parts
            const addr = addressData.address;
            const streetName = way.tags.name || addr.road || "Unnamed Street";
            
            //city is usually addr.city or addr.town
            const cityName = addr.city || addr.town || addr.municipality || "Unknown City";
            
            //province is usually addr.province or addr.region (for Metro Manila)
            const provinceName = addr.province || addr.region || addr.state || "";

            // Update Dashboard Text
            document.getElementById('sd-street').textContent = streetName;
            document.getElementById('sd-city').textContent = `${cityName}${provinceName ? ', ' + provinceName : ''}`;

            document.getElementById('mapTip').style.display = 'none';

            activeStreetLayer.bindPopup("Street segment selected! Now fill out the form.").openPopup();

            // Show the dashboard
            streetDashboard.style.display = 'flex';
            
    
            renderStreetComments(streetName);
            renderStreetStats(streetName);


        } else {
            loadingPopup.setContent("No street found nearby.");
            tempLatLng = null;
        }
    } catch (error) {
        console.error("Error:", error);
        loadingPopup.setContent("Error loading data.");
    }
});

function updateCommentsView() {
    if (commentCounter > 0) {
        sdCommentNone.classList.add("hidden");
        sdComment1.classList.remove("hidden");
    } else {
        sdCommentNone.classList.remove("hidden");
        sdComment1.classList.add("hidden");
    }
}

sdFormBtn.addEventListener('click', function() {
                console.log("sdFormBtn clicked!");
                streetDashboardRating.style.display = 'none'; 
                femSafeForm.style.display = 'flex';
                streetDashboardStats.style.display = 'none';
                streetDashboardComments.style.display = 'none';
            });

fsCancelBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log("fsCancelBtn button clicked!");

    streetDashboardRating.style.display = 'flex'; 
    femSafeForm.style.display = 'none';
    streetDashboardStats.style.display = 'flex';
    streetDashboardComments.style.display = 'flex';

    updateCommentsView();
    selectedStreetGroup.clearLayers();

    document.getElementById('FemSafeForm').reset();
    
    // 4. Reset the visual slider UI (Heart and Text) back to default
    document.getElementById('rating-text').textContent = "Slide to rate...";
    document.getElementById('rating-text').style.color = "#ffffff";
    document.getElementById('rating-text').style.backgroundColor = "transparent";
    document.getElementById('rating-heart').style.color = "#333"; 
    document.getElementById('rating-heart').style.transform = "scale(0.8)"; 
    document.getElementById('rating-heart').style.filter = "drop-shadow(0 0 10px rgba(0,0,0,0.5))";
    });
        

// 3. Submit to "save" the street to the map
document.getElementById('FemSafeForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    console.log("Form submitted!");
    if (!tempLatLng || !activeStreetLayer) {
        alert("Please click a street on the map first!");
        return;
    }

    const typedName = document.getElementById('sd-street').textContent || "Unnamed Street";
    const locComment = document.getElementById('fs-comment').value;
    
    // Get the rating and color from the slider
    const sliderVal = document.getElementById('safety-slider').value;
    const finalRating = ratings[sliderVal];
    const ratingLabel = finalRating.name;

        // Update style
    activeStreetLayer.setStyle({ color: finalRating.color, opacity: 1 });

    // Remove from selected group
    selectedStreetGroup.clearLayers();  // <- only clear selected street BEFORE adding to saved group

    // Add to saved group
    savedStreetsGroup.addLayer(activeStreetLayer);


    // Update the permanent popup
    activeStreetLayer.bindPopup(`
        <div class="popup-content">
            <b style="font-size: 14px; color: #FF66C4;">${typedName}</b><br>
            <hr style="margin: 5px 0; border: 0.5px solid #eee;">
            <b>Rating:</b> ${ratingLabel}<br>
            <b>Note:</b> ${locComment}
        </div>
    `).openPopup();

    activeStreetLayer = null;
    tempLatLng = null;

    // Update the Dashboard Comments
    commentCounter++;
    document.getElementById('sd-comment-name').textContent = "You"; 
    document.getElementById('sd-comment-rating').textContent = `Rated ${ratingLabel}`;
    document.getElementById('sd-comment-content').textContent = locComment;

    // Toggle visibility and reset UI
    updateCommentsView();
    
    femSafeForm.style.display = 'none';
    streetDashboardRating.style.display = 'flex';
    streetDashboardStats.style.display = 'flex';
    streetDashboardComments.style.display = 'flex';

    // Clear variables so next click starts fresh
    tempLatLng = null;
    activeStreetLayer = null;
    
    // Reset the form fields and slider UI for the next street
    this.reset();
    document.getElementById('rating-text').textContent = "Slide to rate...";
    document.getElementById('rating-text').style.color = "#ffffff";
    document.getElementById('rating-text').style.backgroundColor = "transparent";
    document.getElementById('rating-heart').style.color = "#333"; // Resets heart to default
    document.getElementById('rating-heart').style.transform = "scale(0.8)"; 
    document.getElementById('rating-heart').style.filter = "drop-shadow(0 0 10px rgba(0,0,0,0.5))";
});

const slider = document.getElementById('safety-slider');
const heart = document.getElementById('rating-heart');
const text = document.getElementById('rating-text');

const ratings = {
    1: { name: "High-Risk Area", color: "#FFB38a" },    // Orange
    2: { name: "Frequent Concerns", color: "#8aff8a" }, // Green
    3: { name: "Mixed Experiences", color: "#FFF9A6" }, // Yellow
    4: { name: "Generally Safe", color: "#d896ff" },    // Purple
    5: { name: "Fem-safe", color: "#FF66C4" }           // Pink
};

slider.addEventListener('input', function() {
    const val = this.value;
    const rating = ratings[val];
    
    // upd text and color
    text.textContent = rating.name;
    text.style.color = "#000";
    text.style.backgroundColor = rating.color;
    
    // change sa heart
    heart.style.color = rating.color;
    heart.style.transform = `scale(${0.8 + (val * 0.1)})`; // Heart grows as it gets safer
    heart.style.filter = `drop-shadow(0 0 15px ${rating.color})`;

    if (activeStreetLayer) {  
        activeStreetLayer.setStyle({ opacity: 1 });
        activeStreetLayer.setStyle({ color: rating.color });
    }
});

// replace this block in your submit handler:
// "// Update the Dashboard Comments"

const currentUserName = localStorage.getItem('currentUserName') || "Anonymous";
const streetName = document.getElementById('sd-street').textContent;
const sliderVal = document.getElementById('safety-slider').value;
    const finalRating = ratings[sliderVal];
    const ratingLabel = finalRating.name;
    

// save to localStorage
let femSafeRatings = JSON.parse(localStorage.getItem('femSafeRatings')) || {};
if (!femSafeRatings[streetName]) femSafeRatings[streetName] = [];
femSafeRatings[streetName].unshift({
    author: currentUserName,
    rating: slider.value,
    ratingLabel: ratingLabel,
    comment: locComment,    
    timestamp: new Date().toLocaleString()
});
localStorage.setItem('femSafeRatings', JSON.stringify(femSafeRatings));

// refresh the comments display
commentCounter++;
renderStreetComments(streetName);
renderStreetStats(streetName);

function renderStreetComments(streetName) {
    const femSafeRatings = JSON.parse(localStorage.getItem('femSafeRatings')) || {};
    const entries = femSafeRatings[streetName] || [];

    // remove previously rendered dynamic comments
    document.querySelectorAll('.sd-comment-dynamic').forEach(el => el.remove());

    if (entries.length === 0) {
        sdCommentNone.classList.remove('hidden');
        return;
    }

    sdCommentNone.classList.add('hidden');

    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'sd-comment sd-comment-dynamic';
        div.innerHTML = `
            <div class="sd-comment-header">
                <div class="sd-comment-name">${entry.author}</div> | 
                <div class="sd-comment-rating">Rated ${entry.ratingLabel}</div>
                <div style="font-size:0.75rem; color:#aaa; margin-left:auto;">${entry.timestamp}</div>
            </div>
            <p class="sd-comment-content">${entry.comment}</p>
        `;
        streetDashboardComments.appendChild(div);
    });
}

function renderStreetStats(streetName) {
    const femSafeRatings = JSON.parse(localStorage.getItem('femSafeRatings')) || {};
    const entries = femSafeRatings[streetName] || [];

    if (entries.length === 0) {
        streetDashboardStats.innerHTML = `<i class="fa-solid fa-heart-pulse"></i><span> No ratings yet for this street.</span>`;
        return;
    }

    const avg = (entries.reduce((sum, e) => sum + parseInt(e.rating), 0) / entries.length).toFixed(1);
    const rounded = Math.round(avg);
    const label = ratings[rounded].name;
    const color = ratings[rounded].color;

    streetDashboardStats.innerHTML = `
        <i class="fa-solid fa-heart-pulse" style="color:${color}"></i>
        <span> Avg: <b style="color:${color}">${avg}/5</b> — ${label} · <b>${entries.length}</b> report${entries.length > 1 ? 's' : ''}</span>
    `;
}

// reload saved street colors on page load
function reloadSavedStreets() {
    const femSafeRatings = JSON.parse(localStorage.getItem('femSafeRatings')) || {};
    
    Object.entries(femSafeRatings).forEach(([streetName, entries]) => {
        if (entries.length === 0) return;

        // use the most recent rating's color
        const latestRating = entries[0].rating;
        const color = ratings[latestRating].color;

        // we don't have geometry saved, so just note: full geometry persistence
        // would require saving latlngs to localStorage too (see note below)
        console.log(`${streetName} has ${entries.length} ratings, latest: ${color}`);
    });
}

const streetLatlngs = activeStreetLayer.getLatLngs().map(p => [p.lat, p.lng]);

if (!femSafeRatings[streetName]) femSafeRatings[streetName] = [];
femSafeRatings[streetName].unshift({
    author: currentUserName,
    rating: sliderVal,
    ratingLabel: ratingLabel,
    comment: locComment,
    timestamp: new Date().toLocaleString(),
    latlngs: streetLatlngs 
});
localStorage.setItem('femSafeRatings', JSON.stringify(femSafeRatings));

reloadSavedStreets();

