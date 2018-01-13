class Rule {
  constructor(host, language) {
    this.host = host;
    this.language = language;
  }

  get pattern() {
    return `*://${this.host}/*`
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
