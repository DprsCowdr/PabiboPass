// Function to identify login forms based on common patterns
function findLoginForm() {
    const formSelectors = [
        'form[action*="login"]',
        'form[action*="signin"]',
        'form[action*="auth"]',
        'form[id*="login"]',
        'form[id*="signin"]',
        'form[class*="login"]',
        'form[class*="signin"]',
        'form[id="loginForm"]',
        'form[action*="identifier"]',  // Specific for Gmail login pages
        'form' // fallback to any form
    ];

    for (const selector of formSelectors) {
        const form = document.querySelector(selector);
        if (form) {
            console.log(`Login form found with selector: ${selector}`);
            return form;
        }
    }
    return null;
}

// Function to find username/email input
function findUsernameInput(form) {
    const usernameSelectors = [
        'input[name="session_key"]',  // LinkedIn specific
        'input[id="username"]',        // LinkedIn specific
        'input[name="username"]',      // Instagram specific
          'input[name="identifier"]',     // Gmail specific 
        'input[type="email"]',
        'input[type="text"][name*="email"]',
        'input[type="text"][name*="user"]',
        'input[name*="login"]',
        'input[name*="username"]',
        'input[id*="email"]',
        'input[id*="user"]',
        'input[id*="login"]',
        'input[autocomplete="username"]',
        'input[autocomplete="email"]'
    ];

    for (const selector of usernameSelectors) {
        const input = form.querySelector(selector);
        if (input) {
            console.log(`Username input found with selector: ${selector}`);
            return input;
        }
    }
    console.log("Username input not found");
    return null;
}

// Function to find password input
function findPasswordInput(form) {
    const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[name*="pass"]',
        'input[id*="pass"]',
        'input[autocomplete="current-password"]'
    ];

    for (const selector of passwordSelectors) {
        const input = form.querySelector(selector);
        if (input) {
            console.log(`Password input found with selector: ${selector}`);
            return input;
        }
    }
    console.log("Password input not found");
    return null;
}

// Function to prompt user to save credentials
function promptSaveCredentials(username, password, url) {
    console.log('Attempting to save credentials:', { username, password, url });
    
    const userConfirmed = confirm(`Do you want to save your credentials for ${url}?`);
    
    if (userConfirmed) {
        chrome.runtime.sendMessage({ 
            type: 'saveCredentials',
            data: {
                username, 
                password, 
                url: window.location.hostname
            }
        }, (response) => {
            if (response && response.success) {
                console.log("Credentials saved successfully");
            } else {
                console.log("Failed to save credentials");
            }
        });
    }
}

// Function to handle form submission with fallback for autofill
function handleFormSubmit(event) {
    const form = event.target;
    const usernameInput = findUsernameInput(form);
    const passwordInput = findPasswordInput(form);

    if (usernameInput && passwordInput) {
        // Wait a short time to allow for autofilled credentials
        setTimeout(() => {
            const username = usernameInput.value;
            const password = passwordInput.value;

            if (username && password) {
                promptSaveCredentials(username, password, window.location.hostname);
            } else {
                console.log("Username or Password field is empty");
            }
        }, 100); // 100ms delay for autofill
    } else {
        console.log("Username or Password input not detected in form");
    }
}

// Function to attach listeners directly to username/password fields
function attachFieldListeners(form) {
    const usernameInput = findUsernameInput(form);
    const passwordInput = findPasswordInput(form);

    if (usernameInput && passwordInput) {
        usernameInput.addEventListener("change", () => {
            usernameInput.dataset.changed = 'true';
        });
        passwordInput.addEventListener("change", () => {
            passwordInput.dataset.changed = 'true';
        });
    }
}

// Updated attachFormListener function to call attachFieldListeners
function attachFormListener() {
    const form = findLoginForm();
    if (form && !form.dataset.pabiboPassed) {
        form.dataset.pabiboPassed = 'true';
        console.log("Attaching event listeners to the form");
        attachFieldListeners(form); // Attach field-specific listeners
        form.addEventListener("submit", handleFormSubmit);
    }
}

// Initial setup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachFormListener);
} else {
    attachFormListener();
}

// Observer for dynamically loaded forms
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            attachFormListener();
        }
    }
});

// Start observing the body for changes
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
