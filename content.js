window.addEventListener('load', function() {
  const phoneRegex = /(\+49\s?\(0\)\s?\d{1,4}|\+49\s?\d{1,4}|0\d{1,4})[\s/-]?\d{1,5}([\s/-]?\d{1,5}){0,2}/g;
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
            const remainingText = node.nodeValue.split(phone);
            node.parentNode.insertBefore(link, node);
            node.nodeValue = remainingText.shift();
            remainingText.forEach(text => {
              const textNode = document.createTextNode(text);
              node.parentNode.insertBefore(textNode, link.nextSibling);
            });
          }
        });
      }
    }
  }

  linkifyPhoneNumbers();
});
