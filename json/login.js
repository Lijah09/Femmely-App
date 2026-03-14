const emailInput = document.querySelector('.login-container input[type="email"]');
const passwordInput = document.querySelector('.login-container input[type="password"]');

const registerBtn = document.querySelector('#content-register .login-submit');
const loginBtn = document.querySelector('#content-login .login-submit');

// --- REGISTRATION LOGIC ---
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (email && password) {
            const users = JSON.parse(localStorage.getItem('allUsers')) || [];
            
            const isDuplicate = users.some(user => user.email == email);
            if (isDuplicate) {
                alert('This email is already registered!');
                emailInput.value = "";
                passwordInput.value = "";
                return;
            }

            const previewImg = document.getElementById('image-preview');
            let base64Image = null;
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                base64Image = previewImg.src;
            } else {
                alert("Please upload an ID to request clearance!");
                return;
            }

            const usersNum = users.length + 1;
            const formattedNumber = usersNum.toString().padStart(3, '0');
            const defaultUsername = "user" + formattedNumber;

            users.push({
                email, 
                password, 
                idImage: base64Image,
                status: "pending",
                displayName: "Member " + usersNum, 
                userName: defaultUsername,
                pronouns: "She/Her",
                about: "",
                birthday: "",
                location: "",
                gender: "",
                status: "pending"
            });
            localStorage.setItem('allUsers', JSON.stringify(users));

            let adminQueue = JSON.parse(localStorage.getItem('femmelyAdminQueue')) || [];
            adminQueue.unshift({
                name: "Member " + usersNum,
                email: email,
                time: new Date().toLocaleTimeString(),
                image: base64Image 
            });
            localStorage.setItem('femmelyAdminQueue', JSON.stringify(adminQueue));

            // send welcome email -- eli
            welcomeEmail(email);

            alert('Thanks for registering! Your ID is being reviewed. You may login now.');
            
            emailInput.value = "";
            passwordInput.value = "";
            //switchTab('login'); 
        }
    });
}

// --- LOGIN LOGIC ---
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (email === 'hq@femmely.com' && password === 'admin123') {
            window.location.href = 'admin.html'; 
            return;
        }

        const users = JSON.parse(localStorage.getItem('allUsers')) || [];
        const matchedUser = users.find(user => user.email === email && user.password === password);

        if (matchedUser) {
            localStorage.setItem('currentUserEmail', matchedUser.email);
            localStorage.setItem('currentUserPassword', matchedUser.password);
            localStorage.setItem('currentDisplayName', matchedUser.displayName || "New User");
            localStorage.setItem('currentUserName', matchedUser.userName);
            localStorage.setItem('currentUserPronouns', matchedUser.pronouns);
            localStorage.setItem('currentUserAbout', matchedUser.about);
            localStorage.setItem('currentUserBday', matchedUser.birthday);
            localStorage.setItem('currentUserLocation', matchedUser.location);
            localStorage.setItem('currentUserGender', matchedUser.gender);

            localStorage.setItem('currentUserIDImage', matchedUser.idImage || "");
            localStorage.setItem('currentUserStatus', matchedUser.status || "guest");


            alert("Login Successful! Welcome back.");
            window.location.href = "profile-account.html";
        } else {
            alert("Invalid email or password. Please try again.");
            emailInput.value = "";
            passwordInput.value = "";
        }
    });
}

// email confirmation logic -- eli
function welcomeEmail(userEmail) {
    emailjs.send("service_qilo4jm", "template_byapgpd", {
        to_email: userEmail,
        message: "Welcome to our community!"
    })
    .then(() => {
        console.log("Email sent successfully!");
    })
    .catch((error) => {
        console.error("Failed to send email:", error);
    });
}