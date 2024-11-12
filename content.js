window.addEventListener('load', function() {
  const phoneRegex = /(?<!\w)(\+49\s?\(0\)\s?\d{1,4}|\+49\s?\d{1,4}|0\d{1,4})[\s/-]?\d{1,5}([\s/-]?\d{1,5}){0,2}(?!\d*[^\d\s/-])(?!\w)/g;
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
