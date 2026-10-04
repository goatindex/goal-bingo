# Hold the gateway

The gateway is a WebSocket. discord.py keeps it open inside `Client.run`.
Events: <https://docs.discord.com/developers/events/gateway>.
Intents: <https://discordpy.readthedocs.io/en/stable/intents.html>.

## Request only the intents you use

`Intents.default()` is the baseline. Message Content is not part of it.

```python
import discord

def build_intents() -> discord.Intents:
    intents = discord.Intents.default()
    intents.message_content = True
    return intents
```

The portal toggle and this flag are both required. If either is missing, the
socket may still connect, and the messages are still delivered, but the
fields that hold what the user typed are empty.

Official list of those fields: `content`, `embeds`, `attachments`,
`components`, and `poll`.
<https://docs.discord.com/developers/events/gateway#message-content-intent>

live-action-intel hit the attachment half of that: without the intent the
media path received nothing, not only the text path. See the module docstring
in <https://github.com/goatindex/live-action-intel/blob/main/src/lai/bot.py>.

Exceptions, where content arrives without the intent: messages the bot sent,
DMs with the bot, messages that mention the bot, and the target of a message
context-menu command.

Do not enable `members` or `presences` to "be safe". Each one is a privileged
intent, and `members` makes startup chunking slow.

## Identify, disconnect, resume

discord.py sends Identify and heartbeats. Do not write that by hand.

- Passing a privileged intent the portal does not allow closes the socket
  with close code **4014**. An intent bit the API does not know is **4013**.
- Disconnects are normal. Resume replays missed events. If resume fails, the
  library identifies again. You do not get a second copy of events from
  before the session.
- Identify is limited: **1000 Identify calls per 24 hours** across shards,
  not counting Resume. A crash loop that identifies instead of resuming burns
  that budget.
- One connection may send **120 gateway events per 60 seconds**. Exceeding
  that disconnects the app.

A bot in one server uses one connection. Do not add sharding unless the
gateway docs say this app is large enough to need it.

## Read a message

```python
client = discord.Client(intents=build_intents())

@client.event
async def on_message(message: discord.Message) -> None:
    if message.author.bot:
        return
    text = message.content  # empty if Message Content is off
```

Ignore other bots, including this one, unless the feature is explicitly
about bot messages. Otherwise two bots answer each other.

## Run

```python
import os

def main() -> None:
    client.run(os.environ["DISCORD_TOKEN"])
```

`run` blocks. It is the process. See
[Host the process](../host/OPERATION.md) for where that process is allowed to
live. The hosting note is secondary; the connection rules above are enough to
write the client.
