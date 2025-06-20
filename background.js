// Remove all existing dynamic rules to ensure a clean slate
chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: [1] // Remove the rule with ID 1 if it exists
}, () => {
  // Add a new rule to block all image requests
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: 1, // Unique ID for our rule
      priority: 1, // High priority
      action: { type: "block" }, // Action: block the request
      condition: {
        // resourceTypes: ["image"] // Apply this rule to all image resource types
        resourceTypes: ["image", "media"]
      }
    }]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting declarativeNetRequest rule:", chrome.runtime.lastError);
    } else {
      console.log("Declarative Net Request rule set: All images will be blocked.");
    }
  });
});

// Listener for declarativeNetRequest updates (optional, for debugging)
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  if (info.request.resourceType === 'image' && info.rule.ruleId === 1) {
    console.log(`Blocked image: ${info.request.url}`);
  }
});