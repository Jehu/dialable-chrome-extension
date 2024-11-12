let phoneLinksEnabled = true;
const phoneRegex = /(?<!\w)(?:\+49\s*\(0\)\s*|\+49\s*|0)(\d{2,4})[\s/.-]*(\d{1,2}[\s/.-]*\d{1,2}[\s/.-]*\d{1,2}|\d{3,7})[\s/.-]*(\d{0,8})(?!\w)/g;

window.addEventListener('load', function() {
  console.log("Phone Linker script loaded.");
  
  // Tastenkombination überwachen
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "toggle-phone-links") {
      phoneLinksEnabled = !phoneLinksEnabled;
      togglePhoneLinks();
    }
  });

  function togglePhoneLinks() {
    const existingLinks = document.querySelectorAll('.phone-link');
    existingLinks.forEach(link => {
      link.style.display = phoneLinksEnabled ? 'inline-block' : 'none';
    });
    
    if (phoneLinksEnabled) {
      linkifyPhoneNumbers();
    }
  }

  function linkifyPhoneNumbers() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
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
