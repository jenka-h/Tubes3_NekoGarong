// PLEASE FIX THIS, I AM STILL UNSURE HOW TO USE THIS

/**
 * Service worker for the background script of the Judol Detector extension.
 * This script listens for events and performs background tasks for the extension.
 * It is registered in the manifest.json file under the "background" key.
 * In short, event-driven.
 */

// NOTE: Check again what kind of state are we handling.
// For now: handle init + message passing
// Init
chrome.runtime.onInstalled.addListener(() => {
    console.log('Judol Detector extension installed and background service worker registered.');
}); 

// Pipline: background -> content script -> popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) {
            sendResponse({
                success: false,
                error: "No active tab found"
            });

            return;
        }

        // Forward message to content script
        chrome.tabs.sendMessage(activeTab.id, message, (response) => {
            sendResponse(response);
        });

    });
    return true; // Keep channel open for async response
});

// Optional: Listen for action icon clicks (???????????)
chrome.action.onClicked.addListener((tab) => {
    console.log(`[Background] Action icon clicked on tab: ${tab.id}`);
});