export const prerender = false;

type Body = {
  name?: string;
  email?: string;
  message?: string;
  'cf-turnstile-response'?: string;
};

// Turnstile verify
async function verifyTurnstile(token: string, secret: string) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token })
  });
  const data = await res.json();
  return data.success === true;
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

export async function POST({ request, locals }: { request: Request; locals: any }) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: Body = {};

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      data = Object.fromEntries(form) as unknown as Body;
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Unsupported content type' }), { status: 415 });
    }

    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();
    const message = (data.message || '').toString().trim();
    const token = (data['cf-turnstile-response'] || '').toString();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400 });
    }

    // 1) Turnstile
    const secret = process.env.TURNSTILE_SECRET_KEY || '';
    if (!secret) {
      return new Response(JSON.stringify({ ok: false, error: 'Turnstile not configured' }), { status: 500 });
    }
    const human = await verifyTurnstile(token, secret);
    if (!human) {
      return new Response(JSON.stringify({ ok: false, error: 'Verification failed' }), { status: 403 });
    }

    // 2) Próba wysyłki e-mail TYLKO przez Cloudflare (jeśli dostępna na koncie)
    const FROM = process.env.EMAIL_FROM;
    const TO = process.env.EMAIL_TO;

    // Te globalne klasy są udostępniane przez Cloudflare, gdy Email Sending jest włączony.
    // (Nazwy mogą się różnić w UI; kod wykrywa ich dostępność).
    // @ts-ignore
    const EmailMessage = (globalThis as any).EmailMessage;
    // @ts-ignore
    const EmailSender = (globalThis as any).EmailSender;

    if (FROM && TO && EmailMessage && EmailSender) {
      // @ts-ignore
      const msg = new EmailMessage(
        FROM,
        TO,
        `NIKIEL – nowa wiadomość od ${name}`,
        {
          html: `
            <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.5">
              <h2 style="margin:0 0 8px">Formularz kontaktowy – NIKIEL</h2>
              <p><strong>Imię:</strong> ${escapeHtml(name)}</p>
              <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
              <p><strong>Wiadomość:</strong><br>${escapeHtml(message).replace(/\n/g,'<br>')}</p>
              <hr><small>Wysłano z nikiel.studio</small>
            </div>
          `,
          replyTo: email
        }
      );
      // @ts-ignore
      await EmailSender.send(msg);
      return new Response(JSON.stringify({ ok: true, delivered: true }), { status: 200 });
    }

    // 3) Plan B: zapis do KV (również 100% Cloudflare, bez osób trzecich)
    const kv = locals?.runtime?.env?.KV_SUBMISSIONS;
    if (kv?.put) {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await kv.put(
        `contact:${id}`,
        JSON.stringify({ name, email, message, ts: new Date().toISOString() }),
        { expirationTtl: 60 * 60 * 24 * 30 } // np. 30 dni
      );
      return new Response(JSON.stringify({ ok: true, stored: true }), { status: 200 });
    }

    // Jeśli nie ma jeszcze wysyłki e-mail ani KV, zwróć 501 z jasnym opisem:
    return new Response(JSON.stringify({ ok: false, error: 'Email sending not enabled and KV not bound' }), { status: 501 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }), { status: 500 });
  }
}
