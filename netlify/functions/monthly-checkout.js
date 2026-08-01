// Creates a Stripe Checkout Session for the £25/month membership (subscription).
// Zero-dependency: calls the Stripe REST API directly (Node 18+ global fetch),
// so the site stays build-free. The secret key is read from the Netlify env var
// STRIPE_SECRET_KEY and is NEVER committed to the repo.
const PRICE_ID = "price_1TpQB9DnZBHLwUvBvbVOfGLV"; // £25/month membership (recurring)

exports.handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe not configured" }) };
  }
  const origin = event.headers.origin || "https://quantedgesyndicate.com";
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": PRICE_ID,
    "line_items[0][quantity]": "1",
    "payment_method_types[0]": "card",
    success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/wc2026_pass.html`,
  });
  try {
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await resp.json();
    if (data.error) {
      return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
    }
    return { statusCode: 303, headers: { Location: data.url }, body: "" };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
