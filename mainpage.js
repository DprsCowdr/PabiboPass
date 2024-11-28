// mainpage.js
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.button-65s');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadAccounts(tab.dataset.tab);
        });
    });

    function addFavoriteEventListeners() {
        const favoriteButtons = document.querySelectorAll('.favorite-button');
        
        favoriteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                const icon = button.querySelector('i');
    
                // Toggle favorite status in storage
                chrome.storage.local.get(['accounts'], function(result) {
                    const accounts = result.accounts || [];
                    accounts[index].favorite = !accounts[index].favorite; // Toggle favorite status
    
                    // Update icon based on the new favorite status
                    if (accounts[index].favorite) {
                        icon.classList.remove('fa-regular', 'fa-star');
                        icon.classList.add('fa-solid', 'fa-star');
                    } else {
                        icon.classList.remove('fa-solid', 'fa-star');
                        icon.classList.add('fa-regular', 'fa-star');
                    }
    
                    // Save the updated accounts back to storage and reload the list
                    chrome.storage.local.set({ accounts }, function() {
                        const activeTab = document.querySelector('.tabs .active').dataset.tab;
                        loadAccounts(activeTab); // Reloads accounts list for the current tab
                    });
                });
            });
        });
    }
    
    document.getElementById('add-account-button').addEventListener('click', function() {
        const form = document.getElementById('add-account-form');
        
        form.classList.toggle('show');
        
        if (form.classList.contains('show')) {
            this.innerText = 'Hide';
        } else {
            this.innerText = 'Add';
        }
    });

    // Service button functionality
    const serviceButtons = document.querySelectorAll('.service-btn');
    const urlInput = document.querySelector('.url-input');
    let selectedUrl = '';

    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            serviceButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (this.classList.contains('custom-url-btn')) {
                urlInput.style.display = 'block';
                selectedUrl = '';
            } else {
                urlInput.style.display = 'none';
                selectedUrl = this.dataset.url;
            }
        });
    });

    // Function to load accounts with filtering
    function loadAccounts(filter = 'all') {
        const accountList = document.getElementById("password-list");
        
        chrome.storage.local.get(['accounts'], function(result) {
            const storedAccounts = result.accounts || [];
            
            accountList.innerHTML = '';
            if (storedAccounts.length === 0) {
                accountList.innerHTML = '<p>No accounts stored yet.</p>';
                return;
            }

            let filteredAccounts = storedAccounts;
            if (filter === 'frequent') {
                filteredAccounts = storedAccounts.slice(0, 5);
            } else if (filter === 'favorites') {
                filteredAccounts = storedAccounts.filter(account => account.favorite);
            }

            filteredAccounts.forEach((account, index) => {
                const accountItem = document.createElement('div');
                accountItem.classList.add('password-item');
                
                console.log('Account URL:', account.url); // This will log the URL of each account
                const serviceIcon = getServiceIcon(account.url);
                
                accountItem.innerHTML = `

                
                   <div class="password-info">
                <div class="password-icon">
                  
                 <img src="${serviceIcon}" alt="service icon" class="service-icon" style="width: 30px; height: 30px;">
                </div>
              <div class="password-details" id="details-${index}">
    <h4>${account.username}</h4>
    <p>${account.url}</p>
    <p class="password-field" id="password-${index}" data-visible="false">
        ${'*'.repeat(account.password.length)}
    </p>
</div>
                <div class="edit-form" id="edit-form-${index}" style="display: none;">
    <input type="text" class="edit-username" value="${account.username}" placeholder="Username">
    <input type="text" class="edit-url" value="${account.url}" placeholder="URL">
    <input type="password" class="edit-password" id="edit-password-${index}" value="${account.password}" placeholder="Password">
    <div>
    <button class="save-edit-button" data-index="${index}"> Save </button>
    <button class="cancel-edit-button" data-index="${index}">Cancel</button>
    </div>
</div>
            </div>
            <div class="password-actions">
                <button class="show-password-button" data-index="${index}">
                    <i class="fa-solid fa-eye-slash"></i>
                </button>
                <button class="edit-button" data-index="${index}">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="autofill-button" data-index="${index}">
                    <i class="fa-solid fa-fill"></i>
                </button>
                <button class="delete-button" data-index="${index}">
                    <i class="fa-solid fa-trash"></i>
                </button>

                <button class="favorite-button" data-index="${index}">
                    <i class="${account.favorite ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>
                </button>
            </div>
                `;
                accountList.appendChild(accountItem);
            });

            addButtonEventListeners();
            addShowPasswordEventListeners();
            addEditEventListeners();
            addFavoriteEventListeners();
        });
    }

    // Helper function to get service icon   <img src="${serviceIcon}" alt="service icon" class="service-icon" style="width: 30px; height: 30px;">

