const { FullNode, Network } = require("hsd");
const { NodeClient, WalletClient } = require("hs-client");
const network = Network.get("regtest");
const { Moniker, MonikerClient } = require("../lib/index.js");
const assert = require("bsert");

const node = new FullNode({
  memory: true,
  apiKey: "test",
  network: "regtest",
  workers: true,
  plugins: [require("hsd/lib/wallet/plugin")]
});

const clientOptions = {
  network: network.type,
  port: network.rpcPort,
  apiKey: "test"
};

const walletOptions = {
  network: network.type,
  port: network.walletPort,
  apiKey: "test"
};

const client = new NodeClient(clientOptions);
const walletClient = new WalletClient(walletOptions);
const chain = node.chain;
const miner = node.miner;
const wdb = node.require("walletdb").wdb;
const testDomain = "satoshi";

let moniker;
let wallet;
let nameQuery;

async function _mine() {
  const info = await client.getInfo();

  //Only mine once the chain has synced
  if (chain.height >= info.chain.height) {
    const block = await miner.mineBlock();
    const results = await chain.add(block);
  }
}

describe("Client", function() {
  this.timeout(5000);

  it("should open a full node, miner, and wallet", async () => {
    await node.open();
    await node.connect();
    await node.startSync();
    wallet = wdb.primary;
    await miner.addAddress(await wallet.receiveAddress());
  });

  it("The client should return info", async () => {
    const info = await client.getInfo();
    assert(info);
  });

  it("should create a moniker client", async () => {
    moniker = new MonikerClient(client);
  });

  it("should have a connected client", async () => {
    assert(moniker.checkClient());
  });

  it("should query a non registered name", async () => {
    let info = await moniker.query("notregistered");

    //info should be null
    if (info) {
      return false;
    }

    return true;
  });

  it("should mine 100 blocks", async () => {
    for (i = 0; i < 101; i++) {
      await _mine();
    }
  });

  it("should return a positive balance", async () => {
    const balance = await wallet.getBalance();

    assert(balance.confirmed > 0);
  });

  it("should win a domain", async () => {
    const open = await walletClient.execute("sendopen", [testDomain]);

    assert(open);

    for (i = 0; i < 20; i++) {
      await _mine();
    }

    const bid = await walletClient.execute("sendbid", [testDomain, 10, 11]);

    assert(bid);

    for (i = 0; i < 11; i++) {
      await _mine();
    }

    const reveal = await walletClient.execute("sendreveal", [testDomain]);

    assert(reveal);

    for (i = 0; i < 20; i++) {
      await _mine();
    }

    const data = {
      ttl: 172800,
      //Hardcode these above so it's easier to reference
      addr: [
        "handshake:ts1qhx2f7tj8wa33t9k7ke9l8ch9ft7hcns34v0fk8",
        "bitcoin:367f4YWz1VCFaqBqwbTrzwi2b1h2U3w1AF",
        "ethereum:0x4ca3cd774a18fa88c61eb9eb3429bc58d44cc4cf",
        "litecoin:LbmvmW3UWsvnJNNVLYzxxRxrg5PnFcvfpY",
        "bitcoincash:1PTmGagC7c1j4sBZ7uXRTia5GsK6kHb7fG",
        "zcash:t1aib2cbwPVrFfrjGGkhWD67imdBet1xDTr",
        "monero:44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A",
        "iota:44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A",
        "neo:ASH41gtWftHvhuYhZz1jj7ee7z9vp9D9wk"
      ]
    };

    const update = await walletClient.execute("sendupdate", [testDomain, data]);

    assert(update);

    for (i = 0; i < 5; i++) {
      await _mine();
    }

    const resource = await client.execute("getnameresource", [testDomain]);

    assert(resource);
  });

  it("should query the name info", async () => {
    nameQuery = await moniker.query(testDomain);

    assert(nameQuery);
  });

  it("should return the correct Bitcoin address", async () => {
    const bAddr = nameQuery.bitcoin();

    assert(bAddr === "367f4YWz1VCFaqBqwbTrzwi2b1h2U3w1AF");
  });

  it("should return the correct Ethereum address", async () => {
    const eAddr = nameQuery.ethereum();

    assert(eAddr === "0x4ca3cd774a18fa88c61eb9eb3429bc58d44cc4cf");
  });

  it("should return the correct Handshake address", async () => {
    const hAddr = nameQuery.handshake();

    assert(hAddr === "ts1qhx2f7tj8wa33t9k7ke9l8ch9ft7hcns34v0fk8");
  });

  it("should return the correct Litecoin address", async () => {
    const lAddr = nameQuery.get("litecoin");

    assert(lAddr === "LbmvmW3UWsvnJNNVLYzxxRxrg5PnFcvfpY");
  });
});

// moniker = new Moniker(client);
