"use strict";

class Rule {
  constructor(host, language) {
    this.host = host;
    this.language = language;
    this.handleRewrite = this.handleRewrite.bind(this);
  }

  get pattern() {
    return `*://${this.host}/*`
  }

  handleRewrite(e) {
    console.log("handle rewrite");
    for (let header of e.requestHeaders) {
      if (header.name.toLowerCase() === "accept-language") {
        header.value = this.language;
        console.log(`${e.host}: ${header.value}`);
      }
    }
    return {requestHeaders: e.requestHeaders};
  }

  unregister() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(this.handleRewrite);
  }

  register(callback) {
    console.log("add " + this.pattern);
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.handleRewrite,
      {urls: [this.pattern]},
      ["blocking", "requestHeaders"]
    );
  }
}

async function getRules() {
  let opts = await browser.storage.local.get("rules");
  if (opts.rules)
    return opts.rules
        .filter(v => v.host && v.language)
        .map(v => new Rule(v.host, v.language));
  else
    return [];
}
