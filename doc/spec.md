# Moniker Spec

This document outlines how Moniker parses records for a domain.

## Cryptocurrency Address

Moniker expects cryptocurrency address in the following format:

    fullname:address

e.g.

    bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

These addresses will be parsed to Moniker underneath the addr array. You can access
an address linked to a Moniker by calling `get(fullname``)` or, in the case of Bitcoin, Ethereum, and
Handshake - call our helper functions of `bitcoin(), ethereum(), handshake()`.

As of right now, Moniker will only parse cryptocurrency addresses that are stored in the Addr
record on a Handshake domain. If you use Moniker to attach addresses to a domain, this is done
automatically for you.


