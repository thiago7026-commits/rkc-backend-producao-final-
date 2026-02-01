// Netlify Function: create-preference
// Configure MERCADO_PAGO_ACCESS_TOKEN and SITE_URL in Netlify environment variables.
// SUPABASE_SERVICE_ROLE_KEY is NOT used here and must stay server-side only.

const buildCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: buildCorsHeaders(),
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: buildCorsHeaders(),
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const siteUrl = process.env.SITE_URL;

  if (!accessToken || !siteUrl) {
    return {
      statusCode: 500,
      headers: buildCorsHeaders(),
      body: JSON.stringify({ error: "Missing Mercado Pago env vars" })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { checkin, checkout, nome, email, telefone } = payload;

    // TODO: calcular o valor real no backend com base nas datas.
    const totalValue = 1000;

    const preferencePayload = {
      items: [
        {
          title: "Reserva Fulô de Pequi",
          quantity: 1,
          unit_price: totalValue,
          currency_id: "BRL"
        }
      ],
      payer: {
        name: nome,
        email,
        phone: {
          number: telefone
        }
      },
      metadata: {
        checkin,
        checkout
      },
      back_urls: {
        success: `${siteUrl}/sucesso.html`,
        failure: `${siteUrl}/erro.html`,
        pending: `${siteUrl}/pendente.html`
      },
      auto_return: "approved"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferencePayload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Mercado Pago error");
    }

    return {
      statusCode: 200,
      headers: buildCorsHeaders(),
      body: JSON.stringify({ init_point: data.init_point })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: buildCorsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};
