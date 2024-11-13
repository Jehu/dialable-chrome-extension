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

// Storage-Änderungen überwachen
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.phoneLinksEnabled) {
    updateIcon(changes.phoneLinksEnabled.newValue);
  }
});

// Icon-Klick Handler
chrome.action.onClicked.addListener(async (tab) => {
  try {
    const result = await chrome.storage.sync.get(['phoneLinksEnabled']);
    const newState = !result.phoneLinksEnabled;
    // Sofort das Icon aktualisieren
    updateIcon(newState);
    // Storage-Änderung durchführen
    await chrome.storage.sync.set({ phoneLinksEnabled: newState });
    // Prüfen ob Tab noch existiert und Nachricht senden
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs[0]?.id === tab.id) {
      await chrome.tabs.sendMessage(tab.id, {command: "toggle-phone-links"}).catch(() => {
        console.log("Tab nicht bereit für Nachrichten");
      });
    }
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
        await chrome.tabs.sendMessage(tabs[0].id, {command: "toggle-phone-links"}).catch(() => {
          console.log("Tab nicht bereit für Nachrichten");
        });
      }
    } catch (error) {
      console.error("Fehler bei Tastenkombination:", error);
    }
  }
});
