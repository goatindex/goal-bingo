# Host the process

`Client.run` holds the gateway open. If the process stops, the bot stops
seeing messages. discord.py reconnects when the process is still alive and
the network blips. It does not reconnect when the machine is asleep or the
process has exited.

## What each entry point can see

| Entry | Sees ordinary messages | Sees slash commands and buttons | Stays up with no process of yours |
|---|---|---|---|
| Gateway (`Client.run`) | Yes, with Message Content | Yes | No |
| Interactions Endpoint URL | No | Yes | The HTTP app must still be reachable |
| Webhook execute URL | No | No | Yes, until you POST |

Pick the gateway when the feature is "a person typed in a channel". Pick an
interactions endpoint when the feature is only slash commands and components
and you already have an HTTPS server. Pick a webhook when something else
posts into a channel and never reads it.

An interactions endpoint must verify Ed25519 signatures with the
application's public key.
<https://docs.discord.com/developers/interactions/receiving-and-responding>

## Where the process runs

The process needs a token in the environment and a restart if it exits.

- A workstation is enough to develop. Sleep, Windows Update, and a closed
  laptop drop the socket. Resume cannot help if the process is gone.
- A small always-on host (a PaaS or a VM) is what "the bot answers while the
  laptop is shut" means. The bot is a long-lived process, not a serverless
  function: the usual serverless platforms do not hold the gateway WebSocket.
- A serverless function can still answer slash commands if you set an
  interactions endpoint, or post via a webhook. It cannot replace the gateway.

live-action-intel wrote this tradeoff down for its own bot:
<https://github.com/goatindex/live-action-intel/blob/main/hosting-options.md>.
Read it as a case study of gateway-versus-serverless. Its prices and host
names are from that date; check current prices before repeating them.

Do not put `DISCORD_TOKEN` in the image, the repo, or the command line of a
process listing if you can put it in the host's secret store.

## Done when

You can say which of the three entry points this bot uses, and what happens
to inbound messages when the machine it runs on reboots.
