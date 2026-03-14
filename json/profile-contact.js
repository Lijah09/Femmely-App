function toggleMenu() {
    var menu = document.getElementById("navLinks");
    menu.classList.toggle("show-menu");
}

document.addEventListener('DOMContentLoaded', function() {
    const headerElement = document.getElementById('header');
    const displayName = localStorage.getItem('currentDisplayName');
    const userEmail = localStorage.getItem('currentUserEmail');
    const emailInput = document.querySelector('input[type="email"]');

        // Update the greeting text
    if (headerElement && displayName) {
        headerElement.textContent = `Your voice matters to us, ${displayName}.`;
    }

    if (emailInput && userEmail) { emailInput.value = userEmail; }
});

const fileInput = document.getElementById('fileInput');
const headerPic = document.getElementById('headerProfilePic');

if(fileInput && headerPic) {
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) { headerPic.src = e.target.result; }
                    reader.readAsDataURL(file);
        }
    });
}

const contactForm = document.getElementById('contactForm');
        
if(contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();  

        const submitBtn = document.querySelector('.submit-contact-btn');
                
        submitBtn.textContent = 'Sent!';
        submitBtn.style.background = 'var(--gradient-slider)';
        submitBtn.style.borderColor = 'transparent';
                
        setTimeout(() => {
            submitBtn.textContent = 'Submit';
            submitBtn.style.background = 'transparent';
            submitBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                    
            document.querySelector('textarea').value = ''; 
        }, 2000);
        
    });
}