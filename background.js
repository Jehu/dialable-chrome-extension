// Funktion zum Aktualisieren des Icons
function updateIcon(enabled) {
  const iconPath = enabled ? {
    16: "icons/icon16_on.png",
    32: "icons/icon32_on.png",
    48: "icons/icon48_on.png",
    128: "icons/icon128_on.png"
  } : {
    16: "icons/icon16_off.png",
    32: "icons/icon32_off.png",
    48: "icons/icon48_off.png",
    128: "icons/icon128_off.png"
  };
  chrome.action.setIcon({ path: iconPath });
}

// Initialen Status setzen, falls noch nicht vorhanden
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['phoneLinksEnabled'], function(result) {
    const initialState = result.phoneLinksEnabled === undefined ? true : result.phoneLinksEnabled;
    chrome.storage.sync.set({ phoneLinksEnabled: initialState });
    updateIcon(initialState);
  });
});

// Icon-Klick Handler
chrome.action.onClicked.addListener(async (tab) => {
  try {
    const result = await chrome.storage.sync.get(['phoneLinksEnabled']);
    const newState = !result.phoneLinksEnabled;
    
    // Parallel ausführen: Icon aktualisieren, Storage setzen und Nachricht senden
    await Promise.all([
      chrome.storage.sync.set({ phoneLinksEnabled: newState }),
      chrome.tabs.sendMessage(tab.id, {command: "toggle-phone-links"}).catch(() => {
        console.log("Tab nicht bereit für Nachrichten");
      })
    ]);
    
    // Icon sofort aktualisieren, ohne auf Storage-Events zu warten
    updateIcon(newState);
  } catch (error) {
    console.error("Fehler beim Umschalten:", error);
  }
});

// Tastenkombinations-Handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-phone-links") {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs[0]?.id) {
        // Aktuellen Status abrufen und umkehren
        const result = await chrome.storage.sync.get(['phoneLinksEnabled']);
        const newState = !result.phoneLinksEnabled;
        
        // Parallel ausführen: Storage setzen und Nachricht senden
        await Promise.all([
          chrome.storage.sync.set({ phoneLinksEnabled: newState }),
          chrome.tabs.sendMessage(tabs[0].id, {command: "toggle-phone-links"}).catch(() => {
            console.log("Tab nicht bereit für Nachrichten");
          })
        ]);
        
        // Icon aktualisieren
        updateIcon(newState);
      }
    } catch (error) {
      console.error("Fehler bei Tastenkombination:", error);
    }
  }
});
