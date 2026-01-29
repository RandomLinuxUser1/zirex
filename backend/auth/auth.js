import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTGeZhmIGTO23BZcgEhJUx_axNqkyzVCg",
  authDomain: "zirex-3f780.firebaseapp.com",
  projectId: "zirex-3f780",
  storageBucket: "zirex-3f780.firebasestorage.app",
  messagingSenderId: "28244607393",
  appId: "1:28244607393:web:c3bf829796cb8f51530be0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const btn = document.querySelector(".login-btn");
const userInput = document.querySelector(".usr");
const passInput = document.querySelector(".pwd");
const statusText = document.querySelector(".status");

function showStatus(message, isError = true) {
  statusText.textContent = message;
  statusText.className = isError ? "status error" : "status success";
}

function clearStatus() {
  statusText.textContent = "";
  statusText.className = "status";
}

btn.addEventListener("click", async () => {
  const username = userInput.value.trim();
  const password = passInput.value.trim();

  if (!username || !password) {
    showStatus("Please enter both username and password");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Logging in...";
    clearStatus();

    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) {
      showStatus("Invalid username or password");
      btn.disabled = false;
      btn.textContent = "Login";
      return;
    }

    let userDoc, userId;
    snap.forEach(d => {
      userDoc = d.data();
      userId = d.id;
    });

    if (userDoc.password !== password || userDoc.isActive === false) {
      showStatus("Invalid username or password");
      btn.disabled = false;
      btn.textContent = "Login";
      return;
    }

    await updateDoc(doc(db, "users", userId), {
      lastLogin: serverTimestamp()
    });

    const data = btoa(`${username}:${password}`);
    document.cookie = `zirex_auth=${data}; path=/; max-age=86400`;

    showStatus("Login successful!", false);

    setTimeout(() => {
      window.location.href = "/home/";
    }, 500);

  } catch {
    showStatus("Login failed");
    btn.disabled = false;
    btn.textContent = "Login";
  }
});

userInput.addEventListener("keypress", e => {
  clearStatus();
  if (e.key === "Enter") passInput.focus();
});

passInput.addEventListener("keypress", e => {
  clearStatus();
  if (e.key === "Enter") btn.click();
});
