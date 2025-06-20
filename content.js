// Function to create and insert a grey placeholder for both images and videos
function createGreyPlaceholder(originalElement) {
    // Check if the element has already been processed to avoid infinite loops or duplicates
    if (originalElement.dataset.extensionProcessed) {
        return;
    }
    originalElement.dataset.extensionProcessed = 'true'; // Mark as processed

    const computedStyle = window.getComputedStyle(originalElement);

    // Determine dimensions based on element type
    let width = 0;
    let height = 0;

    if (originalElement.tagName === 'IMG') {
        width = originalElement.width || originalElement.naturalWidth || parseInt(computedStyle.width, 10);
        height = originalElement.height || originalElement.naturalHeight || parseInt(computedStyle.height, 10);
    } else if (originalElement.tagName === 'VIDEO') {
        width = originalElement.width || originalElement.videoWidth || parseInt(computedStyle.width, 10);
        height = originalElement.height || originalElement.videoHeight || parseInt(computedStyle.height, 10);
    }

    // Fallback for cases where dimensions are 0 (e.g., no explicit size, or not yet rendered)
    if (width === 0) width = 50; // Minimum default width
    if (height === 0) height = 50; // Minimum default height

    // Create a new div element to act as the placeholder
    const placeholder = document.createElement('div');
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    placeholder.style.backgroundColor = '#cccccc'; // Light grey color

    // Maintain original display type (inline-block is good for both img and video)
    placeholder.style.display = computedStyle.display === 'inline' ? 'inline-block' : computedStyle.display;

    // Try to copy common layout styles to maintain page flow
    placeholder.style.margin = computedStyle.margin;
    placeholder.style.padding = computedStyle.padding;
    placeholder.style.float = computedStyle.float;
    placeholder.style.position = computedStyle.position;
    placeholder.style.top = computedStyle.top;
    placeholder.style.left = computedStyle.left;
    placeholder.style.right = computedStyle.right;
    placeholder.style.bottom = computedStyle.bottom;
    placeholder.style.verticalAlign = computedStyle.verticalAlign; // Important for inline-block
    placeholder.style.borderRadius = computedStyle.borderRadius; // Maintain rounded corners if any

    // Optional: Add a title for debugging/info
    placeholder.title = `Blocked ${originalElement.tagName} (Original size: ${width}x${height})`;

    // Replace the original element with the new placeholder
    if (originalElement.parentNode) {
        originalElement.replaceWith(placeholder);
        console.log(`Replaced ${originalElement.tagName}: ${originalElement.src || originalElement.currentSrc || 'data-uri/blob'} with grey box of size ${width}x${height}`);
    }
}

// Function to process newly added nodes
function processNode(node) {
    if (node.tagName === 'IMG' || node.tagName === 'VIDEO') {
        // For elements dynamically added, their dimensions might not be immediately available.
        // We can wait for a moment, or rely on computed styles.
        // Using requestAnimationFrame or a small setTimeout can help ensure computed styles are stable.
        // For simplicity, we directly call createGreyPlaceholder which uses computed styles.
        // However, for videos specifically, `videoWidth`/`videoHeight` might only be available after metadata loads,
        // but since we are blocking it, they often remain 0. `computedStyle` is the most reliable.
        requestAnimationFrame(() => createGreyPlaceholder(node));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Also check for images and videos within newly added elements
        node.querySelectorAll('img, video').forEach(el => {
            requestAnimationFrame(() => createGreyPlaceholder(el));
        });
    }
}

// Observe the DOM for new images and videos being added
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(processNode);
        }
    }
});

// Start observing the document body for changes, including subtree
observer.observe(document.body, { childList: true, subtree: true });

// Initial scan for images and videos that are already present in the DOM when the script loads
document.querySelectorAll('img, video').forEach(el => {
    processNode(el);
});

// Note on background images and audio tags:
// The declarativeNetRequest rule will block background images and audio tags too
// because they fall under "image" and "media" resource types.
// However, this content.js script specifically targets <img> and <video> elements
// for replacement. Replacing background images is significantly more complex.
// Audio tags (<audio>) don't visually occupy space in the same way, so replacing
// them with a grey box isn't typically desired or necessary for visual blocking.