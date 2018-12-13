/*!
 * monikerclient.js - Moniker - HNS Domain Wrapper
 * Copyright (c) 2018, Handshake Alliance (MIT License).
 * https://github.com/HandshakeAlliance/moniker-js
 */

"use strict";

const assert = require("bsert");
const Moniker = require("./moniker");

console.log(Moniker);

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

module.exports = MonikerClient;
