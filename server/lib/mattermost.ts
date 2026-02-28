type MMOptions = {
  username?: string;
  channel?: string;
  icon_url?: string;
};

let overrideWebhookUrl: string | null = null;

export async function sendMattermost(text: string, opts?: MMOptions) {
  const url = overrideWebhookUrl || process.env.MATTERMOST_WEBHOOK_URL;
  if (!url) {
    throw new Error("MATTERMOST_WEBHOOK_URL is not configured");
  }
  const body: Record<string, any> = { text };
  if (opts?.username) body.username = opts.username;
  if (opts?.channel) body.channel = opts.channel;
  if (opts?.icon_url) body.icon_url = opts.icon_url;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Mattermost error: ${res.status} ${msg || res.statusText}`);
  }
  return true;
}

export function setMattermostWebhook(url: string | null) {
  overrideWebhookUrl = url || null;
}

export function getMattermostConfig() {
  if (overrideWebhookUrl) return { configured: true, source: "override" };
  if (process.env.MATTERMOST_WEBHOOK_URL) return { configured: true, source: "env" };
  return { configured: false, source: "none" };
}
