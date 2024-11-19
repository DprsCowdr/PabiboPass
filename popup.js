document.addEventListener("DOMContentLoaded", function() {
    function initialize() {
        chrome.storage.local.get(['masterLock', 'isLoggedIn'], function(result) {
            console.log("Initialization check - Master Lock:", result.masterLock, "Is Logged In:", result.isLoggedIn); // Debug log

            if (result.masterLock && result.isLoggedIn === true) {
                // If user is logged in, redirect to main page
                window.location.href = 'mainpage.html';
                return;
            }

            if (result.masterLock) {
                // If a master lock is stored, hide the confirm password input
                document.getElementById("confirm-container").style.display = "none";
            }
        });
    }

    // Handle the form submission (login or setup)
    document.getElementById("submit-lock").addEventListener("click", function(event) {
        event.preventDefault();

        const masterLockInput = document.getElementById("master-lock").value;
        const confirmLockInput = document.getElementById("confirm-lock").value;
        const errorMessage = document.getElementById("error-message");

        chrome.storage.local.get(['masterLock'], function(result) {
            if (result.masterLock) {
                // If a master password is already set, check it
                if (masterLockInput !== result.masterLock) {
                    errorMessage.textContent = "Incorrect master password!";
                    return;
                }

                // Set login state
                chrome.storage.local.set({ isLoggedIn: true }, function() {
                    errorMessage.textContent = ""; // Clear any previous error
                    window.location.href = 'mainpage.html';
                });
            } else {
                // If no master lock is set, we are in setup mode
                if (!masterLockInput) {
                    errorMessage.textContent = "Master lock cannot be empty!";
                    return;
                }

                if (confirmLockInput && masterLockInput !== confirmLockInput) {
                    errorMessage.textContent = "Master locks do not match!";
                    return;
                }

                // Store the master lock and set login state
                chrome.storage.local.set({
                    masterLock: masterLockInput,
                    isLoggedIn: true
                }, function() {
                    errorMessage.textContent = "";
                    document.getElementById("confirm-container").style.display = "none";
                    window.location.href = 'mainpage.html';
                });
            }
        });
    });

    // Initialize the state when the popup is opened
    initialize();
});

// mainpage.js modifications
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

        // Rest of your account rendering code...
        renderAccounts(filteredAccounts);
    });
}

function saveAccount(accountData) {
    chrome.storage.local.get(['accounts'], function(result) {
        const accounts = result.accounts || [];
        accounts.push(accountData);
        chrome.storage.local.set({ accounts: accounts }, function() {
            loadAccounts();
            resetForm();
        });
    });
}

function deleteAccount(index) {
    const confirmation = confirm("Are you sure you want to delete this account?");
    if (confirmation) {
        chrome.storage.local.get(['accounts'], function(result) {
            const accounts = result.accounts || [];
            accounts.splice(index, 1);
            chrome.storage.local.set({ accounts: accounts }, function() {
                loadAccounts();
            });
        });
    }
}

function saveEdit(index) {
    const editForm = document.getElementById(`edit-form-${index}`);
    const newUsername = editForm.querySelector('.edit-username').value;
    const newUrl = editForm.querySelector('.edit-url').value;
    const newPassword = editForm.querySelector('.edit-password').value;

    if (newUsername && newUrl && newPassword) {
        chrome.storage.local.get(['accounts'], function(result) {
            const accounts = result.accounts || [];
            accounts[index] = {
                username: newUsername,
                url: newUrl,
                password: newPassword
            };
            chrome.storage .local.set({ accounts: accounts }, function() {
                loadAccounts();
            });
        });
    } else {
        alert("Please fill in all fields.");
    }
}