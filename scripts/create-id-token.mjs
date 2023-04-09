// @ts-check

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { parseArgs } from "util";
import * as jose from "jose";
import { createPrivateKey } from "crypto";

const { values: options } = parseArgs({
  options: {
    kid: { type: "string" },
    sub: { type: "string" },
    aud: { type: "string" },
  },
});

// Generate a private key if one doesn't exist
const kid = options.kid || "default";
const sub = options.sub || "me";
const privateKeyPath = `.data/keys/${kid}.key.json`;
const key = await jose.importJWK(
  JSON.parse(readFileSync(privateKeyPath, "utf8")),
  "RS256"
);
const configuration = JSON.parse(
  readFileSync(".well-known/openid-configuration", "utf8")
);
const aud = options.aud || configuration.issuer;
const claims = {
  iss: configuration.issuer,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  sub: sub,
  aud: aud,
};
const token = await new jose.SignJWT(claims)
  .setProtectedHeader({ alg: "RS256", kid })
  .sign(key);
console.log(token);
