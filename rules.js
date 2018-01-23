"use strict";

class Rule {
  constructor(host, language) {
    this.host = host || "";
    this.language = language || "";
    this.handleRewrite = this.handleRewrite.bind(this);
  }

  get pattern() {
    return `*://${this.host}/*`
  }

  get isWild() {
    return this.host.startsWith("*");
  }

  get pureHost() {
    if (this.isWild) {
      return this.host.substr(2);
    } else {
      return this.host;
    }
  }

  get formHTML() {
    let template = document.querySelector("#rule");
    let content = document.importNode(template, true).content;
    content.querySelector(".host").value = this.host;
    content.querySelector(".language").value = this.language;
    return content;
  }

  handleRewrite(e) {
    for (let header of e.requestHeaders) {
      if (header.name.toLowerCase() === "accept-language") {
        header.value = this.language;
      }
    }
    return {requestHeaders: e.requestHeaders};
  }

  unregister() {
    chrome.webRequest.onBeforeSendHeaders.removeListener(this.handleRewrite);
  }

  register(callback) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.handleRewrite,
      {urls: [this.pattern]},
      ["blocking", "requestHeaders"]
    );
  }
}

// "a.b.c" => ["a.b.c", "b.c", "c", ""]
function subHosts(host, self = true) {
  let segs = host.split(".");
  segs.reduceRight((suffix, host, i, segs) => {
    segs[i] = host + suffix;
    return "." + segs[i];
  }, "");
  if (!self) segs.shift();
  segs.push("");
  return segs;
}

Array.prototype.flatMap = function(f) {
  return this.map(f).reduce((c, i) => c.concat(i), [])
}

class RuleSet {
  constructor(rules) {
    let keyRules = rules.map(r => [r.pureHost, r]);
    this.tames = new Map(keyRules.filter(kr => !kr[1].isWild));
    this.wilds = new Map(keyRules.filter(kr => kr[1].isWild));
    console.log(this.wilds);
  }

  hasOverlapping() {
    return Array.from(this.wilds.keys())
        .flatMap(h => subHosts(h, false))
        .concat(Array.from(this.tames.keys()).flatMap(subHosts))
        .some(h => this.wilds.has(h));
  }

  // Return matched Rule or undefined
  get(host) {
    // Exactly matching fisrt
    if (this.tames.has(host))
      return this.tames.get(host);
    // Match wildcard rules, longer first.
    let matched = subHosts(host).find(h => this.wilds.has(h));
    if (matched != undefined)
      return this.wilds.get(matched);
  }

  forEach(func) {
    for (let rule of this.tames.values()) func(rule);
    for (let rule of this.wilds.values()) func(rule);
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
