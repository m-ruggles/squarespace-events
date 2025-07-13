const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const token = process.env.PCO_ACCESS_TOKEN;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Missing access token" }),
    };
  }

  try {
    const response = await fetch("https://api.planningcenteronline.com/registrations/v2/events", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "DiscoveryEventsApp (mike@dc2.me)"
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to fetch events", details }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};