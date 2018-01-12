"use strict";

function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    host: document.querySelector("#host").value,
    language: document.querySelector("#language").value
  });
}

async function restoreOptions() {
  let opts = await browser.storage.local.get(["host", "language"]);
  document.querySelector("#host").value = opts.host || "";
  document.querySelector("#language").value = opts.language || "";
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
