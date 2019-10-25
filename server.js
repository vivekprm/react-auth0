const express = require("express");
// To instantiate environment variables.
require("dotenv").config();

const jwt = require("express-jwt"); // Validate JWT and set req.user
const jwksRsa = require("jwks-rsa"); // Retrieve RSA keys from a JSON Web Key set (JWKS) endpoint that Auth0 exposes for our domain.
const checkScope = require("express-jwt-authz"); // Validate JWT scopes

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

app.get("/courses", checkJwt, checkScope(["read:courses"]), function(req, res) {
  res.json({
    courses: [
      { id: 1, title: "Building app with react and redux" },
      { id: 2, title: "Creating reusable react components." }
    ]
  });
});

function checkRole(role) {
  return function(req, res, next) {
    const assignedRoles = req.user["http://localhost:3000/roles"];
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next();
    } else {
      res.status(401).send("Insufficient role");
    }
  };
}

app.get("/admin", checkJwt, checkRole("admin"), function(req, res) {
  res.json({
    message: "Hello from a admin API."
  });
});

app.listen(3001);

console.log("API server listening on: " + process.env.REACT_APP_API_URL);
