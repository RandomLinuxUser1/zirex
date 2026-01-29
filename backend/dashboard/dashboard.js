        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
        import { 
            getFirestore, 
            collection, 
            getDocs, 
            doc, 
            deleteDoc,
            setDoc,
            serverTimestamp,
            query,
            orderBy
        } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCTGeZhmIGTO23BZcgEhJUx_axNqkyzVCg",
            authDomain: "zirex-3f780.firebaseapp.com",
            projectId: "zirex-3f780",
            storageBucket: "zirex-3f780.firebasestorage.app",
            messagingSenderId: "28244607393",
            appId: "1:28244607393:web:c3bf829796cb8f51530be0"
        };

        let app;
        let db;

        try {
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
        } catch (error) {
            console.error("Firebase initialization error:", error);
            document.getElementById('systemStatus').textContent = "✗";
            document.getElementById('systemStatus').style.color = "#f44336";
        }

        const addUserBtn = document.getElementById('addUserBtn');
        const refreshUsersBtn = document.getElementById('refreshUsersBtn');
        const usersList = document.getElementById('usersList');
        const newUsernameInput = document.getElementById('newUsername');
        const newEmailInput = document.getElementById('newEmail');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const searchUsersInput = document.getElementById('searchUsers');
        const addUserMessage = document.getElementById('addUserMessage');
        const manageMessage = document.getElementById('manageMessage');
        const totalUsersEl = document.getElementById('totalUsers');
        const activeUsersEl = document.getElementById('activeUsers');
        const systemStatusEl = document.getElementById('systemStatus');
const homebtn = document.querySelector('.backbtn');

        let allUsers = [];
        let userPasswords = {};

