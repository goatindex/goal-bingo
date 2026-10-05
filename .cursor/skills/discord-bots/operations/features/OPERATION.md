# Add a feature

Add a feature to a bot that already runs. Do not fold it into the gateway
callback.

live-action-intel is the estate example of the split, not of the feature:

- `src/lai/bot.py` — connection and event entry
- `src/lai/router.py` — where an outbound message goes
- `src/lai/roles.py` — what a channel is for
- `src/lai/onboarding.py` — the setup UI

<https://github.com/goatindex/live-action-intel/blob/main/src/lai/bot.py>

That service's features are game-day reports. Leave them there.

## Steps

1. Name the behaviour in one sentence: what arrives, what the bot does, what
   a person sees.
2. Name who may trigger it. This is part of the feature, for any bot:
   - **Everyone who can speak in the channel.** Say so. Still ignore other
     bots unless the feature is about bot messages. Discord's channel
     permissions are the gate.
   - **A role.** Check `member.roles` (or the interaction member's roles).
     This is the right gate for a team bot: moderators, a staff role, a
     paid role.
   - **An allowlist of user ids.** Use this when the bot is private, or the
     action is something a role cannot express (it spends money, it runs a
     job on a host, it DMs a third party). Store the ids in configuration,
     not in source. Anyone absent from the list gets no action and no error
     dump.
   Do not leave the choice implicit. A missing check is a bot that acts for
   every person who can see the channel.
3. Pick the entry:
   - Someone typed in a channel → `on_message` (needs Message Content).
   - Someone used a slash command or a button → an interaction handler.
   - Something outside Discord has news → a webhook or a REST call, no new
     listener.
4. Put the decision in a new module, including the trigger check. The
   listener calls it and sends the result. The module does not import the
   client.
5. If the feature needs a permission the invite did not grant, change the
   invite and say so. A new intent is a portal toggle plus a code change.
   See [Create the bot](../create-bot/OPERATION.md) and
   [Hold the gateway](../gateway/OPERATION.md).
6. If the reply can be long, send it by the rules in
   [Send messages](../send/OPERATION.md). Do not discover the 2000-character
   cap in production.
7. If the bot opens a thread and a person must be notified, add them or
   @mention them. Visibility of the parent channel does not do that. See
   [Channels, threads, forums](../channels/OPERATION.md).
8. Test the module without a live socket. Pass it the inputs and assert the
   outputs, including a caller who is not allowed. Connect to Discord only
   to check the wiring you cannot fake (sync, permissions, intents).

live-action-intel's `tests/` directory is the example of testing command
sync and routing without treating a live server as the test suite. Look at
the shape (`tests/test_command_sync.py`, `tests/test_router.py`), not the
assertions about that game.

## Done when

The new module has a test that fails if the decision is wrong, including a
caller who may not trigger it. The listener or command is a thin call into
that module, and a token is still not in the repo.
