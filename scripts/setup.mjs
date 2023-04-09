// @ts-check

import { writeFileSync } from "fs";
import { parseArgs } from "util";

const { values: options } = parseArgs({
  options: {
    issuer: { type: "string" },
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
