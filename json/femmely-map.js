function selectMode(mode, shouldRedirect = true) {
    
    const dot = document.getElementById('slidingDot');
    const safeText = document.querySelector('.safe-text');
    const careText = document.querySelector('.care-text');
    const modeColorPill = document.getElementById('modeColorPill');
    const fmCard = document.getElementById('fmCard');

    //mini toggle elements
    const miniDot = document.getElementById('mini-slidingDot');
    const miniSafeText = document.querySelector('.mini-safe-text'); 
    const miniCareText = document.querySelector('.mini-care-text');
    const miniModeColorPill = document.getElementById('miniColorPill');
    const fmTitle = document.getElementById('fmTitle');

    const currentPage = window.location.pathname.split('/').pop();
    
    if (mode === 'safe') {

        if (dot) dot.className = 'toggle-dot dot-left'; 
        if (safeText) { safeText.classList.remove('text-inactive'); safeText.classList.add('text-active1'); }
        if (careText) { careText.classList.remove('text-active2'); careText.classList.add('text-inactive'); }
        if (modeColorPill) modeColorPill.style.backgroundColor = '#FF66C4';


        if (fmCard) fmCard.style.background = 'linear-gradient(90deg, #ff71be, #d34893, #ff71be)'; 
        if (fmTitle) fmTitle.textContent = 'Femmely Map > Fem-safe Mode'; 


        if (miniDot) miniDot.className = 'mini-toggle-dot mini-dot-left'; 
        if (miniSafeText) { miniSafeText.classList.remove('mini-text-inactive'); miniSafeText.classList.add('mini-text-active1'); }
        if (miniCareText) { miniCareText.classList.remove('mini-text-active2'); miniCareText.classList.add('mini-text-inactive'); }
        if (miniModeColorPill) miniModeColorPill.style.backgroundColor = '#FF66C4';

        if (shouldRedirect && currentPage !== "femmely-map-fem-safe.html") {
            setTimeout(() => {
                window.location.href = "femmely-map-fem-safe.html";
            }, 500); 
        }

    } else if (mode === 'care') {

        if (dot) dot.className = 'toggle-dot dot-right'; 
        if (careText) { careText.classList.remove('text-inactive'); careText.classList.add('text-active2'); }
        if (safeText) { safeText.classList.remove('text-active1'); safeText.classList.add('text-inactive'); }
        if (modeColorPill) modeColorPill.style.backgroundColor = '#a06cd5';

        if (fmCard) fmCard.style.background = 'linear-gradient(90deg, #a06cd5, #593d76, #a06cd5)';
        if (fmTitle) fmTitle.textContent = 'Femmely Map > Fem-care Mode';

        if (miniDot) miniDot.className = 'mini-toggle-dot mini-dot-right'; 
        if (miniCareText) { miniCareText.classList.remove('mini-text-inactive'); miniCareText.classList.add('mini-text-active2'); }
        if (miniSafeText) { miniSafeText.classList.remove('mini-text-active1'); miniSafeText.classList.add('mini-text-inactive'); }
        if (miniModeColorPill) miniModeColorPill.style.backgroundColor = '#a06cd5';

        if (shouldRedirect && currentPage !== "femmely-map-fem-care.html") {
                    setTimeout(() => {
                        window.location.href = "femmely-map-fem-care.html";
                    }, 500);
                }        
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === "femmely-map-fem-safe.html") {
        selectMode('safe', false);
    } else if (currentPage === "femmely-map-fem-care.html") {
        selectMode('care', false);
    }
});