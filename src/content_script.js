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

const replaceMapping = new Map([
    [/\bTaiwan, province of [a-zA-Z]*\b/gu, "Taiwan"],
    [/\bTaiwan, China\b/gu, "Taiwan"],
    [/\bChina Taiwan\b/gu, "ROC (Taiwan)"],
    [/\bTaiwan China\b/gu, "Taiwan (ROC)"],
    [/中[國国][臺台]([灣湾])/gu, "台$1"],
    [/[臺台]([灣湾])省/gu, "台$1"]
]);

function replaceText(string) {
    replaceMapping.forEach((str, regexp) => {
        string = string.replace(regexp, str);
    });
    return string;
}

function stringMatches(string) {
    let matches = false;
    replaceMapping.forEach((_, regexp) => {
        if (string.match(regexp)) {
            matches = true;
        }
    });
    return matches;
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

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    let docTitle = doc.getElementsByTagName("title")[0];
    let observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    };
    // The callback used for the document body and title observers
    const observerCallback = (mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Should never operate on user-editable content
                if (isForbiddenNode(node)) {
                    return;
                }
                if (node.nodeType === 3) {
                    // Replace the text for text nodes
                    node.nodeValue = replaceText(node.nodeValue);
                } else {
                    // Otherwise, find text nodes within the given node and replace text
                    walk(node);
                }
            });
        });
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
