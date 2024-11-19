// background.js

let currentExtensionId = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    currentExtensionId = chrome.runtime.id;
    
    // Clear any old extension data
    chrome.storage.local.clear(() => {
        console.log('Extension storage cleared on install/update');
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'saveCredentials') {
      chrome.storage.local.get(['accounts'], (result) => {
          if (chrome.runtime.lastError) {
              console.error("Error getting accounts:", chrome.runtime.lastError);
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
              return;
          }

          const accounts = result.accounts || [];
          accounts.push({
              username: message.data.username,
              password: message.data.password,
              url: message.data.url
          });

          chrome.storage.local.set({ accounts }, () => {
              if (chrome.runtime.lastError) {
                  console.error("Error setting accounts:", chrome.runtime.lastError);
                  sendResponse({ success: false, error: chrome.runtime.lastError.message });
              } else {
                  sendResponse({ success: true });
                  console.log("Credentials saved:", message.data);
              }
          });
      });
      
      return true; // Indicates asynchronous response
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