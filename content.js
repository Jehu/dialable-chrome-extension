document.addEventListener('DOMContentLoaded', function() {
  const phoneRegex = /(\+?\d{1,4}[\s/-]?)?(\(?\d{1,4}\)?[\s/-]?)?[\d\s/-]{5,}/g;

  function linkifyPhoneNumbers() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const matches = node.nodeValue.match(phoneRegex);
      if (matches) {
        matches.forEach(phone => {
          if (!node.parentNode.closest('a')) {
            const link = document.createElement('a');
            link.href = `tel:${phone.replace(/\s+/g, '')}`;
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
