"use strict";

function saveOptions(e) {
  e.preventDefault();
  let rules = [{
    host: document.querySelector(".host").value,
    language: document.querySelector(".language").value
  }];
  console.log(rules);
  browser.storage.local.set({
    rules: rules
  });
}

async function restoreOptions() {
  let rules = await getRules();
  for (const rule of rules) {
    document.querySelector(".host").value = rule.host;
    document.querySelector(".language").value = rule.language;
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
