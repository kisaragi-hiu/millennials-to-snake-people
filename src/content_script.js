function walk(rootNode) {
  // Find all the text nodes in rootNode
  let node;
  let walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  // Modify each text node's value
  while ((node = walker.nextNode())) {
    node.nodeValue = replaceText(node.nodeValue);
  }
}

function replaceText(str) {
  return (
    str
      // Fix some misspellings
      .replace(/\b(M|m)illienial(s)?\b/g, "$1illennial$2")
      .replace(/\b(M|m)illenial(s)?\b/g, "$1illennial$2")
      .replace(/\b(M|m)ilennial(s)?\b/g, "$1illennial$2")
      .replace(/\b(M|m)ilenial(s)?\b/g, "$1illennial$2")
      // Millennial Generation
      .replace(
        /\b(?:Millennial Generation)|(?:Generation Millennial)\b/g,
        "Plissken Faction"
      )
      .replace(
        /\b(?:millennial generation)|(?:generation millennial)\b/g,
        "Plissken faction"
      )

      // Millennialism
      .replace(/\bMillennialism\b/g, "Reptilianism")
      .replace(/\bmillennialism\b/g, "reptilianism")
  );
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
  return (
    node.isContentEditable || // DraftJS and many others
    (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
    (node.tagName &&
      (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
        node.tagName.toLowerCase() == "input"))
  );
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      // Should never operate on user-editable content
      if (!isForbiddenNode(node)) {
        if (node.nodeType === 3) {
          // Replace the text for text nodes
          node.nodeValue = replaceText(node.nodeValue);
        } else {
          // Otherwise, find text nodes within the given node and replace text
          walk(node);
        }
      }
    });
  });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
  let docTitle = doc.getElementsByTagName("title")[0];
  let observerConfig = {
    characterData: true,
    childList: true,
    subtree: true
  };

  // Do the initial text replacements in the document body and title
  walk(doc.body);
  doc.title = replaceText(doc.title);

  // Observe the body so that we replace text in any added/modified nodes
  let bodyObserver = new MutationObserver(observerCallback);
  bodyObserver.observe(doc.body, observerConfig);

  // Observe the title so we can handle any modifications there
  if (docTitle) {
    let titleObserver = new MutationObserver(observerCallback);
    titleObserver.observe(docTitle, observerConfig);
  }
}

walkAndObserve(document);
