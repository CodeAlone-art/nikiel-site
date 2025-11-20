// functions/api/contact.ts

export const onRequestPost: PagesFunction = async (context) => {
  const form = await context.request.formData();
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const message = String(form.get("message") || "");

  console.log("[CONTACT FORM]", { name, email, message });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
