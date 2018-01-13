"use strict";

let rules = [];

function rewriteAcceptLanguage(e) {
  let rule = rules[0];
  for (let header of e.requestHeaders) {
    if (header.name.toLowerCase() === "accept-language") {
      header.value = rule.language;
    }
  }
  return {requestHeaders: e.requestHeaders};
}

async function registerHandle() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteAcceptLanguage);
  rules = await getRules();
  let patterns = rules.map(rule => rule.pattern);
  if (!patterns) return;
  chrome.webRequest.onBeforeSendHeaders.addListener(
    rewriteAcceptLanguage,
    {urls: patterns},
    ["blocking", "requestHeaders"]
  );
}

registerHandle().then(() => {
  browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === "local") await registerHandle();
  });
});

