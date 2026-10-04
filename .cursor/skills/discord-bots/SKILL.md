---
name: discord-bots
description: >-
  Build and extend Discord bots with discord.py: create the application, hold
  the gateway, read and send messages, call the REST API, add slash commands,
  and add a feature to an existing bot. Use when the user mentions Discord, a
  Discord bot, discord.py, discord.js, slash commands, the gateway, intents,
  webhooks, channels, threads, or forum channels.
---

# Discord bots

Build a bot that uses a bot token and the current Discord API. The estate's
worked example is [live-action-intel](https://github.com/goatindex/live-action-intel)
(`src/lai/bot.py`, `DEPLOY.md`). Copy its shape when it helps. Do not copy its
game-day domain, and do not treat it as an agent control surface.

This skill does not choose how a server should be organised. Layout is a
separate decision.

## Library

Default to **discord.py 2** (`import discord`, `discord.app_commands`). It is
what live-action-intel runs.

Use **discord.js** instead when the bot lives in a TypeScript repo, including
one that calls `@cursor/sdk`. The operations below are the same jobs; the
library calls change. discord.js docs: <https://discord.js.org/docs/packages/discord.js/main>.

Do not add a second library "for later".

## Rules that are easy to get wrong

- Use a **bot token** from the Developer Portal. A user-account token is a
  self-bot and is not allowed. Policy: <https://docs.discord.com/developers/policy>.
- **Message Content** is off until it is enabled in the portal *and* requested
  in code. Without it, `content`, `embeds`, `attachments`, `components`, and
  `poll` arrive empty. Messages the bot itself sent, DMs with the bot, and
  messages that mention the bot are the exceptions.
  <https://docs.discord.com/developers/events/gateway#message-content-intent>
- Acknowledge an interaction within **3 seconds** (`defer` if the work is
  slower). The token then lasts **15 minutes**.
  <https://docs.discord.com/developers/interactions/receiving-and-responding>
- Do not hardcode rate limits. Read `Retry-After` / `retry_after`. discord.py
  already queues 429s. Stop on a 401; do not retry a dead token.
- A bot that reads ordinary channel messages needs a **process that stays
  connected** to the gateway. An interactions endpoint URL can answer slash
  commands with no gateway. It cannot see ordinary messages.
- Never commit a token. Read it from the environment.

## Operations

Each link is the procedure. Official pages are inside the procedure and listed
again in [references.md](references.md).

- [Create the bot](operations/create-bot/OPERATION.md) — application, token, invite, permissions.
- [Hold the gateway](operations/gateway/OPERATION.md) — intents, identify, reconnect.
- [Call the API](operations/calls/OPERATION.md) — REST, 429s, deferral, webhooks.
- [Send messages](operations/send/OPERATION.md) — 2000 characters, embeds, files.
- [Slash commands](operations/commands/OPERATION.md) — guild sync versus global sync.
- [Add a feature](operations/features/OPERATION.md) — module, command or listener, tests.
- [Channels, threads, forums](operations/channels/OPERATION.md) — types and server caps.
- [Host the process](operations/host/OPERATION.md) — what must stay running.
