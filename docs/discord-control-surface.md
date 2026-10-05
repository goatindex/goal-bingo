# Discord as a control surface

Advisory report, 2026-10-05. It states no Goal Bingo requirement and it is not
a section of `docs/design-description.md`.

**Framing:** How should a private Discord server take a prompt from a phone,
hand it to Cursor, and return the work, while the Claude subscription stays
on CI?

The category idea holds: one Discord category per repository (`goal-bingo`,
`code-terraform-companion`). What does not hold is a text channel per agent
chat as the default. Threads sit outside the channel cap; channels do not.

## What Discord will and will not do

A private server and a bot token are enough. Discord Nitro is not required
for the bot. A user-account token is a self-bot and is outside Discord's
policy (<https://docs.discord.com/developers/policy>).

The caps that shape the layout, from Discord's server-caps article
(<https://support.discord.com/hc/en-us/articles/33694251638295-Discord-Account-Caps-Server-Caps-and-More>)
and the threads page (<https://docs.discord.com/developers/topics/threads>):

| Cap | Number |
|---|---|
| Channels per server, categories included | 500 |
| Categories per server | 50 |
| Channels inside one category | 50 |
| Bot message `content` | 2000 characters |
| Create-message request | 25 MiB |

Threads do not count toward the 500. Active threads are capped; the threads
page does not publish one integer for that cap, and a busy server shortens
archive timers as it nears the cap. `auto_archive_duration` is 60, 1440,
4320, or 10080 minutes. Sending a message unarchives a thread unless it is
locked. Users who are not members of a thread do not get the parent's
notification for it. A thread opened from that person's message makes them
the owner. A thread the bot opens on its own stays quiet on the phone until
the bot adds them.

Other structural limits:

- **The gateway is a long-lived WebSocket.** A bot that reads ordinary
  messages needs a process that stays connected. An Interactions Endpoint URL
  can answer slash commands with no gateway. A webhook can post into a
  channel. Neither sees a person type. Serverless platforms that cannot hold
  the socket cannot be the reader. live-action-intel's
  [hosting-options.md](https://github.com/goatindex/live-action-intel/blob/main/hosting-options.md)
  is the estate's earlier write-up of that split; its prices are from 2026-08-20.
- **Message Content is a privileged intent.** Without the portal toggle and
  the intent flag, `content`, `embeds`, `attachments`, `components`, and
  `poll` arrive empty. Mentions, DMs with the bot, and the bot's own messages
  are the exceptions
  (<https://docs.discord.com/developers/events/gateway#message-content-intent>).
- **An interaction token lasts 15 minutes**, and the first ack must land
  within 3 seconds
  (<https://docs.discord.com/developers/interactions/receiving-and-responding>).
  A cloud agent run can outlive that token. The result has to be a normal
  message in the thread (`thread.send`), not only an interaction follow-up.
- **Discord is not a job queue.** A crash between accept and reply can run
  the agent twice or drop the reply. The bot has to store the thread id and
  the Cursor agent id before the run, and log the run id as soon as `send`
  returns.
- **Rate limits are real and must not be hardcoded.** A bot's global ceiling
  is 50 HTTP requests per second. 10,000 responses of 401, 403, or 429 in 10
  minutes blocks the IP
  (<https://docs.discord.com/developers/topics/rate-limits>). Streaming every
  token into Discord will hit this. Post a short status, then the final text
  or a file.
- **The phone is a good prompt box and a bad diff viewer.** Put the pull
  request URL in the message. Put a long diff or log in a file (25 MiB cap
  on the request).
- **Prompts, file contents, and replies are stored by Discord** and sit in
  the mobile app. Treat the server as private, allowlist your user id, and
  do not paste secrets into the channel.
- **The Claude CI bot stays the CI bot.** This control surface is a second
  Discord application and a second token. It does not post review gates and
  it does not share the CI credential.

## Open source

**Libraries to build with.** `discord.py` is the estate default (live-action-intel).
`discord.js` is the right library when the bot calls `@cursor/sdk`, because
that SDK's primary path is async TypeScript and a discord.py bot has to use
the Python SDK's async client on purpose
(<https://cursor.com/docs/sdk/typescript>, the Cursor SDK skill).

**A small Cursor bridge, useful as a spike, not as the product.**
[lilyzhng/agent-channels](https://github.com/lilyzhng/agent-channels) (7 stars
on 2026-10-05) wakes a Cursor CLI session on @mention and replies in the
thread. It uses `agent login` (subscription auth) and can run on a laptop or
a VPS. Read it before writing a local bridge. Do not vendor it unreviewed:
it would hold the Discord token and the Cursor login.

**A full agent gateway, the wrong worker.** [OpenClaw](https://docs.openclaw.ai/channels/discord)
already has Discord allowlists, mention gating, thread-bound sessions, and
forum posts. Its worker is OpenClaw's own agent runtime. The docs read for
this report do not show it launching a Cursor cloud agent. Adopting it means
operating that runtime. That fights the constraint that Cursor does the work.

**The opposite direction.** [jb-bz/jb-discord-mcp](https://github.com/jb-bz/jb-discord-mcp)
lets an agent post into Discord. It does not take a Discord prompt and run
Cursor. Skip it for this job.

**live-action-intel** is a finished `discord.py` service with role-bound
channels, not a control surface and not a skill. Use it as the worked example
of intents, invites, and "the process must stay up". Do not copy its channel
roles into this server. Those roles split ingest from output for a team
reading many people's reports. One operator on a phone wants the prompt and
the result in the same thread.

## Recommendations

Each row is a whole approach: layout, how many bots, and where Cursor runs.
Ranked for a phone-reachable Cursor control surface. Claude stays on CI in
every row.

| # | Option | Verdict | Risks | Benefits | Cost (money) | Cost (time/effort) | Tradeoffs | References |
|---|---|---|---|---|---|---|---|---|
| 1 | One category per repo, one text channel, a thread per session, one gateway bot on an always-on host, Cursor cloud agents | Recommended | Prompts and results live on Discord; the cloud VM sees a fresh clone, so uncommitted local edits are invisible; a dropped process can double-run a prompt | Phone works with the laptop shut; threads do not burn the 50-channel cap; one bot can gain a second harness later as an adapter | Discord $0. Bot host about $2–5/month (Fly shared-cpu-1x 256MB is $2.19/month; Railway Hobby is $5/month including $5 of usage). Cursor cloud agents have no separate VM fee; they draw included plan usage, then on-demand at the model API rate, and require a spend limit | 1–2 days for a thin bot (thread ↔ agent id, create/resume, file or chunk the reply, user allowlist). More days for crash recovery and a kill switch | Always-on phone access vs. usage billing and a clone that is not your working tree | [Server caps](https://support.discord.com/hc/en-us/articles/33694251638295-Discord-Account-Caps-Server-Caps-and-More), [threads](https://docs.discord.com/developers/topics/threads), [Cloud Agents](https://cursor.com/docs/cloud-agent), [pricing](https://cursor.com/docs/models-and-pricing), [Fly](https://fly.io/pricing/), [Railway](https://railway.com/pricing), [SDK](https://cursor.com/docs/sdk/typescript) |
| 2 | Same Discord layout as row 1, bot and Cursor local runtime on this PC (CLI or SDK) | Viable | The phone is dead while the PC sleeps, updates, or loses the network; the local agent and the IDE can edit the same checkout | $0 host; the agent sees uncommitted work; a spike can start from agent-channels | Discord $0. Host $0. Inference still goes through Cursor's hosted models and draws the subscription, the way the IDE does. No cloud VM line | An afternoon to install and read agent-channels. About a day to write the local bridge yourself | Working-tree access vs. the laptop has to stay awake | [agent-channels](https://github.com/lilyzhng/agent-channels), [SDK local vs cloud](https://cursor.com/docs/sdk/typescript), SDK skill (local inference is still hosted) |
| 3 | One category per repo, one text channel per long-lived agent, one bot, Cursor cloud | Viable | 50 channels per category, then the server's 500; the mobile sidebar fills with idle rooms; a "new chat" becomes a channel-admin task | A pinned, named room per standing agent; no archive timer; easy to glance at on a phone while the count stays small | Same money as row 1 | About half a day to wire, because there is no thread map. The later cost is reorganising when a category fills | Stable rooms vs. a hard cap at 50 agents per repo | [Server caps](https://support.discord.com/hc/en-us/articles/33694251638295-Discord-Account-Caps-Server-Caps-and-More), [channels](https://docs.discord.com/developers/resources/channel) |
| 4 | One category per repo, one forum channel, a post per task, one bot, Cursor cloud | Viable | You cannot speak in the forum channel itself; the mobile UI is a post list, not a chat; posts are threads and still archive | One post is one task, with tags for status; posts do not count as channels | Same money as row 1 | 1–2 days, close to row 1, plus tag setup | Task-shaped history vs. a worse running conversation | [Forums](https://docs.discord.com/developers/topics/threads), [Cloud Agents](https://cursor.com/docs/cloud-agent) |
| 5 | live-action-intel style: separate channels for prompts and results inside the category | Avoid | The phone shows the prompt in one place and the answer in another; easy to miss the result | Matches a bot this estate already runs | Same bot-host band as row 1 if built | Not worth spending; the pattern solves a different job | A safe split for a multi-person intel team vs. a broken conversation for one operator | [LAI channels](https://github.com/goatindex/live-action-intel/blob/main/docs/channels.md) |
| 6 | One Discord application per harness now, or a serverless function as the message reader | Avoid | A second bot is a second token, invite, and process before a second harness exists. Serverless cannot hold the gateway, so it never sees a typed prompt | A distinct bot name would show which system spoke | Extra application is $0 at Discord. The serverless reader still fails the job | The time goes into plumbing that does not read messages | Clean names vs. an architecture that cannot see the prompt | [Gateway](https://docs.discord.com/developers/events/gateway), [LAI hosting note](https://github.com/goatindex/live-action-intel/blob/main/hosting-options.md) |

### 1. Threads, one bot, Cursor cloud

A category is a repository. Inside it, one text channel (name it for the job,
for example `agents`). Each session is a thread. The first message opens the
thread and creates a cloud agent against that repo
(`Agent.create` with `cloud.repos`, or the Cloud Agents API). The bot stores
thread id → agent id (`bc-…`). A follow-up in the thread is `agent.send` /
`Agent.resume`, not a new agent. `Agent.prompt` is the one-shot helper; a
conversation wants create and send. The SDK skill is blunt about this: omit
`cloud` and you silently get a local agent.

The bot is one gateway process on a small always-on host, written in
TypeScript with `discord.js` and `@cursor/sdk`. Python works if the bot uses
the async SDK client; the default `discord.py` plus the sync SDK client will
block the gateway. The skill already says to switch to `discord.js` when the
bot calls `@cursor/sdk`.

Reply in the thread with a normal message. Ack immediately so the phone shows
that the run started. When the run finishes, post a short result and the pull
request URL, and attach the long text as a file. Log `agent.agentId` and
`run.id` before streaming. Allowlist your Discord user id. Leave Message
Content off and require an @mention if you want the stricter default; on a
one-person server, reading the one channel is simpler and needs the intent.

Claude's CI workflows stay as they are. This bot never uses that token.

### 2. Threads, local Cursor on this PC

Same server layout as row 1. The bot and the agent both run on the workstation.
Local SDK runs against `cwd` and sees uncommitted files. Inference is still
Cursor's hosted models. The phone works only while that process is alive, so
this is the right spike and the wrong steady state for "any device, laptop
shut". agent-channels is the existing sketch of this row. Read it. Do not
treat seven stars as a review.

### 3. A text channel per agent

This is the layout you described, and it is the right one for a handful of
standing agents you want pinned: a `goal-bingo` category with `design` and
`playtest`, not a channel every time you start a chat. Fifty channels per
category is the wall. Categories themselves count toward the server's 500.
New sessions belong in threads (row 1) or forum posts (row 4). Long-lived
named rooms can sit beside the `agents` channel later, inside the same
category, without making them the only pattern.

### 4. A forum post per task

A forum is a thread-only channel. The bot creates a post (the thread plus the
first message) and talks inside it. Tags can mark running, done, and blocked.
You cannot post in the forum channel itself. Use this when the work is a pile
of tasks. Use row 1 when the work is a conversation you return to from the
phone. The money and the Cursor side are the same as row 1.

### 5. Separate prompt and result channels

live-action-intel binds channels to roles (`ingest`, `output`, `query`) and
creates no channels. That kept a game-day team from mixing field reports with
the analyst's answers. Here it splits the one conversation you need to see on
a lock screen. Keep the lesson (the bot should not create channels casually;
50 per category is close). Do not keep the split.

### 6. A bot per harness, or serverless as the reader

One bot, with a Cursor adapter behind it, is the starting shape. A later
harness is another adapter in that process, not another Discord application,
until a real permission or rate-limit split appears. A distinct bot name is a
cosmetic benefit.

A serverless function can answer slash commands or fire a webhook. It cannot
hold the gateway, so it cannot be the thing that hears a message. The gateway
bot can be small. It still has to be a process.

## Dive deeper

1. Cursor self-hosted pool, if the clone must stay off Cursor's VMs
   (<https://cursor.com/docs/cloud-agent/self-hosted-pool>).
2. Mention-only mode so Message Content can stay off.
3. The adapter interface for a second harness behind the same bot.
4. Fly vs Railway vs a VPS for the gateway process, with current prices, using the LAI hosting note only as the failure modes.
5. A timed spike of agent-channels on the PC before any cloud bot is written.

## Open decisions

- Adopt row 1 as the layout and the runtime → `decision needed`.
- Where the first gateway process runs (Fly, Railway, or a VPS) → `decision needed`. The phone-while-shut goal rules out the PC as the steady host.
- Spend limit and model for cloud agents → `decision needed`. Set the limit before the first run (<https://cursor.com/docs/cloud-agent>).
- Spike agent-channels before writing the bot → `decision needed`, and only if row 2 is the experiment. Row 1 does not need that repo.
- Leave this skill in `goal-bingo` only → `go (no decision)` for this pass. Copying it to other repos, or to the user skill directory, is `decision needed` when you want it outside this workspace.
- Build the bot → `decision needed`. This report does not create the Discord application.

## The skill, after the research

`.cursor/skills/discord-bots/` was written first and then used. Two factual
corrections came out of the docs pass. No other numbers in the skill were
wrong against the pages fetched on 2026-10-05.

**What the operations made easy to check.** The channels operation had the
500 / 50 / 50 caps and the fact that threads do not count, which is the
reason row 3 is capped and row 1 is the default. The host operation separated
gateway, interactions URL, and webhook, which is why row 6 loses. The send
operation had 2000 characters and 25 MiB, which is why results go out as a
short message plus a file. The calls operation had the 3-second ack and the
15-minute token, which is why a cloud run must not depend on an interaction
follow-up. The gateway operation had the empty `content` and `attachments`
fields, confirmed on the current gateway page and already lived in
live-action-intel's `bot.py`.

**What the research had to leave the skill to learn.** Cursor local versus
cloud, `bc-` ids, resume, the silent-local trap, and pricing are in the
Cursor SDK skill and the Cursor docs, on purpose: this skill does not choose
a control-surface layout. Thread membership and phone notifications are not
in the channels operation; the archive timer is. The comparison "15 minutes
is shorter than a cloud agent run" is an application of a fact the skill
has, not a fact the skill draws. Allowlists, and "do not reuse the CI bot
token", are absent. OpenClaw and agent-channels are absent. Those are real
gaps for *this* job. They are not missing bot-building steps, so they stayed
in this report.

**Whether the subfolders earned their keep.** Yes, for this pass. The ranking
used channels, host, send, calls, and gateway, each as its own file, and did
not have to load create-bot or features. The commands operation was opened
only because the research contradicted it. A single `SKILL.md` would have
pulled the unused procedures into the same read.

**Corrections applied.** The commands operation said a global sync "can take
up to an hour". The current application-command docs say guild commands
update instantly and describe read-repair for a stale global invoke; they do
not state a duration. Discord staff, on
[discord-api-docs#2372](https://github.com/discord/discord-api-docs/issues/2372),
said the global rollout can still take up to an hour. The operation now says
both, with the two links. The same operation said an invite with only the
`bot` scope has no slash commands. Discord's upgrading guide says `bot`
includes `applications.commands`
(<https://docs.discord.com/developers/tutorials/upgrading-to-application-commands>).
The operation now says to name both scopes, and to stop treating a missing
scope as a reliable way to hide commands.

**Where it loads.** This is a project skill under `.cursor/skills/`. It is
available when the workspace is this repo. It does not load for
`code-terraform-companion` or any other checkout. That is acceptable for a
first copy and wrong if the control surface is how you drive every repo.
Moving or copying it is an open decision above, not a silent extra step.
