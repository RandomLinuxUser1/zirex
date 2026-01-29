import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const statusText = document.getElementById("status");
const currentUserSpan = document.getElementById("current-user");
const logoutBtn = document.getElementById("logout-btn");
const homeBtn = document.getElementById("home-btn");

let currentUsername = null;
let unsubscribe = null;

function getCurrentUser() {
  const cookie = document.cookie
    .split("; ")
    .find(c => c.startsWith("zirex_auth="));

  if (!cookie) {
    window.location.href = "/index.html";
    return null;
  }

  try {
    const data = atob(cookie.split("=")[1]);
    const parts = data.split(":");
    if (parts.length !== 2) {
      clearAuthAndRedirect();
      return null;
    }
    return parts[0];
  } catch {
    clearAuthAndRedirect();
    return null;
  }
}

function clearAuthAndRedirect() {
  document.cookie = "zirex_auth=; path=/; max-age=0";
  window.location.href = "/index.html";
}

function showStatus(message, type = "error") {
  statusText.textContent = message;
  statusText.className = `status ${type}`;
  setTimeout(() => {
    statusText.textContent = "";
    statusText.className = "status";
  }, 3000);
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "Just now";
  
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    return "Just now";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function createMessageElement(messageData) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  
  if (messageData.username === currentUsername) {
    messageDiv.classList.add("own-message");
  }

  const headerDiv = document.createElement("div");
  headerDiv.className = "message-header";

  const userSpan = document.createElement("span");
  userSpan.className = "message-user";
  userSpan.textContent = messageData.username;

  const timeSpan = document.createElement("span");
  timeSpan.className = "message-time";
  timeSpan.textContent = formatTimestamp(messageData.timestamp);

  headerDiv.appendChild(userSpan);
  headerDiv.appendChild(timeSpan);

  const textP = document.createElement("p");
  textP.className = "message-text";
  textP.textContent = messageData.message;

  messageDiv.appendChild(headerDiv);
  messageDiv.appendChild(textP);

  return messageDiv;
}

function loadMessages() {
  messagesContainer.innerHTML = '<div class="loading-message">Loading messages...</div>';

  const q = query(
    collection(db, "chat"),
    orderBy("timestamp", "asc"),
    limit(100)
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = "";

    if (snapshot.empty) {
      messagesContainer.innerHTML = '<div class="empty-state">No messages yet. Be the first to say hello!</div>';
      return;
    }

    snapshot.forEach((doc) => {
      const messageData = doc.data();
      const messageElement = createMessageElement(messageData);
      messagesContainer.appendChild(messageElement);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, (error) => {
    console.error("Error loading messages:", error);
    messagesContainer.innerHTML = '<div class="empty-state">Error loading messages. Please refresh.</div>';
  });
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {
    showStatus("Please enter a message", "error");
    return;
  }

  if (message.length > 500) {
    showStatus("Message too long (max 500 characters)", "error");
    return;
  }

  try {
    sendBtn.disabled = true;
    messageInput.disabled = true;

    await addDoc(collection(db, "chat"), {
      username: currentUsername,
      message: message,
      timestamp: serverTimestamp()
    });

    messageInput.value = "";
    messageInput.focus();

  } catch (error) {
    console.error("Error sending message:", error);
    showStatus("Failed to send message", "error");
  } finally {
    sendBtn.disabled = false;
    messageInput.disabled = false;
  }
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

logoutBtn.addEventListener("click", () => {
  if (unsubscribe) unsubscribe();
  clearAuthAndRedirect();
});

homeBtn.addEventListener("click", () => {
  if (unsubscribe) unsubscribe();
  window.location.href = "/home/";
});

currentUsername = getCurrentUser();
if (currentUsername) {
  currentUserSpan.textContent = currentUsername;
  loadMessages();
  messageInput.focus();
}

window.addEventListener("beforeunload", () => {
  if (unsubscribe) unsubscribe();
});