// /functions/api/contact.ts
// Prosty handler Cloudflare Pages Function – działa z formularzem Astro

export const onRequestPost: PagesFunction = async (context) => {
  const form = await context.request.formData();
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const message = String(form.get("message") || "");

  // Logujemy dane formularza do podglądu w Cloudflare Pages → Deployments → Logs
  console.log("[CONTACT]", { name, email, message });

  // Odpowiadamy 204 (bez treści)
  return new Response(null, { status: 204 });
};
// /functions/api/contact.ts
// Poprawiony handler Cloudflare Pages Function

export const onRequestPost: PagesFunction = async (context) => {
  const form = await context.request.formData();
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const message = String(form.get("message") || "");

  // Log w Cloudflare Pages → Deployments → Logs
  console.log("[CONTACT FORM]", { name, email, message });

  // Odpowiedź, której oczekuje frontend
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
