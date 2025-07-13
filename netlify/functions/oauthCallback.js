// netlify/functions/oauthCallback.js
const fetch = require("node-fetch");
const querystring = require("querystring");

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing authorization code.",
    };
  }

  const body = {
    grant_type: "authorization_code",
    code,
    client_id: process.env.PCO_CLIENT_ID,
    client_secret: process.env.PCO_CLIENT_SECRET,
    redirect_uri: process.env.PCO_REDIRECT_URI,
  };

  const response = await fetch("https://api.planningcenteronline.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "DiscoveryEventsApp (mike@dc2.me)",
    },
    body: querystring.stringify(body),
  });

  const tokenData = await response.json();

  if (!response.ok) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to retrieve token", details: tokenData }),
    };
  }

  return {
    statusCode: 200,
    body: `Access Token: ${tokenData.access_token} — Store this in your .env file as PCO_ACCESS_TOKEN`,
  };
};