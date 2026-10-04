# Slash commands

Application commands:
<https://docs.discord.com/developers/interactions/application-commands>.
discord.py:
<https://discordpy.readthedocs.io/en/stable/interactions/api.html>.

Put `applications.commands` on the invite next to `bot`. Discord's upgrading
guide says requesting `bot` also includes `applications.commands`, so an
invite that names only `bot` may still gain commands.
<https://docs.discord.com/developers/tutorials/upgrading-to-application-commands>
If commands do not appear, check the server's Integrations page for the app
before inventing a second invite. To keep commands off a server, do not rely
on omitting the scope; remove them in that server's integration settings.

## Define and sync

```python
import os
import discord
from discord import app_commands

class Bot(discord.Client):
    def __init__(self) -> None:
        super().__init__(intents=discord.Intents.default())
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self) -> None:
        guild_id = os.environ.get("DISCORD_GUILD_ID")
        if guild_id:
            guild = discord.Object(id=int(guild_id))
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
        else:
            await self.tree.sync()

bot = Bot()

@bot.tree.command(name="ping", description="Check that the bot is connected")
async def ping(interaction: discord.Interaction) -> None:
    await interaction.response.send_message("pong")
```

`setup_hook` runs once before the gateway connects. Sync there, not on every
`on_ready`. `on_ready` fires on every resume.

## Guild sync versus global sync

| | Guild `tree.sync(guild=...)` | Global `tree.sync()` |
|---|---|---|
| Where commands appear | That server only | Every server the bot is in |
| When they appear | Instantly | Not instantly. A stale invoke is rejected and the client reloads (read-repair). |
| Use while | Building and testing | The command is ready for every server |

Discord staff have said a global rollout can take up to an hour
(<https://github.com/discord/discord-api-docs/issues/2372>). The current
command docs describe the read-repair, not a clock time.

While developing, set `DISCORD_GUILD_ID` and sync to that guild. Guild
commands update instantly.
<https://docs.discord.com/developers/interactions/application-commands>
Global commands are a different list. A guild copy hides the global command
of the same name in that guild until you remove the guild copies. Do not
sync on a timer to "fix" a missing command.

There is a limit of 200 application-command creates per day per guild. Editing
in place is not a create. A loop that deletes and recreates commands will hit
it.

Command names are lowercase, 1–32 characters, no spaces. The description is
required on slash commands and is what the mobile client shows under the name.

## Ack

If the handler can finish in under 3 seconds, `response.send_message`. If it
cannot, `response.defer` and then `followup`. See
[Call the API](../calls/OPERATION.md).
