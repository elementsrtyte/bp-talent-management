/** Override with `VITE_N8N_ROSTER_WEBHOOK` in `.env` if the webhook URL changes. */
export const N8N_ROSTER_WEBHOOK =
  import.meta.env.VITE_N8N_ROSTER_WEBHOOK ??
  "https://blueprintapps.app.n8n.cloud/webhook/fb793796-4d70-4fc0-9efa-f3b4c5baf09a";
