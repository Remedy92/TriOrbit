const RATE_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
const buckets = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  const entry = buckets.get(ip);
  if (!entry || entry.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true };
  }
  if (entry.count >= RATE_LIMIT.max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true };
}

function originAllowed(req) {
  const env = process.env.VERCEL_ENV;
  if (env !== "production" && env !== "preview") return true;

  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return false;

  const allowed = new Set();
  const add = (host) => {
    if (!host) return;
    const cleaned = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
    allowed.add(`https://${cleaned}`);
  };
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  add(process.env.VERCEL_BRANCH_URL);
  (process.env.ALLOWED_ORIGINS || "")
    .split(",").map((s) => s.trim()).filter(Boolean)
    .forEach(add);

  try {
    const u = new URL(origin);
    return allowed.has(`${u.protocol}//${u.host}`);
  } catch {
    return false;
  }
}

function cleanStr(val, max) {
  if (val == null || val === "") return "";
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed.length > max) return null;
  return trimmed;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+()\s-]{7,20}$/;

function looksSpammy(text) {
  if (!text) return false;
  const urlMatches = text.match(/https?:\/\/|www\./gi) || [];
  if (urlMatches.length >= 2) return true;
  if (/<a\s+href|\[url=|bit\.ly|tinyurl/i.test(text)) return true;
  return false;
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ error: "Too many requests" });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};

  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const service = cleanStr(body.service, 100);
  const propertyType = cleanStr(body.propertyType, 100);
  const size = cleanStr(body.size, 20);
  const when = cleanStr(body.when, 100);
  const notes = cleanStr(body.notes, 2000);
  const name = cleanStr(body.name, 100);
  const phone = cleanStr(body.phone, 30);
  const email = cleanStr(body.email, 254);
  const consent = body.consent === true;

  if ([service, propertyType, size, when, notes, name, phone, email].some((v) => v === null)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  if (!name || !consent) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!phone && !email) {
    return res.status(400).json({ error: "Provide phone or email" });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (phone && !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: "Invalid phone" });
  }
  if (looksSpammy(notes) || looksSpammy(name)) {
    return res.status(200).json({ ok: true });
  }

  const apiKey = process.env.AGENTMAIL_API_KEY;
  const inboxId = process.env.AGENTMAIL_INBOX_ID;
  if (!apiKey || !inboxId) {
    console.error("AGENTMAIL_API_KEY or AGENTMAIL_INBOX_ID not set");
    return res.status(500).json({ error: "Email not configured" });
  }

  const to = process.env.INQUIRY_TO || "triorbit.group@gmail.com";

  const text = [
    `Service:   ${service || "—"}`,
    `Property:  ${propertyType || "—"}`,
    `Size:      ${size ? size + " m²" : "—"}`,
    `When:      ${when || "—"}`,
    notes ? `\nNotes:\n${notes}` : null,
    "",
    `Name:   ${name}`,
    `Phone:  ${phone || "—"}`,
    `Email:  ${email || "—"}`,
  ].filter(Boolean).join("\n");

  const r = await fetch(`https://api.agentmail.to/inboxes/${encodeURIComponent(inboxId)}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject: `New inquiry — ${service || "TriOrbit"} (${name})`,
      text,
      reply_to: email || undefined,
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    console.error("AgentMail error", r.status, detail);
    return res.status(502).json({ error: "Failed to send" });
  }

  return res.status(200).json({ ok: true });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
