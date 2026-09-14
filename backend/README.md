# Orbit 2 AI backend — activation required

The front end stays on GitHub Pages. This Cloudflare Worker is a separate, deployable model service. It is **not live** until deployed to your Cloudflare account and configured in `docs/guide/config.json`.

## Deploy

1. Sign into your Cloudflare account and ensure Workers AI is available. Review the provider's current quotas and billing before enabling paid usage.
2. Clone this profile repository. In `backend`, run `npm install`, `npx wrangler login`, then `npm run check` and `npm run deploy`.
3. Wrangler creates the AI binding and SQLite Durable Object. No model API key goes in GitHub or the browser. Keep account credentials in Wrangler's local login or your deployment provider's secret store.
4. Open the returned Worker's `/health` endpoint. It must return `service: orbit-2` and `ready: true`.
5. Run the smoke test in `scripts/test_orbit_backend.mjs` locally before publishing. Test a POST to `/chat` from the GitHub Pages origin and verify a real model response.
6. Set `docs/guide/config.json` to `{"version":2,"endpoint":"https://YOUR-DEPLOYED-WORKER/chat","modelEnabled":true}` using the actual URL, then commit. GitHub Pages republishes automatically. Visitors can opt into AI with the AI mode button; it is off initially.

## Protection and limits

- Server-side Workers AI binding; no public credential.
- One Durable Object enforces **40 model requests globally per UTC day**, **10 per IP/day**, and **3 per IP/minute**, synchronously reserving before inference. Failed inference still consumes a reservation. Limits can be lowered through Worker variables; raising the hard ceilings requires a code change.
- At most 300 question characters, four previous question/answer pairs, 8 KB JSON body, and 256 output tokens. Previous answers are discarded before model inference so client-provided text cannot become trusted knowledge.
- Requests must come with the allowed browser Origin and Cloudflare-provided IP header. CORS is not authentication; automated clients can spoof Origin. Distributed abuse can exhaust the small global allowance, after which the page falls back to local notes. There is no unlimited inference path.
- Only a daily hash of the IP is stored for quota enforcement, plus counters. No chat text is stored by this Worker. Hashes are pseudonymous, not guaranteed anonymous. Old counters are removed on subsequent usage or the inactivity alarm. Cloudflare's own service data handling still applies.
- Retrieval selects approved notes bundled from `docs/guide/knowledge.json`. No private repositories, tools, external browsing, or arbitrary client documents are available to the model.
- Grounding and prompt instructions reduce unsupported answers; they do not guarantee a model will never be wrong. Model-generated text is labeled, rendered as plain text, and never used as executable navigation commands.
- Browser timeouts and backend/provider failures fall back to local answers. Client timeout does not cancel a running provider inference; the server quota already reserved its cost.

## Verified provider references

- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/

Default model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. This is model-backed Q&A, not a fine-tuned personal model. Activation and a real provider response cannot be verified without your Cloudflare deployment.
