export class Rule {
  constructor(host, language) {
    this.host = host || "";
    this.language = language || "";
  }

  get canonicalDomain() {
    if (this.host === '*') {
      return '*';
    } if (this.host.startsWith('*.')) {
      return '*.' + new URL(`http://${this.host.slice(2)}`).host;
    } else {
      return new URL(`http://${this.host}`).host;
    }
  }

  get urlFilter() {
    return `*://${this.canonicalDomain}/*`;
  }

  get rule() {
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
        resourceTypes: ["main_frame", "sub_frame"],
        urlFilter: this.urlFilter
      },
      priority: this.host.split(".").length
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
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
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
