import { RuleSet, getRules } from "./rules.js";

async function applyRulesFromStorage() {
  const rules = new RuleSet(await getRules());
  rules.registerAll();
}

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    console.info('Addon updated; reload rules.');
    await applyRulesFromStorage();
  }
});

browser.storage.local.onChanged.addListener(async () => {
  console.debug("Ruleset changed");
  await applyRulesFromStorage();;
});
