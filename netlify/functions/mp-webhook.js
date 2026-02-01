// Netlify Function: mp-webhook
// Configure MERCADO_PAGO_ACCESS_TOKEN, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify env vars.

const getPaymentId = (event) => {
  if (event.queryStringParameters?.id) return event.queryStringParameters.id;
  try {
    const body = JSON.parse(event.body || "{}");
    return body?.data?.id || body?.id;
  } catch (error) {
    return null;
  }
};

exports.handler = async (event) => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!accessToken || !supabaseUrl || !serviceKey) {
    return {
      statusCode: 500,
      body: "Missing env vars"
    };
  }

  const paymentId = getPaymentId(event);

  if (!paymentId) {
    return {
      statusCode: 200,
      body: "No payment id"
    };
  }

  try {
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(paymentData?.message || "Mercado Pago error");
    }

    if (paymentData.status === "approved") {
      // TODO: atualizar a tabela existente de reservas/bloqueios no Supabase.
      // Use a metadata do pagamento para localizar a reserva.
      const updatePayload = {
        status: "approved",
        payment_id: paymentId
      };

      await fetch(`${supabaseUrl}/rest/v1/reservas?payment_id=eq.${paymentId}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(updatePayload)
      });
    }

    return {
      statusCode: 200,
      body: "ok"
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: `erro: ${error.message}`
    };
  }
};
