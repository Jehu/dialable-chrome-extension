let phoneLinksEnabled = true;
const phoneRegex = /(?<!\w)(?:\+49\s*\(0\)\s*|\+49\s*|0)(\d{2,4})[\s/.-]*(\d{1,2}[\s/.-]*\d{1,2}[\s/.-]*\d{1,2}|\d{3,7})[\s/.-]*(\d{0,8})(?:\s*\d{1,2})?(?!\w)/g;

// Initialen Status laden
chrome.storage.sync.get(['phoneLinksEnabled'], function(result) {
  if (result.phoneLinksEnabled !== undefined) {
    phoneLinksEnabled = result.phoneLinksEnabled;
    if (!phoneLinksEnabled) {
      togglePhoneLinks();
    }
  }
});

window.addEventListener('load', function() {
  console.log("Phone Linker script loaded.");
  
  // Tastenkombination überwachen
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "toggle-phone-links") {
      phoneLinksEnabled = !phoneLinksEnabled;
      chrome.storage.sync.set({ phoneLinksEnabled: phoneLinksEnabled });
      togglePhoneLinks();
    }
  });

  // MutationObserver konfigurieren
  const observerConfig = {
    childList: true,
    subtree: true,
    characterData: true
  };

  // Callback-Funktion für den Observer
  const mutationCallback = function(mutations) {
    if (phoneLinksEnabled) {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              linkifyPhoneNumbers(node);
            }
          });
        }
      });
    }
  };

  // Observer erstellen und starten
  const observer = new MutationObserver(mutationCallback);
  observer.observe(document.body, observerConfig);

  function togglePhoneLinks() {
    if (!phoneLinksEnabled) {
      // Alle phone-links entfernen und durch ursprünglichen Text ersetzen
      const existingLinks = document.querySelectorAll('.phone-link');
      existingLinks.forEach(link => {
        const phoneNumber = link.textContent;
        const textNode = document.createTextNode(phoneNumber);
        link.parentNode.replaceChild(textNode, link);
      });
    } else {
      // Telefonnummern neu erkennen und verlinken
      linkifyPhoneNumbers();
    }
  }

  function linkifyPhoneNumbers(rootNode = document.body) {
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const matches = node.nodeValue.match(phoneRegex);
      if (matches) {
        console.log("Found phone numbers:", matches);
        matches.forEach(phone => {
          if (!node.parentNode.closest('a')) {
            const link = document.createElement('a');
            link.className = 'phone-link';
            link.style.cssText = 'color: #000000 !important; background-color: #f0f0f0 !important; padding: 2px 6px !important; border-radius: 4px !important; text-decoration: none !important; display: inline-block !important;';
            let formattedPhone = phone
              .replace(/\s+/g, '')       // Entferne Leerzeichen
              .replace(/[\(\)\/.-]/g, '') // Entferne Klammern, Schrägstriche, Punkte und Bindestriche
              .replace(/\(0\)/g, '');     // Entferne (0) falls vorhanden
            link.href = `tel:${formattedPhone}`;
            link.textContent = phone;
            const remainingText = node.nodeValue.split(phone);
            node.parentNode.insertBefore(link, node);
            const lastTextNode = document.createTextNode(remainingText.pop());
            node.nodeValue = remainingText.join(phone);
            node.parentNode.insertBefore(link, node.nextSibling);
            node.parentNode.insertBefore(lastTextNode, link.nextSibling);
          }
        });
      }
    }
  }

  linkifyPhoneNumbers();
});
