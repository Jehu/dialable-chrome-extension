// Initialen Status setzen, falls noch nicht vorhanden
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['phoneLinksEnabled'], function(result) {
    if (result.phoneLinksEnabled === undefined) {
      chrome.storage.sync.set({ phoneLinksEnabled: true });
    }
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-phone-links") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "toggle-phone-links"});
    });
  }
});
