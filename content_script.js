
// Function to identify login forms based on platform-specific patterns
function findLoginForm() {
    const formSelectors = [
        // Platform-specific selectors
        'form[action*="x.com"]',       
        'form[action*="twitter.com"]',
        'form[action*="instagram.com"]', 
        'form[action*="accounts.google.com"]', 
        
        // Existing generic selectors
        'form[action*="login"]',
        'form[action*="signin"]',
        'form[action*="auth"]',
        'form[id*="login"]',
        'form[id*="signin"]',
        'form[class*="login"]',
        'form[class*="signin"]',
        'form[action*="identifier"]', 
        'form' 
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


function findUsernameInput(form) {
    const usernameSelectors = [
       
        'input[name="text"]',          
        'input[autocomplete="username"]',
        
        // Instagram selectors
        'input[name="username"]',        // Instagram username field
        'input[name="emailOrPhone"]',    // Instagram alternate field
        
        // Gmail/Google selectors
        'input[type="email"]',           // Google email field
        'input[name="identifier"]',      // Google identifier field
        'input#identifierId',            // Google specific ID
        
        // Existing broad selectors
        'input[name="session_key"]',     // LinkedIn specific
        'input[id="username"]',           // Generic username
        'input[type="text"][name*="email"]',
        'input[type="text"][name*="user"]',
        'input[name*="login"]',
        'input[name*="username"]',
        'input[id*="email"]',
        'input[id*="user"]',
        'input[id*="login"]',
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

// Function to find password input with platform-specific selectors
function findPasswordInput(form) {
    const passwordSelectors = [
        // Platform-specific selectors
        // X (Twitter) selectors
        'input[name="password"]',        // X login password field
        
        // Instagram selectors
        'input[type="password"]',        // Instagram password field
        
        // Gmail/Google selectors
        'input[type="password"][name="password"]', // Google password field
        
        // Existing selectors
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
function promptSaveCredentials(username, password, url) {
    console.log('Attempting to save credentials:', { username, password, url });
    
    // Normalize the URL
    const normalizedUrl = url.replace(/^www\./, '').toLowerCase();
    
    const userConfirmed = confirm(`Do you want to save your credentials for ${normalizedUrl}?`);
    
    if (userConfirmed) {
        try {
            chrome.runtime.sendMessage({ 
                type: 'saveCredentials',
                data: {
                    username, 
                    password, 
                    url: normalizedUrl
                }
            }, (response) => {
                if (response && response.success) {
                    console.log("Credentials saved successfully");
                } else {
                    console.error("Failed to save credentials:", response);
                }
            });
        } catch (error) {
            console.error("Error sending save credentials message:", error);
        }
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
                // Special handling for different platforms
                let normalizedUrl = window.location.hostname;
                
                // Normalize URLs for specific platforms
                if (normalizedUrl.includes('github.com') || normalizedUrl.includes('github.com')) {
                    normalizedUrl = 'github.com';
                } else if (normalizedUrl.includes('instagram.com')) {
                    normalizedUrl = 'instagram.com';
                } else if (normalizedUrl.includes('accounts.google.com')) {
                    normalizedUrl = 'gmail.com';
                }

                promptSaveCredentials(username, password, normalizedUrl);
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


