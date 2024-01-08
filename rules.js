export class Rule {
  constructor(host, language) {
    // "host" is legacy name, better be "expr"
    // The true host name is `this.canonicalDomain`
    this.host = host || '';
    this.language = language || '';
  }

  get isUniversalWidlcard() {
    return this.host === '*';
  }

  get isSubdomainWildcard() {
    return this.host.startsWith('*.');
  }

  get canonicalDomain() {
    if (this.isUniversalWidlcard) {
      return null;
    } else if (this.isSubdomainWildcard) {
      return new URL(`http://${this.host.slice(2)}`).host;
    } else {
      return new URL(`http://${this.host}`).host;
    }
  }

  get permissionOrigins() {
    if (this.isUniversalWidlcard) {
      return '*://*/*';
    } else {
      return `*://*.${this.canonicalDomain}/*`;
    }
  }

  get regexFilter() {
    if (this.isUniversalWidlcard) {
      return "https?:\\/\\/.*";
    }
    const escapedHost = this.canonicalDomain.replace('.', '\\.');
    if (this.isSubdomainWildcard) {
      return `https?:\\/\\/([^\\/]+\\.)?${escapedHost}\\/.*`;
    } else {
      return `https?:\\/\\/${escapedHost}\\/.*`;
    }
  }

  get rule() {
    let priority = this.host.split(".").length;
    if (!this.isUniversalWidlcard && !this.isSubdomainWildcard) {
      // Let `example.com` precedent `*.example.com`
      priority += 1;
    }
    console.debug(`Rule P${priority} ${this.language} [${this.host}] /${this.regexFilter}/`)

    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#rules
    return {
      id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "Accept-Language",
            operation: "set",
            value: this.language,
          }
        ]
      },
      condition: {
        regexFilter: this.regexFilter
      },
      priority
    };
  }

  get formHTML() {
    let template = document.querySelector("#rule");
    let content = document.importNode(template, true).content;
    content.querySelector(".host").value = this.host;
    content.querySelector(".language").value = this.language;
    return content;
  }
}

export class RuleSet {
  constructor(rules) {
    this.rules = rules;
  }

  async registerAll() {
    const oldRules = await browser.declarativeNetRequest.getDynamicRules();
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map((r) => r.id),
      addRules: this.rules.map((r) => r.rule),
    });
    console.debug(`Remove ${oldRules.length}; add ${this.rules.length} rules`);
  }
}

export async function getRules() {
  let opts = await browser.storage.local.get("rules");
  if (opts.rules)
    return opts.rules
        .filter(v => v.host && v.language)
        .map(v => new Rule(v.host, v.language));
  else
    return [];
}
