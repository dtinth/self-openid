// @ts-check

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { parseArgs } from "util";
import * as jose from "jose";

const { values: options } = parseArgs({
  options: {
    kid: { type: "string" },
  },
});

mkdirSync(".data/keys", { recursive: true });

// Generate a private key if one doesn't exist
const kid = options.kid || "default";
const privateKeyPath = `.data/keys/${kid}.key.json`;
const publicKeyPath = `.data/keys/${kid}.pub.json`;

const publicKey = await (async () => {
  if (!existsSync(publicKeyPath)) {
    const pair = await jose.generateKeyPair("RS256", { extractable: true });
    console.log("Generated a new keypair.");
    const privateKey = await jose.exportJWK(pair.privateKey);
    const publicKey = await jose.exportJWK(pair.publicKey);
    writeFileSync(privateKeyPath, JSON.stringify(privateKey));
    writeFileSync(publicKeyPath, JSON.stringify(publicKey));
    return publicKey;
  }
  console.log(`Public key file "${publicKeyPath}" already exists — skipping.`);
  return JSON.parse(readFileSync(publicKeyPath, "utf8"));
})();

// Update jwks.json
const jwks = (() => {
  try {
    return JSON.parse(readFileSync(".well-known/jwks.json", "utf8"));
  } catch {
    return { keys: [] };
  }
})();

const key = { ...publicKey, kid };
const index = jwks.keys.findIndex((key) => key.kid === kid);

if (index === -1) {
  jwks.keys.unshift(key);
} else {
  jwks.keys[index] = key;
}

writeFileSync(".well-known/jwks.json", JSON.stringify(jwks, null, 2));
