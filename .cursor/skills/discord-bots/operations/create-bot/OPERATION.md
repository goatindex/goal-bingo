# Create the bot

Portal: <https://discord.com/developers/applications>. Walkthrough:
<https://docs.discord.com/developers/quick-start/getting-started>.

live-action-intel's deploy notes are the estate example of this exact
sequence: <https://github.com/goatindex/live-action-intel/blob/main/DEPLOY.md>.

## Steps

1. **New Application.** The name is what people see. It is not the token.
2. Open **Bot**. Reset the token once and store it as `DISCORD_TOKEN` in the
   environment of the process that will run. Do not put it in the repo, a
   screenshot, or a chat log. If it leaks, reset it; the old value dies.
3. Under **Privileged Gateway Intents**, turn on **Message Content** if the
   bot will read what people type or the files they attach. Leave **Server
   Members** and **Presence** off unless a later operation needs them.
   A verified app (required once the app is in 100 or more servers) also needs
   Discord's approval for a privileged intent. A private one-server bot does
   not.
   <https://docs.discord.com/developers/events/gateway#gateway-intents>
4. Copy the **Application ID** from **General Information**.
5. Invite with the OAuth2 URL generator, or build the URL. Scopes are `bot`
   and `applications.commands`. Permissions are a bitfield, not a vibe.
   <https://docs.discord.com/developers/topics/oauth2>
   <https://docs.discord.com/developers/topics/permissions>

```
https://discord.com/api/oauth2/authorize?client_id=APPLICATION_ID&scope=bot%20applications.commands&permissions=PERMISSIONS
```

## Starting permission set

Grant only what the bot does. A bot that reads a channel and answers in it
needs, at minimum:

| Permission | Why |
|---|---|
| View Channels | See the channel |
| Send Messages | Post the answer |
| Read Message History | See what was already said, including after a reconnect |
| Embed Links | Embeds render instead of showing as a bare URL |
| Attach Files | Long output goes out as a file |

Add these when the bot creates or speaks in threads:

| Permission | Why |
|---|---|
| Send Messages in Threads | `Send Messages` does nothing inside a thread |
| Create Public Threads | The bot opens the thread |

Add **Manage Channels** only if the bot creates or deletes channels. Do not
grant Administrator.

live-action-intel's team-server invite is View, Send, Read History, Embed
Links, and Attach Files, and nothing else (`permissions=117760` in `DEPLOY.md`).
That set cannot create threads. Copy the restraint, not the integer, if the
bot's job is different.

## Done when

The bot user is in the server, `DISCORD_TOKEN` is set in the environment, and
Message Content is on in the portal if the next operation requests it in code.
