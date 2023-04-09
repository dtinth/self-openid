# self-openid
Become your own OpenID Connect provider

```sh
# Install dependencies
pnpm install

# First time - set up `openid-configuration` file
# Note: Set your own issuer URL
node scripts/setup.mjs --issuer=https://dtinth.github.io/self-openid

# Create a key pair
node scripts/create-key.mjs --kid=default

# Generate an ID token
node scripts/create-id-token.mjs --aud=dummy
```

## Why?

Basically, I want to [protect my Azure Container App](https://learn.microsoft.com/en-us/azure/container-apps/authentication) endpoints from unauthorized access. Their authentication solution is based on OpenID Connect. This project implements a minimal OpenID Connect provider that is compliant with [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps).

1. Run the `setup` script to set up a new provider and generate a `.well-known/openid-configuration` file. The `.well-known` folder can be deployed to a static website host, and you need to specify the URL of the host as the `--issuer` parameter.

2. Run the `create-key` script to generate a new keypair. The keypair is stored in the `.data/keys` folder. This folder should be kept secret as it contains the private key. This will also update the `jwks.json` file with the new public key.

3. Deploy the `.well-known` folder to a static website host (e.g. GitHub Pages.)

4. Register the OpenID Connect provider with the target service:

    Example with Azure Container Apps:

    > ![image](https://user-images.githubusercontent.com/193136/230766749-5e9fa5ce-642a-44e4-adda-c772789b0739.png)

5. Whenever you want to generate a new ID token, run the `create-id-token` script. The script will generate a new ID token and print it to the console. You can then use the ID token to authenticate with the target service.

    Example with Azure Container Apps:

    1. Generate an ID token with the `--aud` parameter set to the registered Client ID.

    2. Make an HTTP POST request to `/.auth/login/<provider-name>`, e.g.

        ```http
        POST https://<app>.azurecontainerapps.io/.auth/login/dtinth-self-openid
        Content-Type: application/json

        {"id_token":"<id-token>"}
        ```

    3. The response will be a JSON document that contains an `authenticationToken` field.

    4. When making a request to the protected endpoint, include the `authenticationToken` in the `Authorization` header.

        ```http
        GET https://<app>.azurecontainerapps.io/
        x-zumo-auth: <authenticationToken>
        ```
