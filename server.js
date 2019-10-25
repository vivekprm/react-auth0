const express = require("express");
// To instantiate environment variables.
require("dotenv").config();

const jwt = require("express-jwt"); // Validate JWT and set req.user
const jwksRsa = require("jwks-rsa"); // Retrieve RSA keys from a JSON Web Key set (JWKS) endpoint that Auth0 exposes for our domain.

const app = express();

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header
  // and the signing keys provided by the jwks endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true, // cache the siging key
    rateLimit: true,
    jwksRequestsPerMinute: 5, // prevent attackers from requesting more than 5 per minute
    jwksUri: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  // Validate the audience and issuer
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
  // This must match the algorithm selected in Auth0 dashboard under our App's advanced settings under OAuth tab.
  algoriths: ["RS256"]
});

app.get("/public", function(req, res) {
  res.json({
    message: "Hello from a public API."
  });
});

app.get("/private", checkJwt, function(req, res) {
  res.json({
    message: "Hello from a private API."
  });
});

app.listen(3001);

console.log("API server listening on: " + process.env.REACT_APP_API_URL);
