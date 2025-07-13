const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Encode your client ID and secret using Basic Auth
  const basicAuth = Buffer.from(
    `${process.env.PCO_CLIENT_ID}:${process.env.PCO_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch(
      "https://api.planningcenteronline.com/registrations/v2/events",
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Failed to fetch events",
          details: errorText,
        }),
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
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected server error",
        details: err.message,
      }),
    };
  }
};