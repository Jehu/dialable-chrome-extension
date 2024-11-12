chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-phone-links") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "toggle-phone-links"});
    });
  }
});
