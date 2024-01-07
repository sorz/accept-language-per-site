import { RuleSet, getRules } from "./rules.js";

async function applyRulesFromStorage() {
  const rules = new RuleSet(await getRules());
  rules.registerAll();
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    console.info('Addon updated; reload rules.');
    await applyRulesFromStorage();
  }
});

browser.storage.onChanged.addListener(async (changes, area) => {
  console.debug("Ruleset changed");
  if (area === "local") await applyRulesFromStorage();;
});
