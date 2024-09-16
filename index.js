const core = require("@actions/core");
const NodeRSA = require("node-rsa");
const jwt = require("jsonwebtoken");

GITHUB_APP_ID = core.getInput("app_id");
INSTALLATION_ID = core.getInput("installation_id");

const payload = {
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 10 * 60,
  iss: GITHUB_APP_ID,
};

const private_key = core.getInput("private_key");
if (private_key == null || private_key == "") {
  throw new Error("No private key provided");
}

if (!private_key.startsWith("-----BEGIN RSA PRIVATE KEY-----\nMII")) {
  throw new Error("Invalid private key provided");
}

const privateKey = new NodeRSA(private_key);

const jwt_token = jwt.sign(payload, privateKey.exportKey("private"), {
  algorithm: "RS256",
});

fetch(
  `https://api.github.com/app/installations/${INSTALLATION_ID}/access_tokens`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt_token}`,
    },
  }
)
  .then((x) => {
    return x.json();
  })
  .then((x) => {
    core.setOutput("token", x["token"]);
  });
