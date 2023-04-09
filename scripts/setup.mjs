import { existsSync, mkdirSync, writeFileSync } from "fs";
import { parseArgs } from "util";
import * as jose from "jose";

const { values: options } = parseArgs({
  options: {
    issuer: { type: "string" },
    kid: { type: "string" },
  },
});

if (!options.issuer) {
  throw new Error("--issuer is required");
}

const issuer = options.issuer.replace(/\/$/, "");

writeFileSync(
  ".well-known/openid-configuration",
  JSON.stringify(
    {
      id_token_signing_alg_values_supported: ["RS256"],
      issuer: issuer,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      authorization_endpoint: `${issuer}`,
      response_types_supported: ["id_token"],
      subject_types_supported: ["public"],
    },
    null,
    2
  )
);

mkdirSync(".data/private-keys", { recursive: true });

// Generate a private key if one doesn't exist
const kid = options.kid || "default";
const privateKeyPath = `.data/private-keys/${kid}.key.json`;
const publicKeyPath = `.data/private-keys/${kid}.pub.json`;

if (!existsSync(publicKeyPath)) {
  const pair = await jose.generateKeyPair("RS256", { extractable: true });
  const privateKey = await jose.exportJWK(pair.privateKey);
  const publicKey = await jose.exportJWK(pair.publicKey);
  writeFileSync(privateKeyPath, JSON.stringify(privateKey));
  writeFileSync(publicKeyPath, JSON.stringify(publicKey));
}
