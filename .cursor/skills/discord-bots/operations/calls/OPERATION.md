# Call the API

Prefer discord.py methods (`channel.send`, `interaction.response.send_message`)
over hand-built HTTP. Use raw REST when the library has no method, or when
the caller is not the gateway process (a webhook, a short script).

Rate limits: <https://docs.discord.com/developers/topics/rate-limits>.
Interactions: <https://docs.discord.com/developers/interactions/receiving-and-responding>.

## Rate limits

Do not hardcode a limit. Buckets move, and Discord says so.

On HTTP 429, wait for `Retry-After` or the JSON `retry_after` (seconds, may
be fractional), then retry that request. Headers that matter:

- `X-RateLimit-Remaining`, `X-RateLimit-Reset-After` — the bucket you are in
- `X-RateLimit-Bucket` — shared by similar routes
- `X-RateLimit-Scope` — `user`, `global`, or `shared`
- `X-RateLimit-Global: true` — the whole bot, not one route

Per-route buckets are separate per channel, guild, or webhook. Being limited
in one channel does not block another.

Global ceiling for a bot: **50 requests per second**. Interaction endpoints
are not counted against that global ceiling.

discord.py's HTTP client honours 429s. Do not wrap every call in your own
sleep. Do handle the cases it cannot invent a retry for:

- **401** — the token is wrong or was reset. Stop. Do not loop.
- **403** — missing permission. Check the channel overwrite before retrying.
- **404** on a webhook — that webhook is gone. Do not call it again.

**Invalid request limit:** 10,000 responses of 401, 403, or 429 in 10 minutes
gets the IP blocked at Cloudflare. A 429 with `X-RateLimit-Scope: shared` does
not count. A retry storm does.

## Interactions

An interaction token dies if you do not answer within **3 seconds**.

```python
await interaction.response.defer(thinking=True)  # the 3-second ack
await interaction.followup.send("result")        # any time in the next 15 minutes
```

Use `defer` when the work can exceed 3 seconds. Do not `defer` and also
`send_message` on `interaction.response`; the first ack wins, the second
throws.

The token lasts **15 minutes** from the interaction, including follow-ups.

Slash commands and components can arrive on the gateway, or by POST to an
**Interactions Endpoint URL** you set in the portal. The endpoint proves it
holds the application's public key (Ed25519). That path does not deliver
ordinary `MESSAGE_CREATE` events. If the feature is "someone typed in a
channel", you need the gateway, not this URL.

## Webhooks

A webhook posts into one channel without a gateway connection. It cannot read
the channel. Execute URL:
`https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`.

To post into a thread, pass `thread_id`.
<https://docs.discord.com/developers/resources/webhook>

Treat the webhook URL as a secret. It is a credential.

Use a webhook for "a CI job posts a line into a channel". Use the gateway bot
for "a person typed, and the bot has to see it".
