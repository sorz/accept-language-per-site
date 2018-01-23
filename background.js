"use strict";

let rules = [];

async function registerHandle() {
  rules.forEach(r => r.unregister());
  rules = new RuleSet(await getRules());
  rules.forEach(r => r.register());
}

registerHandle().then(() => {
  browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") await registerHandle();
  });
});
