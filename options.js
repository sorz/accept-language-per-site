"use strict";

function saveOptions(e) {
  e.preventDefault();
  let list = document.querySelectorAll("#list li");
  let rules = Array.from(list).map(li => ({
      host: li.querySelector(".host").value,
      language: li.querySelector(".language").value
  })).filter(rule => rule.host && rule.language);
  browser.storage.local.set({
    rules: rules
  });
}

async function restoreOptions() {
  let rules = await getRules();
  let list = document.querySelector("#list");
  list.innerHTML = '';
  rules.forEach(rule => list.appendChild(rule.formHTML));
  list.appendChild(new Rule().formHTML);
}

function addMoreRule() {
  document.querySelector("#list")
    .appendChild(new Rule().formHTML);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#more").addEventListener("click", addMoreRule);
