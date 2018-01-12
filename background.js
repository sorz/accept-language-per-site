"use strict";

let opts = {};

function rewriteAcceptLanguage(e) {
  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() === "accept-language") {
      header.value = opts.language;
      console.log(`${header.name}: ${header.value}`);
    }
  }
  return {requestHeaders: e.requestHeaders};
}

function registerHandle() {
  chrome.webRequest.onBeforeSendHeaders.removeListener(rewriteAcceptLanguage);
  if ((!opts.host) || (!opts.language)) return;

  let patterns = [`*://${opts.host}/*`];
  chrome.webRequest.onBeforeSendHeaders.addListener(
    rewriteAcceptLanguage,
    {urls: patterns},
    ["blocking", "requestHeaders"]
  );
}

function updateOptions(changes) {
  Object.assign(opts, changes);
  registerHandle();
}

browser.storage.local.get().then(updateOptions);
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") updateOptions(changes);
});
