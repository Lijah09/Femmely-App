function getCurrentUser() {
    const email = localStorage.getItem("currentUserEmail");
    const status = localStorage.getItem("currentUserStatus");

    if (!email) return null;
    return { email, status };
}

function isLoggedIn() {
    const user = getCurrentUser();
    return user !== null;
}

function isVerified() {
    const user = getCurrentUser();
    return user && user.status === "approved";
}

function requireLogIn() {
    if (!isLoggedIn()) {
        alert("Please log in to access this page.");
        window.location.href = "login.html";
    }
}

function requireVerification() {
    if (!isVerified()) {
        alert("Your account is pending verification. Please wait for approval.");
        window.location.href = "profile-account.html";
    }
}