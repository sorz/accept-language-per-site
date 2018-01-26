"use strict";

const $ = selector => document.querySelector(selector);
const sleep = ms => new Promise(cb => setTimeout(cb, ms));

async function saveOptions(ev) {
  ev.preventDefault();
  ev.target.disabled = true;

  let list = document.querySelectorAll("#list li");
  let rules = Array.from(list).map(li => ({
      host: li.querySelector(".host").value,
      language: li.querySelector(".language").value
  })).filter(rule => rule.host && rule.language);
  await browser.storage.local.set({ rules: rules });

  ev.target.disabled = false;
  $("#saved").classList.add("show");
  await sleep(800);
  $("#saved").classList.remove("show");
}

async function restoreOptions() {
  let rules = await getRules();
  let list = $("#list");
  list.innerHTML = '';
  rules.forEach(rule => list.appendChild(rule.formHTML));
  list.appendChild(new Rule().formHTML);
}

function addMoreRule() {
  $("#list").appendChild(new Rule().formHTML);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
$("form").addEventListener("submit", saveOptions);
$("#more").addEventListener("click", addMoreRule);
