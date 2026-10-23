---
meta:
  contentType: How-to
---

# Release Aura with Atria on Cloudflare

Use this guide to deploy Aura’s frontend and AI endpoint together on Cloudflare Workers. You need access to a Cloudflare account and an Atria API key. The app provides one AI reflection for every Gentle words release; it does not store conversations.

<!-- Documentation plan: Overview: one Cloudflare deployment with static assets and an AI Worker. Goal: configure, deploy, and verify an AI release. Audience: Aura maintainer with account access. Documentation plan: prerequisites, checks, secrets, deployment, verification, recovery. Open questions: live account/domain, provider retention terms, live latency and response quality. -->

## Verify the candidate

Run the build, backend tests, browser checks, lint, and dependency audit:

```sh
npm test
npm run lint
npm audit
npm run deploy:check
```

`deploy:check` bundles the Worker and validates the Cloudflare configuration without publishing. Browser tests use synthetic writing and mocked AI responses. Backend tests exercise validation, origin checks, rate limiting, provider failures, and routing without using a real key.

## Configure the deployment

The `wrangler.jsonc` configuration serves `dist` as static assets and sends `/api/*` requests to the Worker. The `/api/reflect` endpoint calls [Atria’s Chat Completions API](https://api.atria-asi.ai/docs), using the `Atria-Dawn` model. Cadence uses the same provider host, although its recorded model configuration names the earlier preview.

1. Sign in to Cloudflare with `npx wrangler login`.
2. Confirm the Worker name in `wrangler.jsonc` is available in your account. Change it before publishing if an existing Worker uses that name.
3. Confirm rate-limit namespace `1001` is not shared with an unrelated Worker. Change it if necessary.
4. Deploy with AI disabled using `npm run deploy`.
5. Store your key with `npx wrangler secret put ATRIA_API_KEY`. Enter the key at the hidden prompt; never add it to frontend variables or Git.
6. Change `AI_ENABLED` to `true` in `wrangler.jsonc` after the key is configured.
7. Redeploy with `npm run deploy`.

The deployment command prints a `workers.dev` URL. You can use that URL for the pilot and add a custom domain through Cloudflare’s dashboard. You do not need a separate backend server or database.

For local testing, copy `.dev.vars.example` to `.dev.vars`, enter the key in that ignored file, and run `npm run dev:worker`. This command builds the frontend and serves the Worker and assets together. Plain `npm run dev` and `npm run preview` serve only the frontend.

## Check the live release

Verify the deployed URL using synthetic content before sharing it:

1. Open `/mirror`, write a synthetic sentence, leave **Gentle words** selected, and release. Confirm the response appears and the next expression starts empty.
2. Choose **Just let me release** and confirm writing is not sent to the AI endpoint.
3. Disconnect from the network after loading online. Confirm quiet release works offline; an AI failure must preserve the draft.
4. Verify direct `/mirror` and `/settings` navigation, security headers, installation, and explicit updates.
5. Complete the accessibility and physical-device checks in [Verify the private Mirror pilot](verify-pilot.md).
6. Review synthetic AI outputs for ordinary feelings, crisis language, attempts to override instructions, and unsupported medical claims. Record latency, model, and findings.
7. Verify Atria’s retention and data-use terms, and finalize the participant-facing disclosure before a public release. The preview explicitly identifies the unverified retention status.

Aura does not persist or log drafts. It stores a generated response on this device only when you choose Save words. Cloudflare processes requests, and Atria receives writing and selected feelings when you release with Gentle words selected. Provider processing is subject to its own policies; API compatibility does not establish OpenAI’s data policies for Atria.

The Worker applies an approximate limit of 5 requests per IP per 60 seconds at each Cloudflare location. People sharing a network also share this allowance. The [Cloudflare rate limiter](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) is not a strict worldwide spending cap. Configure provider quota controls appropriate to the pilot.

## Disable AI or recover

Set `AI_ENABLED` to `false` and redeploy to stop provider calls while keeping local releases usable. AI requests fail closed when the key is missing or the rate limiter fails. The app keeps the draft when a request fails and lets the person retry or choose quiet release.

Record the working Cloudflare version and URL before updating. Use Cloudflare’s deployment history to restore that version if needed, then repeat the live checks. Preserve browser storage during rollback.
