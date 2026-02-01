// Payment helpers for Mercado Pago.
// Uses Netlify Function /create-preference which reads MERCADO_PAGO_ACCESS_TOKEN.

export async function startPayment(payload) {
  const response = await fetch("/.netlify/functions/create-preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Falha ao iniciar pagamento");
  }

  const data = await response.json();

  if (!data.init_point) {
    throw new Error("Resposta inválida do Mercado Pago");
  }

  window.location.href = data.init_point;
}
