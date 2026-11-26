export interface Env {
  // KV namespace storing the notes array under a single key. Bind it with:
  //   wrangler kv namespace create NOTES
  // then paste the returned id into wrangler.toml.
  NOTES: KVNamespace;

  // Shared secret the page must send as `X-API-Key` on every request.
  // Set with: wrangler secret put API_KEY
  API_KEY: string;

  // Rate limit binding — see wrangler.toml's [[ratelimits]] block.
  RATE_LIMITER: RateLimit;
}
