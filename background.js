// background.js

let currentExtensionId = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    currentExtensionId = chrome.runtime.id;
    
   
    
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'saveCredentials') {
        chrome.storage.local.get(['accounts'], (result) => {
            const accounts = result.accounts || [];
            
            // Check if this account already exists to prevent duplicates
            const existingAccountIndex = accounts.findIndex(
                acc => acc.username === message.data.username && 
                       acc.url === message.data.url
            );
  
            if (existingAccountIndex === -1) {
                accounts.push({
                    username: message.data.username,
                    password: message.data.password,
                    url: message.data.url,
                    favorite: false // Add favorite flag by default
                });
  
                chrome.storage.local.set({ accounts }, () => {
                    sendResponse({ success: true });
                    console.log("Credentials saved:", message.data);
                });
            } else {
                sendResponse({ success: false, message: "Account already exists" });
            }
        });
        
        return true; // For asynchronous response
    }
  });

// Inject content script when a page loads
chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content_script.js']
    });
}, {
    url: [{ schemes: ['http', 'https'] }]
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['isLoggedIn'], function(result) {
        if (result.isLoggedIn) {
            chrome.storage.local.set({ isLoggedIn: true }); // Ensure persistence on reload
        }
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.isLoggedIn) {
        console.log("isLoggedIn state changed:", changes.isLoggedIn.newValue);
    }
});