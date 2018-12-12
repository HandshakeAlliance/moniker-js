const assert = require("bsert");
const Resource = require("hsd/lib/dns/resource");

//TODO support multiple ways of connect to clients
//Also curious which is faster -> Blockchain lookups or DNS lookups
class MonikerClient {
  constructor(client) {
    assert(client);
    this.client = client;
  }

  async checkClient() {
    let info;
    try {
      info = await this.client.getInfo();
    } catch (e) {
      return false;
    }

    if (info) {
      return true;
    }

    return false;
  }

  async query(name) {
    let nameInfo = await this.client.execute("getnameresource", [name]);

    if (!nameInfo) return null;

    const moniker = new Moniker(nameInfo, name);

    return moniker;
  }
}

class Moniker {
  constructor(records, name) {
    this.name = name;
    this.addrs = {};

    this._parseRecords(records);
  }

  _parseRecords(data) {
    if (data.addr) {
      this._parseAddresses(data.addr);
    }

    return;
  }

  _parseAddresses(addrs) {
    assert(Array.isArray(addrs));

    for (let addr of addrs) {
      const parts = addr.split(":");
      assert(parts.length === 2);

      const [currency, address] = parts;

      this.addrs[currency] = address;
    }

    return;
  }

  bitcoin() {
    if (this.addrs.bitcoin) {
      return this.addrs.bitcoin;
    }
  }

  ethereum() {
    if (this.addrs.ethereum) {
      return this.addrs.ethereum;
    }
  }

  handshake() {
    if (this.addrs.handshake) {
      return this.addrs.handshake;
    }
  }

  //Generic function for checking if a moniker has a currency
  get(currency) {
    if (this.addrs[currency]) {
      return this.addrs[currency];
    }

    return null;
  }
}

module.exports.Moniker = Moniker;
module.exports.MonikerClient = MonikerClient;
