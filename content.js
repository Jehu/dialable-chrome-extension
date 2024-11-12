window.addEventListener('load', function() {
  const phoneRegex = /(\+?\d{1,4}[\s/-]?)?(\(0\))?(\(?\d{1,4}\)?[\s/-]?)?[\d\s/-]{5,}/g;
  console.log("Phone Linker script loaded.");

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
            let formattedPhone = phone.replace(/\s+/g, '');
            if (formattedPhone.startsWith('+') && formattedPhone.includes('(0)')) {
              formattedPhone = formattedPhone.replace('(0)', '');
            }
            link.href = `tel:${formattedPhone}`;
            link.textContent = phone;
            const newNode = document.createTextNode(node.nodeValue.replace(phone, ''));
            node.parentNode.insertBefore(link, node);
            node.parentNode.insertBefore(newNode, link.nextSibling);
            node.nodeValue = node.nodeValue.replace(phone, '');
          }
        });
      }
    }
  }

  linkifyPhoneNumbers();
});
