const fetch = require("node-fetch");

exports.handler = async () => {
  const pat = process.env.PCO_ACCESS_TOKEN;
  const client_id = process.env.PCO_CLIENT_ID

  if (!client_id) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Missing access token" }),
    };
  }

  try {
const credentials = Buffer.from(`${client_id}:${pat}`).toString('base64');
     let allData = [];
    let url = "https://api.planningcenteronline.com/registrations/v2/signups";

while (url) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "X-PCO-API-Version": "2018-08-01",
          Accept: "application/json",
          "User-Agent": "DiscoveryEventsApp (mike@dc2.me)"
        },
      });

      // Handle rate limiting (HTTP 429)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "1", 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue; // Retry the same request after waiting
      }

      // Dynamically adjust for rate limits if close to the limit
      const rateLimit = parseInt(response.headers.get("X-PCO-API-Request-Rate-Limit") || "100", 10);
      const ratePeriod = parseInt(response.headers.get("X-PCO-API-Request-Rate-Period") || "20", 10);
      const rateCount = parseInt(response.headers.get("X-PCO-API-Request-Rate-Count") || "0", 10);

      // If we're within 5 requests of the limit, pause for the period
      if (rateLimit - rateCount <= 5) {
        await new Promise(resolve => setTimeout(resolve, ratePeriod * 1000));
      }

      if (!response.ok) {
        const details = await response.text();
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: "Failed to fetch events", details }),
        };
      }

      const page = await response.json();
      if (Array.isArray(page.data)) {
        allData = allData.concat(page.data);
      }

      url = page.links && page.links.next ? page.links.next : null;
    }

console.dir(allData,{depth:null});
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    const filteredEvents = (allData || []).filter(event => {
      const visibility = event.attributes.visibility;
      const openAt = event.attributes.open_at ? event.attributes.open_at.slice(0, 10) : null;
      const hideAt = event.attributes.hide_at ? event.attributes.hide_at.slice(0, 10) : null;
      return (
        visibility === "public" &&
        openAt <= todayISO &&
        (!hideAt || hideAt >= todayISO) &&
        // !archived &&
        event.type === "Event"
      );
    });


    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredEvents),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: error.message }),
    };
  }
};