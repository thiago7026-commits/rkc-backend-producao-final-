// Netlify Function: sync-airbnb-calendar
// Configure AIRBNB_ICAL_URL in Netlify environment variables.

const formatDate = (raw) => {
  if (!raw) return null;
  const datePart = raw.split("T")[0];
  if (datePart.length !== 8) return null;
  return `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
};

const parseIcs = (icsText) => {
  const lines = icsText.split(/\r?\n/);
  const events = [];
  let current = null;

  lines.forEach((line) => {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
      return;
    }

    if (line.startsWith("END:VEVENT")) {
      if (current?.start_date && current?.end_date) {
        events.push({
          start_date: current.start_date,
          end_date: current.end_date,
          source: "airbnb"
        });
      }
      current = null;
      return;
    }

    if (!current) return;

    if (line.startsWith("DTSTART")) {
      const value = line.split(":")[1];
      current.start_date = formatDate(value);
    }

    if (line.startsWith("DTEND")) {
      const value = line.split(":")[1];
      current.end_date = formatDate(value);
    }
  });

  return events;
};

exports.handler = async () => {
  const icalUrl = process.env.AIRBNB_ICAL_URL;

  if (!icalUrl) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "AIRBNB_ICAL_URL not configured" })
    };
  }

  try {
    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.status}`);
    }

    const icsText = await response.text();
    const events = parseIcs(icsText);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(events)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
