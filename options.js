import { Rule, getRules } from "./rules.js";

const $ = selector => document.querySelector(selector);
const sleep = ms => new Promise(cb => setTimeout(cb, ms));

async function saveOptions(ev) {
  const button = $("button[type='submit']");
  ev.preventDefault();
  button.disabled = true;
  try {
    // Get rules from form
    const list = document.querySelectorAll("#list li");
    const rules = Array.from(list)
      .map(li => ({
        host: li.querySelector(".host").value,
        language: li.querySelector(".language").value
      }))
      .filter(rule => rule.host && rule.language)
      .map(({host, language}) => new Rule(host, language));

    // Check permission
    const permissions = {
      origins: rules.map((rule) => rule.permissionOrigins),
    };
    if (!await browser.permissions.request(permissions)) {
      throw new Error("permssions rejected");
    }

    // Save rules
    await browser.storage.local.set({ rules: rules });
    $("#saved").classList.add("show");
    await sleep(800);
    $("#saved").classList.remove("show");
  } catch (err) {
    alert(`Failed to save rules: ${err}`)
  } finally {
    button.disabled = false;
  }
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