// Helper function to get service icon
function getServiceIcon(url) {
    // Local icon mappings for predefined services
    if (url.includes('facebook.com')) return 'icons/facebook.png';
    if (url.includes('gmail.com')) return 'icons/gmail.png';
    if (url.includes('instagram.com')) return 'icons/instagram.png';
    if (url.includes('twitter.com')) return 'icons/twitter.png';
    if (url.includes('linkedin.com')) return 'icons/linkedin.png';

    // Fetch the favicon from the Google Favicon API for custom URLs
    return `https://www.google.com/s2/favicons?domain=${url}&size=64`;
}

    

    function addButtonEventListeners() {
        document.querySelectorAll('.autofill-button').forEach(button => {
            button.addEventListener('click', function() {
                autofillAccountInTab(this.dataset.index);
            });
        });

        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                chrome.storage.local.get(['accounts'], function(result) {
                    const account = result.accounts[index];
                    navigator.clipboard.writeText(account.password)
                        .then(() => {
                            button.style.backgroundColor = '#e8efff';
                            setTimeout(() => {
                                button.style.backgroundColor = 'transparent';
                            }, 200);
                        });
                });
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function() {
                deleteAccount(this.dataset.index);
            });
        });
    }

    document.getElementById("save-account").addEventListener("click", function() {
        const username = document.getElementById("account-username").value;
        const password = document.getElementById("account-password").value;
        const customUrl = document.getElementById("account-url").value;
        
        const finalUrl = selectedUrl || customUrl;

        if (username && password && (finalUrl || customUrl)) {
            chrome.storage.local.get(['accounts'], function(result) {
                const storedAccounts = result.accounts || [];
                storedAccounts.push({ 
                    username, 
                    password, 
                    url: finalUrl,
                    favorite: false
                });
                chrome.storage.local.set({ accounts: storedAccounts }, function() {
                    resetForm();
                    loadAccounts();
                    
                    const form = document.getElementById('add-account-form');
                    const addButton = document.getElementById('add-account-button');
                    form.classList.toggle('show');
                    addButton.innerText = 'Add';
                });
            });
        } else {
            alert("Please fill in all required fields.");
        }
    });

    function resetForm() {
        document.getElementById("add-account-form").style.display = "none";
        document.getElementById("account-username").value = "";
        document.getElementById("account-password").value = "";
        document.getElementById("account-url").value = "";
        document.querySelectorAll('.service-btn').forEach(btn => btn.classList.remove('active'));
        selectedUrl = '';
        urlInput.style.display = 'none';
    }

    function autofillAccountInTab(index) {
        chrome.storage.local.get(['accounts'], function(result) {
            const account = result.accounts[index];
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const activeTab = tabs[0];
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    func: autofillForm,
                    args: [account.username, account.password]
                });
            });
        });
    }

    function autofillForm(username, password) {
        const usernameField = document.querySelector('input[type="text"], input[type="email"]');
        const passwordField = document.querySelector('input[type="password"]');

        if (usernameField && passwordField) {
            usernameField.value = username;
            passwordField.value = password;
        } else {
            alert("Username or password fields not found on this page.");
        }
    }
    
    // Handle "Add Account" button click
    document.getElementById("add-account-button").addEventListener("click", function() {
        document.getElementById("add-account-form").style.display = "block";
    });

    // Listen for messages from content_script.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "saveCredentials") {
            const { username, password, url } = message.data;

            // Retrieve current stored accounts or initialize an empty array
            const storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];
            
            // Add the new account data
            storedAccounts.push({ username, password, url });
            
            // Save updated accounts list back to localStorage
            localStorage.setItem("accounts", JSON.stringify(storedAccounts));

            // Optionally, you can trigger a reload of the accounts list
            loadAccounts();
        }
    });

    function addShowPasswordEventListeners() {
        const showPasswordButtons = document.querySelectorAll('.show-password-button');
        
        showPasswordButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                const passwordField = document.getElementById(`password-${index}`);
                const editPasswordField = document.getElementById(`edit-password-${index}`);
                const isVisible = passwordField.getAttribute('data-visible') === 'true';
                const icon = button.querySelector('i');
        
                // Assuming you have access to the stored accounts
                chrome.storage.local.get(['accounts'], function(result) {
                    const storedAccounts = result.accounts || [];
                    const password = storedAccounts[index].password; // Get the actual password
        
                    if (isVisible) {
                        // Normal mode
                        passwordField.textContent = '*'.repeat(password.length); // Show asterisks
                        passwordField.setAttribute('data-visible', 'false');
                        // Edit mode
                        if (editPasswordField) {
                            editPasswordField.type = 'password';
                        }
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        // Show the actual password
                        passwordField.textContent = password; // Show the actual password
                        passwordField.setAttribute('data-visible', 'true');
                        // Edit mode
                        if (editPasswordField) {
                            editPasswordField.type = 'text'; // Change to text to show the password
                        }
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            });
        });
    }

    function deleteAccount(index) {
        const confirmation = confirm("Are you sure you want to delete this account?");
        if (confirmation) {
            chrome.storage.local.get(['accounts'], function(result) {
                const storedAccounts = result.accounts;
                storedAccounts.splice(index, 1);
                chrome.storage.local.set({ accounts: storedAccounts }, function() {
                    loadAccounts();
                });
            });
        }
    }

    // Password Generator Function
    function generatePassword(length) {
        const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const specialCharacters = "!@#$%^&*()_+";

        const allCharacters = uppercaseLetters + lowercaseLetters + numbers + specialCharacters;

        let password = "";
        for (let i = 0; i < length; i++) {
            password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
        }

        return password;
    }

    document.getElementById('generate-password-button').addEventListener('click', function() {
        const passwordLength = 12;
        const generatedPassword = generatePassword(passwordLength);
        document.getElementById('generated-password-output').value = generatedPassword;
    });

    document.getElementById('copy-password-button').addEventListener('click', function() {
        const passwordField = document.getElementById('generated-password-output');
        passwordField.select();
        document.execCommand('copy');
        alert('Password copied to clipboard!');
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const accountElements = document.querySelectorAll('.password-item');
        
        accountElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            element.style.display = text.includes(query) ? 'flex' : 'none';
        });
    });

    document.getElementById("logout-button").addEventListener("click", function() {
        chrome.storage.local.set({ isLoggedIn: false }, function() {
            window.location.href = chrome.runtime.getURL("popup.html");
        });
    });

    document.getElementById("delete-all-button").addEventListener('click', function() {
        const confirmation = confirm("Are you sure you want to delete all accounts? This cannot be undone.");
        if (confirmation) {
            chrome.storage.local.set({ accounts: [] }, function() {
                alert("All accounts have been deleted!");
                loadAccounts();
            });
        }
    });

    function addEditEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                toggleEditForm(index);
            });
        });

        // Save edit buttons
        document.querySelectorAll('.save-edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                saveEdit(index);
            });
        });

        // Cancel edit buttons
        document.querySelectorAll('.cancel-edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                toggleEditForm(index);
            });
        });
    }

    function toggleEditForm(index) {
        const detailsDiv = document.getElementById(`details-${index}`);
        const editForm = document.getElementById(`edit-form-${index}`);
        
        if (editForm.style.display === 'none') {
            detailsDiv.style.display = 'none';
            editForm.style.display = 'block';
        } else {
            detailsDiv.style.display = 'block';
            editForm.style.display = 'none';
        }
    }

    function saveEdit(index) {
        const editForm = document.getElementById(`edit-form-${index}`);
        const newUsername = editForm.querySelector('.edit-username').value;
        const newUrl = editForm.querySelector('.edit-url').value;
        const newPassword = editForm.querySelector('.edit-password').value;

        if (newUsername && newUrl && newPassword) {
            chrome.storage.local.get(['accounts'], function(result) {
                const storedAccounts = result.accounts;
                storedAccounts[index] = {
                    username: newUsername,
                    url: newUrl,
                    password: newPassword
                };
                chrome.storage.local.set({ accounts: storedAccounts }, function() {
                    loadAccounts();
                });
            });
        } else {
            alert("Please fill in all fields.");
        }
    }

    // Initial load
    loadAccounts();
});