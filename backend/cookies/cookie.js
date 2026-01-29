import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

async function validateAuth() {
  const cookie = document.cookie
    .split("; ")
    .find(c => c.startsWith("zirex_auth="));

  if (!cookie) {
    redirectToLogin();
    return;
  }

  try {
    const data = atob(cookie.split("=")[1]);
    const parts = data.split(":");
    
    if (parts.length !== 2) {
      clearAuthAndRedirect();
      return;
    }

    const [username, password] = parts;

    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) {
      clearAuthAndRedirect();
      return;
    }

    let isValid = false;
    snap.forEach(doc => {
      const user = doc.data();
      if (user.password === password && user.isActive !== false) {
        isValid = true;
      }
    });

    if (!isValid) {
      clearAuthAndRedirect();
    }

  } catch (error) {
    console.error("Auth validation error:", error);
    clearAuthAndRedirect();
  }
}

function clearAuthAndRedirect() {
  document.cookie = "zirex_auth=; path=/; max-age=0";
  redirectToLogin();
}

function redirectToLogin() {
  window.location.href = "/index.html";
}

validateAuth();