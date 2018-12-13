/*!
 * moniker.js - Moniker - HNS Domain Wrapper
 * Copyright (c) 2018, Handshake Alliance (MIT License).
 * https://github.com/HandshakeAlliance/moniker-js
 */

"use strict";

const Resource = require("hsd/lib/dns/resource");
const assert = require("bsert");

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

module.exports = Moniker;
