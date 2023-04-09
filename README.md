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
```