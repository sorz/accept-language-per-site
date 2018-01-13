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
  let list = document.querySelector("#list");
  list.innerHTML = '';
  rules.forEach(rule => list.appendChild(rule.formHTML));
  list.appendChild(new Rule("", "").formHTML);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
