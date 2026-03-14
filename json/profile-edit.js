document.addEventListener('DOMContentLoaded', function() {
        // --- 1. DOM ELEMENTS ---
    const profileForm = document.getElementById('profileForm');
    const fileInput = document.getElementById('fileInput');
    const headerPic = document.getElementById('headerProfilePic');
        
        // Input Fields
    const inputName = document.getElementById('input-name');
    const inputUsername = document.getElementById('input-username');
    const inputAbout = document.getElementById('input-about');
    const inputPronouns = document.getElementById('input-pronouns');
        
        // UI Display Elements
    const displayHeaderName = document.getElementById('display-name');
    const displayHeaderUser = document.getElementById('display-username');

        // Get the "Session" data from localStorage
    const sessionName = localStorage.getItem('currentDisplayName');
    const sessionUser = localStorage.getItem('currentUserName');
    const sessionPronouns = localStorage.getItem('currentUserPronouns') || "";
    const sessionAbout = localStorage.getItem('currentUserAbout');
    const sessionEmail = localStorage.getItem('currentUserEmail');
    
    

        // Fill the text headings in the header
    if (sessionName) {
        displayHeaderName.textContent = sessionName;
        inputName.value = sessionName;
    }

        // Pre-fill the input boxes so the user sees their current info
    if (sessionUser) {
        displayHeaderUser.textContent = sessionUser.startsWith('@') ? sessionUser : '@' + sessionUser;
        inputUsername.value = sessionUser.replace(/^@+/, ''); 
    }

    if (sessionPronouns) { inputPronouns.value = sessionPronouns; }
    if (sessionAbout) {inputAbout.value = sessionAbout; }

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) { headerPic.src = e.target.result; }
            reader.readAsDataURL(file);
            }
    });

    if (profileForm) {
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const newName = inputName.value;
            let newUsername = inputUsername.value;
            const newPronouns = inputPronouns.value;
            const newAbout = inputAbout.value;


            newUsername = '@' + newUsername.replace(/^@+/, '');

                // A. Update the "Session" (for immediate page use)
            localStorage.setItem('currentDisplayName', newName);
            localStorage.setItem('currentUserName', newUsername);
            localStorage.setItem('currentUserPronouns', newPronouns);
            localStorage.setItem('currentUserAbout', newAbout);

                // B. Update the visual UI labels immediately
            displayHeaderName.textContent = newName;
            displayHeaderUser.textContent = newUsername;

                // C. Update the "Permanent Database" (allUsers array)
            let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
                
                // Find the user by their email and update their object
            allUsers = allUsers.map(user => {
                if (user.email === sessionEmail) {
                    return { 
                        ...user, 
                        displayName: newName, 
                        userName: newUsername,
                        pronouns: newPronouns,
                        about: newAbout 
                    };
                }
                return user;
            });
                
            localStorage.setItem('allUsers', JSON.stringify(allUsers));

            const saveBtn = document.querySelector('.save-btn');
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = 'var(--gradient-main, #6e48aa)'; // fallback color
            saveBtn.style.color = 'white';
                
            setTimeout(() => {
                saveBtn.textContent = 'Save Changes';
                saveBtn.style.background = 'transparent';
                saveBtn.style.color = 'inherit';
                }, 2000);

                console.log("Database updated for:", sessionEmail);
            });
    }
});