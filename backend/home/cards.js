const gamesbtn = document.querySelector(".card-g");
const dashbtn = document.querySelector(".card-d");
const chatbtn = document.querySelector(".card");

const modal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("adminPassword");
const submitBtn = document.getElementById("submitPassword");
const cancelBtn = document.getElementById("cancelPassword");
const statusDiv = document.getElementById("passwordStatus");

if (gamesbtn) {
    gamesbtn.addEventListener("click", () => {
        window.location.href = "/app/";
    });
}

if (chatbtn) {
    chatbtn.addEventListener("click", () => {
        window.location.href = "/chat/";
    });
}

if (dashbtn) {
    dashbtn.addEventListener('click', function() {
        modal.style.display = "block";
        passwordInput.value = "";
        passwordInput.focus();
        statusDiv.textContent = "";
        statusDiv.className = "status";
    });
}

if (submitBtn) {
    submitBtn.addEventListener('click', function() {
        const password = passwordInput.value;
        if (password === 'Swaylio1') {
            statusDiv.textContent = "Authenticated!";
            statusDiv.className = "status success";
            setTimeout(() => {
                window.location.href = '../dashboard/';
            }, 500);
        } else if (password === '') {
            statusDiv.textContent = "Please enter a password";
            statusDiv.className = "status error";
        } else {
            statusDiv.textContent = "Incorrect password!";
            statusDiv.className = "status error";
        }
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        modal.style.display = "none";
    });
}

if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});