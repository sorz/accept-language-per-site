"use strict";

let rules = new RuleSet([]);

async function registerHandle() {
  rules.unregisterAll();
  rules = new RuleSet(await getRules());
  rules.registerAll();
}

registerHandle().then(() => {
  browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") await registerHandle();
  });
});
