function toggleMenu() {
    var menu = document.getElementById("navLinks");
    menu.classList.toggle("show-menu");
}

const accountForm = document.getElementById('accountForm');
        
if(accountForm) {
    accountForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const bdayField = document.getElementById('userBirthDate');
        const newBday = bdayField.value;
        const locationField = document.getElementById('userLocation');
        const newLocation = locationField.value;

        const genderRadio = document.querySelector('input[name="gender"]:checked');
        const newGender = genderRadio ? genderRadio.value : "female"; // default to female if none found

        const sessionEmail = localStorage.getItem('currentUserEmail');

        // 2. Update the "Session"
        localStorage.setItem('currentUserBday', newBday);
        localStorage.setItem('currentUserLocation', newLocation);
        localStorage.setItem('currentUserGender', newGender);

        // 3. Update the "Permanent Database" (allUsers array)
        let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
        allUsers = allUsers.map(user => {
            if (user.email === sessionEmail) {
                return { 
                    ...user, 
                    birthday: newBday,
                    location: newLocation,
                    gender: newGender 
                };
            }
            return user;
        });

        localStorage.setItem('allUsers', JSON.stringify(allUsers));

        const saveBtn = document.querySelector('.save-account-btn');
                
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = 'var(--gradient-slider)';
        saveBtn.style.borderColor = 'transparent';

        setTimeout(() => {
            saveBtn.textContent = 'Save Changes';
            saveBtn.style.background = 'transparent';
            saveBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
            }, 2000);
        });
    }

document.addEventListener('DOMContentLoaded', function() {

    // for revising default display name & username //
    const displayHeaderName = document.getElementById('display-name');
    const displayHeaderUser = document.getElementById('display-username');
    const emailField = document.getElementById('userEmailInput');
    const passwordField = document.getElementById('userPasswordInput');
    const bdayField = document.getElementById('userBirthDate');
    const locationField = document.getElementById('userLocation');

    const savedEmail = localStorage.getItem('currentUserEmail');
    const savedPassword = localStorage.getItem('currentUserPassword');
    const savedDisplayName = localStorage.getItem('currentDisplayName');
    const savedUserName = localStorage.getItem('currentUserName');
    const savedBday = localStorage.getItem('currentUserBday');
    const savedLocation = localStorage.getItem('currentUserLocation');
    const savedGender = localStorage.getItem('currentUserGender');

    if (savedEmail && emailField) { emailField.value = savedEmail; }
    if (savedPassword && passwordField) { passwordField.value = savedPassword; }
    if (savedBday && bdayField) { bdayField.value = savedBday; }
    if (savedLocation && locationField) { locationField.value = savedLocation; }

    if (savedGender) {
        const genderOption = document.querySelector(`input[name="gender"][value="${savedGender}"]`);

        if (genderOption) { genderOption.checked = true; }
    }

    // for displaying revised display name & username //
    if (displayHeaderName) { displayHeaderName.textContent = savedDisplayName; }

    // FIX: Update Username Header (ensuring it has @)
    if (displayHeaderUser && savedUserName) {
        displayHeaderUser.textContent = savedUserName.startsWith('@') ? savedUserName : '@' + savedUserName;
    }


});

// modal popup functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10); 
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300); 
}

function changePasswordHandler() {

    const currentInput = document.getElementById('modalCurrentPassword');
    const newInput = document.getElementById('modalNewPassword');
    const confirmInput = document.getElementById('modalConfirmPassword');
    const displayPassField = document.getElementById('userPasswordInput');

    // 2. Get saved data
    const savedPassword = localStorage.getItem('currentUserPassword');
    const sessionEmail = localStorage.getItem('currentUserEmail');

    // 3. Validation Logic
    if (currentInput.value !== savedPassword) {
        alert("Current password is incorrect!");
        return;
    }

    if (newInput.value.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
    }

    if (newInput.value !== confirmInput.value) {
        alert("New passwords do not match!");
        return;
    }

    // 4. Update Database (allUsers array)
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    allUsers = allUsers.map(user => {
        if (user.email === sessionEmail) {
            return { ...user, password: newInput.value };
        }
        return user;
    });

    // 5. Save back to LocalStorage
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    localStorage.setItem('currentUserPassword', newInput.value);
    
    // 6. Update UI
    if (displayPassField) displayPassField.value = newInput.value;
    
    alert("Password updated successfully!");
    
    // 7. Cleanup
    currentInput.value = "";
    newInput.value = "";
    confirmInput.value = "";
    closeModal('passwordModal');

} 

function deleteAccountHandler() {
    // 1. Get the current user's email from the session
    const sessionEmail = localStorage.getItem('currentUserEmail');
    
    if (!sessionEmail) {
        alert("Error: No active session found.");
        return;
    }

    // 2. Load the permanent database
    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];

    // 3. Filter out the current user (Keep everyone EXCEPT the current email)
    const updatedUsers = allUsers.filter(user => user.email !== sessionEmail);

    // 4. Save the updated list back to LocalStorage
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    // 5. Clear all session data so they are officially "logged out"
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserPassword');
    localStorage.removeItem('currentDisplayName');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserBday');
    localStorage.removeItem('currentUserLocation');
    localStorage.removeItem('currentUserGender');
    localStorage.removeItem('currentUserPronouns');
    localStorage.removeItem('currentUserAbout');

    alert("Your account has been permanently deleted. We're sad to see you go!");

    // 6. Redirect to the login or index page
    window.location.href = 'login.html';
}

function logoutHandler() {
    // Clear all session data
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserPassword');
    localStorage.removeItem('currentDisplayName');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserBday');
    localStorage.removeItem('currentUserLocation');
    localStorage.removeItem('currentUserGender');
    localStorage.removeItem('currentUserPronouns');
    localStorage.removeItem('currentUserAbout');

    alert("You have been logged out.");

    // Redirect to the login or index page
    window.location.href = 'login.html';
}