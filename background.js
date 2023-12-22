"use strict";

async function applyRulesFromStorage() {
  const rules = new RuleSet(await getRules());
  rules.registerAll();
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update' && details.previousVersion < '0.3.0') {
    console.info(`Migrate from ${details.previousVersion} mv2 to mv3`);
    await applyRulesFromStorage();
  }
});

browser.storage.onChanged.addListener(async (changes, area) => {
  console.debug("Ruleset changed");
  if (area === "local") await applyRulesFromStorage();;
});