if (homebtn) {
    homebtn.addEventListener('click', () => {
        window.location.href = '../home/';
    });
}


        function showMessage(element, text, type) {
            element.textContent = text;
            element.className = `message ${type}`;
            element.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }

        function formatTimestamp(timestamp) {
            if (!timestamp) return 'Never';
            try {
                const date = timestamp.toDate();
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            } catch (error) {
                return 'Invalid date';
            }
        }

        function generateSimpleId() {
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function loadUsers(searchTerm = '') {
            try {
                usersList.innerHTML = '<div class="loading">Loading users...</div>';
                
                const usersRef = collection(db, "users");
                const q = query(usersRef, orderBy("createdAt", "desc"));
                const usersSnapshot = await getDocs(q);
                
                allUsers = [];
                userPasswords = {};
                let activeCount = 0;

                usersSnapshot.forEach((docSnapshot) => {
                    const userData = docSnapshot.data();
                    const userId = docSnapshot.id;
                    const username = userData.username || 'No username';
                    
                    userPasswords[userId] = userData.password || '';
                    
                    if (searchTerm && 
                        !username.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !(userData.email && userData.email.toLowerCase().includes(searchTerm.toLowerCase()))) {
                        return;
                    }
                    
                    if (userData.isActive !== false) {
                        activeCount++;
                    }
                    
                    allUsers.push({
                        id: userId,
                        ...userData
                    });
                });

                totalUsersEl.textContent = allUsers.length;
                activeUsersEl.textContent = activeCount;

                if (allUsers.length === 0) {
                    usersList.innerHTML = '<div class="loading">No users found' + 
                        (searchTerm ? ' matching "' + escapeHtml(searchTerm) + '"' : '') + 
                        '. Add some users to get started!</div>';
                    return;
                }

                usersList.innerHTML = '';
                allUsers.forEach(user => {
                    const userElement = document.createElement('div');
                    userElement.className = 'user-item';
                    userElement.id = 'user-' + user.id;
                    
                    const passwordDisplay = user.password ? 
                        '<span class="password-display" id="pwd-' + user.id + '" data-visible="false">••••••••</span>' +
                        '<button class="toggle-password" data-user-id="' + user.id + '">Show</button>' :
                        '<span class="password-display">No password</span>';
                    
                    userElement.innerHTML = `
                        <div class="user-info">
                            <div class="user-username">${escapeHtml(user.username || 'No username')}</div>
                            ${user.email ? '<div class="user-email">' + escapeHtml(user.email) + '</div>' : ''}
                            <div class="user-id">ID: ${escapeHtml(user.id)}</div>
                            <div>Password: ${passwordDisplay}</div>
                            <div class="user-created">
                                Created: ${formatTimestamp(user.createdAt)}
                                ${user.lastLogin ? ' | Last Login: ' + formatTimestamp(user.lastLogin) : ''}
                            </div>
                        </div>
                        <div class="user-actions">
                            <button class="btn btn-danger btn-sm" data-delete-user="${user.id}" data-username="${escapeHtml(user.username || '')}">
                                Delete
                            </button>
                        </div>
                    `;
                    
                    usersList.appendChild(userElement);
                });

                attachEventListeners();

            } catch (error) {
                console.error("Error loading users:", error);
                showMessage(manageMessage, `Error loading users: ${error.message}`, "error");
                usersList.innerHTML = '<div class="loading">Error loading users. Please try again.</div>';
            }
        }

        function attachEventListeners() {
            document.querySelectorAll('[data-delete-user]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-delete-user');
                    const username = this.getAttribute('data-username');
                    deleteUser(userId, username);
                });
            });

            document.querySelectorAll('.toggle-password').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    togglePassword(userId);
                });
            });
        }

        async function addNewUser() {
            const username = newUsernameInput.value.trim();
            const email = newEmailInput.value.trim();
            const password = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!username) {
                showMessage(addUserMessage, "Username is required", "error");
                return;
            }

            if (!password) {
                showMessage(addUserMessage, "Password is required", "error");
                return;
            }

            if (password.length < 3) {
                showMessage(addUserMessage, "Password must be at least 3 characters", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage(addUserMessage, "Passwords do not match", "error");
                return;
            }

            try {
                addUserBtn.disabled = true;
                addUserBtn.textContent = 'Creating...';

                const userId = generateSimpleId();
                
                await setDoc(doc(db, "users", userId), {
                    username: username,
                    email: email || null,
                    password: password,
                    createdAt: serverTimestamp(),
                    lastLogin: null,
                    isActive: true,
                    updatedAt: serverTimestamp()
                });

                newUsernameInput.value = '';
                newEmailInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';

                showMessage(addUserMessage, `User "${username}" created successfully!`, "success");
                
                loadUsers(searchUsersInput.value);

            } catch (error) {
                console.error("Error adding user:", error);
                showMessage(addUserMessage, `Failed to create user: ${error.message}`, "error");
            } finally {
                addUserBtn.disabled = false;
                addUserBtn.textContent = 'Create User Account';
            }
        }

        async function deleteUser(userId, username) {
            if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
                return;
            }

            try {
                await deleteDoc(doc(db, "users", userId));
                
                const userElement = document.getElementById('user-' + userId);
                if (userElement) {
                    userElement.style.opacity = '0.5';
                    setTimeout(() => {
                        if (userElement.parentNode) {
                            userElement.parentNode.removeChild(userElement);
                        }
                    }, 300);
                }
                
                showMessage(manageMessage, `User "${username}" deleted successfully`, "success");
                
                loadUsers(searchUsersInput.value);
                
            } catch (error) {
                console.error("Error deleting user:", error);
                showMessage(manageMessage, `Error deleting user: ${error.message}`, "error");
            }
        }

        function togglePassword(userId) {
            const passwordSpan = document.getElementById('pwd-' + userId);
            const button = passwordSpan.nextElementSibling;
            const isVisible = passwordSpan.getAttribute('data-visible') === 'true';
            
            if (isVisible) {
                passwordSpan.textContent = '••••••••';
                passwordSpan.setAttribute('data-visible', 'false');
                button.textContent = 'Show';
            } else {
                passwordSpan.textContent = userPasswords[userId] || 'No password';
                passwordSpan.setAttribute('data-visible', 'true');
                button.textContent = 'Hide';
            }
        }

        addUserBtn.addEventListener('click', addNewUser);
        refreshUsersBtn.addEventListener('click', () => loadUsers(searchUsersInput.value));
        
        searchUsersInput.addEventListener('input', (e) => {
            loadUsers(e.target.value);
        });

        newPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewUser();
            }
        });

        confirmPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewUser();
            }
        });

        window.addEventListener('DOMContentLoaded', () => {
            loadUsers();
            systemStatusEl.textContent = "✓";
            systemStatusEl.style.color = "#4caf50";
        });

        setInterval(() => {
            loadUsers(searchUsersInput.value);
        }, 30000);
