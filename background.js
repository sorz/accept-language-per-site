"use strict";

let rules = [];

async function registerHandle() {
  for (let rule of rules)
    rule.unregister();
  rules = await getRules();
  for (let rule of rules)
    rule.register();
}

registerHandle().then(() => {
  browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") await registerHandle();
  });
});

